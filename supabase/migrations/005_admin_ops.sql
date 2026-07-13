-- BrandBridge: admin role, case review, favorites, RLS

-- ---------------------------------------------------------------------------
-- profiles: admin role + is_active
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists is_active boolean not null default true;

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('maker', 'partner', 'admin'));

-- ---------------------------------------------------------------------------
-- cases: review workflow
-- ---------------------------------------------------------------------------
alter table public.cases
  add column if not exists review_status text,
  add column if not exists reviewed_at timestamptz,
  add column if not exists reviewed_by uuid references public.profiles (id) on delete set null,
  add column if not exists review_note text;

update public.cases
set review_status = coalesce(nullif(review_status, ''), 'approved')
where review_status is null or review_status = '';

alter table public.cases
  alter column review_status set default 'pending_review',
  alter column review_status set not null;

alter table public.cases
  drop constraint if exists cases_review_status_check;

alter table public.cases
  add constraint cases_review_status_check
  check (review_status in ('pending_review', 'approved', 'rejected'));

create index if not exists cases_review_status_idx on public.cases (review_status);

-- ---------------------------------------------------------------------------
-- favorites
-- ---------------------------------------------------------------------------
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  case_id uuid not null references public.cases (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, case_id)
);

create index if not exists favorites_user_id_idx on public.favorites (user_id);
create index if not exists favorites_case_id_idx on public.favorites (case_id);

alter table public.favorites enable row level security;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
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

create or replace function public.is_active_user()
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
      and p.is_active = true
  );
$$;

-- ---------------------------------------------------------------------------
-- RLS updates
-- ---------------------------------------------------------------------------

-- Profiles SELECT: keep previous + admin sees all
drop policy if exists "profiles_select" on public.profiles;

create policy "profiles_select"
  on public.profiles
  for select
  using (
    public.is_admin()
    or id = auth.uid()
    or role = 'maker'
    or auth.uid() is not null
  );

drop policy if exists "profiles_update_own" on public.profiles;

create policy "profiles_update_own"
  on public.profiles
  for update
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- Cases SELECT: approved+open public, own, or admin
drop policy if exists "cases_select_open_or_own" on public.cases;

create policy "cases_select_open_or_own"
  on public.cases
  for select
  using (
    public.is_admin()
    or maker_id = auth.uid()
    or (status = 'open' and review_status = 'approved')
  );

drop policy if exists "cases_update_own" on public.cases;

create policy "cases_update_own"
  on public.cases
  for update
  using (
    public.is_admin()
    or (maker_id = auth.uid() and public.get_my_role() = 'maker')
  )
  with check (
    public.is_admin()
    or (maker_id = auth.uid() and public.get_my_role() = 'maker')
  );

-- Negotiations: admin read-all
drop policy if exists "negotiations_select_own_or_maker" on public.negotiations;

create policy "negotiations_select_own_or_maker"
  on public.negotiations
  for select
  using (
    public.is_admin()
    or partner_id = auth.uid()
    or exists (
      select 1
      from public.cases c
      where c.id = negotiations.case_id
        and c.maker_id = auth.uid()
    )
  );

-- Messages: admin read-all (if table exists)
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'messages'
  ) then
    execute 'drop policy if exists "messages_select_party" on public.messages';
    execute $pol$
      create policy "messages_select_party"
        on public.messages
        for select
        using (
          public.is_admin()
          or public.is_negotiation_party(negotiation_id)
        )
    $pol$;
  end if;
end $$;

-- Favorites RLS
drop policy if exists "favorites_select_own" on public.favorites;
drop policy if exists "favorites_insert_own" on public.favorites;
drop policy if exists "favorites_delete_own" on public.favorites;

create policy "favorites_select_own"
  on public.favorites
  for select
  using (user_id = auth.uid());

create policy "favorites_insert_own"
  on public.favorites
  for insert
  with check (
    user_id = auth.uid()
    and public.is_active_user()
  );

create policy "favorites_delete_own"
  on public.favorites
  for delete
  using (user_id = auth.uid());
