alter table public.deals
add column if not exists maker_confirmed boolean default false,
add column if not exists partner_confirmed boolean default false,
add column if not exists contract_note text,
add column if not exists contract_date date;
