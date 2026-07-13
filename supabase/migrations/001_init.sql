-- BrandBridge initial schema: profiles, cases, negotiations + RLS

-- ---------------------------------------------------------------------------
-- Profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('maker', 'partner')),
  company_name text not null,
  contact_name text not null,
  email text not null,
  industry text,
  product_overview text,
  sales_channel text,
  area text,
  strength text,
  created_at timestamptz not null default now()
);

create index profiles_role_idx on public.profiles (role);

-- ---------------------------------------------------------------------------
-- Cases (maker listings)
-- ---------------------------------------------------------------------------
create table public.cases (
  id uuid primary key default gen_random_uuid(),
  maker_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  category text not null,
  region text not null,
  summary text not null,
  description text not null,
  ideal_partner text not null,
  offer text not null,
  status text not null default 'open' check (status in ('open', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index cases_status_idx on public.cases (status);
create index cases_maker_id_idx on public.cases (maker_id);
create index cases_created_at_idx on public.cases (created_at desc);

create or replace function public.set_cases_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger cases_set_updated_at
  before update on public.cases
  for each row
  execute function public.set_cases_updated_at();

-- ---------------------------------------------------------------------------
-- Negotiations (partner applications)
-- ---------------------------------------------------------------------------
create table public.negotiations (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases (id) on delete cascade,
  partner_id uuid not null references public.profiles (id) on delete cascade,
  message text,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz not null default now(),
  unique (case_id, partner_id)
);

create index negotiations_case_id_idx on public.negotiations (case_id);
create index negotiations_partner_id_idx on public.negotiations (partner_id);

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.get_my_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- Auto-create profile from auth.users metadata on signup
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
    strength
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
    new.raw_user_meta_data->>'strength'
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.cases enable row level security;
alter table public.negotiations enable row level security;

-- Profiles: own row, or maker profiles (for public case display),
-- or partners who applied to the maker's cases
create policy "profiles_select"
  on public.profiles
  for select
  using (
    id = auth.uid()
    or role = 'maker'
    or exists (
      select 1
      from public.negotiations n
      join public.cases c on c.id = n.case_id
      where n.partner_id = profiles.id
        and c.maker_id = auth.uid()
    )
  );

create policy "profiles_insert_own"
  on public.profiles
  for insert
  with check (id = auth.uid());

create policy "profiles_update_own"
  on public.profiles
  for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- Cases: open cases are public; makers manage their own
create policy "cases_select_open_or_own"
  on public.cases
  for select
  using (status = 'open' or maker_id = auth.uid());

create policy "cases_insert_maker"
  on public.cases
  for insert
  with check (
    maker_id = auth.uid()
    and public.get_my_role() = 'maker'
  );

create policy "cases_update_own"
  on public.cases
  for update
  using (
    maker_id = auth.uid()
    and public.get_my_role() = 'maker'
  )
  with check (
    maker_id = auth.uid()
    and public.get_my_role() = 'maker'
  );

create policy "cases_delete_own"
  on public.cases
  for delete
  using (
    maker_id = auth.uid()
    and public.get_my_role() = 'maker'
  );

-- Negotiations
create policy "negotiations_insert_partner"
  on public.negotiations
  for insert
  with check (
    partner_id = auth.uid()
    and public.get_my_role() = 'partner'
  );

create policy "negotiations_select_own_or_maker"
  on public.negotiations
  for select
  using (
    partner_id = auth.uid()
    or exists (
      select 1
      from public.cases c
      where c.id = negotiations.case_id
        and c.maker_id = auth.uid()
    )
  );

create policy "negotiations_update_maker"
  on public.negotiations
  for update
  using (
    exists (
      select 1
      from public.cases c
      where c.id = negotiations.case_id
        and c.maker_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.cases c
      where c.id = negotiations.case_id
        and c.maker_id = auth.uid()
    )
  );
