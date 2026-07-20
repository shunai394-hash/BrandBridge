-- Partner applications (応募). Separate from negotiations (商談スレッド).
-- applicationCount on /cases reads from this table.

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases (id) on delete cascade,
  partner_id uuid not null references public.profiles (id) on delete cascade,
  message text,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'rejected', 'withdrawn')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (case_id, partner_id)
);

create index if not exists applications_case_id_idx
  on public.applications (case_id);
create index if not exists applications_partner_id_idx
  on public.applications (partner_id);

alter table public.applications enable row level security;

-- Partners: create / read own applications
drop policy if exists applications_partner_insert on public.applications;
create policy applications_partner_insert
  on public.applications
  for insert
  to authenticated
  with check (
    partner_id = auth.uid()
    and public.get_my_role() = 'partner'
  );

drop policy if exists applications_partner_select_own on public.applications;
create policy applications_partner_select_own
  on public.applications
  for select
  to authenticated
  using (partner_id = auth.uid());

-- Makers: read applications on own cases
drop policy if exists applications_maker_select_own_cases on public.applications;
create policy applications_maker_select_own_cases
  on public.applications
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.cases c
      where c.id = applications.case_id
        and c.maker_id = auth.uid()
    )
  );

-- Admin: full read
drop policy if exists applications_admin_select on public.applications;
create policy applications_admin_select
  on public.applications
  for select
  to authenticated
  using (public.is_admin());

-- Backfill from existing negotiations so historical 応募件数 is preserved
insert into public.applications (case_id, partner_id, message, status, created_at)
select
  n.case_id,
  n.partner_id,
  n.message,
  coalesce(n.application_status, 'pending'),
  n.created_at
from public.negotiations n
on conflict (case_id, partner_id) do nothing;
