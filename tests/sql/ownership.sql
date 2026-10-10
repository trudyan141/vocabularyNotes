-- Real PostgreSQL role switches and transactions; JWT helper/Storage metadata are local fixtures.
insert into auth.users values('10000000-0000-0000-0000-000000000001'),('20000000-0000-0000-0000-000000000002');
set role authenticated;
set request.jwt.claim.sub='10000000-0000-0000-0000-000000000001';
insert into public.libraries(id,name) values('11000000-0000-0000-0000-000000000001','A');
insert into public.lessons(id,library_id,title,learned_on,source_type) values('12000000-0000-0000-0000-000000000001','11000000-0000-0000-0000-000000000001','A lesson','2026-10-10','manual');
insert into public.vocabulary_entries(id,library_id,display_text,canonical_key,kind) values('13000000-0000-0000-0000-000000000001','11000000-0000-0000-0000-000000000001','book','book','word');
insert into public.entry_senses(id,library_id,entry_id,pos,sense_label,identity_key,origin) values('14000000-0000-0000-0000-000000000001','11000000-0000-0000-0000-000000000001','13000000-0000-0000-0000-000000000001','noun','printed object','noun|printed object','user'),('14000000-0000-0000-0000-000000000002','11000000-0000-0000-0000-000000000001','13000000-0000-0000-0000-000000000001','verb','reserve','verb|reserve','user');
insert into public.practice_sessions(id,library_id,mode,deck_snapshot) values('15000000-0000-0000-0000-000000000001','11000000-0000-0000-0000-000000000001','flashcard','{}');
insert into public.review_events(id,library_id,sense_id,session_id,rating,event_time) values('16000000-0000-0000-0000-000000000001','11000000-0000-0000-0000-000000000001','14000000-0000-0000-0000-000000000001','15000000-0000-0000-0000-000000000001','Good',now());
insert into storage.objects(bucket_id,name) values('learning-sources','10000000-0000-0000-0000-000000000001/11000000-0000-0000-0000-000000000001/image.jpg');
do $$ begin
 if (select count(*) from public.entry_senses)<>2 then raise exception 'distinct senses lost';end if;
 begin insert into public.vocabulary_entries(library_id,display_text,canonical_key,kind) values('11000000-0000-0000-0000-000000000001',' BOOK, ','client forged key','word');raise exception 'duplicate accepted';exception when unique_violation then null;end;
 begin insert into public.examples(library_id,text_en,origin) values('11000000-0000-0000-0000-000000000001','wrong target','user');raise exception 'missing target accepted';exception when check_violation then null;end;
 begin update public.entry_senses set learning_approval_status='approved',approved_content_version=null where id='14000000-0000-0000-0000-000000000001';raise exception 'approval without version accepted';exception when check_violation then null;end;
 begin update public.review_events set rating='Easy';raise exception 'immutable event updated';exception when insufficient_privilege then null;end;
 begin delete from public.review_events;raise exception 'immutable event deleted';exception when insufficient_privilege then null;end;
 begin insert into public.review_states(library_id,sense_id,card_type,interval_days,ease,streak,due_at,last_event_seq) values('11000000-0000-0000-0000-000000000001','14000000-0000-0000-0000-000000000001','word',1,2.5,1,now(),1);raise exception 'client schedule accepted';exception when insufficient_privilege then null;end;
 begin update public.libraries set owner_id='20000000-0000-0000-0000-000000000002';raise exception 'owner moved';exception when raise_exception then if SQLERRM='owner moved' then raise;end if;end;
end $$;
update public.lessons set title='updated',version=900 where id='12000000-0000-0000-0000-000000000001';
do $$ begin if (select version from public.lessons where id='12000000-0000-0000-0000-000000000001')<>2 then raise exception 'client version trusted';end if;end $$;
set request.jwt.claim.sub='20000000-0000-0000-0000-000000000002';
insert into public.libraries(id,name) values('21000000-0000-0000-0000-000000000002','B');
do $$ declare affected integer;begin
 if (select count(*) from public.libraries)<>1 or (select count(*) from public.lessons)<>0 or (select count(*) from public.entry_senses)<>0 or (select count(*) from public.review_events)<>0 then raise exception 'foreign rows visible';end if;
 if (select count(*) from storage.objects)<>0 then raise exception 'foreign storage visible';end if;
 update public.lessons set title='attack' where id='12000000-0000-0000-0000-000000000001';get diagnostics affected=row_count;if affected<>0 then raise exception 'foreign update';end if;
 delete from public.lessons where id='12000000-0000-0000-0000-000000000001';get diagnostics affected=row_count;if affected<>0 then raise exception 'foreign delete';end if;
 begin insert into public.lessons(owner_id,library_id,title,learned_on,source_type) values('10000000-0000-0000-0000-000000000001','11000000-0000-0000-0000-000000000001','attack','2026-10-10','manual');raise exception 'foreign owner accepted';exception when insufficient_privilege then null;end;
 begin insert into public.lessons(library_id,title,learned_on,source_type) values('11000000-0000-0000-0000-000000000001','attack','2026-10-10','manual');raise exception 'foreign library accepted';exception when foreign_key_violation or insufficient_privilege then null;end;
 begin insert into public.entry_senses(library_id,entry_id,pos,sense_label,identity_key,origin) values('21000000-0000-0000-0000-000000000002','13000000-0000-0000-0000-000000000001','noun','attack','attack','user');raise exception 'foreign entry reference accepted';exception when foreign_key_violation then null;end;
 begin insert into storage.objects(bucket_id,name) values('learning-sources','10000000-0000-0000-0000-000000000001/11000000-0000-0000-0000-000000000001/attack.jpg');raise exception 'foreign storage insert';exception when insufficient_privilege then null;end;
 begin insert into storage.objects(bucket_id,name) values('learning-sources','20000000-0000-0000-0000-000000000002/11000000-0000-0000-0000-000000000001/attack.jpg');raise exception 'foreign storage library';exception when insufficient_privilege then null;end;
 begin perform * from private.sync_receipts;raise exception 'private ledger exposed';exception when insufficient_privilege then null;end;
end $$;
reset role;
do $$ declare t record;begin
 for t in select c.relname from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r' loop
 if not exists(select 1 from pg_class c where c.relname=t.relname and c.relrowsecurity and c.relforcerowsecurity) then raise exception 'table without forced RLS: %',t.relname;end if;end loop;
 if (select public from storage.buckets where id='learning-sources') then raise exception 'public bucket';end if;
end $$;
set role anon;
do $$ begin begin perform * from public.libraries;raise exception 'anonymous library exposed';exception when insufficient_privilege then null;end;end $$;
reset role;
do $$ begin if private.canonical_v1(' Ａpple, ','fold')<>'apple' or private.canonical_v1(' US ','exact')<>'US' or private.canonical_v1('ice  cream','fold')<>'ice cream' or private.canonical_v1('don’t','fold')<>E'don\'t' or private.sense_v1(' NOUN ',' Printed  Object ')<>'["noun","printed object"]' then raise exception 'canonical fixture mismatch';end if;end $$;
delete from auth.users where id='10000000-0000-0000-0000-000000000001';
do $$ begin if exists(select 1 from public.lessons) or exists(select 1 from public.review_events) then raise exception 'account cascade failed';end if;end $$;
