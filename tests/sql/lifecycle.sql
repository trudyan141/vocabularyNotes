insert into auth.users values('80000000-0000-4000-8000-000000000008');
set role authenticated;
set request.jwt.claim.sub='80000000-0000-4000-8000-000000000008';
insert into public.libraries(id,name) values('81000000-0000-4000-8000-000000000008','Deletion test');
select public.begin_account_deletion();
select public.begin_account_deletion();
do $$ begin
 if (select deleted_at from public.libraries where id='81000000-0000-4000-8000-000000000008') is null then raise exception 'not frozen';end if;
 begin update public.libraries set deleted_at=null;raise exception 'resurrection allowed';exception when insufficient_privilege then null;end;
 begin insert into public.lessons(library_id,title,learned_on,source_type) values('81000000-0000-4000-8000-000000000008','forbidden','2026-10-10','manual');raise exception 'deleting account write';exception when insufficient_privilege then null;end;
 begin insert into storage.objects(bucket_id,name) values('learning-sources','80000000-0000-4000-8000-000000000008/81000000-0000-4000-8000-000000000008/new.jpg');raise exception 'deleting account upload';exception when insufficient_privilege then null;end;
end $$;
reset role;
delete from auth.users where id='80000000-0000-4000-8000-000000000008';
do $$ begin if exists(select 1 from private.account_deletions where owner_id='80000000-0000-4000-8000-000000000008') then raise exception 'deletion ledger retained';end if;end $$;
