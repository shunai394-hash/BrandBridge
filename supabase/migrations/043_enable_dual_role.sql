-- BrandBridge: Enable dual-role accounts
-- A user can be both a sales partner and a product provider.

alter table public.profiles
  add column if not exists is_maker boolean not null default false;

alter table public.profiles
  add column if not exists is_partner boolean not null default false;


-- Existing accounts:
-- maker -> maker capability
-- partner -> partner capability
update public.profiles
set
  is_maker = (role = 'maker'),
  is_partner = (role = 'partner');


-- Keep role as the primary registration role.
-- Actual feature permissions should use is_maker / is_partner.


create index if not exists profiles_is_maker_idx
  on public.profiles (is_maker);

create index if not exists profiles_is_partner_idx
  on public.profiles (is_partner);
-- ---------------------------------------------------------------------------
-- Dual-role RLS helpers
-- ---------------------------------------------------------------------------

create or replace function public.is_my_maker()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(is_maker, false)
  from public.profiles
  where id = auth.uid();
$$;

create or replace function public.is_my_partner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(is_partner, false)
  from public.profiles
  where id = auth.uid();
$$;


-- ---------------------------------------------------------------------------
-- Replace role-based RLS with capability-based RLS
-- ---------------------------------------------------------------------------

drop policy if exists "cases_insert_maker" on public.cases;
drop policy if exists "cases_update_own" on public.cases;
drop policy if exists "cases_delete_own" on public.cases;

drop policy if exists "negotiations_insert_partner" on public.negotiations;


create policy "cases_insert_maker"
  on public.cases
  for insert
  with check (
    maker_id = auth.uid()
    and public.is_my_maker()
  );


create policy "cases_update_own"
  on public.cases
  for update
  using (
    maker_id = auth.uid()
    and public.is_my_maker()
  )
  with check (
    maker_id = auth.uid()
    and public.is_my_maker()
  );


create policy "cases_delete_own"
  on public.cases
  for delete
  using (
    maker_id = auth.uid()
    and public.is_my_maker()
  );


create policy "negotiations_insert_partner"
  on public.negotiations
  for insert
  with check (
    partner_id = auth.uid()
    and public.is_my_partner()
  );


-- ---------------------------------------------------------------------------
-- Profiles visibility
-- Maker capability users can be visible as product providers.
-- ---------------------------------------------------------------------------

drop policy if exists "profiles_select" on public.profiles;

create policy "profiles_select"
  on public.profiles
  for select
  using (
    id = auth.uid()
    or is_maker = true
    or exists (
      select 1
      from public.negotiations n
      join public.cases c on c.id = n.case_id
      where n.partner_id = profiles.id
        and c.maker_id = auth.uid()
    )
  );
