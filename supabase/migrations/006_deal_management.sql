-- BrandBridge: deal management (pipeline + deals table + commission settings)

-- ---------------------------------------------------------------------------
-- negotiations: rename status → application_status, add pipeline_status
-- ---------------------------------------------------------------------------
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'negotiations'
      and column_name = 'status'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'negotiations'
      and column_name = 'application_status'
  ) then
    alter table public.negotiations rename column status to application_status;
  end if;
end $$;

alter table public.negotiations
  drop constraint if exists negotiations_status_check;

alter table public.negotiations
  drop constraint if exists negotiations_application_status_check;

alter table public.negotiations
  add constraint negotiations_application_status_check
  check (application_status in ('pending', 'accepted', 'rejected'));

alter table public.negotiations
  add column if not exists pipeline_status text;

update public.negotiations
set pipeline_status = 'in_negotiation'
where application_status = 'accepted'
  and pipeline_status is null;

alter table public.negotiations
  drop constraint if exists negotiations_pipeline_status_check;

alter table public.negotiations
  add constraint negotiations_pipeline_status_check
  check (
    pipeline_status is null
    or pipeline_status in (
      'in_negotiation',
      'terms_review',
      'contract_prep',
      'won',
      'closed'
    )
  );

create index if not exists negotiations_application_status_idx
  on public.negotiations (application_status);

create index if not exists negotiations_pipeline_status_idx
  on public.negotiations (pipeline_status);

-- When maker accepts, start pipeline
create or replace function public.set_pipeline_on_accept()
returns trigger
language plpgsql
as $$
begin
  if new.application_status = 'accepted'
     and (old.application_status is distinct from 'accepted')
     and new.pipeline_status is null then
    new.pipeline_status := 'in_negotiation';
  end if;
  if new.application_status = 'rejected' then
    new.pipeline_status := null;
  end if;
  return new;
end;
$$;

drop trigger if exists negotiations_set_pipeline_on_accept on public.negotiations;

create trigger negotiations_set_pipeline_on_accept
  before update on public.negotiations
  for each row
  execute function public.set_pipeline_on_accept();

-- Messages helper: use application_status
create or replace function public.is_negotiation_accepted(p_negotiation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.negotiations n
    where n.id = p_negotiation_id
      and n.application_status = 'accepted'
  );
$$;

-- ---------------------------------------------------------------------------
-- commission_settings (singleton, default 5%)
-- ---------------------------------------------------------------------------
create table if not exists public.commission_settings (
  id int primary key default 1 check (id = 1),
  default_rate numeric(5, 2) not null default 5.00
    check (default_rate >= 0 and default_rate <= 100),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id) on delete set null
);

insert into public.commission_settings (id, default_rate)
values (1, 5.00)
on conflict (id) do nothing;

alter table public.commission_settings enable row level security;

drop policy if exists "commission_settings_select_auth" on public.commission_settings;
drop policy if exists "commission_settings_update_admin" on public.commission_settings;

create policy "commission_settings_select_auth"
  on public.commission_settings
  for select
  using (auth.uid() is not null);

create policy "commission_settings_update_admin"
  on public.commission_settings
  for update
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- deals (1 negotiation can have multiple deals in the future)
-- ---------------------------------------------------------------------------
create table if not exists public.deals (
  id uuid primary key default gen_random_uuid(),
  negotiation_id uuid not null references public.negotiations (id) on delete restrict,
  case_id uuid not null references public.cases (id) on delete restrict,
  maker_id uuid not null references public.profiles (id) on delete restrict,
  partner_id uuid not null references public.profiles (id) on delete restrict,
  deal_closed_at timestamptz not null default now(),
  deal_amount numeric(14, 2) not null check (deal_amount >= 0),
  deal_currency text not null default 'JPY',
  commission_rate numeric(5, 2) not null
    check (commission_rate >= 0 and commission_rate <= 100),
  commission_amount numeric(14, 2) not null check (commission_amount >= 0),
  commission_note text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists deals_negotiation_id_idx on public.deals (negotiation_id);
create index if not exists deals_case_id_idx on public.deals (case_id);
create index if not exists deals_maker_id_idx on public.deals (maker_id);
create index if not exists deals_partner_id_idx on public.deals (partner_id);
create index if not exists deals_deal_closed_at_idx on public.deals (deal_closed_at desc);

create or replace function public.set_deals_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists deals_set_updated_at on public.deals;

create trigger deals_set_updated_at
  before update on public.deals
  for each row
  execute function public.set_deals_updated_at();

alter table public.deals enable row level security;

drop policy if exists "deals_select_party_or_admin" on public.deals;
drop policy if exists "deals_insert_admin" on public.deals;
drop policy if exists "deals_update_admin" on public.deals;

create policy "deals_select_party_or_admin"
  on public.deals
  for select
  using (
    public.is_admin()
    or maker_id = auth.uid()
    or partner_id = auth.uid()
  );

create policy "deals_insert_admin"
  on public.deals
  for insert
  with check (public.is_admin());

create policy "deals_update_admin"
  on public.deals
  for update
  using (public.is_admin())
  with check (public.is_admin());

-- Allow admin to update pipeline on negotiations (already covered if admin update policy exists)
-- Ensure maker/admin can update application_status / pipeline
drop policy if exists "negotiations_update_maker" on public.negotiations;

create policy "negotiations_update_maker_or_admin"
  on public.negotiations
  for update
  using (
    public.is_admin()
    or exists (
      select 1
      from public.cases c
      where c.id = negotiations.case_id
        and c.maker_id = auth.uid()
    )
    or (
      partner_id = auth.uid()
      and application_status = 'accepted'
    )
  )
  with check (
    public.is_admin()
    or exists (
      select 1
      from public.cases c
      where c.id = negotiations.case_id
        and c.maker_id = auth.uid()
    )
    or (
      partner_id = auth.uid()
      and application_status = 'accepted'
    )
  );
