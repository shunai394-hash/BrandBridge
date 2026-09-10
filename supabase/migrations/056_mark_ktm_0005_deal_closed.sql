-- Mark SKU KTM-0005 (北の恵みジンジャーシロップ) as 成約済み.
-- Public status "成約済み" is derived from public.deals (hasDeal), not a new case status.
-- Keep the listing open+approved so it remains visible on /cases.
-- Uses the existing won negotiation; does not change product fields or applications.

insert into public.deals (
  id,
  negotiation_id,
  case_id,
  maker_id,
  partner_id,
  deal_closed_at,
  deal_amount,
  deal_currency,
  commission_rate,
  commission_amount,
  agreed_product_name,
  agreed_currency
)
select
  'd0000005-0000-4000-8000-000000000005'::uuid,
  n.id,
  c.id,
  c.maker_id,
  n.partner_id,
  now(),
  0,
  'JPY',
  coalesce(
    (select default_rate from public.commission_settings where id = 1),
    5
  ),
  0,
  c.product_name,
  'JPY'
from public.cases c
join public.negotiations n
  on n.case_id = c.id
 and n.id = 'bbf677f3-b22e-4c89-a345-bc38f2b8402c'
where c.id = 'c0000005-0000-4000-8000-000000000005'
  and c.sku = 'KTM-0005'
  and not exists (
    select 1 from public.deals d where d.case_id = c.id
  );
