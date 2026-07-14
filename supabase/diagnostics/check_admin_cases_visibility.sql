-- Latest cases (actual data check)
select
  id,
  product_name,
  maker_id,
  status,
  review_status,
  created_at
from public.cases
order by created_at desc
limit 30;

select count(*)::int as total_cases from public.cases;
select count(*)::int as pending_review
from public.cases
where review_status = 'pending_review';
select count(*)::int as approved_open
from public.cases
where status = 'open' and review_status = 'approved';

-- Admin helpers / policies
select proname
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and proname in ('is_admin', 'get_my_role');

select policyname, cmd, qual, with_check
from pg_policies
where schemaname = 'public' and tablename = 'cases'
order by policyname;

-- Admin profile
select id, email, role, is_active
from public.profiles
where role = 'admin';
