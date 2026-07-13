-- BrandBridge: negotiations.updated_at + messages table + RLS

-- ---------------------------------------------------------------------------
-- negotiations.updated_at
-- ---------------------------------------------------------------------------
alter table public.negotiations
  add column if not exists updated_at timestamptz not null default now();

create or replace function public.set_negotiations_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists negotiations_set_updated_at on public.negotiations;

create trigger negotiations_set_updated_at
  before update on public.negotiations
  for each row
  execute function public.set_negotiations_updated_at();

-- ---------------------------------------------------------------------------
-- messages
-- ---------------------------------------------------------------------------
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  negotiation_id uuid not null references public.negotiations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(trim(body)) > 0),
  created_at timestamptz not null default now()
);

create index if not exists messages_negotiation_id_idx
  on public.messages (negotiation_id, created_at);

create index if not exists messages_sender_id_idx
  on public.messages (sender_id);

-- Helper: is current user a party to this negotiation?
create or replace function public.is_negotiation_party(p_negotiation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.negotiations n
    join public.cases c on c.id = n.case_id
    where n.id = p_negotiation_id
      and (n.partner_id = auth.uid() or c.maker_id = auth.uid())
  );
$$;

-- Helper: is negotiation accepted?
create or replace function public.is_negotiation_accepted(p_negotiation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.negotiations n
    where n.id = p_negotiation_id
      and n.status = 'accepted'
  );
$$;

alter table public.messages enable row level security;

create policy "messages_select_party"
  on public.messages
  for select
  using (public.is_negotiation_party(negotiation_id));

create policy "messages_insert_party_when_accepted"
  on public.messages
  for insert
  with check (
    sender_id = auth.uid()
    and public.is_negotiation_party(negotiation_id)
    and public.is_negotiation_accepted(negotiation_id)
  );
