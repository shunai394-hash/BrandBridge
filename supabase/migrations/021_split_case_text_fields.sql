-- BrandBridge: split duplicated case text fields
-- summary = short listing, product_features = differentiation, description = detail

do $$
declare
  r record;
  v_summary text;
  v_features text;
  v_description text;
  v_longest text;
  v_short text;
begin
  for r in
    select
      id,
      product_name,
      coalesce(summary, '') as summary,
      coalesce(product_features, '') as product_features,
      coalesce(description, '') as description
    from public.cases
  loop
    v_summary := btrim(r.summary);
    v_features := btrim(r.product_features);
    v_description := btrim(r.description);

    -- Pick longest as detailed description
    v_longest := v_description;
    if char_length(v_summary) > char_length(v_longest) then
      v_longest := v_summary;
    end if;
    if char_length(v_features) > char_length(v_longest) then
      v_longest := v_features;
    end if;

    if v_description = '' then
      v_description := v_longest;
    end if;

    -- Short listing summary
    if v_summary = ''
       or v_summary = v_description
       or v_summary = v_features
       or (
         char_length(v_summary) >= 40
         and left(v_description, 40) = left(v_summary, 40)
       )
    then
      v_short := regexp_replace(v_description, '\s+', ' ', 'g');
      if char_length(v_short) > 120 then
        v_short := left(v_short, 117) || '...';
      end if;
      if v_short = '' then
        v_short := coalesce(nullif(btrim(r.product_name), ''), '商品') || 'の販売パートナー募集';
      end if;
      v_summary := v_short;
    elsif char_length(v_summary) > 280 then
      v_summary := left(regexp_replace(v_summary, '\s+', ' ', 'g'), 117) || '...';
    end if;

    -- Clear features when duplicated with description/summary
    if v_features = ''
       or v_features = v_description
       or v_features = v_summary
       or (
         char_length(v_features) >= 40
         and left(v_description, 40) = left(v_features, 40)
       )
    then
      v_features := null;
    end if;

    update public.cases
    set
      summary = v_summary,
      description = v_description,
      product_features = v_features
    where id = r.id;
  end loop;
end $$;
