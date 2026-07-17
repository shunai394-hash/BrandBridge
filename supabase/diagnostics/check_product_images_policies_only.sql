select
  policyname,
  cmd,
  roles::text as roles,
  permissive,
  qual,
  with_check
from pg_policies
where schemaname = 'storage'
  and tablename = 'objects'
  and (
    policyname ilike '%product_images%'
    or coalesce(qual, '') ilike '%product-images%'
    or coalesce(with_check, '') ilike '%product-images%'
  )
order by cmd, policyname;
