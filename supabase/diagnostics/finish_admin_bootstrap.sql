-- Allow admin role
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('maker', 'partner', 'admin'));

-- Add missing columns used by app
alter table public.profiles add column if not exists onboarding_completed boolean not null default false;
alter table public.profiles add column if not exists display_name text;
alter table public.profiles add column if not exists entity_type text;
alter table public.profiles add column if not exists sales_genres text;
alter table public.profiles add column if not exists preferred_categories text;
alter table public.profiles add column if not exists preferred_deal_types text;

-- Promote sebunn8 to admin
update public.profiles
set role = 'admin',
    is_active = true,
    onboarding_completed = true,
    company_name = coalesce(nullif(company_name, ''), 'BrandBridge Admin'),
    contact_name = coalesce(nullif(contact_name, ''), 'Admin')
where id = 'b7c467be-25d4-453a-b770-d7bbfa81dae8';

select id, email, role, is_active, onboarding_completed
from public.profiles
where id = 'b7c467be-25d4-453a-b770-d7bbfa81dae8';
