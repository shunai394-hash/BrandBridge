-- Remove accidental "Me at the zoo" test YouTube URLs from product listings.
update public.cases
set product_video_url = null
where product_video_url ilike '%jNQXAC9IVRw%';
