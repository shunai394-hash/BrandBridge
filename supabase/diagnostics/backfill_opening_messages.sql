-- Backfill opening messages for negotiations with zero messages
insert into public.messages (negotiation_id, sender_id, topic, body)
select
  n.id,
  n.partner_id,
  coalesce(nullif(trim(n.topic), ''), '（件名なし）'),
  coalesce(nullif(trim(n.message), ''), '交渉を申し込みました')
from public.negotiations n
where not exists (
  select 1 from public.messages m where m.negotiation_id = n.id
);

update public.negotiations n
set topic = coalesce(nullif(trim(n.topic), ''), '（件名なし）')
where n.topic is null or trim(n.topic) = '';
