-- Outbound sales mail: reply tracking (sent → replied)
-- Separate from contact_inquiries

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

create index if not exists outbound_emails_status_idx
  on public.outbound_emails (status);

-- Mark replied when a prospect thread message exists (backfill)
update public.outbound_emails o
set
  status = 'replied',
  replied_at = coalesce(
    o.replied_at,
    (
      select min(t.created_at)
      from public.email_threads t
      where t.outbound_email_id = o.id
        and t.sender = 'prospect'
    )
  )
where o.status = 'sent'
  and exists (
    select 1
    from public.email_threads t
    where t.outbound_email_id = o.id
      and t.sender = 'prospect'
  );

-- Webhook inserts use service_role (bypasses RLS). Keep admin policies.
