-- Private version notifications; content is read only through authenticated cloud_pull.
begin;
create policy wfk_library_broadcast_read on realtime.messages for select to authenticated
using (extension='broadcast' and exists (
 select 1 from public.libraries l where l.owner_id=(select auth.uid()) and l.deleted_at is null
 and realtime.topic()='library:'||l.owner_id::text||':'||l.id::text
));
create or replace function private.sync_change() returns trigger language plpgsql security definer set search_path='' as $$
declare sequence_id bigint;notified jsonb:=coalesce(nullif(current_setting('wfk.broadcast_libraries',true),''),'[]')::jsonb;
begin
 if NEW.client_id is null or NEW.client_payload is null then return NEW;end if;
 perform 1 from public.libraries where id=NEW.library_id and owner_id=NEW.owner_id for update;
 insert into private.cloud_changes(owner_id,library_id,entity,client_id,version,payload)
 values(NEW.owner_id,NEW.library_id,TG_TABLE_NAME,NEW.client_id,NEW.version,NEW.client_payload) returning sequence into sequence_id;
 -- Notification failure must not roll back a lesson save. Cursor catch-up recovers it.
 begin
  if not notified ? NEW.library_id::text then
   perform realtime.send(jsonb_build_object('sequence',sequence_id),'changed','library:'||NEW.owner_id::text||':'||NEW.library_id::text,true);
   perform set_config('wfk.broadcast_libraries',(notified||jsonb_build_array(NEW.library_id::text))::text,true);
  end if;
 exception when others then null;
 end;
 return NEW;
end $$;
revoke all on function private.sync_change() from public,anon,authenticated;
commit;

begin;
-- Atomic patch merge preserves concurrent changes to different preference fields.
create function public.wfk_update_preferences(target_library uuid,changes jsonb) returns jsonb language plpgsql security invoker set search_path='' as $$
declare result jsonb;
begin
 if auth.uid() is null or jsonb_typeof(changes)<>'object' or octet_length(changes::text)>2000 or exists(select 1 from jsonb_object_keys(changes) k where k<>all(array['locale','level','childFriendly','reduceMotion','sound','profileName','profileAvatar'])) then raise exception 'invalid' using errcode='22023';end if;
 if exists(select 1 from jsonb_each(changes) as e(key,value) where
 (key in ('childFriendly','reduceMotion','sound') and jsonb_typeof(value)<>'boolean') or
 (key='locale' and value not in ('"vi"'::jsonb,'"en"'::jsonb)) or
 (key='level' and value not in ('"Beginner"'::jsonb,'"Intermediate"'::jsonb)) or
 (key='profileAvatar' and value not in ('"google"'::jsonb,'"fox"'::jsonb,'"cat"'::jsonb,'"dog"'::jsonb)) or
 (key='profileName' and (jsonb_typeof(value)<>'string' or length(value#>>'{}')>60))) then raise exception 'invalid preferences' using errcode='22023';end if;
 update public.libraries set preferences=preferences||changes where id=target_library and owner_id=auth.uid() and deleted_at is null returning preferences into result;
 if not found then raise exception 'unavailable' using errcode='42501';end if;
 return result;
end $$;
revoke all on function public.wfk_update_preferences(uuid,jsonb) from public,anon;
grant execute on function public.wfk_update_preferences(uuid,jsonb) to authenticated;
create function private.preferences_changed() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if NEW.preferences is distinct from OLD.preferences then
  begin perform realtime.send('{}'::jsonb,'changed','library:'||NEW.owner_id::text||':'||NEW.id::text,true);exception when others then null;end;
 end if;
 return NEW;
end $$;
revoke all on function private.preferences_changed() from public,anon,authenticated;
create trigger preferences_changed after update of preferences on public.libraries for each row execute function private.preferences_changed();
commit;
