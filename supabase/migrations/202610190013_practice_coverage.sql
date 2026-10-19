-- ADR100: persistent coverage with unchanged ten-question sessions.
-- Additive store; existing attempts/SRS/content identities remain intact.
begin;
set local lock_timeout='5s';
create table public.practice_cycles (
 id uuid primary key default gen_random_uuid(),owner_id uuid not null default auth.uid(),library_id uuid not null,
 cycle_snapshot jsonb not null check(jsonb_typeof(cycle_snapshot)='object'),
 client_id text not null check(length(client_id) between 1 and 200),client_payload jsonb not null check(jsonb_typeof(client_payload)='object'),
 version bigint not null default 1,created_at timestamptz not null default now(),updated_at timestamptz not null default now(),deleted_at timestamptz,
 unique(owner_id,library_id,id),unique(library_id,client_id),
 foreign key(owner_id,library_id) references public.libraries(owner_id,id) on delete cascade
);
create index practice_cycles_owner_library on public.practice_cycles(owner_id,library_id,updated_at,id);
alter table public.practice_cycles enable row level security;
alter table public.practice_cycles force row level security;
create policy owner_all on public.practice_cycles for all to authenticated using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()));
revoke all on public.practice_cycles from public,anon,authenticated;
grant select,insert,update,delete on public.practice_cycles to authenticated;
create trigger account_write_guard before insert or update on public.practice_cycles for each row execute function private.guard_account_write();
create trigger stamp before insert or update on public.practice_cycles for each row execute function private.stamp_record();
create trigger changes after insert or update on public.practice_cycles for each row execute function private.sync_change();

create function private.validate_practice_cycle() returns trigger language plpgsql security definer set search_path='' as $$
declare c jsonb:=new.cycle_snapshot;i jsonb;
begin
 if c is distinct from new.client_payload->'payload'->'cycle' or c->>'id' is distinct from new.client_id or c->>'scopeId' is distinct from 'account:'||new.owner_id::text||':'||new.library_id::text or new.client_payload->>'scopeId' is distinct from c->>'scopeId' or new.client_payload->>'id' is distinct from new.client_id then raise exception 'invalid cycle identity' using errcode='22023';end if;
 if tg_op='UPDATE' then
  if old.cycle_snapshot is distinct from c then raise exception 'cycle snapshot immutable' using errcode='40001';end if;
  return new;
 end if;
 if c->>'mode' not in ('flashcard','picture-word','word-picture','letters','spelling','missing-letters','grammar','grammar-card') or jsonb_typeof(c->'items') is distinct from 'array' or jsonb_array_length(c->'items') not between 1 and 10000 or jsonb_typeof(c->'filter') is distinct from 'object' then raise exception 'invalid cycle' using errcode='22023';end if;
 if (select count(*) from jsonb_array_elements(c->'items'))<>(select count(distinct value->>'key') from jsonb_array_elements(c->'items')) then raise exception 'duplicate cycle item' using errcode='22023';end if;
 -- Historical snapshots may first sync after a later edit/deletion. Check
 -- ownership here; active-question approval/revision is checked independently.
 for i in select value from jsonb_array_elements(c->'items') loop
  if not exists(select 1 from public.entry_senses s join public.vocabulary_entries e on e.id=s.entry_id where s.owner_id=new.owner_id and s.library_id=new.library_id and s.client_id=i->>'senseId') then raise exception 'foreign or stale cycle item' using errcode='42501';end if;
  if i ? 'grammar' and not exists(select 1 from public.learning_content g join public.entry_senses s on s.id=g.sense_id where g.owner_id=new.owner_id and g.library_id=new.library_id and g.client_id=i->'grammar'->>'id' and s.client_id=i->>'senseId') then raise exception 'foreign cycle grammar' using errcode='42501';end if;
 end loop;
 return new;
end$$;
revoke all on function private.validate_practice_cycle() from public,anon,authenticated;
create trigger validate_cycle before insert or update on public.practice_cycles for each row execute function private.validate_practice_cycle();

