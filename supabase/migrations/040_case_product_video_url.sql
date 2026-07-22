-- Optional product introduction video URL on cases (YouTube / Vimeo / etc.)
alter table public.cases
  add column if not exists product_video_url text;
