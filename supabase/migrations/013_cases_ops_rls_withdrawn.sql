-- BrandBridge ops: withdrawn status + explicit cases RLS

-- Allow maker withdraw
alter table public.cases
  drop constraint if exists cases_review_status_check;

alter table public.cases
  add constraint cases_review_status_check
  check (
    review_status in (
      'pending_review',
      'approved',
      'rejected',
      'withdrawn'
    )
  );

-- SELECT: public approved+open, own (maker_id = auth.uid()), admin
drop policy if exists "cases_select_open_or_own" on public.cases;

create policy "cases_select_open_or_own"
  on public.cases
  for select
  using (
    public.is_admin()
    or maker_id = auth.uid()
    or (status = 'open' and review_status = 'approved')
  );

-- UPDATE: owner maker or admin
drop policy if exists "cases_update_own" on public.cases;

create policy "cases_update_own"
  on public.cases
  for update
  using (
    public.is_admin()
    or maker_id = auth.uid()
  )
  with check (
    public.is_admin()
    or maker_id = auth.uid()
  );

-- INSERT: maker_id must be auth.uid()
drop policy if exists "cases_insert_maker" on public.cases;

create policy "cases_insert_maker"
  on public.cases
  for insert
  with check (
    maker_id = auth.uid()
    and public.get_my_role() = 'maker'
  );
