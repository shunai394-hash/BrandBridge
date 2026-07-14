-- Restore review-aware case visibility (admin review remains the source of truth).
-- Public: open + approved only. Maker: own rows. Admin: all.
-- Reverts the open-all SELECT policy from 011_beta_auto_approve_cases.sql.

drop policy if exists "cases_select_open_or_own" on public.cases;

create policy "cases_select_open_or_own"
  on public.cases
  for select
  using (
    public.is_admin()
    or maker_id = auth.uid()
    or (status = 'open' and review_status = 'approved')
  );
