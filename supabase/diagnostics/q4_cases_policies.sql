select policyname, cmd, qual
from pg_policies
where schemaname = 'public' and tablename = 'cases'
order by policyname;
