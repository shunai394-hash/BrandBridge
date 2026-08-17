-- Marketing Agent: social post history + optional OAuth tokens
-- Admin-only. Does not change profiles.role or existing product RLS.
-- Secrets are never written to marketing_recommendations.

-- ---------------------------------------------------------------------------
-- social_posts
-- ---------------------------------------------------------------------------
create table if not exists public.social_posts (
  id uuid primary key default gen_random_uuid(),
  recommendation_id uuid references public.marketing_recommendations (id) on delete set null,
  platform text not null
    check (
      platform in (
        'x',
        'linkedin',
        'instagram',
        'tiktok',
        'substack',
        'reddit'
      )
    ),
  content text not null default '',
  media_url text,
  status text not null default 'draft'
    check (
      status in (
        'draft',
        'ready',
        'posted',
        'failed',
        'manual',
        'api_unavailable'
      )
    ),
  external_post_id text,
  external_post_url text,
  error_message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  posted_at timestamptz
);

create index if not exists social_posts_platform_created_idx
  on public.social_posts (platform, created_at desc);

create index if not exists social_posts_status_idx
  on public.social_posts (status);

create index if not exists social_posts_recommendation_idx
  on public.social_posts (recommendation_id);

-- ---------------------------------------------------------------------------
-- social_oauth_tokens (LinkedIn member OAuth only; never expose to browser)
-- ---------------------------------------------------------------------------
create table if not exists public.social_oauth_tokens (
  id uuid primary key default gen_random_uuid(),
  platform text not null
    check (platform in ('linkedin')),
  access_token text not null,
  refresh_token text,
  expires_at timestamptz,
  account_label text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists social_oauth_tokens_platform_uidx
  on public.social_oauth_tokens (platform);

drop trigger if exists social_oauth_tokens_set_updated_at
  on public.social_oauth_tokens;
create trigger social_oauth_tokens_set_updated_at
  before update on public.social_oauth_tokens
  for each row
  execute function public.marketing_agent_set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS: admin only
-- ---------------------------------------------------------------------------
alter table public.social_posts enable row level security;
alter table public.social_oauth_tokens enable row level security;

drop policy if exists "social_posts_admin_all"
  on public.social_posts;
create policy "social_posts_admin_all"
  on public.social_posts
  for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "social_oauth_tokens_admin_all"
  on public.social_oauth_tokens;
create policy "social_oauth_tokens_admin_all"
  on public.social_oauth_tokens
  for all
  using (public.is_admin())
  with check (public.is_admin());
