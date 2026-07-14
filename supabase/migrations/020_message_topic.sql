-- BrandBridge: negotiation message topics (件名) + multiple themes per case

-- Thread subject on each message (required for new opening messages via app)
alter table public.messages
  add column if not exists topic text;

-- Denormalized thread subject for list/header (synced from opening message)
alter table public.negotiations
  add column if not exists topic text;

-- Allow multiple negotiation themes per case × partner
alter table public.negotiations
  drop constraint if exists negotiations_case_id_partner_id_key;

create index if not exists negotiations_case_partner_idx
  on public.negotiations (case_id, partner_id);

create index if not exists messages_topic_idx
  on public.messages (negotiation_id, topic);

-- Opening message may be inserted while pending (partner, first message only, with topic)
drop policy if exists "messages_insert_party_when_accepted" on public.messages;

create policy "messages_insert_party_thread"
  on public.messages
  for insert
  with check (
    sender_id = auth.uid()
    and public.is_negotiation_party(negotiation_id)
    and (
      public.is_negotiation_accepted(negotiation_id)
      or (
        -- Partner opening message on a pending negotiation (件名必須)
        exists (
          select 1
          from public.negotiations n
          where n.id = negotiation_id
            and n.partner_id = auth.uid()
            and n.application_status = 'pending'
        )
        and topic is not null
        and char_length(trim(topic)) > 0
        and (
          select count(*)::int
          from public.messages m
          where m.negotiation_id = messages.negotiation_id
        ) = 0
      )
    )
  );