create function private.validate_session_cycle() returns trigger language plpgsql security definer set search_path='' as $$
declare s jsonb:=new.deck_snapshot;c jsonb;q jsonb;
begin
 if not(s ? 'cycleId') then return new;end if;
 select cycle_snapshot into c from public.practice_cycles where owner_id=new.owner_id and library_id=new.library_id and client_id=s->>'cycleId' and deleted_at is null;
 if not found or c->>'mode' is distinct from s->>'mode' or c->'filter' is distinct from s->'filter' then raise exception 'invalid cycle session' using errcode='22023';end if;
 for q in select value from jsonb_array_elements(s->'questions') loop
  if not exists(select 1 from jsonb_array_elements(c->'items') i where i->>'key'=q->>'cycleKey' and i->>'senseId'=q->'word'->>'id' and i->>'revision'=q->'word'->>'revision' and coalesce(i->'grammar','null')=case when q ? 'grammar' then jsonb_build_object('id',q->'grammar'->'id','version',q->'grammar'->'version','formula',q->'grammar'->'formula','example',q->'grammar'->'example') else 'null'::jsonb end) then raise exception 'invalid cycle question' using errcode='22023';end if;
 end loop;
 if tg_op='UPDATE' and old.deck_snapshot->'cycleId' is distinct from s->'cycleId' then raise exception 'cycle link immutable' using errcode='40001';end if;
 return new;
