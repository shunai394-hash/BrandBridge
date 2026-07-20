-- Admin outreach emails to registered companies (profiles)

create table if not exists public.company_email_messages (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.profiles (id) on delete cascade,
  recipient_email text not null,
  subject text not null,
  body text not null,
  status text not null check (status in ('sent', 'failed')),
  created_at timestamptz not null default now()
);

create index if not exists company_email_messages_company_id_idx
  on public.company_email_messages (company_id, created_at desc);

create index if not exists company_email_messages_created_at_idx
  on public.company_email_messages (created_at desc);

alter table public.company_email_messages enable row level security;

drop policy if exists company_email_messages_admin_select
  on public.company_email_messages;
create policy company_email_messages_admin_select
  on public.company_email_messages
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists company_email_messages_admin_insert
  on public.company_email_messages;
create policy company_email_messages_admin_insert
  on public.company_email_messages
  for insert
  to authenticated
  with check (public.is_admin());
