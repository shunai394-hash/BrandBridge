-- Fix missing columns / admin helpers so case inserts and admin review work

-- 1) product_image_url (required by createCase payload)
alter table public.cases
  add column if not exists product_image_url text;

-- 2) review_status safety
alter table public.cases
  add column if not exists review_status text;

update public.cases
set review_status = coalesce(nullif(review_status, ''), 'pending_review')
where review_status is null or review_status = '';

alter table public.cases
  alter column review_status set default 'pending_review';

alter table public.cases
  drop constraint if exists cases_review_status_check;

alter table public.cases
  add constraint cases_review_status_check
  check (
    review_status in (
      'pending_review',
      'approved',
      'rejected',
      'withdrawn'
    )
  );

alter table public.cases
  add column if not exists reviewed_at timestamptz,
  add column if not exists reviewed_by uuid references public.profiles (id) on delete set null,
  add column if not exists review_note text;

-- 3) is_admin helper (RLS)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
      and p.is_active = true
  );
$$;

-- 4) SELECT policy: admin sees all cases
drop policy if exists "cases_select_open_or_own" on public.cases;

create policy "cases_select_open_or_own"
  on public.cases
  for select
  using (
    public.is_admin()
    or maker_id = auth.uid()
    or (status = 'open' and review_status = 'approved')
  );

-- 5) UPDATE for admin review
drop policy if exists "cases_update_own" on public.cases;

create policy "cases_update_own"
  on public.cases
  for update
  using (
    public.is_admin()
    or maker_id = auth.uid()
  )
  with check (
    public.is_admin()
    or maker_id = auth.uid()
  );

select
  (select count(*)::int from public.cases) as total_cases,
  (select count(*)::int from public.cases where review_status = 'pending_review') as pending_review,
  exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='cases' and column_name='product_image_url'
  ) as has_product_image_url,
  exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname='public' and p.proname='is_admin'
  ) as has_is_admin;
