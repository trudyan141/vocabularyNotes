begin;
-- Supabase-managed storage.objects/buckets; database policy tests use schema-compatible fixtures.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('learning-sources','learning-sources',false,10000000,array['image/jpeg','image/png','image/webp']) on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
create policy wfk_source_select on storage.objects for select to authenticated using (
 bucket_id='learning-sources' and split_part(name,'/',1)=(select auth.uid())::text
 and exists(select 1 from public.libraries l where l.owner_id=(select auth.uid()) and l.id::text=split_part(storage.objects.name,'/',2) and l.deleted_at is null)
);
create policy wfk_source_insert on storage.objects for insert to authenticated with check (
 bucket_id='learning-sources' and split_part(name,'/',1)=(select auth.uid())::text
 and exists(select 1 from public.libraries l where l.owner_id=(select auth.uid()) and l.id::text=split_part(storage.objects.name,'/',2) and l.deleted_at is null)
);
create policy wfk_source_delete on storage.objects for delete to authenticated using (
 bucket_id='learning-sources' and split_part(name,'/',1)=(select auth.uid())::text
 and exists(select 1 from public.libraries l where l.owner_id=(select auth.uid()) and l.id::text=split_part(storage.objects.name,'/',2) and l.deleted_at is null)
);
-- No object UPDATE permission: upload with a fresh UUID; do not overwrite approved source bytes.
commit;
