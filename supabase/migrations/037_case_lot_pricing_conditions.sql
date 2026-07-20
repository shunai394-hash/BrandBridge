-- Partner-only lot pricing + normalize price_conditions to fixed|quote
-- Compatible with existing rows

alter table public.cases
  add column if not exists lot_pricing text;

comment on column public.cases.lot_pricing is
  'ロット別価格（ログイン後の販売パートナー向け）';

-- Normalize legacy free-text price_conditions → fixed | quote
update public.cases
set price_conditions = case
  when price_conditions is null or btrim(price_conditions) = '' then null
  when price_conditions in ('fixed', 'quote') then price_conditions
  when price_conditions ~* '見積|quote|見積もり' then 'quote'
  when price_conditions ~* '固定|fixed' then 'fixed'
  else 'quote'
end
where price_conditions is distinct from null
  and price_conditions not in ('fixed', 'quote');

alter table public.cases
  drop constraint if exists cases_price_conditions_check;

alter table public.cases
  add constraint cases_price_conditions_check
  check (
    price_conditions is null
    or price_conditions in ('fixed', 'quote')
  );

comment on column public.cases.price_conditions is
  '価格条件: fixed=固定価格 / quote=見積条件あり';
