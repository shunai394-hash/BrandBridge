-- BrandBridge: negotiation message attachments (Storage + columns)

-- ---------------------------------------------------------------------------
-- messages: attachment metadata (private bucket path + display name)
-- ---------------------------------------------------------------------------
alter table public.messages
  add column if not exists attachment_path text,
  add column if not exists attachment_name text,
  add column if not exists attachment_mime text,
  add column if not exists attachment_size integer;

-- Allow empty body when a file is attached
do $$
declare
  cname text;
begin
  select con.conname into cname
  from pg_constraint con
  join pg_class rel on rel.oid = con.conrelid
  join pg_namespace nsp on nsp.oid = rel.relnamespace
  where nsp.nspname = 'public'
    and rel.relname = 'messages'
    and con.contype = 'c'
    and pg_get_constraintdef(con.oid) ilike '%char_length%body%';

  if cname is not null then
    execute format('alter table public.messages drop constraint %I', cname);
  end if;
end $$;

alter table public.messages
  drop constraint if exists messages_body_or_attachment_check;

alter table public.messages
  add constraint messages_body_or_attachment_check
  check (
    char_length(trim(body)) > 0
    or (
      attachment_path is not null
      and char_length(trim(attachment_path)) > 0
    )
  );

-- ---------------------------------------------------------------------------
-- Storage bucket (private — download via signed URL)
-- Path: {negotiation_id}/{user_id}/{timestamp}_{filename}
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'negotiation-attachments',
  'negotiation-attachments',
  false,
  10485760, -- 10MB
  array[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Safe uuid parse from first path segment (avoids cast errors in RLS)
create or replace function public.storage_path_uuid(object_name text, idx int default 1)
returns uuid
language plpgsql
stable
as $$
declare
  seg text;
begin
  seg := (storage.foldername(object_name))[idx];
  if seg is null or seg !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    return null;
  end if;
  return seg::uuid;
end;
$$;

drop policy if exists "nego_attachments_select_party" on storage.objects;
drop policy if exists "nego_attachments_insert_party" on storage.objects;
drop policy if exists "nego_attachments_update_own" on storage.objects;
drop policy if exists "nego_attachments_delete_own" on storage.objects;

create policy "nego_attachments_select_party"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'negotiation-attachments'
    and (
      public.is_admin()
      or (
        public.storage_path_uuid(name, 1) is not null
        and public.is_negotiation_party(public.storage_path_uuid(name, 1))
      )
    )
  );

create policy "nego_attachments_insert_party"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'negotiation-attachments'
    and (storage.foldername(name))[2] = auth.uid()::text
    and public.storage_path_uuid(name, 1) is not null
    and public.is_negotiation_party(public.storage_path_uuid(name, 1))
    and public.is_negotiation_accepted(public.storage_path_uuid(name, 1))
  );

create policy "nego_attachments_update_own"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'negotiation-attachments'
    and (storage.foldername(name))[2] = auth.uid()::text
  )
  with check (
    bucket_id = 'negotiation-attachments'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

create policy "nego_attachments_delete_own"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'negotiation-attachments'
    and (
      public.is_admin()
      or (storage.foldername(name))[2] = auth.uid()::text
    )
  );
