-- Owned rollback-only fixtures: owner sync, recipient progress and RLS.
begin;
create temporary table coverage_fixture(key text primary key,value jsonb);
grant select,insert,update on coverage_fixture to authenticated,anon;
insert into auth.users(id,email,email_confirmed_at) values
 ('d1000000-0000-4000-8000-000000000001','coverage-owner@example.test',now()),
 ('d2000000-0000-4000-8000-000000000002','coverage-other@example.test',now());
insert into public.libraries(id,owner_id,name) values('e1000000-0000-4000-8000-000000000001','d1000000-0000-4000-8000-000000000001','Coverage fixture');
do $$declare owner uuid:='d1000000-0000-4000-8000-000000000001';lib uuid:='e1000000-0000-4000-8000-000000000001';scope text:='account:'||owner||':'||lib;base jsonb;c jsonb;op jsonb;word jsonb;s jsonb;
begin
 base:=jsonb_build_object('scopeId',scope,'version',1,'createdAt','2026-10-19T00:00:00.000Z','updatedAt','2026-10-19T00:00:00.000Z','deletedAt',null);
 insert into public.vocabulary_entries(id,owner_id,library_id,display_text,canonical_key,kind,client_id,client_payload) values(private.share_remote(lib,'entries','entry'),owner,lib,'apple','apple','word','entry',base||'{"id":"entry","displayText":"apple","canonicalKey":"apple","keyVersion":1,"caseMode":"fold","kind":"word","language":"en"}');
 insert into public.entry_senses(id,owner_id,library_id,entry_id,pos,sense_label,identity_key,origin,learning_approval_status,approved_content_version,client_id,client_payload) values(private.share_remote(lib,'senses','apple'),owner,lib,private.share_remote(lib,'entries','entry'),'noun','fruit','noun:fruit','user','approved',1,'apple',base||'{"id":"apple","entryId":"entry","identity":"noun:fruit","pos":"noun","senseLabel":"fruit","definitionEn":"fruit","meaningVi":"táo","art":null,"source":"","origin":"user","contentStatus":"complete","learningApprovalStatus":"approved","contentVersion":1,"approvedContentVersion":1,"pronunciations":[],"tags":[]}');
 c:=jsonb_build_object('id','cycle','scopeId',scope,'mode','spelling','filter','{}'::jsonb,'createdAt','2026-10-19T00:00:00.000Z','items','[{"key":"item","senseId":"apple","revision":"1:1"}]'::jsonb);
 op:=jsonb_build_object('entity','practice_cycles','id',private.share_remote(lib,'practiceCycles','cycle'),'baseVersion',0,'data',jsonb_build_object('cycle_snapshot',c,'deleted_at',null,'client_id','cycle','client_payload',base||jsonb_build_object('id','cycle','payload',jsonb_build_object('cycle',c))));
 insert into coverage_fixture values('cycle-op',op);
 c:=jsonb_set(c,'{id}','"shared-cycle"');op:=jsonb_set(jsonb_set(jsonb_set(jsonb_set(op,'{id}',to_jsonb(private.share_remote(lib,'practiceCycles','shared-cycle'))),'{data,client_id}','"shared-cycle"'),'{data,cycle_snapshot}',c),'{data,client_payload}',base||jsonb_build_object('id','shared-cycle','payload',jsonb_build_object('cycle',c)));
 insert into coverage_fixture values('shared-cycle-op',op);
 word:='{"id":"apple","word":"apple","vi":"táo","en":"fruit","example":"","exampleVi":"","art":null,"lesson":"","pos":"noun","sense":"fruit","ready":true,"source":"","origin":"user","revision":"1:1","caseMode":"fold","approved":true,"tags":[],"pronunciations":[],"examplePronunciations":[]}';
 s:=jsonb_build_object('id','shared-round','scopeId',scope,'cycleId','shared-cycle','filter','{}'::jsonb,'direction','en-vi','mode','spelling','questions',jsonb_build_array(jsonb_build_object('id','q','cycleKey','item','word',word,'choices','[]'::jsonb,'missingIndex',0)),'position',0,'answers','[]'::jsonb,'revealed',false,'hint',false,'checkedAnswer',null,'checkedCorrect',null,'completedAt',null,'version',1,'createdAt','2026-10-19T00:00:00.000Z');
 op:=jsonb_build_object('entity','practice_sessions','id',private.share_remote(lib,'practiceSessions','shared-round'),'baseVersion',0,'data',jsonb_build_object('mode','spelling','deck_snapshot',s,'position',0,'completed_at',null,'deleted_at',null,'client_id','shared-round','client_payload',base||jsonb_build_object('id','shared-round','payload',jsonb_build_object('session',s))));
 insert into coverage_fixture values('session-op',op);
