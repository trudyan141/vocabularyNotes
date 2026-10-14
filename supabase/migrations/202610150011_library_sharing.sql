-- ADR096: read-only library sharing, shared learning, and independent 72h device leases.
-- No changes to existing learning rows, IDs, constraints, owner policies or Auth identities.
begin;
set local lock_timeout='5s';
create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;

create table private.share_keys(id boolean primary key default true check(id),secret text not null);
insert into private.share_keys values(true,encode(extensions.gen_random_bytes(32),'hex'));
create table private.share_invites(
 id uuid primary key default gen_random_uuid(),owner_id uuid not null,library_id uuid not null,
 recipient_id uuid not null references auth.users(id),email text not null,status text not null default 'pending' check(status in('pending','active','revoked')),
 generation integer not null default 1,created_at timestamptz not null default now(),accepted_at timestamptz,revoked_at timestamptz,
 foreign key(owner_id,library_id) references public.libraries(owner_id,id) on delete cascade,unique(library_id,recipient_id)
);
create index share_invites_recipient on private.share_invites(recipient_id,status);
create table private.share_pairings(
 id uuid primary key default gen_random_uuid(),owner_id uuid not null,library_id uuid not null,
 recipient_id uuid references auth.users(id),token_hash text not null unique,code_hash text not null unique,
 delivery bytea,created_at timestamptz not null default now(),expires_at timestamptz not null default(now()+interval '15 minutes'),
 revoked_at timestamptz,consumed_id uuid,
 foreign key(owner_id,library_id) references public.libraries(owner_id,id) on delete cascade
);
create index share_pairings_owner on private.share_pairings(owner_id,library_id,created_at);
create table private.share_devices(
 id uuid primary key default gen_random_uuid(),owner_id uuid not null,library_id uuid not null,
 pairing_id uuid not null unique references private.share_pairings(id),secret_hash text not null unique,
 label text not null check(length(label) between 1 and 60),created_at timestamptz not null default now(),
 expires_at timestamptz not null default(now()+interval '72 hours'),revoked_at timestamptz,
 foreign key(owner_id,library_id) references public.libraries(owner_id,id) on delete cascade
);
create index share_devices_owner on private.share_devices(owner_id,library_id,expires_at);
create table private.share_inbox(
 id uuid primary key default gen_random_uuid(),recipient_id uuid not null references auth.users(id),
 kind text not null check(kind in('library-invite','device-invite')),source_id uuid not null,generation integer not null default 1,
 created_at timestamptz not null default now(),unique(recipient_id,kind,source_id,generation)
);
create index share_inbox_recipient on private.share_inbox(recipient_id,created_at desc,id);
create table private.share_budgets(key text primary key,bucket bigint not null,used integer not null,last_touched timestamptz not null default now());
create index share_budgets_cleanup on private.share_budgets(last_touched);
create table private.share_snapshots(
 id uuid primary key default gen_random_uuid(),access_id uuid not null,library_id uuid not null,watermark bigint not null,
 pages jsonb not null,created_at timestamptz not null default now(),expires_at timestamptz not null default(now()+interval '15 minutes')
);
create index share_snapshots_expiry on private.share_snapshots(expires_at);
revoke all on private.share_keys,private.share_invites,private.share_pairings,private.share_devices,private.share_inbox,private.share_budgets,private.share_snapshots from public,anon,authenticated;

create function private.share_hash(value text) returns text language sql immutable set search_path='' as $$select encode(sha256(convert_to(value,'UTF8')),'hex')$$;
create function private.share_remote(lib uuid,entity text,id text) returns uuid language plpgsql immutable strict set search_path='' as $$
declare b bytea:=substring(sha256(convert_to(lib::text||E'\n'||entity||E'\n'||id,'UTF8')) from 1 for 16);h text;
begin b:=set_byte(b,6,(get_byte(b,6)&15)|128);b:=set_byte(b,8,(get_byte(b,8)&63)|128);h:=encode(b,'hex');return (substr(h,1,8)||'-'||substr(h,9,4)||'-'||substr(h,13,4)||'-'||substr(h,17,4)||'-'||substr(h,21,12))::uuid;end$$;
create function private.share_keep(p jsonb,keys text[]) returns jsonb language sql immutable set search_path='' as $$
 select coalesce(jsonb_object_agg(key,value),'{}') from jsonb_each(case when jsonb_typeof(p)='object' then p else '{}'::jsonb end) where key=any(keys)
