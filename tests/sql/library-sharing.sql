-- Isolated fixtures only. Tests caller roles through the public RPC.
insert into auth.users(id,email,email_confirmed_at) values
 ('a1000000-0000-4000-8000-000000000001','owner@example.test',now()),
 ('a2000000-0000-4000-8000-000000000002','wife@example.test',now()),
 ('a3000000-0000-4000-8000-000000000003','other@example.test',now());
insert into auth.identities(user_id,provider) select id,'google' from auth.users where id in ('a1000000-0000-4000-8000-000000000001','a2000000-0000-4000-8000-000000000002','a3000000-0000-4000-8000-000000000003');
insert into public.libraries(id,owner_id,name,preferences) values
 ('b1000000-0000-4000-8000-000000000001','a1000000-0000-4000-8000-000000000001','Source library','{"privateKey":"PRIVATE_CANARY"}'),
 ('b2000000-0000-4000-8000-000000000002','a2000000-0000-4000-8000-000000000002','Wife own library','{}');
create table public.sharing_fixture(key text primary key,value jsonb);
grant select,insert,update on public.sharing_fixture to authenticated,anon;
set role authenticated;
set request.jwt.claim.sub='a1000000-0000-4000-8000-000000000001';
insert into public.sharing_fixture values('invite',public.wfk_share('invite','{"libraryId":"b1000000-0000-4000-8000-000000000001","emails":["wife@example.test","missing@example.test"]}'));
insert into public.sharing_fixture values('pair',public.wfk_share('pair','{"libraryId":"b1000000-0000-4000-8000-000000000001"}'));
insert into public.sharing_fixture values('notifiedPair',public.wfk_share('pair','{"libraryId":"b1000000-0000-4000-8000-000000000001","emails":["wife@example.test"]}'));
do $$declare v jsonb;begin
 select value into v from public.sharing_fixture where key='invite';
 if not exists(select 1 from jsonb_array_elements(v->'results') r where r->>'error'='recipient-unavailable') then raise exception 'unregistered email accepted';end if;
 select value->'results'->0 into v from public.sharing_fixture where key='pair';
 if length(v->>'code')<>10 or v->>'code'~'[^ABCDEFGHJKLMNPQRSTUVWXYZ23456789]' then raise exception 'invalid manual code';end if;
end$$;
set request.jwt.claim.sub='a3000000-0000-4000-8000-000000000003';
do $$declare id uuid;begin
 select (r->>'id')::uuid into id from public.sharing_fixture f,jsonb_array_elements(f.value->'results') r where key='invite' and r->>'email'='wife@example.test';
 begin perform public.wfk_share('accept',jsonb_build_object('id',id,'generation',1));raise exception 'wrong recipient accepted';exception when insufficient_privilege then null;end;
 begin perform public.wfk_share('overview','{"libraryId":"b1000000-0000-4000-8000-000000000001"}');raise exception 'foreign owner accepted';exception when insufficient_privilege then null;end;
end$$;
set request.jwt.claim.sub='a2000000-0000-4000-8000-000000000002';
insert into public.sharing_fixture select 'emailContext',public.wfk_share('accept',jsonb_build_object('id',r->>'id','generation',1)) from public.sharing_fixture f,jsonb_array_elements(f.value->'results') r where key='invite' and r->>'email'='wife@example.test';
do $$declare inbox jsonb;detail jsonb;begin
 inbox:=public.wfk_share('inbox');
 if jsonb_array_length(inbox->'items')<>2 then raise exception 'inbox delivery lost';end if;
 select public.wfk_share('detail',jsonb_build_object('id',r->>'id')) into detail from jsonb_array_elements(inbox->'items') r where r->>'kind'='device-invite';
 if length(detail->>'code')<>10 or length(detail->>'token')<>64 then raise exception 'notified code unavailable';end if;
 if (select count(*) from public.libraries)<>1 then raise exception 'own library visibility changed';end if;
 begin update public.libraries set name='hijack' where id='b1000000-0000-4000-8000-000000000001';if found then raise exception 'owner boundary bypassed';end if;exception when insufficient_privilege then null;end;
