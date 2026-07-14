-- Diagnose latest cases (run in Supabase SQL Editor)
select
  id,
  product_name,
  maker_id,
  status,
  review_status,
  created_at
from public.cases
order by created_at desc
limit 20;

-- Check maker_id matches auth.users for a maker email
-- select c.*, u.email
-- from public.cases c
-- join auth.users u on u.id = c.maker_id
-- order by c.created_at desc
-- limit 20;
