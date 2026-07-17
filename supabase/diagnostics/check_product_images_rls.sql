select policyname, cmd, roles, permissive, qual, with_check
from pg_policies
where schemaname = 'storage' and tablename = 'objects'
  and (
    policyname ilike '%product%'
    or coalesce(qual, '') ilike '%product-images%'
    or coalesce(with_check, '') ilike '%product-images%'
  )
order by policyname;

select id, name, public, file_size_limit, allowed_mime_types
from storage.buckets
where id = 'product-images';

select relrowsecurity, relforcerowsecurity
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'storage' and c.relname = 'objects';
