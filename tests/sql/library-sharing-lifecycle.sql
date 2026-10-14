-- Delete only the fixture identities. Receiving an invite must not block account deletion.
delete from auth.users where id='a2000000-0000-4000-8000-000000000002';
do $$begin
 if exists(select 1 from private.share_invites where recipient_id='a2000000-0000-4000-8000-000000000002') or exists(select 1 from private.share_inbox where recipient_id='a2000000-0000-4000-8000-000000000002') then raise exception 'recipient deletion left share membership';end if;
 if exists(select 1 from private.share_pairings where recipient_id='a2000000-0000-4000-8000-000000000002') then raise exception 'recipient deletion left account binding';end if;
 if (select count(*) from public.review_events where library_id='b1000000-0000-4000-8000-000000000001')<>1 then raise exception 'recipient deletion erased source progress';end if;
end$$;
delete from auth.users where id='a1000000-0000-4000-8000-000000000001';
do $$begin
 if exists(select 1 from private.share_invites where owner_id='a1000000-0000-4000-8000-000000000001') or exists(select 1 from private.share_pairings where owner_id='a1000000-0000-4000-8000-000000000001') or exists(select 1 from private.share_devices where owner_id='a1000000-0000-4000-8000-000000000001') or exists(select 1 from private.share_inbox where library_id='b1000000-0000-4000-8000-000000000001') or exists(select 1 from private.share_snapshots where library_id='b1000000-0000-4000-8000-000000000001') then raise exception 'source deletion left share data';end if;
end$$;
