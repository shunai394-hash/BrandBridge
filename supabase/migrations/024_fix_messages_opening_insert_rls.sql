-- Fix: opening message INSERT on pending negotiations was blocked.
-- Cause: WITH CHECK used count(messages)=0; during INSERT the new row can
-- make the subquery fail (or race). Allow partner opening messages on pending
-- when topic is present; app enforces single opening message.

create or replace function public.can_insert_negotiation_message(
  p_negotiation_id uuid,
  p_topic text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_negotiation_party(p_negotiation_id)
    and (
      -- Normal replies after acceptance
      public.is_negotiation_accepted(p_negotiation_id)
      or (
        -- Partner opening message on pending thread (件名必須)
        exists (
          select 1
          from public.negotiations n
          where n.id = p_negotiation_id
            and n.partner_id = auth.uid()
            and n.application_status = 'pending'
        )
        and p_topic is not null
        and char_length(trim(p_topic)) > 0
      )
    );
$$;

drop policy if exists "messages_insert_party_thread" on public.messages;
drop policy if exists "messages_insert_party_when_accepted" on public.messages;

create policy "messages_insert_party_thread"
  on public.messages
  for insert
  to authenticated
  with check (
    sender_id = auth.uid()
    and public.can_insert_negotiation_message(negotiation_id, topic)
  );

-- Ensure API schema cache sees messages.topic
notify pgrst, 'reload schema';
