-- BrandBridge: contact inquiries for beta support

create table if not exists public.contact_inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company_name text,
  category text not null default 'general'
    check (category in ('general', 'maker', 'partner', 'billing', 'bug', 'other')),
  message text not null,
  user_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists contact_inquiries_created_at_idx
  on public.contact_inquiries (created_at desc);

alter table public.contact_inquiries enable row level security;

drop policy if exists "contact_inquiries_insert_public" on public.contact_inquiries;
drop policy if exists "contact_inquiries_select_admin" on public.contact_inquiries;

create policy "contact_inquiries_insert_public"
  on public.contact_inquiries
  for insert
  to anon, authenticated
  with check (
    char_length(trim(name)) > 0
    and char_length(trim(email)) > 3
    and char_length(trim(message)) > 0
  );

create policy "contact_inquiries_select_admin"
  on public.contact_inquiries
  for select
  to authenticated
  using (public.is_admin());
