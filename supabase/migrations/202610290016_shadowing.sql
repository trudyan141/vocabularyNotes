begin;
create table public.shadowing_content (
 id uuid primary key default gen_random_uuid(),owner_id uuid not null default auth.uid(),library_id uuid not null,sense_id uuid not null,
 content jsonb not null check(jsonb_typeof(content)='object'),version bigint not null default 1,created_at timestamptz not null default now(),updated_at timestamptz not null default now(),deleted_at timestamptz,
 client_id text not null check(length(client_id) between 1 and 200),client_payload jsonb not null check(jsonb_typeof(client_payload)='object'),
 unique(owner_id,library_id,id),unique(library_id,client_id),unique(owner_id,library_id,sense_id),
 foreign key(owner_id,library_id) references public.libraries(owner_id,id) on delete cascade,
 foreign key(owner_id,library_id,sense_id) references public.entry_senses(owner_id,library_id,id) on delete cascade
);
alter table public.shadowing_content enable row level security;
alter table public.shadowing_content force row level security;
create policy owner_all on public.shadowing_content for all to authenticated using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()));
revoke all on public.shadowing_content from public,anon,authenticated;
grant select,insert,update,delete on public.shadowing_content to authenticated;
create function private.validate_shadowing_content() returns trigger language plpgsql set search_path='' as $$
declare s public.entry_senses;
begin
 if new.content is distinct from new.client_payload->'payload' or new.client_payload->>'scopeId' is distinct from 'account:'||new.owner_id::text||':'||new.library_id::text or new.client_payload->>'id' is distinct from new.client_id then raise exception 'shadow identity' using errcode='22023';end if;
 select * into s from public.entry_senses where id=new.sense_id and owner_id=new.owner_id and library_id=new.library_id;
 if not found or s.client_id is distinct from new.content->>'senseId' or new.content->>'targetId' is distinct from s.client_id or new.client_id is distinct from 'shadow:'||s.client_id then raise exception 'shadow parent' using errcode='42501';end if;
 return new;
end$$;
create trigger validate_shadow before insert or update on public.shadowing_content for each row execute function private.validate_shadowing_content();
create trigger account_write_guard before insert or update on public.shadowing_content for each row execute function private.guard_account_write();
create trigger stamp before insert or update on public.shadowing_content for each row execute function private.stamp_record();
create trigger cloud_change after insert or update on public.shadowing_content for each row execute function private.sync_change();
do $$declare definition text;begin
 select pg_get_functiondef('public.cloud_apply(uuid,uuid,jsonb)'::regprocedure) into definition;
 if position('''learning_extensions'']' in definition)=0 then raise exception 'unexpected cloud allowlist';end if;
 execute replace(definition,'''learning_extensions'']','''learning_extensions'',''shadowing_content'']');
end$$;
create function private.shared_shadow(p jsonb) returns jsonb language plpgsql immutable set search_path='' as $$
declare l jsonb;s jsonb;levels jsonb:='[]';sentences jsonb;decisions jsonb:='{}';i integer;j integer;
begin
 for l in select value from jsonb_array_elements(p->'levels') loop
 sentences:='[]';i:=0;j:=0;
 for s in select value from jsonb_array_elements(l->'sentences') loop
 if p->'decisions'->>(l->>'level'||':'||i::text)='approved' then sentences:=sentences||jsonb_build_array(s);decisions:=decisions||jsonb_build_object(l->>'level'||':'||j::text,'approved');j:=j+1;end if;i:=i+1;
 end loop;
 levels:=levels||jsonb_build_array(jsonb_build_object('level',l->>'level','sentences',sentences,'reason',''));
 end loop;
 return p||jsonb_build_object('levels',levels,'decisions',decisions,'status','ready','error',null);
end$$;
alter function private.share_rows(uuid,uuid) rename to share_rows_before_shadow;
create function private.share_rows(lib uuid,owner uuid) returns table(entity text,id text,version bigint,document jsonb) language plpgsql security definer set search_path='' as $$
begin
 return query select * from private.share_rows_before_shadow(lib,owner);
 return query select 'shadowingContent'::text,t.client_id,t.version,jsonb_set(t.client_payload,'{payload}',private.shared_shadow(t.content)) from public.shadowing_content t join public.entry_senses s on s.id=t.sense_id and s.owner_id=t.owner_id and s.library_id=t.library_id where t.owner_id=owner and t.library_id=lib and t.deleted_at is null and s.deleted_at is null and s.learning_approval_status='approved' and s.content_version=s.approved_content_version and exists(select 1 from jsonb_each_text(t.content->'decisions') d where d.value='approved');
end$$;
revoke all on function private.validate_shadowing_content(),private.shared_shadow(jsonb),private.share_rows_before_shadow(uuid,uuid),private.share_rows(uuid,uuid) from public,anon,authenticated;
commit;
