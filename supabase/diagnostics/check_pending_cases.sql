select column_name
from information_schema.columns
where table_schema = 'public'
  and table_name = 'cases'
  and column_name in ('review_status', 'status', 'product_name')
order by 1;

select count(*)::int as pending_count
from public.cases
where review_status = 'pending_review';