end$$;
set role authenticated;
set request.jwt.claim.sub='d1000000-0000-4000-8000-000000000001';
do $$declare op jsonb;bad jsonb;v jsonb;begin
 select value into op from coverage_fixture where key='cycle-op';
 perform public.cloud_apply('e1000000-0000-4000-8000-000000000001',gen_random_uuid(),jsonb_build_array(op));
 if (select count(*) from public.practice_cycles)<>1 then raise exception 'cycle owner sync lost';end if;
 bad:=jsonb_set(op,'{baseVersion}','1');bad:=jsonb_set(bad,'{data,cycle_snapshot,items,0,senseId}','"foreign"');bad:=jsonb_set(bad,'{data,client_payload,payload,cycle,items,0,senseId}','"foreign"');
 begin perform public.cloud_apply('e1000000-0000-4000-8000-000000000001',gen_random_uuid(),jsonb_build_array(bad));raise exception 'immutable cycle changed';exception when serialization_failure then null;end;
 v:=public.cloud_pull('e1000000-0000-4000-8000-000000000001',0);
 if not exists(select 1 from jsonb_array_elements(v->'changes') x where x->>'entity'='practice_cycles') then raise exception 'cycle absent from cursor';end if;
 insert into coverage_fixture values('pair',public.wfk_share('pair','{"libraryId":"e1000000-0000-4000-8000-000000000001"}'));
end$$;
set request.jwt.claim.sub='d2000000-0000-4000-8000-000000000002';
do $$begin if exists(select 1 from public.practice_cycles) then raise exception 'foreign cycles visible';end if;
 begin perform public.cloud_apply('e1000000-0000-4000-8000-000000000001',gen_random_uuid(),jsonb_build_array((select value from coverage_fixture where key='cycle-op')));raise exception 'foreign owner wrote cycle';exception when insufficient_privilege then null;end;
end$$;
set role anon;set request.jwt.claim.sub='';
do $$declare p jsonb;v jsonb;op jsonb;s jsonb;bad jsonb;begin
 select value->'results'->0 into p from coverage_fixture where key='pair';
 perform public.wfk_share('preview',jsonb_build_object('code',p->>'code','binding',repeat('f',64)));
 perform public.wfk_share('claim',jsonb_build_object('code',p->>'code','binding',repeat('f',64),'label','Coverage TV'));
 begin perform 1 from public.practice_cycles;raise exception 'anonymous table access';exception when insufficient_privilege then null;end;
 select value into op from coverage_fixture where key='shared-cycle-op';
 v:=public.wfk_share('progress',jsonb_build_object('kind','device','device',repeat('f',64),'operationId',gen_random_uuid(),'operations',jsonb_build_array(op)));if v ? 'error' then raise exception 'shared cycle rejected: %',v;end if;
 select value into op from coverage_fixture where key='session-op';
 bad:=jsonb_set(jsonb_set(op,'{data,deck_snapshot,questions,0,cycleKey}','"foreign"'),'{data,client_payload,payload,session,questions,0,cycleKey}','"foreign"');
 begin perform public.wfk_share('progress',jsonb_build_object('kind','device','device',repeat('f',64),'operationId',gen_random_uuid(),'operations',jsonb_build_array(bad)));raise exception 'foreign item accepted';exception when invalid_parameter_value then null;end;
 perform public.wfk_share('progress',jsonb_build_object('kind','device','device',repeat('f',64),'operationId',gen_random_uuid(),'operations',jsonb_build_array(op)));
 s:=op->'data'->'deck_snapshot';s:=s||'{"position":1,"version":2,"completedAt":"2026-10-19T00:01:00.000Z","answers":[{"questionId":"q","correct":false,"skipped":false,"hint":false,"rating":null,"answeredAt":"2026-10-19T00:01:00.000Z","day":"2026-10-19","timezone":"Asia/Ho_Chi_Minh"}]}'::jsonb;
 op:=jsonb_set(op,'{baseVersion}','1');op:=jsonb_set(jsonb_set(op,'{data,deck_snapshot}',s),'{data,client_payload,payload,session}',s);op:=jsonb_set(op,'{data,position}','1');op:=jsonb_set(op,'{data,completed_at}','"2026-10-19T00:01:00.000Z"');
 perform public.wfk_share('progress',jsonb_build_object('kind','device','device',repeat('f',64),'operationId',gen_random_uuid(),'operations',jsonb_build_array(op)));
 v:=public.wfk_share('snapshot',jsonb_build_object('kind','device','device',repeat('f',64)));
 if not exists(select 1 from jsonb_array_elements(v->'items') i where i->>'entity'='practiceCycles') then raise exception 'shared cycle missing';end if;
 if not exists(select 1 from jsonb_array_elements(v->'items') i where i->>'entity'='practiceSessions' and i->'row'->'payload'->'session'->'answers'->0->>'day'='2026-10-19') then raise exception 'activity day stripped';end if;
end$$;
reset role;
rollback;
