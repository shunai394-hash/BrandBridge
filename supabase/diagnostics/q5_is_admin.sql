select proname from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname='public' and proname='is_admin';

select is_admin as is_admin_fn_as_admin
from public.profiles
where email='sebunn8@gmail.com';
-- can't call is_admin() without auth.uid context via SQL editor easily
