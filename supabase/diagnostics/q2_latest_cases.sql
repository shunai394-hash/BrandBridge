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
