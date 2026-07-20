-- Replace leftover 「メーカー」 phrasing in demo/content rows that can surface on product pages.
-- Idempotent: only updates rows that still contain the old strings.

update public.profiles
set description = replace(description, '部品メーカー', '部品提供企業')
where description like '%部品メーカー%';

update public.cases
set product_features = replace(product_features, '主要メーカー互換', '主要ブランド互換')
where product_features like '%主要メーカー互換%';

update public.cases
set ideal_partner = replace(ideal_partner, '海外機械メーカー', '海外機械ブランド')
where ideal_partner like '%海外機械メーカー%';
