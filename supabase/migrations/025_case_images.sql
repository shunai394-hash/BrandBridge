-- BrandBridge: multiple product images per case (max 4 enforced in app)
-- Keeps cases.product_image_url as primary/main image for backward compatibility

create table if not exists public.case_images (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases (id) on delete cascade,
  image_url text not null,
  storage_path text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists case_images_case_id_sort_idx
  on public.case_images (case_id, sort_order, created_at);

comment on table public.case_images is
  'Product gallery images (up to 4). sort_order=0 is primary; synced to cases.product_image_url';

-- Raise storage limit to 10MB; keep jpeg/png/webp/gif
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Backfill from legacy single URL
insert into public.case_images (case_id, image_url, sort_order)
select c.id, c.product_image_url, 0
from public.cases c
where c.product_image_url is not null
  and char_length(trim(c.product_image_url)) > 0
  and not exists (
    select 1 from public.case_images ci where ci.case_id = c.id
  );

alter table public.case_images enable row level security;

drop policy if exists "case_images_select" on public.case_images;
drop policy if exists "case_images_insert_maker" on public.case_images;
drop policy if exists "case_images_update_maker" on public.case_images;
drop policy if exists "case_images_delete_maker" on public.case_images;

-- Anyone who can see the case can see its images
create policy "case_images_select"
  on public.case_images
  for select
  using (
    exists (
      select 1
      from public.cases c
      where c.id = case_images.case_id
        and (
          public.is_admin()
          or c.maker_id = auth.uid()
          or (c.status = 'open' and c.review_status = 'approved')
        )
    )
  );

create policy "case_images_insert_maker"
  on public.case_images
  for insert
  to authenticated
  with check (
    public.is_admin()
    or exists (
      select 1
      from public.cases c
      where c.id = case_images.case_id
        and c.maker_id = auth.uid()
    )
  );

create policy "case_images_update_maker"
  on public.case_images
  for update
  to authenticated
  using (
    public.is_admin()
    or exists (
      select 1
      from public.cases c
      where c.id = case_images.case_id
        and c.maker_id = auth.uid()
    )
  )
  with check (
    public.is_admin()
    or exists (
      select 1
      from public.cases c
      where c.id = case_images.case_id
        and c.maker_id = auth.uid()
    )
  );

create policy "case_images_delete_maker"
  on public.case_images
  for delete
  to authenticated
  using (
    public.is_admin()
    or exists (
      select 1
      from public.cases c
      where c.id = case_images.case_id
        and c.maker_id = auth.uid()
    )
  );

-- Keep product_image_url = primary gallery image (lowest sort_order)
create or replace function public.sync_case_product_image_url()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_case uuid;
  primary_url text;
begin
  target_case := coalesce(new.case_id, old.case_id);

  select ci.image_url into primary_url
  from public.case_images ci
  where ci.case_id = target_case
  order by ci.sort_order asc, ci.created_at asc
  limit 1;

  update public.cases
  set product_image_url = primary_url
  where id = target_case;

  return coalesce(new, old);
end;
$$;

drop trigger if exists case_images_sync_primary on public.case_images;

create trigger case_images_sync_primary
  after insert or update or delete on public.case_images
  for each row
  execute function public.sync_case_product_image_url();
