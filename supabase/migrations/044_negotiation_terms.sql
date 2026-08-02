create table if not exists public.negotiation_terms (
  id uuid primary key default gen_random_uuid(),

  negotiation_id uuid not null unique
    references public.negotiations(id)
    on delete cascade,

  sales_region text,
  sales_channel text,

  wholesale_price numeric,
  moq integer,

  lead_time text,
  payment_terms text,

  exclusive_sales boolean not null default false,

  notes text,

  status text not null default 'draft'
    check (status in (
      'draft',
      'submitted',
      'revision_requested',
      'agreed'
    )),

  created_by uuid not null
    references public.profiles(id)
    on delete restrict,

  maker_confirmed_at timestamptz,
  partner_confirmed_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists negotiation_terms_created_by_idx
  on public.negotiation_terms(created_by);

create index if not exists negotiation_terms_status_idx
  on public.negotiation_terms(status);

create or replace function public.set_negotiation_terms_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_negotiation_terms_updated_at
  on public.negotiation_terms;

create trigger set_negotiation_terms_updated_at
before update on public.negotiation_terms
for each row
execute function public.set_negotiation_terms_updated_at();

alter table public.negotiation_terms enable row level security;