$$;
create function private.share_word(p jsonb) returns jsonb language sql immutable set search_path='' as $$
 select private.share_keep(p,array['id','word','vi','en','example','exampleVi','art','lesson','pos','sense','ready','source','origin','revision','caseMode','approved','tags','pronunciations','examplePronunciations'])
$$;
create function private.share_content(p jsonb) returns jsonb language plpgsql immutable set search_path='' as $$
declare result jsonb;variants jsonb;
begin result:=private.share_keep(p,array['grammarFamily','grammarVariants','senseId','targetRevision','example','exampleVi','exampleIpa','readingHintVi','pattern','patternExplanation','grammarTitle','conditions','formula','analysis','commonError','commonErrorIpa','correction','correctionIpa','approved','origin','source','lessonId']);
 if p ? 'grammarVariants' then select coalesce(jsonb_agg(private.share_keep(value,array['formula','example','exampleVi','exampleIpa','analysis','conditions','commonError','commonErrorIpa','correction','correctionIpa'])),'[]') into variants from jsonb_array_elements(p->'grammarVariants');result:=jsonb_set(result,'{grammarVariants}',variants);end if;return result;end$$;
create function private.share_deck(p jsonb) returns jsonb language plpgsql immutable set search_path='' as $$
declare d jsonb:=private.share_keep(p,array['name','senseIds','direction','group']);g jsonb;refs jsonb;sets jsonb;key text;
begin if p ? 'group' then g:=private.share_keep(p->'group',array['wordIds','sentences','grammar','sets']);
 for key in select unnest(array['sentences','grammar']) loop if g ? key then select coalesce(jsonb_agg(private.share_keep(value,array['senseId','key'])),'[]') into refs from jsonb_array_elements(g->key);g:=jsonb_set(g,array[key],refs);end if;end loop;
 if g ? 'sets' then select coalesce(jsonb_agg(private.share_keep(value,array['id','lessonId','title','learnedOn','sourceType','wordIds','sentenceKeys','grammarKeys'])),'[]') into sets from jsonb_array_elements(g->'sets');g:=jsonb_set(g,'{sets}',sets);end if;d:=jsonb_set(d,'{group}',g);end if;return d;end$$;
create function private.share_media(p jsonb) returns jsonb language sql immutable set search_path='' as $$
 select private.share_keep(p,array['candidate','senseId','word','revision','base64','sha256','checkedAt','receipt','status','approved'])||jsonb_build_object('candidate',private.share_keep(p->'candidate',array['id','title','sourceUrl','imageUrl','creator','license','licenseUrl','credit']))
$$;
create function private.share_session(p jsonb) returns jsonb language plpgsql immutable set search_path='' as $$
declare s jsonb;q jsonb;questions jsonb:='[]';choices jsonb;answers jsonb;
begin
 s:=private.share_keep(p,array['id','scopeId','mode','filter','direction','questions','position','revealed','hint','checkedAnswer','checkedCorrect','answers','completedAt','version','createdAt']);
 for q in select value from jsonb_array_elements(p->'questions') loop
  select coalesce(jsonb_agg(private.share_word(value)),'[]') into choices from jsonb_array_elements(q->'choices');
  if q ? 'grammar' then q:=jsonb_set(q,'{grammar}',private.share_keep(q->'grammar',array['id','version','formula','example','exampleVi','exampleIpa','title','conditions','analysis']));end if;
  questions:=questions||jsonb_build_array(private.share_keep(q,array['id','missingIndex','missingIndices','grammar'])||jsonb_build_object('word',private.share_word(q->'word'),'choices',choices));
 end loop;
 select coalesce(jsonb_agg(private.share_keep(value,array['questionId','correct','skipped','hint','rating'])),'[]') into answers from jsonb_array_elements(p->'answers');s:=jsonb_set(s,'{answers}',answers);
 if s ? 'filter' then s:=jsonb_set(s,'{filter}',private.share_keep(s->'filter',array['set','word','lesson','deck','due','weak','direction']));end if;return jsonb_set(s,'{questions}',questions);
