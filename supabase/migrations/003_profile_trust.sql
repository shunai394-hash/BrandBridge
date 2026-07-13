-- BrandBridge: profile trust / company info columns + RLS update

alter table public.profiles
  add column if not exists description text,
  add column if not exists website_url text,
  add column if not exists headquarters text,
  add column if not exists founded_year int,
  add column if not exists employee_range text,
  add column if not exists corporate_number text,
  add column if not exists achievements text,
  add column if not exists updated_at timestamptz not null default now();

alter table public.profiles
  drop constraint if exists profiles_founded_year_check;

alter table public.profiles
  add constraint profiles_founded_year_check
  check (
    founded_year is null
    or (founded_year >= 1800 and founded_year <= extract(year from now())::int + 1)
  );

alter table public.profiles
  drop constraint if exists profiles_employee_range_check;

alter table public.profiles
  add constraint profiles_employee_range_check
  check (
    employee_range is null
    or employee_range in ('1-10', '11-50', '51-200', '201+')
  );

create or replace function public.set_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_profiles_updated_at();

-- Replace SELECT policy:
-- own row OR maker (public) OR any authenticated user (partner browsing)
drop policy if exists "profiles_select" on public.profiles;

create policy "profiles_select"
  on public.profiles
  for select
  using (
    id = auth.uid()
    or role = 'maker'
    or auth.uid() is not null
  );
