-- Allow negotiation parties to upload attachments before acceptance
-- (needed for opening-message attachments on 交渉開始)

drop policy if exists "nego_attachments_insert_party" on storage.objects;

create policy "nego_attachments_insert_party"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'negotiation-attachments'
    and (storage.foldername(name))[2] = auth.uid()::text
    and public.storage_path_uuid(name, 1) is not null
    and public.is_negotiation_party(public.storage_path_uuid(name, 1))
  );
