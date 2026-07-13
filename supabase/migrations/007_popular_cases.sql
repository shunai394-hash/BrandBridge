-- BrandBridge: popular cases helper (favorite counts bypass RLS for public ranking)

create or replace function public.get_popular_open_case_ids(lim int default 6)
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select c.id
  from public.cases c
  left join public.favorites f on f.case_id = c.id
  where c.status = 'open'
    and c.review_status = 'approved'
  group by c.id, c.created_at
  order by count(f.id) desc, c.created_at desc
  limit greatest(coalesce(lim, 6), 1);
$$;

revoke all on function public.get_popular_open_case_ids(int) from public;
grant execute on function public.get_popular_open_case_ids(int) to anon, authenticated;
