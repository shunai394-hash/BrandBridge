-- Promote existing Auth user to ops admin (run in Supabase SQL Editor)
-- Replace the email below with your admin mailbox.

-- 1) Confirm Auth user
select id, email, email_confirmed_at
from auth.users
where email = 'admin@example.com';

-- 2) Upsert profiles linked by auth.users.id
insert into public.profiles (
  id,
  role,
  company_name,
  contact_name,
  email,
  is_active,
  onboarding_completed
)
select
  u.id,
  'admin',
  'BrandBridge Admin',
  'Admin',
  u.email,
  true,
  true
from auth.users u
where u.email = 'admin@example.com'
on conflict (id) do update
set
  role = 'admin',
  is_active = true,
  onboarding_completed = true,
  email = excluded.email,
  company_name = coalesce(nullif(public.profiles.company_name, ''), excluded.company_name),
  contact_name = coalesce(nullif(public.profiles.contact_name, ''), excluded.contact_name);

-- 3) Verify
select p.id, p.email, p.role, p.is_active, p.onboarding_completed
from public.profiles p
join auth.users u on u.id = p.id
where u.email = 'admin@example.com';
