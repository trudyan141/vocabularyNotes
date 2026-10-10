-- Additive sync protocol. User identity is always auth.uid(); no service-role client.
begin;
create table public.learning_content (
 id uuid primary key default gen_random_uuid(),owner_id uuid not null default auth.uid(),library_id uuid not null,
 sense_id uuid not null,content jsonb not null check(jsonb_typeof(content)='object'),
 version bigint not null default 1,created_at timestamptz not null default now(),updated_at timestamptz not null default now(),deleted_at timestamptz,
 unique(owner_id,library_id,id),foreign key(owner_id,library_id) references public.libraries(owner_id,id) on delete cascade,
 foreign key(owner_id,library_id,sense_id) references public.entry_senses(owner_id,library_id,id) on delete cascade
);
create index learning_content_sense_idx on public.learning_content(owner_id,library_id,sense_id);
alter table public.learning_content enable row level security;
alter table public.learning_content force row level security;
create policy owner_all on public.learning_content for all to authenticated using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()));
revoke all on public.learning_content from public,anon,authenticated;
grant select,insert,update,delete on public.learning_content to authenticated;
create trigger stamp before insert or update on public.learning_content for each row execute function private.stamp_record();
create table private.cloud_changes (
 sequence bigint generated always as identity primary key,owner_id uuid not null,library_id uuid not null,entity text not null,client_id text not null,version bigint not null,payload jsonb not null,
 foreign key(owner_id,library_id) references public.libraries(owner_id,id) on delete cascade
);
create index cloud_changes_cursor on private.cloud_changes(owner_id,library_id,sequence);
revoke all on private.cloud_changes from public,anon,authenticated;
create function private.sync_change() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if NEW.client_id is null or NEW.client_payload is null then return NEW;end if;
 perform 1 from public.libraries where id=NEW.library_id and owner_id=NEW.owner_id for update;
 insert into private.cloud_changes(owner_id,library_id,entity,client_id,version,payload) values(NEW.owner_id,NEW.library_id,TG_TABLE_NAME,NEW.client_id,NEW.version,NEW.client_payload);
 return NEW;
end $$;
revoke all on function private.sync_change() from public,anon,authenticated;
do $$ declare tab text;begin
 foreach tab in array array['lessons','vocabulary_entries','entry_senses','source_evidence','examples','lesson_vocabulary','notes','decks','practice_sessions','review_events','game_attempts','review_states','learning_content'] loop
  execute format('alter table public.%I add column client_id text check(length(client_id) between 1 and 200),add column client_payload jsonb check(jsonb_typeof(client_payload)=''object'')',tab);
  execute format('create unique index %I on public.%I(library_id,client_id) where client_id is not null',tab||'_client_identity',tab);
  execute format('create trigger sync_change after insert or update on public.%I for each row execute function private.sync_change()',tab);
 end loop;
