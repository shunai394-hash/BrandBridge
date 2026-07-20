-- Partner-facing pricing / MOQ fields for B2B matching
-- Compatible with existing price_band / min_order (nullable new columns)

alter table public.cases
  add column if not exists wholesale_price text;

alter table public.cases
  add column if not exists price_conditions text;

alter table public.cases
  add column if not exists min_order_amount text;

alter table public.cases
  add column if not exists suggested_retail_price text;

alter table public.cases
  add column if not exists sample_available text;

alter table public.cases
  add column if not exists test_sale_available text;

-- Normalize empty strings to null is app-level; constrain known values when set
alter table public.cases
  drop constraint if exists cases_sample_available_check;

alter table public.cases
  add constraint cases_sample_available_check
  check (
    sample_available is null
    or sample_available in ('yes', 'no', 'negotiable')
  );

alter table public.cases
  drop constraint if exists cases_test_sale_available_check;

alter table public.cases
  add constraint cases_test_sale_available_check
  check (
    test_sale_available is null
    or test_sale_available in ('yes', 'no', 'negotiable')
  );

comment on column public.cases.price_band is
  '参考卸価格帯（一覧表示）。空欄は UI で「見積条件あり」と表示';

comment on column public.cases.min_order is
  'MOQ（最低発注数量）';

comment on column public.cases.wholesale_price is
  '正確な卸価格（詳細ページ向け・任意）';

comment on column public.cases.price_conditions is
  '価格条件（ロット・支払い条件など）';

comment on column public.cases.min_order_amount is
  '最小発注金額';

comment on column public.cases.suggested_retail_price is
  '希望小売価格（想定売価）';

comment on column public.cases.sample_available is
  'サンプル提供可否: yes | no | negotiable';

comment on column public.cases.test_sale_available is
  'テスト販売可否: yes | no | negotiable';
