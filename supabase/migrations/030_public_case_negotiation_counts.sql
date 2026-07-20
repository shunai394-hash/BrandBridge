-- Public aggregate counts for /cases (applicationCount / negotiationCount).
-- RLS on negotiations only allows party/admin SELECT, so anon gets [].
-- This SECURITY DEFINER RPC returns counts only (no message / partner_id).
--
-- Version 030 (not 028): 028 is already used by 028_cases_sku.sql on remote.
-- DROP first: CREATE OR REPLACE cannot change RETURNS TABLE column types
-- (SQLSTATE 42P13).

drop function if exists public.get_case_negotiation_counts(uuid[]);

create function public.get_case_negotiation_counts(p_case_ids uuid[])
returns table (
  case_id uuid,
  application_count bigint,
  negotiation_count bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    n.case_id,
    count(*)::bigint as application_count,
    count(*) filter (
      where n.application_status = 'accepted'
         or n.pipeline_status is not null
    )::bigint as negotiation_count
  from public.negotiations n
  where p_case_ids is not null
    and n.case_id = any (p_case_ids)
  group by n.case_id;
$$;

revoke all on function public.get_case_negotiation_counts(uuid[]) from public;
grant execute on function public.get_case_negotiation_counts(uuid[]) to anon, authenticated;
