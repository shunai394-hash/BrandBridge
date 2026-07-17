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

select id, name, public, file_size_limit, allowed_mime_types
from storage.buckets
where id = 'product-images';
