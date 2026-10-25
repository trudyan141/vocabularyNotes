-- Six reviewed/tap-first games. Additive JSON contracts, unchanged owner/RLS boundaries.
begin;
set local lock_timeout='5s';
alter table public.practice_sessions drop constraint practice_sessions_mode_check;
alter table public.practice_sessions add constraint practice_sessions_mode_check check(mode in ('flashcard','picture-word','word-picture','letters','spelling','missing-letters','grammar','grammar-card','match-pairs','memory-pairs','word-builder','grammar-cloze','grammar-repair','grammar-dialogue')) not valid;
alter table public.practice_sessions validate constraint practice_sessions_mode_check;
create or replace function private.validate_practice_cycle() returns trigger language plpgsql security definer set search_path='' as $$
declare c jsonb:=new.cycle_snapshot;i jsonb;
begin
 if c is distinct from new.client_payload->'payload'->'cycle' or c->>'id' is distinct from new.client_id or c->>'scopeId' is distinct from 'account:'||new.owner_id::text||':'||new.library_id::text or new.client_payload->>'scopeId' is distinct from c->>'scopeId' or new.client_payload->>'id' is distinct from new.client_id then raise exception 'invalid cycle identity' using errcode='22023';end if;
 if tg_op='UPDATE' then
  if old.cycle_snapshot is distinct from c then raise exception 'cycle snapshot immutable' using errcode='40001';end if;
  return new;
 end if;
 if c->>'mode' not in ('flashcard','picture-word','word-picture','letters','spelling','missing-letters','grammar','grammar-card','match-pairs','memory-pairs','word-builder','grammar-cloze','grammar-repair','grammar-dialogue') or jsonb_typeof(c->'items') is distinct from 'array' or jsonb_array_length(c->'items') not between 1 and 10000 or jsonb_typeof(c->'filter') is distinct from 'object' then raise exception 'invalid cycle' using errcode='22023';end if;
 if (select count(*) from jsonb_array_elements(c->'items'))<>(select count(distinct value->>'key') from jsonb_array_elements(c->'items')) then raise exception 'duplicate cycle item' using errcode='22023';end if;
 -- Historical snapshots may first sync after a later edit/deletion. Check
 -- ownership here; active-question approval/revision is checked independently.
 for i in select value from jsonb_array_elements(c->'items') loop
  if not exists(select 1 from public.entry_senses s join public.vocabulary_entries e on e.id=s.entry_id where s.owner_id=new.owner_id and s.library_id=new.library_id and s.client_id=i->>'senseId') then raise exception 'foreign or stale cycle item' using errcode='42501';end if;
  if i ? 'grammar' and not exists(select 1 from public.learning_content g join public.entry_senses s on s.id=g.sense_id where g.owner_id=new.owner_id and g.library_id=new.library_id and g.client_id=i->'grammar'->>'id' and s.client_id=i->>'senseId') then raise exception 'foreign cycle grammar' using errcode='42501';end if;
 end loop;
 return new;
end$$;

create or replace function private.share_content(p jsonb) returns jsonb language plpgsql immutable set search_path='' as $$
declare result jsonb;variants jsonb;
begin result:=private.share_keep(p,array['gameActivities','grammarFamily','grammarVariants','senseId','targetRevision','example','exampleVi','exampleIpa','readingHintVi','pattern','patternExplanation','grammarTitle','conditions','formula','analysis','commonError','commonErrorIpa','correction','correctionIpa','approved','origin','source','lessonId']);
 if p ? 'grammarVariants' then select coalesce(jsonb_agg(private.share_keep(value,array['formula','example','exampleVi','exampleIpa','analysis','conditions','commonError','commonErrorIpa','correction','correctionIpa'])),'[]') into variants from jsonb_array_elements(p->'grammarVariants');result:=jsonb_set(result,'{grammarVariants}',variants);end if;if p ? 'gameActivities' then select coalesce(jsonb_agg(private.share_keep(value,array['sourceHash','version','kind','prompt','solution','translation','explanation','options','answer','context','promptIpa','solutionIpa','slot'])),'[]') into variants from jsonb_array_elements(p->'gameActivities');result:=jsonb_set(result,'{gameActivities}',variants);end if;return result;end$$;

create or replace function private.share_session(p jsonb) returns jsonb language plpgsql immutable set search_path='' as $$
declare s jsonb;q jsonb;questions jsonb:='[]';choices jsonb;answers jsonb;
begin
 s:=private.share_keep(p,array['id','scopeId','cycleId','mode','filter','direction','questions','position','revealed','hint','checkedAnswer','checkedCorrect','gameState','answers','completedAt','version','createdAt']);
 for q in select value from jsonb_array_elements(p->'questions') loop
  select coalesce(jsonb_agg(private.share_word(value)),'[]') into choices from jsonb_array_elements(q->'choices');
  if q ? 'grammar' then q:=jsonb_set(q,'{grammar}',private.share_keep(q->'grammar',array['id','version','formula','example','exampleVi','exampleIpa','title','conditions','analysis']));end if;
  if q ? 'activity' then q:=jsonb_set(q,'{activity}',private.share_keep(q->'activity',array['sourceHash','version','kind','prompt','solution','translation','explanation','options','answer','context','promptIpa','solutionIpa','slot']));end if;
  questions:=questions||jsonb_build_array(private.share_keep(q,array['id','cycleKey','missingIndex','missingIndices','grammar','activity','boardKeys'])||jsonb_build_object('word',private.share_word(q->'word'),'choices',choices));
 end loop;
 select coalesce(jsonb_agg(private.share_keep(value,array['questionId','correct','skipped','hint','rating','answeredAt','day','timezone','coveredKeys'])),'[]') into answers from jsonb_array_elements(p->'answers');s:=jsonb_set(s,'{answers}',answers);
 if s ? 'gameState' then s:=jsonb_set(s,'{gameState}',private.share_keep(s->'gameState',array['chosen','matched','open','wrong','left','mistakes']));end if;
 if s ? 'filter' then s:=jsonb_set(s,'{filter}',private.share_keep(s->'filter',array['set','word','lesson','deck','due','weak','direction']));end if;return jsonb_set(s,'{questions}',questions);