end$$;
create function private.share_budget(key_name text,maximum integer,seconds integer) returns boolean language plpgsql security definer set search_path='' as $$
declare tick bigint:=floor(extract(epoch from clock_timestamp())/seconds);n integer;
begin
 insert into private.share_budgets(key,bucket,used) values(key_name,tick,1) on conflict(key) do update set last_touched=now(),bucket=excluded.bucket,used=case when share_budgets.bucket=excluded.bucket then share_budgets.used+1 else 1 end returning used into n;
 return n<=maximum;
end$$;
create function private.share_owner(lib uuid) returns public.libraries language plpgsql security definer set search_path='' as $$
declare r public.libraries;
begin
 select * into r from public.libraries where id=lib and owner_id=auth.uid() and deleted_at is null;
 if not found then raise exception 'share:owner-required' using errcode='42501';end if;return r;
end$$;
create function private.share_recipient(address text) returns uuid language sql stable security definer set search_path='' as $$
 select u.id from auth.users u where lower(u.email)=lower(trim(address)) and u.email_confirmed_at is not null
 and exists(select 1 from auth.identities i where i.user_id=u.id and i.provider='google') limit 1
$$;
create function private.share_context(args jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare kind text:=args->>'kind';access uuid;lib uuid;owner uuid;expiry timestamptz;title text;r private.share_invites;d private.share_devices;
begin
 if kind='email' then
  select * into r from private.share_invites where id=(args->>'id')::uuid and recipient_id=auth.uid() for share;
  if not found or r.status<>'active' then raise exception 'share:access-revoked' using errcode='42501';end if;
  access:=r.id;lib:=r.library_id;owner:=r.owner_id;
 elsif kind='device' then
  select * into d from private.share_devices where secret_hash=private.share_hash(coalesce(args->>'device','')) for share;
  if not found or d.revoked_at is not null then raise exception 'share:access-revoked' using errcode='42501';end if;
  if d.expires_at<=clock_timestamp() then raise exception 'share:session-expired' using errcode='42501';end if;
  access:=d.id;lib:=d.library_id;owner:=d.owner_id;expiry:=d.expires_at;
 else raise exception 'share:invalid-context' using errcode='22023';end if;
 select name into title from public.libraries where id=lib and owner_id=owner and deleted_at is null;
 if not found then raise exception 'share:access-revoked' using errcode='42501';end if;
 return jsonb_build_object('id',access,'kind',kind,'libraryId',lib,'ownerId',owner,'name',title,'expiresAt',expiry,'serverTime',clock_timestamp());
end$$;

-- Whitelist persisted DTO fields. Never return arbitrary owner JSON or source photos/evidence.
create function private.share_project(entity text,p jsonb) returns jsonb language plpgsql immutable set search_path='' as $$
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
 when 'decks','sentences','mediaAssets','practiceSessions','gameAttempts','reviewStates' then allowed:=allowed||array['payload'];
 else return null;
 end case;
 select coalesce(jsonb_object_agg(key,value),'{}') into result from jsonb_each(p) where key=any(allowed);
 if entity='lessons' then result:=jsonb_set(result,'{sourceDigest}','null');end if;
 if entity='lessonItems' then result:=jsonb_set(result,'{evidenceId}','null');end if;
 if entity='sentences' then result:=jsonb_set(result,'{payload}',jsonb_build_object('content',private.share_content(p->'payload'->'content')));
 elsif entity='decks' then result:=jsonb_set(result,'{payload}',jsonb_build_object('deck',private.share_deck(p->'payload'->'deck')));
 elsif entity='mediaAssets' then result:=jsonb_set(result,'{payload}',jsonb_build_object('asset',private.share_media(p->'payload'->'asset')));
 elsif entity='practiceSessions' then result:=jsonb_set(result,'{payload}',jsonb_build_object('session',private.share_session(p->'payload'->'session')));
 elsif entity='gameAttempts' then result:=jsonb_set(result,'{payload}',(select coalesce(jsonb_object_agg(key,value),'{}') from jsonb_each(p->'payload') where key=any(array['senseId','questionId','sessionId','answer','correct','skipped','hint','understood'])));
 elsif entity='reviewStates' then result:=jsonb_set(result,'{payload}',jsonb_build_object('state',private.share_keep(p->'payload'->'state',array['intervalDays','ease','streak','dueAt','algorithmVersion'])));end if;
 return result;
end$$;
create function private.share_rows(lib uuid,owner uuid) returns table(entity text,id text,version bigint,document jsonb) language plpgsql security definer set search_path='' as $$
declare tab text;name text;q text;
begin
 for tab,name in select * from(values('lessons','lessons'),('vocabulary_entries','entries'),('entry_senses','senses'),('examples','examples'),('lesson_vocabulary','lessonItems'),('notes','notes'),('decks','decks'),('learning_content','sentences'),('media_assets','mediaAssets'),('practice_sessions','practiceSessions'),('review_events','reviewEvents'),('game_attempts','gameAttempts'),('review_states','reviewStates')) as x(a,b) loop
  q:=format('select %L::text,t.client_id,t.version,private.share_project(%L,t.client_payload) from public.%I t where t.library_id=$1 and t.owner_id=$2 and t.client_payload is not null',name,name,tab);
  if tab='entry_senses' then q:=q||' and t.deleted_at is null and t.learning_approval_status=''approved'' and t.approved_content_version=t.content_version';
  elsif tab='vocabulary_entries' then q:=q||' and exists(select 1 from public.entry_senses s where s.entry_id=t.id and s.library_id=$1 and s.deleted_at is null and s.learning_approval_status=''approved'' and s.approved_content_version=s.content_version)';
  elsif tab=any(array['examples','lesson_vocabulary','learning_content','media_assets']) then q:=q||' and exists(select 1 from public.entry_senses s where s.id=t.sense_id and s.library_id=$1 and s.deleted_at is null and s.learning_approval_status=''approved'' and s.approved_content_version=s.content_version)';end if;
  if tab='media_assets' then q:=q||' and t.ready_status=''ready'' and t.approval_version is not null';end if;
  return query execute q using lib,owner;
 end loop;
end$$;

create function private.share_progress(ctx jsonb,op_id uuid,ops jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
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
  if tab<>all(array['practice_sessions','review_events','game_attempts']) or tab is null or jsonb_typeof(data) is distinct from 'object' then raise exception 'share:read-only' using errcode='42501';end if;
  allowed:=array['client_id','client_payload','deleted_at'];
  case tab when 'practice_sessions' then allowed:=allowed||array['mode','deck_snapshot','position','completed_at'];
  when 'review_events' then allowed:=allowed||array['sense_id','session_id','rating','hints','event_time'];
  when 'game_attempts' then allowed:=allowed||array['sense_id','session_id','question_id','answer','is_correct','hints'];end case;
  if exists(select 1 from jsonb_object_keys(data) k where k<>all(allowed)) then raise exception 'share:read-only' using errcode='42501';end if;
  if data->>'client_id' is null or jsonb_typeof(data->'client_payload') is distinct from 'object' or data->'client_payload'->>'id' is distinct from data->>'client_id' or data->'client_payload'->>'scopeId' is distinct from 'account:'||owner::text||':'||lib::text or op->>'baseVersion' is null or (op->>'baseVersion')::bigint<0 then raise exception 'share:invalid-record' using errcode='22023';end if;
  if private.share_project(case tab when 'practice_sessions' then 'practiceSessions' when 'review_events' then 'reviewEvents' else 'gameAttempts' end,data->'client_payload') is distinct from data->'client_payload' then raise exception 'share:invalid-record' using errcode='22023';end if;
  if remote is distinct from private.share_remote(lib,case tab when 'practice_sessions' then 'practiceSessions' when 'review_events' then 'reviewEvents' else 'gameAttempts' end,data->>'client_id') then raise exception 'share:invalid-record' using errcode='22023';end if;
  execute format('select version from public.%I where id=$1 and owner_id=$2 and library_id=$3',tab) into old_version using remote,owner,lib;
  if tab='practice_sessions' then
   s:=data->'deck_snapshot';
   if jsonb_typeof(s) is distinct from 'object' or s is distinct from data->'client_payload'->'payload'->'session' or not(s ?& array['id','scopeId','mode','questions','position','answers','version','createdAt','completedAt','revealed','hint','checkedAnswer','checkedCorrect']) or s->>'id' is distinct from data->>'client_id' or s->>'scopeId' is distinct from 'account:'||owner::text||':'||lib::text or s->>'mode' is distinct from data->>'mode' or jsonb_typeof(s->'questions') is distinct from 'array' or jsonb_typeof(s->'answers') is distinct from 'array' then raise exception 'share:invalid-session' using errcode='22023';end if;
   if jsonb_array_length(s->'questions') not between 1 and 10 or jsonb_array_length(s->'answers')<>(s->>'position')::integer or (s->>'position')::integer not between 0 and jsonb_array_length(s->'questions') or (s->>'position')::integer is distinct from (data->>'position')::integer or s->>'completedAt' is distinct from data->>'completed_at' then raise exception 'share:invalid-session' using errcode='22023';end if;
   for question in select value from jsonb_array_elements(s->'questions') loop
    if not exists(select 1 from public.entry_senses sense join public.vocabulary_entries entry on entry.id=sense.entry_id where sense.library_id=lib and sense.client_id=question->'word'->>'id' and sense.deleted_at is null and sense.learning_approval_status='approved' and sense.approved_content_version=sense.content_version and entry.deleted_at is null and entry.display_text=question->'word'->>'word' and question->'word'->>'revision'=(entry.client_payload->>'version')||':'||(sense.client_payload->>'version')) then raise exception 'share:content-changed' using errcode='40001';end if;
   end loop;
   if old_version is not null then
    select deck_snapshot into old_s from public.practice_sessions where id=remote and owner_id=owner and library_id=lib;
    if private.share_session(old_s)->'questions' is distinct from s->'questions' or old_s->'mode' is distinct from s->'mode' or (s->>'position')::integer<(old_s->>'position')::integer then raise exception 'share:progress-conflict' using errcode='40001';end if;
    if old_s->>'completedAt' is not null and private.share_session(old_s) is distinct from s then raise exception 'share:read-only' using errcode='42501';end if;
    -- Keep owner-private fields in the original question snapshot; recipients only send the projection.
    s:=jsonb_set(s,'{questions}',old_s->'questions');data:=jsonb_set(jsonb_set(data,'{deck_snapshot}',s),'{client_payload,payload,session}',s);
   end if;
   if data->>'deleted_at' is not null and ((s->>'position')::integer<>0 or s->>'completedAt' is not null) then raise exception 'share:read-only' using errcode='42501';end if;
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

create function public.wfk_share(action text,args jsonb default '{}') returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid();l public.libraries;ctx jsonb;lib uuid;r private.share_invites;p private.share_pairings;d private.share_devices;recipient uuid;address text;token text;code text;alphabet text:='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';secret text;binding text;output jsonb:='[]';entry jsonb;notify uuid;page jsonb:='[]';pages jsonb:='[]';bytes integer:=0;item record;snap private.share_snapshots;watermark bigint;n integer;proof text;
begin
 if octet_length(args::text)>2100000 then raise exception 'share:invalid-batch' using errcode='22023';end if;
 delete from private.share_snapshots where expires_at<now();
 delete from private.share_budgets where last_touched<now()-interval '1 day';
 update private.share_pairings set delivery=null where delivery is not null and (expires_at<=now() or revoked_at is not null or consumed_id is not null);
 if action in('overview','invite','pair','revoke','cancel') then
  l:=private.share_owner((args->>'libraryId')::uuid);
 end if;
 if action='overview' then
  return jsonb_build_object('libraryId',l.id,'name',l.name,'invites',(select coalesce(jsonb_agg(jsonb_build_object('id',i.id,'email',i.email,'status',i.status,'createdAt',i.created_at,'generation',i.generation) order by i.created_at desc),'[]') from private.share_invites i where i.library_id=l.id),'pairings',(select coalesce(jsonb_agg(jsonb_build_object('id',q.id,'recipientEmail',u.email,'expiresAt',q.expires_at,'status',case when q.consumed_id is not null then 'used' when q.revoked_at is not null then 'cancelled' when q.expires_at<=now() then 'expired' else 'ready' end) order by q.created_at desc),'[]') from private.share_pairings q left join auth.users u on u.id=q.recipient_id where q.library_id=l.id and q.created_at>now()-interval '7 days'),'devices',(select coalesce(jsonb_agg(jsonb_build_object('id',v.id,'label',v.label,'createdAt',v.created_at,'expiresAt',v.expires_at,'status',case when v.revoked_at is not null then 'revoked' when v.expires_at<=now() then 'expired' else 'active' end) order by v.created_at desc),'[]') from private.share_devices v where v.library_id=l.id));
 elsif action='invite' then
  if jsonb_typeof(args->'emails')<>'array' or jsonb_array_length(args->'emails') not between 1 and 20 then raise exception 'share:too-many-emails' using errcode='22023';end if;
  if not private.share_budget('invite:'||actor::text,20,60) then return jsonb_build_object('error','rate-limited');end if;
  for address in select distinct lower(trim(value)) from jsonb_array_elements_text(args->'emails') loop
   recipient:=private.share_recipient(address);
   if recipient is null then output:=output||jsonb_build_array(jsonb_build_object('email',address,'status','failed','error','recipient-unavailable'));continue;end if;
   if recipient=actor then output:=output||jsonb_build_array(jsonb_build_object('email',address,'status','already-shared'));continue;end if;
   select * into r from private.share_invites where library_id=l.id and recipient_id=recipient for update;
   if found and r.status<>'revoked' then output:=output||jsonb_build_array(jsonb_build_object('email',address,'status','already-shared','id',r.id));continue;end if;
   insert into private.share_invites(owner_id,library_id,recipient_id,email) values(actor,l.id,recipient,address) on conflict(library_id,recipient_id) do update set status='pending',generation=share_invites.generation+1,email=excluded.email,created_at=now(),accepted_at=null,revoked_at=null returning * into r;
   insert into private.share_inbox(recipient_id,kind,source_id,generation) values(recipient,'library-invite',r.id,r.generation);
   output:=output||jsonb_build_array(jsonb_build_object('email',address,'status','created','id',r.id));
  end loop;return jsonb_build_object('results',output);
 elsif action='accept' then
  select * into r from private.share_invites where id=(args->>'id')::uuid and recipient_id=actor for update;
  if not found or r.status='revoked' or (args->>'generation')::integer is distinct from r.generation then raise exception 'share:invitation-unavailable' using errcode='42501';end if;
  update private.share_invites set status='active',accepted_at=coalesce(accepted_at,now()) where id=r.id;
  return private.share_context(jsonb_build_object('kind','email','id',r.id));
 elsif action='revoke' then
  update private.share_invites set status='revoked',revoked_at=now() where id=(args->>'id')::uuid and library_id=l.id;return jsonb_build_object('ok',true);
 elsif action='cancel' then
  update private.share_pairings set revoked_at=now(),delivery=null where id=(args->>'id')::uuid and library_id=l.id and consumed_id is null;return jsonb_build_object('ok',true);
 elsif action='pair' then
  perform 1 from public.libraries where id=l.id for update;
  if args->'emails' is not null and (jsonb_typeof(args->'emails')<>'array' or jsonb_array_length(args->'emails')>20) then raise exception 'share:too-many-emails' using errcode='22023';end if;
  if (select count(*) from private.share_devices where library_id=l.id and revoked_at is null and expires_at>now())>=20 then return jsonb_build_object('error','device-limit');end if;
  select share_keys.secret into secret from private.share_keys;
  for address in select distinct lower(trim(value)) from jsonb_array_elements_text(case when coalesce(jsonb_array_length(args->'emails'),0)=0 then '[""]'::jsonb else args->'emails' end) loop
   recipient:=case when address='' then null else private.share_recipient(address) end;
   if address<>'' and recipient is null then output:=output||jsonb_build_array(jsonb_build_object('email',address,'status','failed','error','recipient-unavailable'));continue;end if;
   if not private.share_budget('pair:'||actor::text,10,900) then output:=output||jsonb_build_array(jsonb_build_object('email',address,'status','failed','error','rate-limited'));continue;end if;
   token:=encode(extensions.gen_random_bytes(32),'hex');code:='';
   for n in 1..10 loop code:=code||substr(alphabet,(get_byte(extensions.gen_random_bytes(1),0)&31)+1,1);end loop;
   insert into private.share_pairings(owner_id,library_id,recipient_id,token_hash,code_hash,delivery) values(actor,l.id,recipient,private.share_hash(token),private.share_hash(code),extensions.pgp_sym_encrypt(jsonb_build_object('token',token,'code',code)::text,secret)) returning * into p;
   if recipient is not null then insert into private.share_inbox(recipient_id,kind,source_id) values(recipient,'device-invite',p.id);end if;
   output:=output||jsonb_build_array(jsonb_build_object('id',p.id,'email',address,'status','created','code',code,'token',token,'expiresAt',p.expires_at));
  end loop;return jsonb_build_object('results',output);
 elsif action in('preview','claim') then
  if not private.share_budget('pair-check:global',600,60) then return jsonb_build_object('error','rate-limited');end if;
  if args->>'notificationId' is not null then
   select source_id into notify from private.share_inbox where id=(args->>'notificationId')::uuid and recipient_id=actor and kind='device-invite';
   select * into p from private.share_pairings where id=notify and recipient_id=actor for update;
  elsif args->>'token' is not null then select * into p from private.share_pairings where token_hash=private.share_hash(args->>'token') for update;
  else code:=regexp_replace(upper(coalesce(args->>'code','')),'[\s-]','','g');select * into p from private.share_pairings where code_hash=private.share_hash(code) for update;end if;
  if not found or p.revoked_at is not null then return jsonb_build_object('error','pairing-unavailable','status',403);end if;
  binding:=args->>'binding';
  if p.consumed_id is not null then
   select * into d from private.share_devices where id=p.consumed_id and secret_hash=private.share_hash(coalesce(binding,''));
   if action='claim' and found then return private.share_context(jsonb_build_object('kind','device','device',binding));end if;
   return jsonb_build_object('error','pairing-used','status',403);
  end if;
  if p.expires_at<=clock_timestamp() then return jsonb_build_object('error','pairing-expired','status',403);end if;
  select * into l from public.libraries where id=p.library_id and deleted_at is null;
  if not found then return jsonb_build_object('error','access-revoked','status',403);end if;
  if action='preview' then return jsonb_build_object('id',p.id,'name',l.name,'expiresAt',p.expires_at,'sessionHours',72);end if;
  if binding is null or binding!~'^[a-f0-9]{64}$' or length(trim(coalesce(args->>'label',''))) not between 1 and 60 then return jsonb_build_object('error','invalid-claim','status',400);end if;
  if (select count(*) from private.share_devices where library_id=l.id and revoked_at is null and expires_at>now())>=20 then return jsonb_build_object('error','device-limit');end if;
  perform 1 from public.libraries where id=l.id for update;
  if (select count(*) from private.share_devices where library_id=l.id and revoked_at is null and expires_at>now())>=20 then return jsonb_build_object('error','device-limit');end if;
  insert into private.share_devices(owner_id,library_id,pairing_id,secret_hash,label) values(p.owner_id,p.library_id,p.id,private.share_hash(binding),trim(args->>'label')) returning * into d;
  update private.share_pairings set consumed_id=d.id,delivery=null where id=p.id;
  return private.share_context(jsonb_build_object('kind','device','device',binding));
 elsif action='end' then
  if args->>'kind' is distinct from 'device' then raise exception 'share:invalid-context' using errcode='22023';end if;
  update private.share_devices set revoked_at=coalesce(revoked_at,now()) where secret_hash=private.share_hash(coalesce(args->>'device',''));return jsonb_build_object('ok',true);
 elsif action='device-revoke' then
  select * into d from private.share_devices where id=(args->>'id')::uuid;l:=private.share_owner(d.library_id);
  update private.share_devices set revoked_at=now() where id=d.id;return jsonb_build_object('ok',true);
 elsif action='context' then return private.share_context(args);
 elsif action in('inbox','detail') then
  if actor is null then raise exception 'share:signed-out' using errcode='42501';end if;
  for item in select i.*,coalesce(a.library_id,b.library_id) as lib,coalesce(case when a.id is null then null when a.generation=i.generation then a.status else 'revoked' end,case when b.consumed_id is not null then 'used' when b.revoked_at is not null then 'cancelled' when b.expires_at<=now() then 'expired' else 'ready' end) as state,b.expires_at,b.delivery,source_library.name from private.share_inbox i left join private.share_invites a on i.kind='library-invite' and a.id=i.source_id left join private.share_pairings b on i.kind='device-invite' and b.id=i.source_id join public.libraries source_library on source_library.id=coalesce(a.library_id,b.library_id) and source_library.deleted_at is null where i.recipient_id=actor and (action='inbox' or i.id=(args->>'id')::uuid) order by i.created_at desc loop
   entry:=jsonb_build_object('id',item.id,'kind',item.kind,'sourceId',item.source_id,'generation',item.generation,'name',item.name,'libraryId',item.lib,'status',item.state,'expiresAt',item.expires_at,'createdAt',item.created_at);
   if action='detail' and item.kind='device-invite' and item.state='ready' then select share_keys.secret into secret from private.share_keys;entry:=entry||extensions.pgp_sym_decrypt(item.delivery,secret)::jsonb;end if;
   output:=output||jsonb_build_array(entry);
  end loop;
  if action='detail' then if jsonb_array_length(output)=0 then raise exception 'share:notification-unavailable' using errcode='42501';end if;return output->0;end if;
  return jsonb_build_object('items',output);
 elsif action='list' then
  if actor is not null then
   for r in select i.* from private.share_invites i join public.libraries source_library on source_library.id=i.library_id where i.recipient_id=actor and i.status='active' and source_library.deleted_at is null loop output:=output||jsonb_build_array(private.share_context(jsonb_build_object('kind','email','id',r.id)));end loop;
  end if;
  if args->>'device' is not null then begin output:=output||jsonb_build_array(private.share_context(jsonb_build_object('kind','device','device',args->>'device')));exception when insufficient_privilege then null;end;end if;
  return jsonb_build_object('libraries',output);
 elsif action in('watermark','snapshot','page','progress') then
  ctx:=private.share_context(args);lib:=(ctx->>'libraryId')::uuid;
  if action='progress' then if not private.share_budget('progress:'||(ctx->>'id'),120,60) then return jsonb_build_object('error','rate-limited');end if;return private.share_progress(ctx,(args->>'operationId')::uuid,args->'operations');end if;
  select coalesce(max(sequence),0) into watermark from private.cloud_changes where library_id=lib and owner_id=(ctx->>'ownerId')::uuid;
  if action='watermark' then return jsonb_build_object('context',ctx,'watermark',watermark);end if;
  if action='snapshot' then
   if not private.share_budget('snapshot:'||(ctx->>'id'),12,60) then return jsonb_build_object('error','rate-limited');end if;
   perform 1 from public.libraries where id=lib for share;
   select coalesce(max(sequence),0) into watermark from private.cloud_changes where library_id=lib and owner_id=(ctx->>'ownerId')::uuid;
   for item in select * from private.share_rows(lib,(ctx->>'ownerId')::uuid) order by entity,id loop
    entry:=jsonb_build_object('entity',item.entity,'id',item.id,'version',item.version,'row',item.document);
    if octet_length(entry::text)>1800000 then raise exception 'share:item-too-large' using errcode='22023';end if;
    if jsonb_array_length(page)>=100 or bytes+octet_length(entry::text)>1800000 then pages:=pages||jsonb_build_array(page);page:='[]';bytes:=0;end if;
    page:=page||jsonb_build_array(entry);bytes:=bytes+octet_length(entry::text);
   end loop;
   pages:=pages||jsonb_build_array(page);
   insert into private.share_snapshots(access_id,library_id,watermark,pages) values((ctx->>'id')::uuid,lib,watermark,pages) returning * into snap;
  else
   select * into snap from private.share_snapshots where id=(args->>'snapshotId')::uuid and access_id=(ctx->>'id')::uuid and library_id=lib and expires_at>now();
   if not found then raise exception 'share:snapshot-expired' using errcode='42501';end if;
  end if;
  n:=coalesce((args->>'page')::integer,0);
  if n<0 or n>=jsonb_array_length(snap.pages) then raise exception 'share:invalid-page' using errcode='22023';end if;
  return jsonb_build_object('context',ctx,'snapshotId',snap.id,'watermark',snap.watermark,'page',n,'pages',jsonb_array_length(snap.pages),'items',snap.pages->n);
 end if;
 raise exception 'share:invalid-action' using errcode='22023';
end$$;

do $$declare r record;begin for r in select oid::regprocedure as f from pg_proc where pronamespace='private'::regnamespace and proname like 'share_%' loop execute 'revoke all on function '||r.f||' from public,anon,authenticated';end loop;end$$;
revoke all on function public.wfk_share(text,jsonb) from public;
grant execute on function public.wfk_share(text,jsonb) to anon,authenticated;
commit;
