-- Admin / user reply history for contact_inquiries

create table if not exists public.contact_inquiry_messages (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references public.contact_inquiries (id) on delete cascade,
  sender_type text not null check (sender_type in ('admin', 'user')),
  subject text,
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists contact_inquiry_messages_inquiry_id_idx
  on public.contact_inquiry_messages (inquiry_id, created_at asc);

alter table public.contact_inquiry_messages enable row level security;

drop policy if exists contact_inquiry_messages_admin_select
  on public.contact_inquiry_messages;
create policy contact_inquiry_messages_admin_select
  on public.contact_inquiry_messages
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists contact_inquiry_messages_admin_insert
  on public.contact_inquiry_messages;
create policy contact_inquiry_messages_admin_insert
  on public.contact_inquiry_messages
  for insert
  to authenticated
  with check (
    public.is_admin()
    and sender_type = 'admin'
  );
