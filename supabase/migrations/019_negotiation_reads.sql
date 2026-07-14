-- BrandBridge: per-user negotiation read receipts (unread badges)

create table if not exists public.negotiation_reads (
  negotiation_id uuid not null references public.negotiations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  last_read_at timestamptz not null default now(),
  primary key (negotiation_id, user_id)
);

create index if not exists negotiation_reads_user_id_idx
  on public.negotiation_reads (user_id);

alter table public.negotiation_reads enable row level security;

drop policy if exists "negotiation_reads_select_own" on public.negotiation_reads;
drop policy if exists "negotiation_reads_insert_party" on public.negotiation_reads;
drop policy if exists "negotiation_reads_update_own" on public.negotiation_reads;

create policy "negotiation_reads_select_own"
  on public.negotiation_reads
  for select
  using (
    public.is_admin()
    or user_id = auth.uid()
  );

create policy "negotiation_reads_insert_party"
  on public.negotiation_reads
  for insert
  with check (
    user_id = auth.uid()
    and public.is_negotiation_party(negotiation_id)
  );

create policy "negotiation_reads_update_own"
  on public.negotiation_reads
  for update
  using (
    user_id = auth.uid()
    and public.is_negotiation_party(negotiation_id)
  )
  with check (
    user_id = auth.uid()
    and public.is_negotiation_party(negotiation_id)
  );
