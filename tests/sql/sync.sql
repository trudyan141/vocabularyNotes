insert into auth.users(id) values('30000000-0000-0000-0000-000000000003'),('40000000-0000-0000-0000-000000000004');
set role authenticated;
set request.jwt.claim.sub='30000000-0000-0000-0000-000000000003';
insert into public.libraries(id,name) values('31000000-0000-0000-0000-000000000003','sync A');
select public.cloud_apply('31000000-0000-0000-0000-000000000003','32000000-0000-0000-0000-000000000003','[{"entity":"lessons","id":"33000000-0000-0000-0000-000000000003","baseVersion":0,"data":{"title":"first","learned_on":"2026-10-10","source_type":"manual","client_id":"lesson-a","client_payload":{"id":"lesson-a","title":"first"}}}]');
do $$ declare result jsonb;begin
 result:=public.cloud_apply('31000000-0000-0000-0000-000000000003','32000000-0000-0000-0000-000000000003','[{"entity":"lessons","id":"33000000-0000-0000-0000-000000000003","baseVersion":0,"data":{"title":"first","learned_on":"2026-10-10","source_type":"manual","client_id":"lesson-a","client_payload":{"id":"lesson-a","title":"first"}}}]');
 if (select count(*) from public.lessons)<>1 then raise exception 'retry duplicated';end if;
 if public.cloud_pull('31000000-0000-0000-0000-000000000003',0)->'changes'->0->>'id'<>'lesson-a' then raise exception 'cursor pull lost';end if;
 begin perform public.cloud_apply('31000000-0000-0000-0000-000000000003','32000000-0000-0000-0000-000000000003','[]');raise exception 'reused hash accepted';exception when serialization_failure then null;end;
 begin perform public.cloud_apply('31000000-0000-0000-0000-000000000003','35000000-0000-0000-0000-000000000003','[{"entity":"lessons","id":"33000000-0000-0000-0000-000000000003","baseVersion":99,"data":{"title":"stale","client_id":"lesson-a","client_payload":{"id":"lesson-a"}}}]');raise exception 'stale accepted';exception when serialization_failure then null;end;
 begin perform public.cloud_apply('31000000-0000-0000-0000-000000000003','36000000-0000-0000-0000-000000000003','[{"entity":"lessons","id":"37000000-0000-0000-0000-000000000003","baseVersion":0,"data":{"title":"rollback","learned_on":"2026-10-10","source_type":"manual","client_id":"rollback","client_payload":{"id":"rollback"}}},{"entity":"auth.users","id":"38000000-0000-0000-0000-000000000003","baseVersion":0,"data":{"client_id":"x","client_payload":{"id":"x"}}}]');raise exception 'entity injection accepted';exception when invalid_parameter_value then null;end;
 if (select count(*) from public.lessons)<>1 then raise exception 'batch not atomic';end if;
end $$;
set request.jwt.claim.sub='40000000-0000-0000-0000-000000000004';
do $$ begin
 begin perform public.cloud_pull('31000000-0000-0000-0000-000000000003',0);raise exception 'foreign pull accepted';exception when insufficient_privilege then null;end;
 begin perform public.cloud_apply('31000000-0000-0000-0000-000000000003','39000000-0000-0000-0000-000000000003','[]');raise exception 'foreign push accepted';exception when insufficient_privilege then null;end;
end $$;
reset role;
delete from auth.users where id in ('30000000-0000-0000-0000-000000000003','40000000-0000-0000-0000-000000000004');
-- The original ownership suite separately verifies that clients cannot write schedules.
