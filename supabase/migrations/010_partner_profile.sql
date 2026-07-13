-- BrandBridge: partner matching profile fields + onboarding

alter table public.profiles
  add column if not exists display_name text,
  add column if not exists entity_type text,
  add column if not exists sales_genres text,
  add column if not exists preferred_categories text,
  add column if not exists preferred_deal_types text,
  add column if not exists onboarding_completed boolean not null default false;

alter table public.profiles
  drop constraint if exists profiles_entity_type_check;

alter table public.profiles
  add constraint profiles_entity_type_check
  check (
    entity_type is null
    or entity_type in ('individual', 'corporate')
  );

-- Backfill: existing users treated as onboarded
update public.profiles
set onboarding_completed = true
where onboarding_completed = false
  and (
    coalesce(sales_channel, '') <> ''
    or coalesce(industry, '') <> ''
    or coalesce(product_overview, '') <> ''
  );

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  user_role text;
  entity text;
begin
  user_role := coalesce(new.raw_user_meta_data->>'role', 'partner');
  if user_role not in ('maker', 'partner') then
    user_role := 'partner';
  end if;

  entity := nullif(new.raw_user_meta_data->>'entity_type', '');
  if entity is not null and entity not in ('individual', 'corporate') then
    entity := null;
  end if;

  insert into public.profiles (
    id,
    role,
    company_name,
    contact_name,
    email,
    industry,
    product_overview,
    sales_channel,
    area,
    strength,
    description,
    display_name,
    entity_type,
    sales_genres,
    preferred_categories,
    preferred_deal_types,
    achievements,
    onboarding_completed
  )
  values (
    new.id,
    user_role,
    coalesce(
      nullif(new.raw_user_meta_data->>'company_name', ''),
      nullif(new.raw_user_meta_data->>'display_name', ''),
      ''
    ),
    coalesce(new.raw_user_meta_data->>'contact_name', ''),
    coalesce(new.email, ''),
    new.raw_user_meta_data->>'industry',
    new.raw_user_meta_data->>'product_overview',
    new.raw_user_meta_data->>'sales_channel',
    new.raw_user_meta_data->>'area',
    new.raw_user_meta_data->>'strength',
    new.raw_user_meta_data->>'description',
    new.raw_user_meta_data->>'display_name',
    entity,
    new.raw_user_meta_data->>'sales_genres',
    new.raw_user_meta_data->>'preferred_categories',
    new.raw_user_meta_data->>'preferred_deal_types',
    new.raw_user_meta_data->>'achievements',
    coalesce((new.raw_user_meta_data->>'onboarding_completed')::boolean, false)
  );

  return new;
end;
$$;
