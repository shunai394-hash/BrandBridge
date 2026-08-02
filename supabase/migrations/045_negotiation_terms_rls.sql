-- negotiation_terms RLS policies
-- Makers and partners can manage terms for negotiations they participate in.

create policy "negotiation_terms_select_party"
  on public.negotiation_terms
  for select
  using (
    exists (
      select 1
      from public.negotiations n
      join public.cases c
        on c.id = n.case_id
      where n.id = negotiation_terms.negotiation_id
        and (
          n.partner_id = auth.uid()
          or c.maker_id = auth.uid()
        )
    )
  );

create policy "negotiation_terms_insert_party"
  on public.negotiation_terms
  for insert
  with check (
    exists (
      select 1
      from public.negotiations n
      join public.cases c
        on c.id = n.case_id
      where n.id = negotiation_terms.negotiation_id
        and (
          n.partner_id = auth.uid()
          or c.maker_id = auth.uid()
        )
    )
  );

create policy "negotiation_terms_update_party"
  on public.negotiation_terms
  for update
  using (
    exists (
      select 1
      from public.negotiations n
      join public.cases c
        on c.id = n.case_id
      where n.id = negotiation_terms.negotiation_id
        and (
          n.partner_id = auth.uid()
          or c.maker_id = auth.uid()
        )
    )
  )
  with check (
    exists (
      select 1
      from public.negotiations n
      join public.cases c
        on c.id = n.case_id
      where n.id = negotiation_terms.negotiation_id
        and (
          n.partner_id = auth.uid()
          or c.maker_id = auth.uid()
        )
    )
  );