end$$;
set request.jwt.claim.sub='';set role anon;
do $$declare p jsonb;v jsonb;begin
 select value->'results'->0 into p from public.sharing_fixture where key='pair';
 perform public.wfk_share('preview',jsonb_build_object('code',p->>'code','binding',repeat('a',64)));
 perform public.wfk_share('preview',jsonb_build_object('token',p->>'token','binding',repeat('b',64)));
 v:=public.wfk_share('claim',jsonb_build_object('code',p->>'code','binding',repeat('a',64),'label','Living room TV'));
 if abs(extract(epoch from((v->>'expiresAt')::timestamptz-(v->>'serverTime')::timestamptz))-259200)>5 then raise exception 'lease not 72h';end if;
 insert into public.sharing_fixture values('deviceContext',v);
 perform public.wfk_share('claim',jsonb_build_object('token',p->>'token','binding',repeat('a',64),'label','retry'));
 v:=public.wfk_share('claim',jsonb_build_object('code',p->>'code','binding',repeat('b',64),'label','Second device'));if v->>'error'<>'pairing-used' then raise exception 'code reused across devices';end if;
 begin perform public.wfk_share('detail','{"id":"a1000000-0000-4000-8000-000000000001"}');raise exception 'anonymous inbox exposed';exception when insufficient_privilege then null;end;
 begin perform 1 from private.share_devices;raise exception 'private device table exposed';exception when insufficient_privilege then null;end;
 begin insert into public.lessons(owner_id,library_id,title,learned_on,source_type) values('a1000000-0000-4000-8000-000000000001','b1000000-0000-4000-8000-000000000001','hijack',current_date,'manual');raise exception 'anonymous write accepted';exception when insufficient_privilege then null;end;
