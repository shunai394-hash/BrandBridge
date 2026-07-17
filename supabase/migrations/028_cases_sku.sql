-- Maker-managed product code (SKU), separate from any future BrandBridge product ID.
-- Product fields live on `cases` (there is no separate `products` table).
alter table public.cases
  add column if not exists sku text;

comment on column public.cases.sku is
  'Maker-managed product code (SKU). Optional. Distinct from any future platform product ID.';

-- Soft uniqueness per maker is not enforced: makers may reuse codes across drafts/cases.
-- App validates length (<=50) and charset (alphanumeric, hyphen, underscore).