end$$;

create function private.validate_expansion_session() returns trigger language plpgsql security definer set search_path='' as $$
declare s jsonb:=new.deck_snapshot;q jsonb;w jsonb;c jsonb;idx integer;
begin
 if s->>'mode' not in ('match-pairs','memory-pairs','word-builder','grammar-cloze','grammar-repair','grammar-dialogue') then return new;end if;
 if s is distinct from new.client_payload->'payload'->'session' or s->>'mode' is distinct from new.mode or jsonb_typeof(s->'questions') is distinct from 'array' or jsonb_array_length(s->'questions') not between 1 and 10 then raise exception 'invalid game session' using errcode='22023';end if;
 if s ? 'gameState' and (jsonb_typeof(s->'gameState') is distinct from 'object' or octet_length((s->'gameState')::text)>4000 or s->'gameState' is distinct from private.share_keep(s->'gameState',array['chosen','matched','open','wrong','left','mistakes'])) then raise exception 'invalid game state' using errcode='22023';end if;
 if s ? 'cycleId' then select cycle_snapshot into c from public.practice_cycles where owner_id=new.owner_id and library_id=new.library_id and client_id=s->>'cycleId';end if;
 for q in select value from jsonb_array_elements(s->'questions') loop
  if s->>'mode' in ('match-pairs','memory-pairs') then
   if jsonb_typeof(q->'boardKeys') is distinct from 'array' or jsonb_typeof(q->'choices') is distinct from 'array' or jsonb_array_length(q->'choices') not between 1 and 3 or jsonb_array_length(q->'choices')<>jsonb_array_length(q->'boardKeys') or (select count(distinct value) from jsonb_array_elements(q->'boardKeys'))<>jsonb_array_length(q->'boardKeys') then raise exception 'invalid game board' using errcode='22023';end if;
   idx:=0;
   for w in select value from jsonb_array_elements(q->'choices') loop
    if not exists(select 1 from public.entry_senses sense where sense.owner_id=new.owner_id and sense.library_id=new.library_id and sense.client_id=w->>'id') then raise exception 'foreign board word' using errcode='42501';end if;
    if c is not null and not exists(select 1 from jsonb_array_elements(c->'items') item where item->>'key'=q->'boardKeys'->>idx and item->>'senseId'=w->>'id' and item->>'revision'=w->>'revision') then raise exception 'invalid board coverage' using errcode='22023';end if;
    if (select auth.uid()) is distinct from new.owner_id and not exists(select 1 from public.entry_senses sense join public.vocabulary_entries entry on entry.id=sense.entry_id where sense.owner_id=new.owner_id and sense.library_id=new.library_id and sense.client_id=w->>'id' and sense.deleted_at is null and entry.deleted_at is null and sense.learning_approval_status='approved' and sense.approved_content_version=sense.content_version and w->>'revision'=(entry.client_payload->>'version')||':'||(sense.client_payload->>'version')) then raise exception 'share:content-changed' using errcode='40001';end if;
    idx:=idx+1;
   end loop;
  elsif s->>'mode' like 'grammar-%' then
   if q->'activity'->>'kind' is distinct from s->>'mode' or q->'activity'->>'version' is distinct from '1' or q->'grammar'->>'example' is distinct from q->'activity'->>'solution' or jsonb_typeof(q->'activity'->'options') is distinct from 'array' or jsonb_array_length(q->'activity'->'options') not between 2 and 3 or not(q->'activity'->'options' ? (q->'activity'->>'answer')) then raise exception 'invalid grammar activity' using errcode='22023';end if;
   if not exists(select 1 from public.learning_content g join public.entry_senses sense on sense.id=g.sense_id where g.owner_id=new.owner_id and g.library_id=new.library_id and g.client_id=q->'grammar'->>'id' and sense.client_id=q->'word'->>'id') then raise exception 'foreign game grammar' using errcode='42501';end if;
   if (select auth.uid()) is distinct from new.owner_id and not exists(select 1 from public.learning_content g where g.owner_id=new.owner_id and g.library_id=new.library_id and g.client_id=q->'grammar'->>'id' and g.deleted_at is null and g.client_payload->>'version'=q->'grammar'->>'version' and g.content->>'approved'='true' and g.content->>'targetRevision'=q->'word'->>'revision' and exists(select 1 from jsonb_array_elements(coalesce(g.content->'gameActivities','[]')) activity where activity=q->'activity')) then raise exception 'share:content-changed' using errcode='40001';end if;
  end if;
 end loop;
 return new;
end$$;
revoke all on function private.validate_expansion_session() from public,anon,authenticated;
create trigger validate_expansion before insert or update on public.practice_sessions for each row execute function private.validate_expansion_session();
commit;