end$$;
reset role;
-- Seed canonical DTOs and preserve a private pending-edit canary in the source.
do $$declare owner uuid:='a1000000-0000-4000-8000-000000000001';lib uuid:='b1000000-0000-4000-8000-000000000001';scope text:='account:'||owner||':'||lib;base jsonb;word jsonb;s jsonb;op jsonb;ctx jsonb;v jsonb;begin
 base:=jsonb_build_object('scopeId',scope,'version',1,'createdAt','2026-10-15T00:00:00.000Z','updatedAt','2026-10-15T00:00:00.000Z','deletedAt',null);
 insert into public.vocabulary_entries(id,owner_id,library_id,display_text,canonical_key,kind,client_id,client_payload) values(private.share_remote(lib,'entries','entry'),owner,lib,'apple','apple','word','entry',base||'{"id":"entry","displayText":"apple","canonicalKey":"apple","keyVersion":1,"caseMode":"fold","kind":"word","language":"en"}');
 insert into public.entry_senses(id,owner_id,library_id,entry_id,pos,sense_label,identity_key,origin,learning_approval_status,approved_content_version,client_id,client_payload) values(private.share_remote(lib,'senses','apple'),owner,lib,private.share_remote(lib,'entries','entry'),'noun','fruit','apple-fruit','user','approved',1,'apple',base||'{"id":"apple","entryId":"entry","identity":"apple-fruit","pos":"noun","senseLabel":"fruit","definitionEn":"fruit","meaningVi":"táo","art":null,"source":"","origin":"user","contentStatus":"complete","learningApprovalStatus":"approved","contentVersion":1,"approvedContentVersion":1,"pronunciations":[],"tags":[],"pendingEdit":{"patch":{"word":"PRIVATE_CANARY","vi":"","en":""},"contentBaseVersion":1,"createdAt":"2026-10-15"}}');
 word:='{"id":"apple","word":"apple","vi":"táo","en":"fruit","example":"","exampleVi":"","art":null,"lesson":"","pos":"noun","sense":"fruit","ready":true,"source":"","origin":"user","revision":"1:1","caseMode":"fold","approved":true,"tags":[],"pronunciations":[],"examplePronunciations":[]}';
 s:=jsonb_build_object('id','round','scopeId',scope,'mode','flashcard','questions',jsonb_build_array(jsonb_build_object('id','question','word',word,'choices','[]'::jsonb,'missingIndex',0)),'position',0,'answers','[]'::jsonb,'revealed',false,'hint',false,'checkedAnswer',null,'checkedCorrect',null,'completedAt',null,'version',1,'createdAt','2026-10-15T00:00:00.000Z');
 op:=jsonb_build_object('entity','practice_sessions','id',private.share_remote(lib,'practiceSessions','round'),'baseVersion',0,'data',jsonb_build_object('mode','flashcard','deck_snapshot',s,'position',0,'completed_at',null,'deleted_at',null,'client_id','round','client_payload',base||jsonb_build_object('id','round','payload',jsonb_build_object('session',s))));
 insert into public.sharing_fixture values('sessionOperation',op);
 ctx:=private.share_context('{"kind":"device","device":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"}');
 v:=public.wfk_share('progress',jsonb_build_object('kind','device','device',repeat('a',64),'operationId','c1000000-0000-4000-8000-000000000001','operations',jsonb_build_array(op)));
 if v->'accepted'->0->>'id'<>'round' then raise exception 'learning write failed';end if;
 perform public.wfk_share('progress',jsonb_build_object('kind','device','device',repeat('a',64),'operationId','c1000000-0000-4000-8000-000000000001','operations',jsonb_build_array(op)));
 if (select count(*) from public.practice_sessions where library_id=lib)<>1 then raise exception 'receipt retry duplicated';end if;
 begin perform public.wfk_share('progress',jsonb_build_object('kind','device','device',repeat('a',64),'operationId',gen_random_uuid(),'operations',jsonb_build_array(op-'baseVersion')));raise exception 'missing CAS accepted';exception when invalid_parameter_value then null;end;
 begin perform public.wfk_share('progress',jsonb_build_object('kind','device','device',repeat('a',64),'operationId',gen_random_uuid(),'operations',jsonb_build_array(jsonb_set(op,'{entity}','"lessons"'))));raise exception 'content write accepted';exception when insufficient_privilege then null;end;
 v:=public.wfk_share('snapshot','{"kind":"device","device":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"}');
 if v::text like '%PRIVATE_CANARY%' then raise exception 'private draft leaked';end if;
 if jsonb_array_length(v->'items')<>3 then raise exception 'source content or learning missing';end if;
 -- Newly committed grammar, including forms, is projected without evidence text.
 insert into public.learning_content(owner_id,library_id,sense_id,content,client_id,client_payload) values(owner,lib,private.share_remote(lib,'senses','apple'),'{}','grammar',base||jsonb_build_object('id','grammar','payload',jsonb_build_object('content','{"senseId":"apple","targetRevision":"1:1","example":"My apple is red.","exampleVi":"Táo của tôi màu đỏ.","readingHintVi":"","pattern":"","patternExplanation":"","grammarTitle":"Be","conditions":"describe","formula":"S + be + Adj","analysis":"adjective","commonError":"apple red","correction":"My apple is red.","approved":true,"origin":"user","sourceEvidenceText":"PRIVATE_CANARY","grammarFamily":"Be","grammarVariants":[{"formula":"S + be + Adj","example":"My apple is red.","exampleVi":"Táo của tôi màu đỏ.","analysis":"adjective","sourceEvidenceText":"PRIVATE_CANARY"}]}'::jsonb)));
 v:=public.wfk_share('snapshot','{"kind":"device","device":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"}');
 if v::text like '%PRIVATE_CANARY%' or not exists(select 1 from jsonb_array_elements(v->'items') item where item->>'entity'='sentences' and item->'row'->'payload'->'content'->>'grammarFamily'='Be') then raise exception 'new grammar missing or evidence leaked';end if;
 -- Shared event goes through the original review reducer and source IDs.
 op:=jsonb_build_object('entity','review_events','id',private.share_remote(lib,'reviewEvents','event'),'baseVersion',0,'data',jsonb_build_object('sense_id',private.share_remote(lib,'senses','apple'),'session_id',private.share_remote(lib,'practiceSessions','round'),'rating','Good','hints',false,'event_time','2026-10-15T00:00:00.000Z','deleted_at',null,'client_id','event','client_payload',jsonb_build_object('scopeId',scope,'id','event','senseId','apple','sessionId','round','rating','Good','hints',false,'eventTime','2026-10-15T00:00:00.000Z')));
 perform public.wfk_share('progress',jsonb_build_object('kind','device','device',repeat('a',64),'operationId',gen_random_uuid(),'operations',jsonb_build_array(op)));
 if (select count(*) from public.review_states where library_id=lib)<>1 then raise exception 'original SRS reducer not used';end if;
 -- Enough source rows to exercise immutable multi-page snapshots and catch-up.
 for i in 1..110 loop insert into public.lessons(owner_id,library_id,title,learned_on,source_type,client_id,client_payload) values(owner,lib,'new '||i,current_date,'manual','lesson-'||i,base||jsonb_build_object('id','lesson-'||i,'title','new '||i,'learnedOn','2026-10-15','sourceType','manual','sourceDigest','PRIVATE_CANARY'));end loop;
 v:=public.wfk_share('snapshot','{"kind":"device","device":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"}');
 if (v->>'pages')::int<2 or jsonb_array_length(v->'items')<>100 then raise exception 'pagination silently truncated';end if;
 v:=public.wfk_share('page',jsonb_build_object('kind','device','device',repeat('a',64),'snapshotId',v->>'snapshotId','page',1));
 if v::text like '%PRIVATE_CANARY%' then raise exception 'source digest leaked';end if;
 if jsonb_array_length(v->'items')<>16 then raise exception 'final page missing rows';end if;
