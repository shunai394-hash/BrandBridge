-- Abolish maker approval gate for negotiation messaging.
-- Parties (maker/partner on the thread) may message freely once a negotiation exists.
-- Rejected threads remain closed. Third parties stay blocked via is_negotiation_party.

-- 1) Existing pending threads become open chats
update public.negotiations
set
  application_status = 'accepted',
  pipeline_status = coalesce(pipeline_status, 'in_negotiation')
where application_status = 'pending';

-- 2) New negotiations default to accepted (open chat)
alter table public.negotiations
  alter column application_status set default 'accepted';

-- 3) Set pipeline on INSERT as well as UPDATE→accepted
create or replace function public.set_pipeline_on_accept()
returns trigger
language plpgsql
as $$
begin
  if new.application_status = 'accepted'
     and (
       tg_op = 'INSERT'
       or old.application_status is distinct from 'accepted'
     )
     and new.pipeline_status is null then
    new.pipeline_status := 'in_negotiation';
  end if;
  if new.application_status = 'rejected' then
    new.pipeline_status := null;
  end if;
  return new;
end;
$$;

drop trigger if exists negotiations_set_pipeline_on_accept on public.negotiations;

create trigger negotiations_set_pipeline_on_accept
  before insert or update on public.negotiations
  for each row
  execute function public.set_pipeline_on_accept();

-- 4) Message INSERT: any party on a non-rejected negotiation
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
    and exists (
      select 1
      from public.negotiations n
      where n.id = p_negotiation_id
        and n.application_status is distinct from 'rejected'
    );
$$;

-- Keep policy name; recreate for clarity
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

notify pgrst, 'reload schema';
