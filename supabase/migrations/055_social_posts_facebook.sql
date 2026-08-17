-- Allow Facebook copy/history on social_posts (no Facebook API posting).
alter table public.social_posts
  drop constraint if exists social_posts_platform_check;

alter table public.social_posts
  add constraint social_posts_platform_check
  check (
    platform in (
      'x',
      'linkedin',
      'instagram',
      'tiktok',
      'substack',
      'reddit',
      'facebook'
    )
  );
