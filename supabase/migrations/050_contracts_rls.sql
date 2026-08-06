alter table public.contracts enable row level security;


create policy "Users can view related contracts"
on public.contracts
for select
using (
  exists (
    select 1
    from public.negotiations n
    where n.id = contracts.negotiation_id
    and (
      n.maker_id = auth.uid()
      or n.partner_id = auth.uid()
    )
  )
);


create policy "Users can create related contracts"
on public.contracts
for insert
with check (
  exists (
    select 1
    from public.negotiations n
    where n.id = contracts.negotiation_id
    and (
      n.maker_id = auth.uid()
      or n.partner_id = auth.uid()
    )
  )
);
