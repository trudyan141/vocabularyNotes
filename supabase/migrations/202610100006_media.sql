begin;
create table private.network_leases(id uuid primary key,owner_id uuid not null references auth.users(id) on delete cascade,operation text not null,expires_at timestamptz not null);
create index network_leases_owner_idx on private.network_leases(owner_id,operation,expires_at);
create table private.network_usage(owner_id uuid not null references auth.users(id) on delete cascade,day date not null,requests integer not null,primary key(owner_id,day));
revoke all on private.network_leases,private.network_usage from public,anon,authenticated;
create function public.reserve_media(operation text,lease uuid,parallel_limit integer default 2,project_daily_limit integer default 1000) returns boolean language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid();used integer;
begin
 if actor is null or operation not in ('search','import') or parallel_limit<1 or project_daily_limit<1 then raise exception 'invalid principal' using errcode='42501';end if;
 -- One shared reservation lock across instances and keys.
 perform pg_advisory_xact_lock(734892610);
 delete from private.network_leases where expires_at<now();delete from private.network_usage where day<current_date-30;
 if exists(select 1 from private.network_leases where id=lease) then return false;end if;
 if (select count(*) from private.network_leases where owner_id=actor and network_leases.operation=reserve_media.operation)>=least(2,parallel_limit) or (select count(*) from private.network_leases)>=8 then return false;end if;
 select requests into used from private.network_usage where owner_id=actor and day=current_date;
 if coalesce(used,0)>=100 or (select coalesce(sum(requests),0) from private.network_usage where day=current_date)>=least(1000,project_daily_limit) then return false;end if;
 insert into private.network_usage values(actor,current_date,1) on conflict(owner_id,day) do update set requests=network_usage.requests+1;
 insert into private.network_leases values(lease,actor,operation,now()+interval '30 seconds');return true;
end $$;
create function public.release_media(lease uuid) returns void language sql security definer set search_path='' as $$ delete from private.network_leases where id=lease and owner_id=auth.uid() $$;
revoke all on function public.reserve_media(text,uuid,integer,integer),public.release_media(uuid) from public,anon,authenticated;
grant execute on function public.reserve_media(text,uuid,integer,integer),public.release_media(uuid) to authenticated;
-- Original typed media records join the same sync protocol; payload holds a
-- bounded, normalized JPEG for portable offline use with source/license credit.
alter table public.media_assets add column client_id text check(length(client_id) between 1 and 200),add column client_payload jsonb check(jsonb_typeof(client_payload)='object');
create unique index media_assets_client_idx on public.media_assets(library_id,client_id) where client_id is not null;
create trigger changes after insert or update on public.media_assets for each row execute function private.sync_change();
create or replace function public.cloud_apply(target_library uuid,operation uuid,operations jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
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
  if tab<>all(array['lessons','vocabulary_entries','entry_senses','source_evidence','examples','lesson_vocabulary','notes','decks','practice_sessions','review_events','game_attempts','learning_content','media_assets']) or tab is null or jsonb_typeof(data)<>'object' then raise exception 'invalid entity' using errcode='22023';end if;
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
commit;
