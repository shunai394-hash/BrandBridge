-- BrandBridge: maker registration — product image + profile description from signup metadata

alter table public.cases
  add column if not exists product_image_url text;

-- Signup metadata may include company description
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  user_role text;
begin
  user_role := coalesce(new.raw_user_meta_data->>'role', 'partner');
  if user_role not in ('maker', 'partner') then
    user_role := 'partner';
  end if;

  insert into public.profiles (
    id,
    role,
    company_name,
    contact_name,
    email,
    industry,
    product_overview,
    sales_channel,
    area,
    strength,
    description
  )
  values (
    new.id,
    user_role,
    coalesce(new.raw_user_meta_data->>'company_name', ''),
    coalesce(new.raw_user_meta_data->>'contact_name', ''),
    coalesce(new.email, ''),
    new.raw_user_meta_data->>'industry',
    new.raw_user_meta_data->>'product_overview',
    new.raw_user_meta_data->>'sales_channel',
    new.raw_user_meta_data->>'area',
    new.raw_user_meta_data->>'strength',
    new.raw_user_meta_data->>'description'
  );

  return new;
end;
$$;

-- Storage for product images (optional upload during registration)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "product_images_public_read" on storage.objects;
drop policy if exists "product_images_auth_upload" on storage.objects;
drop policy if exists "product_images_auth_update" on storage.objects;
drop policy if exists "product_images_auth_delete" on storage.objects;

create policy "product_images_public_read"
  on storage.objects
  for select
  using (bucket_id = 'product-images');

create policy "product_images_auth_upload"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "product_images_auth_update"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "product_images_auth_delete"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
