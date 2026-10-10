begin;
create table private.account_deletions (
 owner_id uuid primary key references auth.users(id) on delete cascade,
 started_at timestamptz not null default now()
);
revoke all on private.account_deletions from public,anon,authenticated;
create function public.begin_account_deletion() returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid();
begin
 if actor is null then raise exception 'authentication required' using errcode='42501';end if;
 perform 1 from public.libraries where owner_id=actor order by id for update;
 if not exists(select 1 from private.account_deletions where owner_id=actor) then
  update public.libraries set deleted_at=now() where owner_id=actor;
  insert into private.account_deletions(owner_id) values(actor);
 end if;
 return jsonb_build_object('status','deleting');
end $$;
revoke all on function public.begin_account_deletion() from public,anon,authenticated;
grant execute on function public.begin_account_deletion() to authenticated;
create function private.guard_account_write() returns trigger language plpgsql security definer set search_path='' as $$
begin
 -- Share the library lock with sync, deletion and source writes.
 if TG_TABLE_NAME='libraries' then
  perform 1 from auth.users where id=NEW.owner_id for key share;
 else
  perform 1 from public.libraries where owner_id=NEW.owner_id and id=NEW.library_id for update;
 end if;
 if exists(select 1 from private.account_deletions where owner_id=NEW.owner_id) then raise exception 'account deletion in progress' using errcode='42501';end if;
 if TG_TABLE_NAME<>'libraries' then
  if not exists(select 1 from public.libraries where owner_id=NEW.owner_id and id=NEW.library_id and deleted_at is null) then raise exception 'inactive library' using errcode='42501';end if;
 end if;
 return NEW;
end $$;
revoke all on function private.guard_account_write() from public,anon,authenticated;
do $$ declare tab text;begin
 foreach tab in array array['libraries','lessons','vocabulary_entries','entry_senses','sentences','patterns','grammar_items','source_evidence','source_assets','surface_forms','examples','lesson_vocabulary','lesson_sentences','lesson_patterns','lesson_grammar','notes','media_assets','decks','deck_items','review_states','practice_sessions','review_events','game_attempts','learning_content'] loop
  execute format('create trigger account_write_guard before insert or update on public.%I for each row execute function private.guard_account_write()',tab);
 end loop;
end $$;
-- Validate deck membership through normalized, owner-scoped FKs as well as its payload.
create function private.validate_deck_members() returns trigger language plpgsql security definer set search_path='' as $$
declare member text;
begin
 if NEW.client_payload is null then return NEW;end if;
 if jsonb_typeof(NEW.query_filters->'senseIds')<>'array' then raise exception 'invalid deck' using errcode='22023';end if;
 for member in select jsonb_array_elements_text(NEW.query_filters->'senseIds') loop
  if not exists(select 1 from public.entry_senses where owner_id=NEW.owner_id and library_id=NEW.library_id and client_id=member and deleted_at is null) then raise exception 'foreign deck member' using errcode='42501';end if;
 end loop;
 return NEW;
end $$;
revoke all on function private.validate_deck_members() from public,anon,authenticated;
create trigger deck_members before insert or update on public.decks for each row execute function private.validate_deck_members();
commit;
