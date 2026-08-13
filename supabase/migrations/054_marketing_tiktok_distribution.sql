-- Additive Marketing Engine follow-up (TikTok + safe Phase 2 tables).
-- Does NOT edit 052/053. Does NOT DROP marketing tables. Does NOT delete rows.
--
-- Apply after checking which marketing tables already exist
-- (see docs/MARKETING_MIGRATIONS.md).
-- Safe to run if 052_marketing_engine.sql was already applied (IF NOT EXISTS / ADD COLUMN).
-- Safe to run if an older local 052_marketing_agent.sql + 053_marketing_competitors.sql
-- already created runs/competitors: this only adds missing Phase 2 objects + TikTok.

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
-- Phase 2 tables (no-op when 052_marketing_engine.sql already created them)
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
      'idea', 'planned', 'draft', 'review', 'approved', 'published', 'archived'
    )),
  competitor_gap_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.marketing_contents (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid,
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
  published_path text,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.marketing_social_accounts (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
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
  oauth_secret_ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.marketing_social_posts (
  id uuid primary key default gen_random_uuid(),
  content_id uuid,
  social_account_id uuid,
  platform text not null,
  format text,
  title text,
  body text not null default '',
  cta text,
  target_country text,
  target_audience text,
  language text not null default 'en',
  status text not null default 'draft',
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
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.marketing_content_calendar (
  id uuid primary key default gen_random_uuid(),
  calendar_date date not null,
  scheduled_time timestamptz,
  platform text not null,
  content_id uuid,
  post_id uuid,
  title text,
  status text not null default 'draft',
  target_country text,
  target_audience text,
  cta text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.marketing_content_performance (
  id uuid primary key default gen_random_uuid(),
  content_id uuid,
  post_id uuid,
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

create table if not exists public.marketing_brand_mentions (
  id uuid primary key default gen_random_uuid(),
  source text,
  url text,
  snippet text,
  mention_type text,
  country text,
  language text,
  sentiment text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- TikTok script fields (additive columns only)
-- ---------------------------------------------------------------------------
alter table public.marketing_social_posts
  add column if not exists hook text,
  add column if not exists narration text,
  add column if not exists caption text,
  add column if not exists hashtags jsonb not null default '[]'::jsonb;

-- ---------------------------------------------------------------------------
-- Widen platform / run_type checks to include tiktok (no table drop)
-- ---------------------------------------------------------------------------
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'marketing_social_accounts'
  ) then
    alter table public.marketing_social_accounts
      drop constraint if exists marketing_social_accounts_platform_check;
    alter table public.marketing_social_accounts
      add constraint marketing_social_accounts_platform_check
      check (platform in (
        'x', 'linkedin', 'instagram', 'tiktok', 'reddit', 'youtube',
        'medium', 'substack', 'brandbridge_blog'
      ));
  end if;

  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'marketing_social_posts'
  ) then
    alter table public.marketing_social_posts
      drop constraint if exists marketing_social_posts_platform_check;
    alter table public.marketing_social_posts
      add constraint marketing_social_posts_platform_check
      check (platform in (
        'brandbridge_blog', 'medium', 'substack', 'linkedin', 'x',
        'instagram', 'tiktok', 'youtube', 'reddit'
      ));
  end if;

  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'marketing_agent_runs'
  ) then
    alter table public.marketing_agent_runs
      drop constraint if exists marketing_agent_runs_run_type_check;
    alter table public.marketing_agent_runs
      add constraint marketing_agent_runs_run_type_check
      check (run_type in (
        'site_analysis', 'search_console', 'seo_analysis', 'keyword_analysis',
        'content_opportunities', 'article_draft', 'geo', 'internal_links',
        'social', 'weekly_pipeline', 'market_research', 'competitor_analysis',
        'platform_discovery', 'brand_authority', 'performance_analysis',
        'global_growth', 'repurpose', 'scaling'
      ));
  end if;
end
$$;

-- Keep auto-publish off unless an admin later enables it on a connected API.
-- Do not rewrite existing true values.
alter table public.marketing_social_accounts
  alter column auto_publish_enabled set default false;

-- ---------------------------------------------------------------------------
-- RLS for any table created by this file (skip if policy already exists)
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
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
    if exists (
      select 1 from information_schema.tables
      where table_schema = 'public' and table_name = t
    ) then
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
    end if;
  end loop;
end
$$;
