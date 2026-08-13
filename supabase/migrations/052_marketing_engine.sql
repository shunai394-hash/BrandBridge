-- BrandBridge Marketing Engine (Phase 1 + Phase 2)
-- Internal admin-only SEO / content / distribution tables.
-- Does NOT add a 4th user role. Does NOT store cookies or SNS passwords.
-- OAuth tokens must live in secret storage / env vars; this schema stores
-- only a secret *reference* (env var name), never the token itself.

-- ---------------------------------------------------------------------------
-- updated_at helper
-- ---------------------------------------------------------------------------
create or replace function public.marketing_engine_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Runs (job history)
-- ---------------------------------------------------------------------------
create table if not exists public.marketing_agent_runs (
  id uuid primary key default gen_random_uuid(),
  run_type text not null
    check (run_type in (
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
      'competitor_analysis',
      'platform_discovery',
      'brand_authority',
      'performance_analysis',
      'global_growth',
      'repurpose',
      'scaling'
    )),
  status text not null default 'running'
    check (status in ('running', 'completed', 'failed')),
  summary text,
  input jsonb not null default '{}'::jsonb,
  output jsonb not null default '{}'::jsonb,
  error_message text,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists marketing_agent_runs_type_created_idx
  on public.marketing_agent_runs (run_type, created_at desc);

-- ---------------------------------------------------------------------------
-- Recommendations
-- ---------------------------------------------------------------------------
create table if not exists public.marketing_recommendations (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references public.marketing_agent_runs (id) on delete set null,
  category text not null
    check (category in (
      'seo',
      'keyword',
      'content',
      'geo',
      'internal_link',
      'social',
      'existing_page',
      'competitor',
      'market_signal',
      'differentiation',
      'growth',
      'performance',
      'scaling',
      'brand_authority'
    )),
  title text not null,
  body text not null,
  priority text not null default 'medium'
    check (priority in ('high', 'medium', 'low')),
  status text not null default 'open'
    check (status in ('open', 'accepted', 'dismissed')),
  related_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists marketing_recommendations_status_idx
  on public.marketing_recommendations (status, created_at desc);

drop trigger if exists marketing_recommendations_set_updated_at
  on public.marketing_recommendations;
create trigger marketing_recommendations_set_updated_at
  before update on public.marketing_recommendations
  for each row execute function public.marketing_engine_set_updated_at();

-- ---------------------------------------------------------------------------
-- Competitors (keep; do not replace)
-- ---------------------------------------------------------------------------
create table if not exists public.marketing_competitors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text,
  country text,
  language text,
  summary text,
  positioning text,
  strengths jsonb not null default '[]'::jsonb,
  weaknesses jsonb not null default '[]'::jsonb,
  content_topics jsonb not null default '[]'::jsonb,
  keywords jsonb not null default '[]'::jsonb,
  source text,
  source_url text,
  last_analyzed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists marketing_competitors_set_updated_at
  on public.marketing_competitors;
create trigger marketing_competitors_set_updated_at
  before update on public.marketing_competitors
  for each row execute function public.marketing_engine_set_updated_at();

create table if not exists public.marketing_competitor_gaps (
  id uuid primary key default gen_random_uuid(),
  competitor_id uuid references public.marketing_competitors (id) on delete cascade,
  gap_type text not null
    check (gap_type in (
      'competitive_gap',
      'underserved_topic',
      'underserved_keyword',
      'content_gap',
      'keyword_gap',
      'differentiation',
      'recommended_action'
    )),
  title text not null,
  detail text,
  keyword text,
  topic text,
  priority text not null default 'medium'
    check (priority in ('high', 'medium', 'low')),
  created_at timestamptz not null default now()
);

create index if not exists marketing_competitor_gaps_competitor_idx
  on public.marketing_competitor_gaps (competitor_id, created_at desc);

-- ---------------------------------------------------------------------------
-- 1. Content Opportunity Engine
-- ---------------------------------------------------------------------------
create table if not exists public.marketing_content_opportunities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  topic text,
  keyword text,
  search_intent text,
  target_audience text,
  target_country text,
  language text not null default 'en',
  platform text not null default 'brandbridge_blog',
  priority text not null default 'medium'
    check (priority in ('high', 'medium', 'low')),
  reason text,
  source text,
  source_url text,
  status text not null default 'idea'
    check (status in (
      'idea',
      'planned',
      'draft',
      'review',
      'approved',
      'published',
      'archived'
    )),
  competitor_gap_id uuid references public.marketing_competitor_gaps (id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists marketing_content_opportunities_status_idx
  on public.marketing_content_opportunities (status, priority, created_at desc);

drop trigger if exists marketing_content_opportunities_set_updated_at
  on public.marketing_content_opportunities;
create trigger marketing_content_opportunities_set_updated_at
  before update on public.marketing_content_opportunities
  for each row execute function public.marketing_engine_set_updated_at();

-- ---------------------------------------------------------------------------
-- 2. Blog / Content Engine (CMS drafts — never overwrites public pages)
-- ---------------------------------------------------------------------------
create table if not exists public.marketing_contents (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid references public.marketing_content_opportunities (id) on delete set null,
  title text not null,
  meta_title text,
  meta_description text,
  slug text,
  h1 text,
  h2 jsonb not null default '[]'::jsonb,
  body text not null default '',
  target_keyword text,
  search_intent text,
  target_country text,
  target_audience text,
  internal_links jsonb not null default '[]'::jsonb,
  cta text,
  faq jsonb not null default '[]'::jsonb,
  language text not null default 'en',
  definition text,
  author_org_info text,
  citations jsonb not null default '[]'::jsonb,
  status text not null default 'draft'
    check (status in ('draft', 'review', 'approved', 'published', 'archived')),
  -- Optional path if a human later publishes a public page. Never auto-written
  -- over existing app/en/** routes.
  published_path text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists marketing_contents_slug_unique
  on public.marketing_contents (slug)
  where slug is not null and slug <> '';

create index if not exists marketing_contents_status_idx
  on public.marketing_contents (status, created_at desc);

drop trigger if exists marketing_contents_set_updated_at
  on public.marketing_contents;
create trigger marketing_contents_set_updated_at
  before update on public.marketing_contents
  for each row execute function public.marketing_engine_set_updated_at();

-- ---------------------------------------------------------------------------
-- 4. Social accounts (human-created only; AI never inserts accounts)
-- ---------------------------------------------------------------------------
create table if not exists public.marketing_social_accounts (
  id uuid primary key default gen_random_uuid(),
  platform text not null
    check (platform in (
      'x',
      'linkedin',
      'instagram',
      'reddit',
      'youtube',
      'medium',
      'substack',
      'brandbridge_blog'
    )),
  account_name text not null,
  country text,
  language text not null default 'en',
  target_audience text,
  profile_url text,
  status text not null default 'active'
    check (status in ('active', 'paused', 'disconnected')),
  posting_enabled boolean not null default true,
  auto_publish_enabled boolean not null default false,
  daily_limit integer not null default 1 check (daily_limit >= 0),
  weekly_limit integer not null default 3 check (weekly_limit >= 0),
  -- Env var name only, e.g. MARKETING_X_ACCESS_TOKEN. Never a token/cookie/password.
  oauth_secret_ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists marketing_social_accounts_platform_idx
  on public.marketing_social_accounts (platform, status);

drop trigger if exists marketing_social_accounts_set_updated_at
  on public.marketing_social_accounts;
create trigger marketing_social_accounts_set_updated_at
  before update on public.marketing_social_accounts
  for each row execute function public.marketing_engine_set_updated_at();

-- ---------------------------------------------------------------------------
-- 3 / 5 / 6 / 7 / 8. Social posts + calendar
-- ---------------------------------------------------------------------------
create table if not exists public.marketing_social_posts (
  id uuid primary key default gen_random_uuid(),
  content_id uuid references public.marketing_contents (id) on delete set null,
  social_account_id uuid references public.marketing_social_accounts (id) on delete set null,
  platform text not null
    check (platform in (
      'brandbridge_blog',
      'medium',
      'substack',
      'linkedin',
      'x',
      'instagram',
      'youtube',
      'reddit'
    )),
  format text,
  title text,
  body text not null default '',
  cta text,
  target_country text,
  target_audience text,
  language text not null default 'en',
  status text not null default 'draft'
    check (status in (
      'draft',
      'pending_review',
      'approved',
      'scheduled',
      'published',
      'failed',
      'manual_publish_required'
    )),
  publish_mode text not null default 'manual'
    check (publish_mode in ('official_api', 'manual')),
  scheduled_at timestamptz,
  published_at timestamptz,
  destination_url text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  error_message text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists marketing_social_posts_status_idx
  on public.marketing_social_posts (status, scheduled_at);

create index if not exists marketing_social_posts_platform_idx
  on public.marketing_social_posts (platform, created_at desc);

drop trigger if exists marketing_social_posts_set_updated_at
  on public.marketing_social_posts;
create trigger marketing_social_posts_set_updated_at
  before update on public.marketing_social_posts
  for each row execute function public.marketing_engine_set_updated_at();

create table if not exists public.marketing_content_calendar (
  id uuid primary key default gen_random_uuid(),
  calendar_date date not null,
  scheduled_time timestamptz,
  platform text not null,
  content_id uuid references public.marketing_contents (id) on delete set null,
  post_id uuid references public.marketing_social_posts (id) on delete cascade,
  title text,
  status text not null default 'draft'
    check (status in (
      'draft',
      'pending_review',
      'approved',
      'scheduled',
      'published',
      'failed'
    )),
  target_country text,
  target_audience text,
  cta text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists marketing_content_calendar_date_idx
  on public.marketing_content_calendar (calendar_date desc, platform);

drop trigger if exists marketing_content_calendar_set_updated_at
  on public.marketing_content_calendar;
create trigger marketing_content_calendar_set_updated_at
  before update on public.marketing_content_calendar
  for each row execute function public.marketing_engine_set_updated_at();

-- ---------------------------------------------------------------------------
-- 9 / 10. Performance
-- ---------------------------------------------------------------------------
create table if not exists public.marketing_content_performance (
  id uuid primary key default gen_random_uuid(),
  content_id uuid references public.marketing_contents (id) on delete set null,
  post_id uuid references public.marketing_social_posts (id) on delete cascade,
  platform text,
  country text,
  topic text,
  keyword text,
  format text,
  cta text,
  impressions integer not null default 0,
  clicks integer not null default 0,
  likes integer not null default 0,
  comments integer not null default 0,
  shares integer not null default 0,
  followers integer not null default 0,
  engagement numeric not null default 0,
  referral_traffic integer not null default 0,
  leads integer not null default 0,
  registrations integer not null default 0,
  recorded_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists marketing_content_performance_post_idx
  on public.marketing_content_performance (post_id, recorded_at desc);

create index if not exists marketing_content_performance_platform_idx
  on public.marketing_content_performance (platform, recorded_at desc);

-- ---------------------------------------------------------------------------
-- 11. Global growth signals
-- ---------------------------------------------------------------------------
create table if not exists public.marketing_global_signals (
  id uuid primary key default gen_random_uuid(),
  country text not null,
  language text not null default 'en',
  topic text not null,
  demand text,
  content_opportunity text,
  traffic integer not null default 0,
  leads integer not null default 0,
  registrations integer not null default 0,
  source text,
  source_url text,
  relevance text,
  created_at timestamptz not null default now()
);

create index if not exists marketing_global_signals_country_idx
  on public.marketing_global_signals (country, created_at desc);

-- ---------------------------------------------------------------------------
-- 12. Platform discovery (communities — not for spam)
-- ---------------------------------------------------------------------------
create table if not exists public.marketing_platform_targets (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  url text,
  country text,
  language text,
  topic text,
  relevance text,
  recommended_action text,
  reason text,
  do_not_promote boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists marketing_platform_targets_platform_idx
  on public.marketing_platform_targets (platform, do_not_promote);

drop trigger if exists marketing_platform_targets_set_updated_at
  on public.marketing_platform_targets;
create trigger marketing_platform_targets_set_updated_at
  before update on public.marketing_platform_targets
  for each row execute function public.marketing_engine_set_updated_at();

-- ---------------------------------------------------------------------------
-- 13. Brand authority
-- ---------------------------------------------------------------------------
create table if not exists public.marketing_brand_mentions (
  id uuid primary key default gen_random_uuid(),
  source text,
  url text,
  snippet text,
  mention_type text
    check (mention_type in (
      'mention',
      'backlink',
      'referral',
      'social',
      'branded_search',
      'registration'
    )),
  country text,
  language text,
  sentiment text,
  created_at timestamptz not null default now()
);

create index if not exists marketing_brand_mentions_created_idx
  on public.marketing_brand_mentions (created_at desc);

-- ---------------------------------------------------------------------------
-- RLS: admin only (reuse public.is_admin(); do not change maker/partner/admin)
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'marketing_agent_runs',
    'marketing_recommendations',
    'marketing_competitors',
    'marketing_competitor_gaps',
    'marketing_content_opportunities',
    'marketing_contents',
    'marketing_social_accounts',
    'marketing_social_posts',
    'marketing_content_calendar',
    'marketing_content_performance',
    'marketing_global_signals',
    'marketing_platform_targets',
    'marketing_brand_mentions'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists %I_admin_all on public.%I', t, t);
    execute format(
      'create policy %I_admin_all on public.%I
         for all
         to authenticated
         using (public.is_admin())
         with check (public.is_admin())',
      t, t
    );
  end loop;
end
$$;
