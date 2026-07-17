select application_status, count(*)::int as n
from public.negotiations
group by application_status
order by application_status;
