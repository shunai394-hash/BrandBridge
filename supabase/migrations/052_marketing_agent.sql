-- BrandBridge Marketing Agent v1
-- Internal admin-only SEO / content planning tables.
-- Does NOT change profiles.role, is_maker, is_partner, or existing RLS.

-- ---------------------------------------------------------------------------
-- marketing_agent_runs
-- ---------------------------------------------------------------------------
create table if not exists public.marketing_agent_runs (
  id uuid primary key default gen_random_uuid(),
  run_type text not null
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
        'weekly_pipeline'
      )
    ),
  status text not null default 'pending'
    check (status in ('pending', 'running', 'succeeded', 'failed')),
  input jsonb not null default '{}'::jsonb,
  result jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists marketing_agent_runs_type_created_idx
  on public.marketing_agent_runs (run_type, created_at desc);

create index if not exists marketing_agent_runs_status_idx
  on public.marketing_agent_runs (status);

-- ---------------------------------------------------------------------------
-- marketing_content_ideas
-- ---------------------------------------------------------------------------
create table if not exists public.marketing_content_ideas (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  topic text,
  target_keyword text,
  search_intent text,
  target_audience text,
  content_type text,
  priority text not null default 'medium'
    check (priority in ('high', 'medium', 'low')),
  reasoning text,
  status text not null default 'proposed'
    check (status in ('proposed', 'accepted', 'rejected', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists marketing_content_ideas_status_idx
  on public.marketing_content_ideas (status, created_at desc);

create index if not exists marketing_content_ideas_priority_idx
  on public.marketing_content_ideas (priority);

-- ---------------------------------------------------------------------------
-- marketing_content_drafts
-- ---------------------------------------------------------------------------
create table if not exists public.marketing_content_drafts (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid references public.marketing_content_ideas (id) on delete set null,
  title text not null,
  slug text,
  meta_title text,
  meta_description text,
  content text not null default '',
  language text not null default 'en',
  seo_notes text,
  geo_notes text,
  status text not null default 'draft'
    check (status in ('draft', 'accepted', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists marketing_content_drafts_idea_idx
  on public.marketing_content_drafts (idea_id);

create index if not exists marketing_content_drafts_status_idx
  on public.marketing_content_drafts (status, created_at desc);

-- ---------------------------------------------------------------------------
-- marketing_recommendations
-- ---------------------------------------------------------------------------
create table if not exists public.marketing_recommendations (
  id uuid primary key default gen_random_uuid(),
  category text not null
    check (
      category in (
        'seo',
        'keyword',
        'content',
        'geo',
        'internal_link',
        'social',
        'existing_page'
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

create index if not exists marketing_recommendations_category_idx
  on public.marketing_recommendations (category, created_at desc);

create index if not exists marketing_recommendations_status_idx
  on public.marketing_recommendations (status);

-- ---------------------------------------------------------------------------
-- updated_at
-- ---------------------------------------------------------------------------
create or replace function public.marketing_agent_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists marketing_agent_runs_set_updated_at
  on public.marketing_agent_runs;
create trigger marketing_agent_runs_set_updated_at
  before update on public.marketing_agent_runs
  for each row
  execute function public.marketing_agent_set_updated_at();

drop trigger if exists marketing_content_ideas_set_updated_at
  on public.marketing_content_ideas;
create trigger marketing_content_ideas_set_updated_at
  before update on public.marketing_content_ideas
  for each row
  execute function public.marketing_agent_set_updated_at();

drop trigger if exists marketing_content_drafts_set_updated_at
  on public.marketing_content_drafts;
create trigger marketing_content_drafts_set_updated_at
  before update on public.marketing_content_drafts
  for each row
  execute function public.marketing_agent_set_updated_at();

drop trigger if exists marketing_recommendations_set_updated_at
  on public.marketing_recommendations;
create trigger marketing_recommendations_set_updated_at
  before update on public.marketing_recommendations
  for each row
  execute function public.marketing_agent_set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS: admin only (uses existing public.is_admin())
-- ---------------------------------------------------------------------------
alter table public.marketing_agent_runs enable row level security;
alter table public.marketing_content_ideas enable row level security;
alter table public.marketing_content_drafts enable row level security;
alter table public.marketing_recommendations enable row level security;

drop policy if exists "marketing_agent_runs_admin_all"
  on public.marketing_agent_runs;
create policy "marketing_agent_runs_admin_all"
  on public.marketing_agent_runs
  for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "marketing_content_ideas_admin_all"
  on public.marketing_content_ideas;
create policy "marketing_content_ideas_admin_all"
  on public.marketing_content_ideas
  for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "marketing_content_drafts_admin_all"
  on public.marketing_content_drafts;
create policy "marketing_content_drafts_admin_all"
  on public.marketing_content_drafts
  for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "marketing_recommendations_admin_all"
  on public.marketing_recommendations;
create policy "marketing_recommendations_admin_all"
  on public.marketing_recommendations
  for all
  using (public.is_admin())
  with check (public.is_admin());
