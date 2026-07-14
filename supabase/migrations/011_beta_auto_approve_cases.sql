-- Beta (historical): bulk-approved pending open cases and temporarily
-- allowed SELECT on all open rows. Restored by 012_restore_case_review_select.sql.

update public.cases
set review_status = 'approved'
where status = 'open'
  and review_status = 'pending_review';

drop policy if exists "cases_select_open_or_own" on public.cases;

create policy "cases_select_open_or_own"
  on public.cases
  for select
  using (
    public.is_admin()
    or maker_id = auth.uid()
    or status = 'open'
  );