end $$;
create function public.cloud_apply(target_library uuid,operation uuid,operations jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid();hashed text:=encode(sha256(convert_to(target_library::text||operations::text,'UTF8')),'hex');receipt private.sync_receipts%rowtype;op jsonb;data jsonb;tab text;key text;cols text;vals text;updates text;old_version bigint;result jsonb:='[]';remote_id uuid;stored jsonb;
begin
 if actor is null then raise exception 'signed out' using errcode='42501';end if;
 perform 1 from public.libraries where id=target_library and owner_id=actor and deleted_at is null for update;
 if not found then raise exception 'library unavailable' using errcode='42501';end if;
 if jsonb_typeof(operations)<>'array' or jsonb_array_length(operations)>100 or octet_length(operations::text)>2000000 then raise exception 'invalid batch' using errcode='22023';end if;
 select * into receipt from private.sync_receipts where owner_id=actor and operation_id=operation;
 if found then if receipt.payload_hash<>hashed then raise exception 'operation reused' using errcode='40001';end if;return receipt.result;end if;
 for op in select value from jsonb_array_elements(operations) loop
  tab:=op->>'entity';data:=op->'data';remote_id:=(op->>'id')::uuid;
  if tab<>all(array['lessons','vocabulary_entries','entry_senses','source_evidence','examples','lesson_vocabulary','notes','decks','practice_sessions','review_events','game_attempts','learning_content']) or tab is null or jsonb_typeof(data)<>'object' then raise exception 'invalid entity' using errcode='22023';end if;
  if op->>'baseVersion' is null or (op->>'baseVersion')::bigint<0 or data->>'client_id' is null or data->'client_payload'->>'id' is null or data->'client_payload'->>'id'<>data->>'client_id' then raise exception 'invalid identity' using errcode='22023';end if;
  cols:='';vals:='';updates:='';
  for key in select jsonb_object_keys(data) loop
   if key=any(array['id','owner_id','library_id','version','created_at','updated_at','accepted_sequence']) or not exists(select 1 from information_schema.columns where table_schema='public' and table_name=tab and column_name=key) then raise exception 'invalid field' using errcode='22023';end if;
   cols:=cols||format(',%I',key);vals:=vals||format(', (jsonb_populate_record(null::public.%I,$1)).%I',tab,key);updates:=updates||case when updates='' then '' else ',' end||format('%I=(jsonb_populate_record(null::public.%I,$1)).%I',key,tab,key);
  end loop;
  execute format('select version from public.%I where id=$1 and owner_id=$2 and library_id=$3',tab) into old_version using remote_id,actor,target_library;
  if old_version is null then
   if (op->>'baseVersion')::bigint<>0 then raise exception 'version conflict' using errcode='40001';end if;
   execute format('insert into public.%I(id,owner_id,library_id%s) select $2,$3,$4%s returning to_jsonb(%I.*)',tab,cols,vals,tab) into stored using data,remote_id,actor,target_library;
  else
   if tab=any(array['review_events','game_attempts']) then
    execute format('select client_payload from public.%I where id=$1 and owner_id=$2 and library_id=$3',tab) into stored using remote_id,actor,target_library;
    if stored<>data->'client_payload' then raise exception 'event changed' using errcode='40001';end if;
    stored:=jsonb_build_object('version',old_version);
   else
    if old_version<>(op->>'baseVersion')::bigint then raise exception 'version conflict' using errcode='40001';end if;
    execute format('update public.%I set %s where id=$2 and owner_id=$3 and library_id=$4 returning to_jsonb(%I.*)',tab,updates,tab) into stored using data,remote_id,actor,target_library;
   end if;
  end if;
  result:=result||jsonb_build_array(jsonb_build_object('entity',tab,'id',data->>'client_id','version',stored->'version'));
 end loop;
 result:=jsonb_build_object('accepted',result);
 insert into private.sync_receipts(owner_id,operation_id,payload_hash,result) values(actor,operation,hashed,result);
 return result;
end $$;
revoke all on function public.cloud_apply(uuid,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.cloud_apply(uuid,uuid,jsonb) to authenticated;
create function public.cloud_pull(target_library uuid,after_sequence bigint default 0) returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid();changes jsonb;cursor bigint;
begin
 if actor is null or not exists(select 1 from public.libraries where id=target_library and owner_id=actor and deleted_at is null) then raise exception 'library unavailable' using errcode='42501';end if;
 if after_sequence<0 then raise exception 'invalid cursor' using errcode='22023';end if;
 with candidates as(select sequence,entity,client_id as id,version,payload from private.cloud_changes where owner_id=actor and library_id=target_library and sequence>after_sequence order by sequence limit 100),bounded as(select *,sum(octet_length(payload::text)) over(order by sequence) as bytes from candidates) select coalesce(jsonb_agg(jsonb_build_object('sequence',sequence,'entity',entity,'id',id,'version',version,'payload',payload) order by sequence),'[]'),coalesce(max(sequence),after_sequence) into changes,cursor from bounded where bytes<=1800000;
 return jsonb_build_object('changes',changes,'cursor',cursor,'more',exists(select 1 from private.cloud_changes where owner_id=actor and library_id=target_library and sequence>cursor));
end $$;
revoke all on function public.cloud_pull(uuid,bigint) from public,anon,authenticated;
grant execute on function public.cloud_pull(uuid,bigint) to authenticated;
create function private.accept_review() returns trigger language plpgsql security definer set search_path='' as $$
declare previous public.review_states%rowtype;days integer:=0;factor numeric:=2.5;streak integer:=0;due timestamptz;local_sense text;local_scope text;state_id uuid;payload jsonb;at_text text;
begin
 perform 1 from public.libraries where id=NEW.library_id and owner_id=NEW.owner_id for update;
 select * into previous from public.review_states where owner_id=NEW.owner_id and library_id=NEW.library_id and sense_id=NEW.sense_id and card_type='word' for update;
 if found then days:=previous.interval_days;factor:=previous.ease;streak:=previous.streak;end if;
 case NEW.rating
  when 'Again' then days:=0;factor:=greatest(1.3,factor-.2);streak:=0;
  when 'Hard' then days:=greatest(1,ceil(greatest(1,days)*1.2));factor:=greatest(1.3,factor-.15);
  when 'Good' then streak:=streak+1;days:=case when streak=1 then 1 when streak=2 then 3 else ceil(days*factor) end;
  when 'Easy' then streak:=streak+1;days:=greatest(4,ceil(greatest(1,days)*(factor+.3)));factor:=least(3,factor+.15);
 end case;
 days:=least(365,days);due:=now()+case when NEW.rating='Again' then interval '10 minutes' else days*interval '1 day' end;
 state_id:=coalesce(previous.id,gen_random_uuid());local_sense:=coalesce(NEW.client_payload->>'senseId',NEW.sense_id::text);local_scope:='account:'||NEW.owner_id::text||':'||NEW.library_id::text;
 at_text:=to_char(now() at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"');
 payload:=jsonb_build_object('id',local_sense,'scopeId',local_scope,'version',coalesce(previous.version,0)+1,'createdAt',coalesce(previous.client_payload->>'createdAt',at_text),'updatedAt',at_text,'deletedAt',null,'payload',jsonb_build_object('state',jsonb_build_object('intervalDays',days,'ease',factor,'streak',streak,'dueAt',to_char(due at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),'algorithmVersion',1)));
 insert into public.review_states(id,owner_id,library_id,sense_id,card_type,interval_days,ease,streak,due_at,last_event_seq,client_id,client_payload)
 values(state_id,NEW.owner_id,NEW.library_id,NEW.sense_id,'word',days,factor,streak,due,NEW.accepted_sequence,local_sense,payload)
 on conflict(library_id,sense_id,card_type) do update set interval_days=excluded.interval_days,ease=excluded.ease,streak=excluded.streak,due_at=excluded.due_at,last_event_seq=excluded.last_event_seq,client_payload=excluded.client_payload,client_id=excluded.client_id;
 return NEW;
end $$;
revoke all on function private.accept_review() from public,anon,authenticated;
create trigger accept_review after insert on public.review_events for each row execute function private.accept_review();
create trigger stamp_update before update on public.review_states for each row execute function private.stamp_record();
commit;
