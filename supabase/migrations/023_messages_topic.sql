-- BrandBridge: ensure public.messages.topic exists
-- Purpose: store negotiation subject (件名) on opening / thread messages
-- Safe to re-run (IF NOT EXISTS)

alter table public.messages
  add column if not exists topic text;

comment on column public.messages.topic is
  'Negotiation subject (件名). Opening message topic is source of truth; also mirrored on negotiations.topic';

create index if not exists messages_topic_idx
  on public.messages (negotiation_id, topic);

-- Verification (visible in SQL editor results when run manually):
-- select column_name, data_type, is_nullable
-- from information_schema.columns
-- where table_schema = 'public'
--   and table_name = 'messages'
--   and column_name = 'topic';