end$$;
revoke all on function private.validate_session_cycle() from public,anon,authenticated;
create trigger validate_cycle before insert or update on public.practice_sessions for each row execute function private.validate_session_cycle();
create or replace function public.cloud_apply(target_library uuid,operation uuid,operations jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid();hashed text:=encode(sha256(convert_to(target_library::text||operations::text,'UTF8')),'hex');receipt private.sync_receipts%rowtype;op jsonb;data jsonb;tab text;key text;cols text;vals text;updates text;old_version bigint;result jsonb:='[]';remote_id uuid;stored jsonb;
begin
 if actor is null then raise exception 'signed out' using errcode='42501';end if;
 perform 1 from public.libraries where id=target_library and owner_id=actor and deleted_at is null for update;
 if not found then raise exception 'library unavailable' using errcode='42501';end if;
 if jsonb_typeof(operations)<>'array' or jsonb_array_length(operations)>100 or octet_length(operations::text)>2000000 then raise exception 'invalid batch' using errcode='22023';end if;
 select * into receipt from private.sync_receipts where owner_id=actor and operation_id=operation;
 if found then if receipt.payload_hash<>hashed then raise exception 'operation reused' using errcode='40001';end if;return receipt.result;end if;
 for op in select value from jsonb_array_elements(operations) loop
  tab:=op->>'entity';data:=op->'data';remote_id:=(op->>'id')::uuid;
  if tab<>all(array['lessons','vocabulary_entries','entry_senses','source_evidence','examples','lesson_vocabulary','notes','decks','practice_sessions','review_events','game_attempts','learning_content','media_assets','practice_cycles']) or tab is null or jsonb_typeof(data)<>'object' then raise exception 'invalid entity' using errcode='22023';end if;
  if op->>'baseVersion' is null or (op->>'baseVersion')::bigint<0 or data->>'client_id' is null or data->'client_payload'->>'id' is null or data->'client_payload'->>'id'<>data->>'client_id' then raise exception 'invalid identity' using errcode='22023';end if;
  cols:='';vals:='';updates:='';
  for key in select jsonb_object_keys(data) loop
   if key=any(array['id','owner_id','library_id','version','created_at','updated_at','accepted_sequence']) or not exists(select 1 from information_schema.columns where table_schema='public' and table_name=tab and column_name=key) then raise exception 'invalid field' using errcode='22023';end if;
   cols:=cols||format(',%I',key);vals:=vals||format(', (jsonb_populate_record(null::public.%I,$1)).%I',tab,key);updates:=updates||case when updates='' then '' else ',' end||format('%I=(jsonb_populate_record(null::public.%I,$1)).%I',key,tab,key);
  end loop;
  execute format('select version from public.%I where id=$1 and owner_id=$2 and library_id=$3',tab) into old_version using remote_id,actor,target_library;
  if old_version is null then
   if (op->>'baseVersion')::bigint<>0 then raise exception 'version conflict' using errcode='40001';end if;
   execute format('insert into public.%I(id,owner_id,library_id%s) select $2,$3,$4%s returning to_jsonb(%I.*)',tab,cols,vals,tab) into stored using data,remote_id,actor,target_library;
  else
   if tab=any(array['review_events','game_attempts']) then
    execute format('select client_payload from public.%I where id=$1 and owner_id=$2 and library_id=$3',tab) into stored using remote_id,actor,target_library;
    if stored<>data->'client_payload' then raise exception 'event changed' using errcode='40001';end if;
    stored:=jsonb_build_object('version',old_version);
   else
    if old_version<>(op->>'baseVersion')::bigint then raise exception 'version conflict' using errcode='40001';end if;
    execute format('update public.%I set %s where id=$2 and owner_id=$3 and library_id=$4 returning to_jsonb(%I.*)',tab,updates,tab) into stored using data,remote_id,actor,target_library;
   end if;
  end if;
  result:=result||jsonb_build_array(jsonb_build_object('entity',tab,'id',data->>'client_id','version',stored->'version'));
 end loop;
 result:=jsonb_build_object('accepted',result);
 insert into private.sync_receipts(owner_id,operation_id,payload_hash,result) values(actor,operation,hashed,result);
 return result;
end $$;
create or replace function private.share_session(p jsonb) returns jsonb language plpgsql immutable set search_path='' as $$
declare s jsonb;q jsonb;questions jsonb:='[]';choices jsonb;answers jsonb;
begin
 s:=private.share_keep(p,array['id','scopeId','cycleId','mode','filter','direction','questions','position','revealed','hint','checkedAnswer','checkedCorrect','answers','completedAt','version','createdAt']);
 for q in select value from jsonb_array_elements(p->'questions') loop
  select coalesce(jsonb_agg(private.share_word(value)),'[]') into choices from jsonb_array_elements(q->'choices');
  if q ? 'grammar' then q:=jsonb_set(q,'{grammar}',private.share_keep(q->'grammar',array['id','version','formula','example','exampleVi','exampleIpa','title','conditions','analysis']));end if;
  questions:=questions||jsonb_build_array(private.share_keep(q,array['id','cycleKey','missingIndex','missingIndices','grammar'])||jsonb_build_object('word',private.share_word(q->'word'),'choices',choices));
 end loop;
 select coalesce(jsonb_agg(private.share_keep(value,array['questionId','correct','skipped','hint','rating','answeredAt','day','timezone'])),'[]') into answers from jsonb_array_elements(p->'answers');s:=jsonb_set(s,'{answers}',answers);
 if s ? 'filter' then s:=jsonb_set(s,'{filter}',private.share_keep(s->'filter',array['set','word','lesson','deck','due','weak','direction']));end if;return jsonb_set(s,'{questions}',questions);
end$$;
create function private.share_cycle(p jsonb) returns jsonb language plpgsql immutable set search_path='' as $$
declare c jsonb;i jsonb;items jsonb:='[]';
begin
 c:=private.share_keep(p,array['id','scopeId','mode','filter','createdAt','items']);
 c:=jsonb_set(c,'{filter}',private.share_keep(p->'filter',array['set','word','lesson','deck','due','weak','direction']));
 -- Historical snapshots may first sync after a later edit/deletion. Check
 -- ownership here; active-question approval/revision is checked independently.
 for i in select value from jsonb_array_elements(p->'items') loop
  if i ? 'grammar' then i:=jsonb_set(i,'{grammar}',private.share_keep(i->'grammar',array['id','version','formula','example']));end if;
  items:=items||jsonb_build_array(private.share_keep(i,array['key','senseId','revision','grammar']));
 end loop;
 return jsonb_set(c,'{items}',items);
end$$;
revoke all on function private.share_cycle(jsonb) from public,anon,authenticated;
create or replace function private.share_project(entity text,p jsonb) returns jsonb language plpgsql immutable set search_path='' as $$
declare allowed text[];result jsonb;
begin
 allowed:=array['scopeId','id','version','createdAt','updatedAt','deletedAt'];
 case entity
 when 'entries' then allowed:=allowed||array['displayText','language','canonicalKey','keyVersion','caseMode','activeKey','kind'];
 when 'senses' then allowed:=allowed||array['entryId','identity','pos','senseLabel','definitionEn','meaningVi','art','source','origin','contentStatus','learningApprovalStatus','contentVersion','approvedContentVersion','pronunciations','tags'];
 when 'lessons' then allowed:=allowed||array['title','learnedOn','sourceType','sourceDigest'];
 when 'examples' then allowed:=allowed||array['senseId','position','textEn','translationVi','origin','pronunciations'];
 when 'lessonItems' then allowed:=allowed||array['lessonId','senseId','entryId','evidenceId'];
 when 'notes' then allowed:=allowed||array['targetType','targetId','text','mnemonicData','origin'];
 when 'reviewEvents' then allowed:=array['scopeId','id','senseId','sessionId','rating','eventTime','hints'];
 when 'decks','sentences','mediaAssets','practiceCycles','practiceSessions','gameAttempts','reviewStates' then allowed:=allowed||array['payload'];
 else return null;
 end case;
 select coalesce(jsonb_object_agg(key,value),'{}') into result from jsonb_each(p) where key=any(allowed);
 if entity='lessons' then result:=jsonb_set(result,'{sourceDigest}','null');end if;
 if entity='lessonItems' then result:=jsonb_set(result,'{evidenceId}','null');end if;
 if entity='sentences' then result:=jsonb_set(result,'{payload}',jsonb_build_object('content',private.share_content(p->'payload'->'content')));
 elsif entity='decks' then result:=jsonb_set(result,'{payload}',jsonb_build_object('deck',private.share_deck(p->'payload'->'deck')));
 elsif entity='mediaAssets' then result:=jsonb_set(result,'{payload}',jsonb_build_object('asset',private.share_media(p->'payload'->'asset')));
 elsif entity='practiceCycles' then result:=jsonb_set(result,'{payload}',jsonb_build_object('cycle',private.share_cycle(p->'payload'->'cycle')));
 elsif entity='practiceSessions' then result:=jsonb_set(result,'{payload}',jsonb_build_object('session',private.share_session(p->'payload'->'session')));
 elsif entity='gameAttempts' then result:=jsonb_set(result,'{payload}',(select coalesce(jsonb_object_agg(key,value),'{}') from jsonb_each(p->'payload') where key=any(array['senseId','questionId','sessionId','answer','correct','skipped','hint','understood'])));
 elsif entity='reviewStates' then result:=jsonb_set(result,'{payload}',jsonb_build_object('state',private.share_keep(p->'payload'->'state',array['intervalDays','ease','streak','dueAt','algorithmVersion'])));end if;
 return result;
end$$;
create or replace function private.share_rows(lib uuid,owner uuid) returns table(entity text,id text,version bigint,document jsonb) language plpgsql security definer set search_path='' as $$
declare tab text;name text;q text;
begin
 for tab,name in select * from(values('lessons','lessons'),('vocabulary_entries','entries'),('entry_senses','senses'),('examples','examples'),('lesson_vocabulary','lessonItems'),('notes','notes'),('decks','decks'),('learning_content','sentences'),('media_assets','mediaAssets'),('practice_cycles','practiceCycles'),('practice_sessions','practiceSessions'),('review_events','reviewEvents'),('game_attempts','gameAttempts'),('review_states','reviewStates')) as x(a,b) loop
  q:=format('select %L::text,t.client_id,t.version,private.share_project(%L,t.client_payload) from public.%I t where t.library_id=$1 and t.owner_id=$2 and t.client_payload is not null',name,name,tab);
  if tab='entry_senses' then q:=q||' and t.deleted_at is null and t.learning_approval_status=''approved'' and t.approved_content_version=t.content_version';
  elsif tab='vocabulary_entries' then q:=q||' and exists(select 1 from public.entry_senses s where s.entry_id=t.id and s.library_id=$1 and s.deleted_at is null and s.learning_approval_status=''approved'' and s.approved_content_version=s.content_version)';
  elsif tab=any(array['examples','lesson_vocabulary','learning_content','media_assets']) then q:=q||' and exists(select 1 from public.entry_senses s where s.id=t.sense_id and s.library_id=$1 and s.deleted_at is null and s.learning_approval_status=''approved'' and s.approved_content_version=s.content_version)';end if;
  if tab='media_assets' then q:=q||' and t.ready_status=''ready'' and t.approval_version is not null';end if;
  return query execute q using lib,owner;
 end loop;
end$$;
create or replace function private.share_progress(ctx jsonb,op_id uuid,ops jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare owner uuid:=(ctx->>'ownerId')::uuid;lib uuid:=(ctx->>'libraryId')::uuid;hashed text;receipt private.sync_receipts;op jsonb;data jsonb;tab text;allowed text[];key text;cols text;vals text;updates text;old_version bigint;stored jsonb;result jsonb:='[]';remote uuid;s jsonb;old_s jsonb;question jsonb;
begin
 if op_id is null or jsonb_typeof(ops) is distinct from 'array' or jsonb_array_length(ops) not between 1 and 100 or octet_length(ops::text)>2000000 then raise exception 'share:invalid-batch' using errcode='22023';end if;
 perform 1 from public.libraries where id=lib and owner_id=owner and deleted_at is null for update;
 if not found then raise exception 'share:access-revoked' using errcode='42501';end if;
 hashed:=encode(sha256(convert_to(lib::text||ops::text,'UTF8')),'hex');
 select * into receipt from private.sync_receipts where owner_id=owner and operation_id=op_id;
 if found then if receipt.payload_hash<>hashed then raise exception 'share:progress-conflict' using errcode='40001';end if;return receipt.result;end if;
 for op in select value from jsonb_array_elements(ops) loop
  tab:=op->>'entity';data:=op->'data';remote:=(op->>'id')::uuid;
  if tab<>all(array['practice_cycles','practice_sessions','review_events','game_attempts']) or tab is null or jsonb_typeof(data) is distinct from 'object' then raise exception 'share:read-only' using errcode='42501';end if;
  allowed:=array['client_id','client_payload','deleted_at'];
  case tab when 'practice_cycles' then allowed:=allowed||array['cycle_snapshot'];
  when 'practice_sessions' then allowed:=allowed||array['mode','deck_snapshot','position','completed_at'];
  when 'review_events' then allowed:=allowed||array['sense_id','session_id','rating','hints','event_time'];
  when 'game_attempts' then allowed:=allowed||array['sense_id','session_id','question_id','answer','is_correct','hints'];end case;
  if exists(select 1 from jsonb_object_keys(data) k where k<>all(allowed)) then raise exception 'share:read-only' using errcode='42501';end if;
  if data->>'client_id' is null or jsonb_typeof(data->'client_payload') is distinct from 'object' or data->'client_payload'->>'id' is distinct from data->>'client_id' or data->'client_payload'->>'scopeId' is distinct from 'account:'||owner::text||':'||lib::text or op->>'baseVersion' is null or (op->>'baseVersion')::bigint<0 then raise exception 'share:invalid-record' using errcode='22023';end if;
  if private.share_project(case tab when 'practice_cycles' then 'practiceCycles' when 'practice_sessions' then 'practiceSessions' when 'review_events' then 'reviewEvents' else 'gameAttempts' end,data->'client_payload') is distinct from data->'client_payload' then raise exception 'share:invalid-record' using errcode='22023';end if;
  if remote is distinct from private.share_remote(lib,case tab when 'practice_cycles' then 'practiceCycles' when 'practice_sessions' then 'practiceSessions' when 'review_events' then 'reviewEvents' else 'gameAttempts' end,data->>'client_id') then raise exception 'share:invalid-record' using errcode='22023';end if;
  execute format('select version from public.%I where id=$1 and owner_id=$2 and library_id=$3',tab) into old_version using remote,owner,lib;
  if tab='practice_cycles' then
   if data->>'deleted_at' is not null then raise exception 'share:read-only' using errcode='42501';end if;
  elsif tab='practice_sessions' then
   s:=data->'deck_snapshot';
   if jsonb_typeof(s) is distinct from 'object' or s is distinct from data->'client_payload'->'payload'->'session' or not(s ?& array['id','scopeId','mode','questions','position','answers','version','createdAt','completedAt','revealed','hint','checkedAnswer','checkedCorrect']) or s->>'id' is distinct from data->>'client_id' or s->>'scopeId' is distinct from 'account:'||owner::text||':'||lib::text or s->>'mode' is distinct from data->>'mode' or jsonb_typeof(s->'questions') is distinct from 'array' or jsonb_typeof(s->'answers') is distinct from 'array' then raise exception 'share:invalid-session' using errcode='22023';end if;
   if jsonb_array_length(s->'questions') not between 1 and 10 or jsonb_array_length(s->'answers')<>(s->>'position')::integer or (s->>'position')::integer not between 0 and jsonb_array_length(s->'questions') or (s->>'position')::integer is distinct from (data->>'position')::integer or s->>'completedAt' is distinct from data->>'completed_at' then raise exception 'share:invalid-session' using errcode='22023';end if;
   for question in select value from jsonb_array_elements(s->'questions') loop
    if data->>'deleted_at' is not null and old_version is not null then continue;end if;
    if not exists(select 1 from public.entry_senses sense join public.vocabulary_entries entry on entry.id=sense.entry_id where sense.library_id=lib and sense.client_id=question->'word'->>'id' and sense.deleted_at is null and sense.learning_approval_status='approved' and sense.approved_content_version=sense.content_version and entry.deleted_at is null and entry.display_text=question->'word'->>'word' and question->'word'->>'revision'=(entry.client_payload->>'version')||':'||(sense.client_payload->>'version')) then raise exception 'share:content-changed' using errcode='40001';end if;
   end loop;
   if old_version is not null then
    select deck_snapshot into old_s from public.practice_sessions where id=remote and owner_id=owner and library_id=lib;
    if old_s->'cycleId' is distinct from s->'cycleId' or old_s->'filter' is distinct from s->'filter' or private.share_session(old_s)->'questions' is distinct from s->'questions' or old_s->'mode' is distinct from s->'mode' or (s->>'position')::integer<(old_s->>'position')::integer then raise exception 'share:progress-conflict' using errcode='40001';end if;
    if old_s->>'completedAt' is not null and private.share_session(old_s) is distinct from s then raise exception 'share:read-only' using errcode='42501';end if;
    -- Keep owner-private fields in the original question snapshot; recipients only send the projection.
    s:=jsonb_set(s,'{questions}',old_s->'questions');data:=jsonb_set(jsonb_set(data,'{deck_snapshot}',s),'{client_payload,payload,session}',s);
   end if;
   if data->>'deleted_at' is not null and (old_version is null or s is distinct from private.share_session(old_s)) then raise exception 'share:read-only' using errcode='42501';end if;
  else
   if data->>'deleted_at' is not null then raise exception 'share:read-only' using errcode='42501';end if;
   if not exists(select 1 from public.entry_senses where id=(data->>'sense_id')::uuid and client_id=case tab when 'review_events' then data->'client_payload'->>'senseId' else data->'client_payload'->'payload'->>'senseId' end and owner_id=owner and library_id=lib and deleted_at is null and learning_approval_status='approved' and approved_content_version=content_version) then raise exception 'share:content-changed' using errcode='40001';end if;
   if not exists(select 1 from public.practice_sessions where id=(data->>'session_id')::uuid and client_id=case tab when 'review_events' then data->'client_payload'->>'sessionId' else data->'client_payload'->'payload'->>'sessionId' end and owner_id=owner and library_id=lib and deleted_at is null) then raise exception 'share:invalid-session' using errcode='22023';end if;
   if tab='game_attempts' and (data->>'question_id')::uuid is distinct from private.share_remote(lib,'question',data->'client_payload'->'payload'->>'questionId') then raise exception 'share:invalid-session' using errcode='22023';end if;
   if tab='review_events' and not exists(select 1 from public.practice_sessions where id=(data->>'session_id')::uuid and mode='flashcard') then raise exception 'share:invalid-session' using errcode='22023';end if;
  end if;
  cols:='';vals:='';updates:='';
  for key in select jsonb_object_keys(data) loop
   cols:=cols||format(',%I',key);vals:=vals||format(', (jsonb_populate_record(null::public.%I,$1)).%I',tab,key);updates:=updates||case when updates='' then '' else ',' end||format('%I=(jsonb_populate_record(null::public.%I,$1)).%I',key,tab,key);
  end loop;
  if old_version is null then
   if (op->>'baseVersion')::bigint<>0 then raise exception 'share:progress-conflict' using errcode='40001';end if;
   execute format('insert into public.%I(id,owner_id,library_id%s) select $2,$3,$4%s returning to_jsonb(%I.*)',tab,cols,vals,tab) into stored using data,remote,owner,lib;
  elsif tab=any(array['review_events','game_attempts']) then
   execute format('select client_payload from public.%I where id=$1 and owner_id=$2 and library_id=$3',tab) into stored using remote,owner,lib;
   if stored is distinct from data->'client_payload' then raise exception 'share:progress-conflict' using errcode='40001';end if;stored:=jsonb_build_object('version',old_version);
  else
   if old_version<>(op->>'baseVersion')::bigint then raise exception 'share:progress-conflict' using errcode='40001';end if;
   execute format('update public.%I set %s where id=$2 and owner_id=$3 and library_id=$4 returning to_jsonb(%I.*)',tab,updates,tab) into stored using data,remote,owner,lib;
  end if;
  result:=result||jsonb_build_array(jsonb_build_object('entity',tab,'id',data->>'client_id','version',stored->'version'));
 end loop;
 if ctx->>'expiresAt' is not null and (ctx->>'expiresAt')::timestamptz<=clock_timestamp() then raise exception 'share:session-expired' using errcode='42501';end if;
 result:=jsonb_build_object('accepted',result);insert into private.sync_receipts values(owner,op_id,hashed,result,now());return result;
end$$;
commit;
