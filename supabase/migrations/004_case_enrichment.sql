-- BrandBridge: case enrichment (product / sales / partner conditions)

-- Add nullable columns first, backfill, then set NOT NULL where required
alter table public.cases
  add column if not exists product_name text,
  add column if not exists product_features text,
  add column if not exists price_band text,
  add column if not exists sales_format text,
  add column if not exists sales_terms text,
  add column if not exists min_order text,
  add column if not exists is_exclusive boolean not null default false,
  add column if not exists target_country text,
  add column if not exists partner_channels text,
  add column if not exists partner_requirements text;

update public.cases
set
  product_name = coalesce(nullif(product_name, ''), nullif(title, ''), '未設定'),
  sales_format = coalesce(nullif(sales_format, ''), 'other'),
  target_country = coalesce(nullif(target_country, ''), 'JP'),
  is_exclusive = coalesce(is_exclusive, false);

alter table public.cases
  alter column product_name set not null,
  alter column sales_format set not null,
  alter column target_country set not null,
  alter column is_exclusive set default false;

alter table public.cases
  drop constraint if exists cases_sales_format_check;

alter table public.cases
  add constraint cases_sales_format_check
  check (
    sales_format in ('wholesale', 'consignment', 'agency', 'oem', 'ec', 'other')
  );

alter table public.cases
  drop constraint if exists cases_target_country_check;

alter table public.cases
  add constraint cases_target_country_check
  check (
    target_country in ('JP', 'US', 'CN', 'ASEAN', 'EU', 'GLOBAL', 'OTHER')
  );

create index if not exists cases_sales_format_idx on public.cases (sales_format);
create index if not exists cases_target_country_idx on public.cases (target_country);
create index if not exists cases_is_exclusive_idx on public.cases (is_exclusive);