end$$;
-- Failed guesses must consume durable budgets; SQL exceptions would roll them back.
insert into public.sharing_fixture values('budgetBefore',to_jsonb((select used from private.share_budgets where key='pair-check:global')));
set role anon;
do $$begin for i in 1..5 loop if public.wfk_share('preview','{"code":"INVALID0000"}')->>'error'<>'pairing-unavailable' then raise exception 'bad code accepted';end if;end loop;end$$;
reset role;
do $$begin if (select used from private.share_budgets where key='pair-check:global')<>(select (value::text)::int+5 from public.sharing_fixture where key='budgetBefore') then raise exception 'failed guesses did not consume budget';end if;end$$;
set role authenticated;set request.jwt.claim.sub='a1000000-0000-4000-8000-000000000001';
do $$declare id text;begin
 select value->>'id' into id from public.sharing_fixture where key='emailContext';
 perform public.wfk_share('revoke',jsonb_build_object('libraryId','b1000000-0000-4000-8000-000000000001','id',id));
 perform public.wfk_share('invite','{"libraryId":"b1000000-0000-4000-8000-000000000001","emails":["wife@example.test"]}');
end$$;
set request.jwt.claim.sub='a2000000-0000-4000-8000-000000000002';
do $$declare id text;begin
 select value->>'id' into id from public.sharing_fixture where key='emailContext';
 begin perform public.wfk_share('context',jsonb_build_object('kind','email','id',id));raise exception 'revoked email still reads';exception when insufficient_privilege then null;end;
 begin perform public.wfk_share('accept',jsonb_build_object('id',id,'generation',1));raise exception 'stale notification accepted';exception when insufficient_privilege then null;end;
end$$;
reset role;
update private.share_devices set expires_at=now()-interval '1 second' where label='Living room TV';
set role anon;set request.jwt.claim.sub='';
do $$begin
 begin perform public.wfk_share('context','{"kind":"device","device":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"}');raise exception 'expired device reads';exception when insufficient_privilege then null;end;
 perform public.wfk_share('end','{"kind":"device","device":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"}');
end$$;
reset role;
-- Fixture-specific isolation remains intact; source learning retained after expiry/revoke.
do $$begin if (select count(*) from public.review_events where library_id='b1000000-0000-4000-8000-000000000001')<>1 or (select count(*) from public.review_states where library_id='b1000000-0000-4000-8000-000000000001')<>1 or (select count(*) from public.libraries where id in ('b1000000-0000-4000-8000-000000000001','b2000000-0000-4000-8000-000000000002'))<>2 then raise exception 'revoke erased data';end if;end$$;
