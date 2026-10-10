begin;
-- Canonical v1 matches the application fixture rules. Ownership is still RLS-controlled.
create function private.canonical_v1(value text, case_mode text) returns text
language plpgsql immutable strict security invoker set search_path='' as $$
declare result text;
begin
 result:=translate(normalize(value,NFKC),'‘’‐‑‒–—',chr(39)||chr(39)||'-----');
 result:=regexp_replace(btrim(result),'^[.,!?;:"“”()\[\]{}[:space:]]+|[.,!?;:"“”()\[\]{}[:space:]]+$','','g');
 result:=regexp_replace(result,'[[:space:]]+',' ','g');
 if length(result)=0 then raise exception 'empty canonical word';end if;
 return case when case_mode='fold' then lower(result) else result end;
end $$;
create function private.sense_v1(pos text,label text) returns text
language sql immutable strict security invoker set search_path='' as $$
 select '['||to_json(lower(regexp_replace(btrim(normalize(pos,NFKC)),'[[:space:]]+',' ','g')))::text||','||to_json(lower(regexp_replace(btrim(normalize(label,NFKC)),'[[:space:]]+',' ','g')))::text||']'
$$;
-- Triggers derive keys before validation; clients cannot bypass dedup by supplying a fake key.
create function private.stamp_identity() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if TG_TABLE_NAME='vocabulary_entries' then NEW.canonical_key:=private.canonical_v1(NEW.display_text,NEW.case_mode);
 else NEW.identity_key:=private.sense_v1(NEW.pos,NEW.sense_label);end if;
 return NEW;
end $$;
create trigger identity_key before insert or update on public.vocabulary_entries for each row execute function private.stamp_identity();
create trigger identity_key before insert or update on public.entry_senses for each row execute function private.stamp_identity();
-- Helper schema usage permits checked pure identity functions, not access to private tables.
grant usage on schema private to authenticated;
revoke all on function private.stamp_identity() from public,anon,authenticated;
revoke all on function private.canonical_v1(text,text),private.sense_v1(text,text) from public,anon;
grant execute on function private.canonical_v1(text,text),private.sense_v1(text,text) to authenticated;
commit;
