-- Rollback-only fixtures for the new game contracts/projections/ownership.
begin;
insert into auth.users(id,email,email_confirmed_at) values('f1000000-0000-4000-8000-000000000001','games-owner@example.test',now());
insert into public.libraries(id,owner_id,name) values('f2000000-0000-4000-8000-000000000001','f1000000-0000-4000-8000-000000000001','Game fixture');
do $$
declare owner uuid:='f1000000-0000-4000-8000-000000000001';lib uuid:='f2000000-0000-4000-8000-000000000001';scope text:='account:'||owner||':'||lib;base jsonb;w jsonb;s jsonb;c jsonb;op jsonb;result jsonb;failed boolean:=false;
begin
 base:=jsonb_build_object('scopeId',scope,'version',1,'createdAt','2026-10-24T00:00:00.000Z','updatedAt','2026-10-24T00:00:00.000Z','deletedAt',null);
 insert into public.vocabulary_entries(id,owner_id,library_id,display_text,canonical_key,kind,client_id,client_payload) values(private.share_remote(lib,'entries','entry'),owner,lib,'apple','apple','word','entry',base||'{}');
 insert into public.entry_senses(id,owner_id,library_id,entry_id,pos,sense_label,identity_key,origin,learning_approval_status,approved_content_version,client_id,client_payload) values(private.share_remote(lib,'senses','apple'),owner,lib,private.share_remote(lib,'entries','entry'),'noun','fruit','noun:fruit','user','approved',1,'apple',base||'{}');
 c:=jsonb_build_object('id','games-cycle','scopeId',scope,'mode','match-pairs','filter','{}'::jsonb,'createdAt','2026-10-24T00:00:00.000Z','items','[{"key":"a","senseId":"apple","revision":"1:1"}]'::jsonb);
 insert into public.practice_cycles(id,owner_id,library_id,cycle_snapshot,client_id,client_payload) values(private.share_remote(lib,'practiceCycles','games-cycle'),owner,lib,c,'games-cycle',base||jsonb_build_object('id','games-cycle','payload',jsonb_build_object('cycle',c)));
 w:='{"id":"apple","word":"apple","vi":"táo","revision":"1:1","privateField":"hidden"}';
 s:=jsonb_build_object('id','games-round','scopeId',scope,'cycleId','games-cycle','mode','match-pairs','filter','{}'::jsonb,'questions',jsonb_build_array(jsonb_build_object('id','q','cycleKey','a','word',w,'choices',jsonb_build_array(w),'missingIndex',0,'boardKeys',jsonb_build_array('a'))),'position',0,'answers','[]'::jsonb,'revealed',false,'hint',false,'checkedAnswer',null,'checkedCorrect',null,'completedAt',null,'version',1,'createdAt','2026-10-24T00:00:00.000Z','gameState','{"chosen":[],"matched":[],"open":[],"wrong":[],"left":0,"mistakes":0}'::jsonb);
 insert into public.practice_sessions(id,owner_id,library_id,mode,deck_snapshot,client_id,client_payload) values(private.share_remote(lib,'practiceSessions','games-round'),owner,lib,'match-pairs',s,'games-round',base||jsonb_build_object('id','games-round','payload',jsonb_build_object('session',s)));
 result:=private.share_session(s);
 if result->'gameState' is distinct from s->'gameState' or result->'questions'->0->'boardKeys' is distinct from '["a"]'::jsonb or result->'questions'->0->'choices'->0 ? 'privateField' then raise exception 'game session projection lost fields/leaked private word';end if;
 result:=private.share_session(jsonb_set(s,'{answers}','[{"questionId":"q","correct":true,"skipped":false,"hint":false,"rating":null,"coveredKeys":["a"]}]'));
 if result->'answers'->0->'coveredKeys' is distinct from '["a"]'::jsonb then raise exception 'coverage projection lost targets';end if;
 begin
  update public.practice_sessions set deck_snapshot=jsonb_set(s,'{questions,0,boardKeys}','["foreign"]'),client_payload=base||jsonb_build_object('id','games-round','payload',jsonb_build_object('session',jsonb_set(s,'{questions,0,boardKeys}','["foreign"]'))) where client_id='games-round' and library_id=lib;
 exception when sqlstate '22023' then failed:=true;end;
 if not failed then raise exception 'foreign board key accepted';end if;
 failed:=false;
 begin
  update public.practice_sessions set deck_snapshot=jsonb_set(s,'{questions,0,choices,0,id}','"foreign"'),client_payload=base||jsonb_build_object('id','games-round','payload',jsonb_build_object('session',jsonb_set(s,'{questions,0,choices,0,id}','"foreign"'))) where client_id='games-round' and library_id=lib;
 exception when sqlstate '42501' then failed:=true;end;
 if not failed then raise exception 'foreign board word accepted';end if;
 result:=private.share_content('{"gameActivities":[{"sourceHash":"signature","version":1,"kind":"grammar-cloze","prompt":"She ___ happy.","answer":"is","solution":"She is happy.","options":["is","am"],"translation":"Bạn ấy vui.","explanation":"She đi với is.","privateField":"hidden"}],"sourceEvidenceText":"private evidence"}');
 if result->'gameActivities'->0->>'sourceHash' is distinct from 'signature' or result->'gameActivities'->0->>'answer' is distinct from 'is' or result ? 'sourceEvidenceText' or result->'gameActivities'->0 ? 'privateField' then raise exception 'activity projection lost data/leaked evidence';end if;
end$$;
rollback;
