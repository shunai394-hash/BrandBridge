select
  pg_get_functiondef('public.can_insert_negotiation_message(uuid, text)'::regprocedure)
  as can_insert_def;

select application_status, count(*)::int as n
from public.negotiations
group by application_status
order by application_status;

select policyname, cmd, with_check
from pg_policies
where schemaname = 'public' and tablename = 'messages'
order by policyname;
