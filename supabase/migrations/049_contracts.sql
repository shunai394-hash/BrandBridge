create table if not exists public.contracts (
  id uuid primary key default gen_random_uuid(),

  negotiation_id uuid not null
    references public.negotiations(id)
    on delete cascade,

  version integer not null default 1,

  pdf_url text,

  status text not null default 'draft'
    check (
      status in (
        'draft',
        'sent',
        'signed',
        'cancelled'
      )
    ),

  maker_signed_at timestamptz,

  partner_signed_at timestamptz,

  created_at timestamptz default now(),

  updated_at timestamptz default now()
);


create index if not exists contracts_negotiation_id_idx
on public.contracts(negotiation_id);