-- Sales mail inbox/thread redesign (separate from contact_inquiries)
-- Target:
--   outbound_emails, inbound_emails, email_threads (1 per outbound),
--   email_messages (messages in thread; name avoids negotiation `messages`)

-- 1) Rename legacy message-per-row email_threads
alter table if exists public.email_threads
  rename to email_thread_messages_legacy;

drop policy if exists email_threads_admin_select on public.email_thread_messages_legacy;
drop policy if exists email_threads_admin_insert on public.email_thread_messages_legacy;

-- 2) Thread header: one thread per outbound email
create table if not exists public.email_threads (
  id uuid primary key default gen_random_uuid(),
  outbound_email_id uuid not null unique
    references public.outbound_emails (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists email_threads_created_at_idx
  on public.email_threads (created_at desc);

-- 3) Messages in a thread
create table if not exists public.email_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null
    references public.email_threads (id) on delete cascade,
  sender_type text not null check (sender_type in ('admin', 'prospect')),
  message text not null,
  inbound_email_id uuid null,
  created_at timestamptz not null default now()
);

create index if not exists email_messages_thread_id_idx
  on public.email_messages (thread_id, created_at asc);

-- 4) Inbound mailbox
create table if not exists public.inbound_emails (
  id uuid primary key default gen_random_uuid(),
  outbound_email_id uuid null
    references public.outbound_emails (id) on delete set null,
  from_email text not null,
  subject text not null default '',
  body text not null,
  received_at timestamptz not null default now(),
  read_status text not null default 'unread'
    check (read_status in ('unread', 'read')),
  resend_email_id text null
);

create index if not exists inbound_emails_received_at_idx
  on public.inbound_emails (received_at desc);

create index if not exists inbound_emails_read_status_idx
  on public.inbound_emails (read_status);

create index if not exists inbound_emails_outbound_email_id_idx
  on public.inbound_emails (outbound_email_id);

-- Link email_messages.inbound_email_id after inbound_emails exists
alter table public.email_messages
  drop constraint if exists email_messages_inbound_email_id_fkey;

alter table public.email_messages
  add constraint email_messages_inbound_email_id_fkey
  foreign key (inbound_email_id)
  references public.inbound_emails (id)
  on delete set null;

-- 5) Ensure outbound helper columns (idempotent with 034)
alter table public.outbound_emails
  drop constraint if exists outbound_emails_status_check;

alter table public.outbound_emails
  add constraint outbound_emails_status_check
  check (status in ('sent', 'failed', 'replied'));

alter table public.outbound_emails
  add column if not exists replied_at timestamptz;

alter table public.outbound_emails
  add column if not exists reply_to_email text;

alter table public.outbound_emails
  add column if not exists resend_email_id text;

-- 6) Migrate legacy rows → threads + messages (+ inbound for prospect)
insert into public.email_threads (outbound_email_id, created_at)
select o.id, o.created_at
from public.outbound_emails o
where not exists (
  select 1 from public.email_threads t where t.outbound_email_id = o.id
);

insert into public.email_messages (thread_id, sender_type, message, created_at)
select
  t.id,
  l.sender,
  l.message,
  l.created_at
from public.email_thread_messages_legacy l
join public.email_threads t on t.outbound_email_id = l.outbound_email_id
order by l.created_at asc;

insert into public.inbound_emails (
  outbound_email_id,
  from_email,
  subject,
  body,
  received_at,
  read_status
)
select
  o.id,
  o.to_email,
  coalesce('Re: ' || o.subject, ''),
  l.message,
  l.created_at,
  'read'
from public.email_thread_messages_legacy l
join public.outbound_emails o on o.id = l.outbound_email_id
where l.sender = 'prospect';

-- Attach inbound_email_id onto matching prospect messages (best-effort by body+time)
update public.email_messages m
set inbound_email_id = i.id
from public.inbound_emails i
join public.email_threads t on t.outbound_email_id = i.outbound_email_id
where m.thread_id = t.id
  and m.sender_type = 'prospect'
  and m.message = i.body
  and m.created_at = i.received_at
  and m.inbound_email_id is null;

-- Mark outbound replied when inbound exists
update public.outbound_emails o
set
  status = 'replied',
  replied_at = coalesce(
    o.replied_at,
    (
      select min(i.received_at)
      from public.inbound_emails i
      where i.outbound_email_id = o.id
    )
  )
where o.status = 'sent'
  and exists (
    select 1 from public.inbound_emails i where i.outbound_email_id = o.id
  );

-- 7) Drop legacy
drop table if exists public.email_thread_messages_legacy;

-- 8) RLS
alter table public.email_threads enable row level security;
alter table public.email_messages enable row level security;
alter table public.inbound_emails enable row level security;

drop policy if exists email_threads_admin_select on public.email_threads;
create policy email_threads_admin_select
  on public.email_threads for select to authenticated
  using (public.is_admin());

drop policy if exists email_threads_admin_insert on public.email_threads;
create policy email_threads_admin_insert
  on public.email_threads for insert to authenticated
  with check (public.is_admin());

drop policy if exists email_messages_admin_select on public.email_messages;
create policy email_messages_admin_select
  on public.email_messages for select to authenticated
  using (public.is_admin());

drop policy if exists email_messages_admin_insert on public.email_messages;
create policy email_messages_admin_insert
  on public.email_messages for insert to authenticated
  with check (public.is_admin());

drop policy if exists inbound_emails_admin_select on public.inbound_emails;
create policy inbound_emails_admin_select
  on public.inbound_emails for select to authenticated
  using (public.is_admin());

drop policy if exists inbound_emails_admin_insert on public.inbound_emails;
create policy inbound_emails_admin_insert
  on public.inbound_emails for insert to authenticated
  with check (public.is_admin());

drop policy if exists inbound_emails_admin_update on public.inbound_emails;
create policy inbound_emails_admin_update
  on public.inbound_emails for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists outbound_emails_admin_update on public.outbound_emails;
create policy outbound_emails_admin_update
  on public.outbound_emails for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());
