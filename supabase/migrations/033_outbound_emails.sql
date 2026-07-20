-- Outbound sales / partnership emails to unregistered companies
-- Separate from contact_inquiries and company_email_messages

create table if not exists public.outbound_emails (
  id uuid primary key default gen_random_uuid(),
  to_email text not null,
  from_email text not null,
  subject text not null,
  body text not null,
  status text not null check (status in ('sent', 'failed')),
  created_at timestamptz not null default now()
);

create index if not exists outbound_emails_created_at_idx
  on public.outbound_emails (created_at desc);

create index if not exists outbound_emails_to_email_idx
  on public.outbound_emails (to_email);

create table if not exists public.email_threads (
  id uuid primary key default gen_random_uuid(),
  outbound_email_id uuid not null
    references public.outbound_emails (id) on delete cascade,
  sender text not null check (sender in ('admin', 'prospect')),
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists email_threads_outbound_email_id_idx
  on public.email_threads (outbound_email_id, created_at asc);

alter table public.outbound_emails enable row level security;
alter table public.email_threads enable row level security;

drop policy if exists outbound_emails_admin_select on public.outbound_emails;
create policy outbound_emails_admin_select
  on public.outbound_emails
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists outbound_emails_admin_insert on public.outbound_emails;
create policy outbound_emails_admin_insert
  on public.outbound_emails
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists email_threads_admin_select on public.email_threads;
create policy email_threads_admin_select
  on public.email_threads
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists email_threads_admin_insert on public.email_threads;
create policy email_threads_admin_insert
  on public.email_threads
  for insert
  to authenticated
  with check (public.is_admin());
