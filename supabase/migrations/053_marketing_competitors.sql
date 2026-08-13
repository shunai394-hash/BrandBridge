-- Marketing Agent: competitor research + market signals
-- Does NOT change profiles.role, is_maker, is_partner, or existing product RLS.
-- Cookies / AgentReach credentials are NOT stored here.

-- ---------------------------------------------------------------------------
-- Extend run_type / recommendation category (additive)
-- ---------------------------------------------------------------------------
alter table public.marketing_agent_runs
  drop constraint if exists marketing_agent_runs_run_type_check;

alter table public.marketing_agent_runs
  add constraint marketing_agent_runs_run_type_check
  check (
    run_type in (
      'site_analysis',
      'search_console',
      'seo_analysis',
      'keyword_analysis',
      'content_opportunities',
      'article_draft',
      'geo',
      'internal_links',
      'social',
      'weekly_pipeline',
      'market_research',
      'competitor_analysis'
    )
  );

alter table public.marketing_recommendations
  drop constraint if exists marketing_recommendations_category_check;

alter table public.marketing_recommendations
  add constraint marketing_recommendations_category_check
  check (
    category in (
      'seo',
      'keyword',
      'content',
      'geo',
      'internal_link',
      'social',
      'existing_page',
      'competitor',
      'market_signal',
      'differentiation'
    )
  );

-- ---------------------------------------------------------------------------
-- marketing_competitors
-- ---------------------------------------------------------------------------
create table if not exists public.marketing_competitors (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  url text,
  category text,
  target_customer text,
  service_summary text,
  strengths text,
  weaknesses text,
  seo_summary text,
  social_summary text,
  source_data jsonb not null default '{}'::jsonb,
  status text not null default 'candidate'
    check (status in ('candidate', 'reviewed', 'watch', 'dismissed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists marketing_competitors_status_idx
  on public.marketing_competitors (status, created_at desc);

-- ---------------------------------------------------------------------------
-- marketing_competitor_gaps
-- ---------------------------------------------------------------------------
create table if not exists public.marketing_competitor_gaps (
  id uuid primary key default gen_random_uuid(),
  competitor_id uuid references public.marketing_competitors (id) on delete set null,
  gap_type text not null
    check (
      gap_type in (
        'competitive_gap',
        'underserved_topic',
        'underserved_keyword',
        'content_gap',
        'keyword_gap',
        'differentiation',
        'recommended_action'
      )
    ),
  title text not null,
  description text,
  priority text not null default 'medium'
    check (priority in ('high', 'medium', 'low')),
  data jsonb not null default '{}'::jsonb,
  status text not null default 'open'
    check (status in ('open', 'accepted', 'dismissed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists marketing_competitor_gaps_type_idx
  on public.marketing_competitor_gaps (gap_type, created_at desc);

create index if not exists marketing_competitor_gaps_competitor_idx
  on public.marketing_competitor_gaps (competitor_id);

drop trigger if exists marketing_competitors_set_updated_at
  on public.marketing_competitors;
create trigger marketing_competitors_set_updated_at
  before update on public.marketing_competitors
  for each row
  execute function public.marketing_agent_set_updated_at();

drop trigger if exists marketing_competitor_gaps_set_updated_at
  on public.marketing_competitor_gaps;
create trigger marketing_competitor_gaps_set_updated_at
  before update on public.marketing_competitor_gaps
  for each row
  execute function public.marketing_agent_set_updated_at();

alter table public.marketing_competitors enable row level security;
alter table public.marketing_competitor_gaps enable row level security;

drop policy if exists "marketing_competitors_admin_all"
  on public.marketing_competitors;
create policy "marketing_competitors_admin_all"
  on public.marketing_competitors
  for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "marketing_competitor_gaps_admin_all"
  on public.marketing_competitor_gaps;
create policy "marketing_competitor_gaps_admin_all"
  on public.marketing_competitor_gaps
  for all
  using (public.is_admin())
  with check (public.is_admin());
