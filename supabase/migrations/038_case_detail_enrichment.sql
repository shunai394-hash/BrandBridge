-- Product detail enrichment fields (brand / sales / terms / rights / overseas / deal)
-- All nullable for backward compatibility with existing cases.

alter table public.cases
  add column if not exists brand_name text;

alter table public.cases
  add column if not exists brand_overview text;

alter table public.cases
  add column if not exists product_strengths text;

alter table public.cases
  add column if not exists sales_track_record text;

alter table public.cases
  add column if not exists market_availability_jp_us text;

alter table public.cases
  add column if not exists lead_time text;

alter table public.cases
  add column if not exists initial_order_terms text;

alter table public.cases
  add column if not exists trademark_status text;

alter table public.cases
  add column if not exists exclusive_deal_option text;

alter table public.cases
  add column if not exists ship_from text;

alter table public.cases
  add column if not exists currencies text;

alter table public.cases
  add column if not exists incoterms text;

alter table public.cases
  add column if not exists certifications text;

alter table public.cases
  add column if not exists support_languages text;

alter table public.cases
  drop constraint if exists cases_trademark_status_check;

alter table public.cases
  add constraint cases_trademark_status_check
  check (
    trademark_status is null
    or trademark_status in ('registered', 'pending', 'unregistered')
  );

alter table public.cases
  drop constraint if exists cases_exclusive_deal_option_check;

alter table public.cases
  add constraint cases_exclusive_deal_option_check
  check (
    exclusive_deal_option is null
    or exclusive_deal_option in ('available', 'conditional', 'unavailable')
  );

comment on column public.cases.brand_name is 'ブランド名';
comment on column public.cases.brand_overview is 'ブランド概要';
comment on column public.cases.product_strengths is '商品の強み（差別化・販売理由）。商品特徴とは別';
comment on column public.cases.sales_track_record is '既存販売実績';
comment on column public.cases.market_availability_jp_us is '日本/米国の販売可否';
comment on column public.cases.lead_time is 'リードタイム';
comment on column public.cases.initial_order_terms is '初回発注条件';
comment on column public.cases.trademark_status is '商標・ライセンス: registered | pending | unregistered';
comment on column public.cases.exclusive_deal_option is '独占販売可否: available | conditional | unavailable';
comment on column public.cases.ship_from is '出荷元（海外展開向け）';
comment on column public.cases.currencies is '対応通貨';
comment on column public.cases.incoterms is '取引条件（Incoterms）';
comment on column public.cases.certifications is '必要認証';
comment on column public.cases.support_languages is '対応言語';
