-- ADR110: optional adult learning supplements; child content and progress stay separate.
begin;
create table public.learning_extensions (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null default auth.uid(), library_id uuid not null,
 sense_id uuid not null, learning_id uuid, content jsonb not null check(jsonb_typeof(content)='object'),
 version bigint not null default 1, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz,
 client_id text not null check(length(client_id) between 1 and 200),client_payload jsonb not null check(jsonb_typeof(client_payload)='object'),
 unique(owner_id,library_id,id),unique(library_id,client_id),
 foreign key(owner_id,library_id) references public.libraries(owner_id,id) on delete cascade,
 foreign key(owner_id,library_id,sense_id) references public.entry_senses(owner_id,library_id,id) on delete cascade,
 foreign key(owner_id,library_id,learning_id) references public.learning_content(owner_id,library_id,id) on delete cascade,
 check(content->>'kind' in ('sense','grammar')),
 check((content->>'kind'='sense' and learning_id is null) or (content->>'kind'='grammar' and learning_id is not null))
);
create index learning_extensions_sense on public.learning_extensions(owner_id,library_id,sense_id);
create index learning_extensions_grammar on public.learning_extensions(owner_id,library_id,learning_id) where learning_id is not null;
create unique index learning_extensions_parent on public.learning_extensions(owner_id,library_id,sense_id,coalesce(learning_id,'00000000-0000-0000-0000-000000000000'::uuid));
alter table public.learning_extensions enable row level security;
alter table public.learning_extensions force row level security;
create policy owner_all on public.learning_extensions for all to authenticated using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()));
revoke all on public.learning_extensions from public,anon,authenticated;
grant select,insert,update,delete on public.learning_extensions to authenticated;
create function private.validate_learning_extension() returns trigger language plpgsql set search_path='' as $$
declare p jsonb:=new.content;s public.entry_senses;g public.learning_content;
begin
 if p is distinct from new.client_payload->'payload' or new.client_payload->>'scopeId' is distinct from 'account:'||new.owner_id::text||':'||new.library_id::text or new.client_payload->>'id' is distinct from new.client_id then raise exception 'extension identity' using errcode='22023';end if;
 select * into s from public.entry_senses where id=new.sense_id and owner_id=new.owner_id and library_id=new.library_id;
 if not found or s.client_id is distinct from p->>'senseId' then raise exception 'extension parent' using errcode='42501';end if;
 if p->>'kind'='sense' and p->>'targetId' is distinct from s.client_id then raise exception 'extension target' using errcode='42501';end if;
 if new.learning_id is not null then select * into g from public.learning_content where id=new.learning_id and owner_id=new.owner_id and library_id=new.library_id and sense_id=new.sense_id;if not found or g.client_id is distinct from p->>'targetId' then raise exception 'extension grammar' using errcode='42501';end if;end if;
 return new;
end$$;
create trigger validate_extension before insert or update on public.learning_extensions for each row execute function private.validate_learning_extension();
create trigger account_write_guard before insert or update on public.learning_extensions for each row execute function private.guard_account_write();
create trigger stamp before insert or update on public.learning_extensions for each row execute function private.stamp_record();
create trigger cloud_change after insert or update on public.learning_extensions for each row execute function private.sync_change();
-- Preserve the current sync function, expanding only its explicit entity allowlist.
do $$declare definition text;begin
 select pg_get_functiondef('public.cloud_apply(uuid,uuid,jsonb)'::regprocedure) into definition;
 if position('''media_assets'',''practice_cycles'']' in definition)=0 then raise exception 'unexpected cloud_apply allowlist';end if;
 definition:=replace(definition,'''media_assets'',''practice_cycles'']','''media_assets'',''practice_cycles'',''learning_extensions'']');execute definition;
end$$;
-- Only reviewed suggestions are projected into read-only shared libraries.
create function private.shared_extension(p jsonb) returns jsonb language plpgsql immutable set search_path='' as $$
declare l jsonb;s jsonb;levels jsonb:='[]';suggestions jsonb;decisions jsonb:='{}';i integer;j integer;
begin
 for l in select value from jsonb_array_elements(p->'result'->'levels') loop
  suggestions:='[]';i:=0;j:=0;
  for s in select value from jsonb_array_elements(l->'suggestions') loop
   if p->'decisions'->>(l->>'level'||':'||i::text)='approved' then suggestions:=suggestions||jsonb_build_array(s);decisions:=decisions||jsonb_build_object(l->>'level'||':'||j::text,'approved');j:=j+1;end if;i:=i+1;
  end loop;
  levels:=levels||jsonb_build_array(jsonb_build_object('level',l->>'level','status',case when j>0 then 'available' else 'no_suggestion' end,'reasonVi',case when j>0 then '' else 'Chưa có gợi ý được duyệt.' end,'suggestions',suggestions));
 end loop;
 return (p-'jobId')||jsonb_build_object('result',jsonb_build_object('levels',levels),'decisions',decisions,'error',null);
end$$;
alter function private.share_rows(uuid,uuid) rename to share_rows_before_extensions;
create function private.share_rows(lib uuid,owner uuid) returns table(entity text,id text,version bigint,document jsonb) language plpgsql security definer set search_path='' as $$
begin
 return query select * from private.share_rows_before_extensions(lib,owner);
 return query select 'learningExtensions'::text,t.client_id,t.version,jsonb_set(t.client_payload,'{payload}',private.shared_extension(t.content)) from public.learning_extensions t join public.entry_senses s on s.id=t.sense_id and s.owner_id=t.owner_id and s.library_id=t.library_id where t.owner_id=owner and t.library_id=lib and t.deleted_at is null and s.deleted_at is null and s.learning_approval_status='approved' and s.content_version=s.approved_content_version and exists(select 1 from jsonb_each_text(t.content->'decisions') d where d.value='approved') and (t.learning_id is null or exists(select 1 from public.learning_content g where g.id=t.learning_id and g.owner_id=owner and g.library_id=lib and g.deleted_at is null));
end$$;
revoke all on function private.share_rows_before_extensions(uuid,uuid),private.share_rows(uuid,uuid),private.shared_extension(jsonb),private.validate_learning_extension() from public,anon,authenticated;
-- The existing library change feed drives shared snapshot invalidation.
commit;
