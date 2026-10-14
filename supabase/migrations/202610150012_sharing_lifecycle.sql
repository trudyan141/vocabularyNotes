-- ADR096: account/library deletion must also clean private sharing records.
-- Additive follow-up to already-applied0011; existing learning/content tables stay unchanged.
begin;
set local lock_timeout='5s';
alter table private.share_invites drop constraint share_invites_recipient_id_fkey;
alter table private.share_invites add constraint share_invites_recipient_id_fkey foreign key(recipient_id) references auth.users(id) on delete cascade;
alter table private.share_pairings drop constraint share_pairings_recipient_id_fkey;
alter table private.share_pairings add constraint share_pairings_recipient_id_fkey foreign key(recipient_id) references auth.users(id) on delete set null;
create index share_pairings_recipient on private.share_pairings(recipient_id) where recipient_id is not null;
alter table private.share_inbox drop constraint share_inbox_recipient_id_fkey;
alter table private.share_inbox add constraint share_inbox_recipient_id_fkey foreign key(recipient_id) references auth.users(id) on delete cascade;
alter table private.share_inbox add column library_id uuid;
update private.share_inbox i set library_id=case i.kind when 'library-invite' then (select library_id from private.share_invites where id=i.source_id) else (select library_id from private.share_pairings where id=i.source_id) end;
-- Orphan reminders have no source grant and were already invisible in the inbox RPC.
delete from private.share_inbox where library_id is null;
alter table private.share_inbox alter column library_id set not null;
alter table private.share_inbox add constraint share_inbox_library_fkey foreign key(library_id) references public.libraries(id) on delete cascade;
create index share_inbox_library on private.share_inbox(library_id);
create function private.share_inbox_library() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.kind='library-invite' then select library_id into new.library_id from private.share_invites where id=new.source_id and recipient_id=new.recipient_id and generation=new.generation;
 else select library_id into new.library_id from private.share_pairings where id=new.source_id and recipient_id=new.recipient_id;end if;
 if new.library_id is null then raise exception 'share:invalid-notification' using errcode='22023';end if;return new;
end$$;
revoke all on function private.share_inbox_library() from public,anon,authenticated;
create trigger share_inbox_library before insert on private.share_inbox for each row execute function private.share_inbox_library();
delete from private.share_snapshots s where not exists(select 1 from public.libraries l where l.id=s.library_id);
alter table private.share_snapshots add constraint share_snapshots_library_fkey foreign key(library_id) references public.libraries(id) on delete cascade;
create index share_snapshots_library on private.share_snapshots(library_id);
commit;
