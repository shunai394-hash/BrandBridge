-- Allow admin role in handle_new_user metadata (ops admin bootstrap)

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
  if user_role not in ('maker', 'partner', 'admin') then
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
    onboarding_completed,
    is_active
  )
  values (
    new.id,
    user_role,
    coalesce(
      nullif(new.raw_user_meta_data->>'company_name', ''),
      nullif(new.raw_user_meta_data->>'display_name', ''),
      case when user_role = 'admin' then 'BrandBridge Admin' else '' end
    ),
    coalesce(
      nullif(new.raw_user_meta_data->>'contact_name', ''),
      case when user_role = 'admin' then 'Admin' else '' end
    ),
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
    coalesce(
      (new.raw_user_meta_data->>'onboarding_completed')::boolean,
      user_role = 'admin'
    ),
    true
  )
  on conflict (id) do update
    set
      role = excluded.role,
      email = excluded.email,
      onboarding_completed = excluded.onboarding_completed,
      is_active = true;

  return new;
end;
$$;
