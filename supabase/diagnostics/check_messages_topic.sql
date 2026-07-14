-- Verify public.messages.topic exists
select
  exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'messages'
      and column_name = 'topic'
  ) as has_messages_topic,
  (
    select data_type
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'messages'
      and column_name = 'topic'
  ) as topic_data_type;

select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name = 'messages'
  and column_name in (
    'topic',
    'attachment_path',
    'attachment_name',
    'attachment_mime',
    'attachment_size'
  )
order by column_name;
