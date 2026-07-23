-- Fictional dummy catalog products (no real brands).
-- Idempotent upsert for local + remote environments.

do $$
declare
  v_maker_a uuid;
  v_maker_b uuid;
  v_maker_c uuid;
begin
  select id into v_maker_a
  from public.profiles
  where role = 'maker'
  order by created_at asc
  limit 1;

  if v_maker_a is null then
    raise notice '042_dummy_catalog_products: no maker profile — skip';
    return;
  end if;

  select id into v_maker_b
  from public.profiles
  where role = 'maker' and id <> v_maker_a
  order by created_at asc
  limit 1;
  v_maker_b := coalesce(v_maker_b, v_maker_a);

  select id into v_maker_c
  from public.profiles
  where role = 'maker' and id not in (v_maker_a, v_maker_b)
  order by created_at asc
  limit 1;
  v_maker_c := coalesce(v_maker_c, v_maker_a);

  insert into public.cases (
    id, maker_id, title, category, region, summary, description,
    ideal_partner, offer, status, review_status,
    product_name, product_features, price_band, sales_format, sales_terms,
    min_order, is_exclusive, target_country, partner_channels, partner_requirements,
    sku, product_image_url,
    created_at, updated_at, reviewed_at
  ) values
  (
    'c0000021-0000-4000-8000-000000000021',
    v_maker_a,
    'Nordic Wood Lampの卸パートナー募集',
    'ホーム・インテリア', '全国・海外',
    '天然木ベースとファブリックシェードの北欧テーブルランプ。インテリア卸向け。',
    '天然木とファブリックシェードを組み合わせた北欧スタイルのテーブルランプ。リビングや寝室、カフェ空間にも調和するシンプルなデザインです。',
    'インテリアショップ、ライフスタイルセレクト、カフェ備品調達',
    '初回ロット割引、売り場什器提案',
    'open', 'approved',
    'Nordic Wood Lamp',
    '天然木ベース、ファブリックシェード、E26対応',
    '3,800〜5,200円（税別）',
    'wholesale', '掛け率 45〜55%',
    '24個〜', false, 'GLOBAL',
    'インテリア / セレクト / カフェ',
    'ライフスタイル商材の取扱実績歓迎',
    'DUM-0021', '/product-placeholder.svg',
    now() - interval '1 day', now() - interval '1 day', now() - interval '1 day'
  ),
  (
    'c0000022-0000-4000-8000-000000000022',
    v_maker_a,
    'Urban Travel Backpackの販売パートナー募集',
    'バッグ', '全国・海外',
    'ノートPC収納・防水素材・USBポート付き多機能バックパック。',
    'ノートPC収納、防水素材、USBポートを備えた多機能バックパック。通勤・通学・旅行まで幅広く対応します。',
    'バッグ専門店、旅行用品店、ECモール出品者',
    'サンプル貸出、カタログデータ提供',
    'open', 'approved',
    'Urban Travel Backpack',
    '15インチPC対応、防水素材、USB充電ポート',
    '4,200〜6,800円（税別）',
    'wholesale', '掛け率 40〜50%',
    '12個〜', false, 'GLOBAL',
    'バッグ専門 / 旅行 / EC',
    'バッグまたはトラベル商材の販売実績',
    'DUM-0022', '/product-placeholder.svg',
    now() - interval '1 day', now() - interval '1 day', now() - interval '1 day'
  ),
  (
    'c0000023-0000-4000-8000-000000000023',
    v_maker_b,
    'Pure Ceramic Mugの卸・ギフト卸パートナー募集',
    'キッチン', '全国',
    'ミニマルデザインのプレミアムセラミックマグ。日常使い・ギフト向け。',
    'シンプルで高級感のあるセラミックマグ。日常使いからギフトまで幅広く利用できます。',
    'キッチン雑貨店、ギフト卸、カフェ・ホテル備品',
    'ギフト箱対応、季節キャンペーン連動',
    'open', 'approved',
    'Pure Ceramic Mug',
    '磁器、電子レンジ対応、ギフト箱対応可',
    '980〜1,480円（税別）',
    'wholesale', '掛け率 45%',
    '48個〜', false, 'JP',
    'キッチン雑貨 / ギフト / カフェ',
    '雑貨またはギフト商材の取扱経験',
    'DUM-0023', '/product-placeholder.svg',
    now() - interval '1 day', now() - interval '1 day', now() - interval '1 day'
  ),
  (
    'c0000024-0000-4000-8000-000000000024',
    v_maker_b,
    'Smart Fitness Bottleのスポーツ卸パートナー募集',
    'スポーツ', '全国・海外',
    '真空断熱のスポーツボトル。ジム・アウトドア向け。',
    '真空断熱構造を採用したスポーツボトル。長時間保温・保冷が可能でアウトドアやジムに最適です。',
    'スポーツ用品店、フィットネスジム、アウトドア専門店',
    '店頭什器提案、初回ロット割引',
    'open', 'approved',
    'Smart Fitness Bottle',
    '真空断熱、500ml、漏れ防止キャップ',
    '2,400〜3,200円（税別）',
    'wholesale', '掛け率 45〜52%',
    '24個〜', false, 'GLOBAL',
    'スポーツ / ジム / アウトドア',
    'スポーツ・アウトドア商材の販売実績歓迎',
    'DUM-0024', '/product-placeholder.svg',
    now() - interval '1 day', now() - interval '1 day', now() - interval '1 day'
  ),
  (
    'c0000025-0000-4000-8000-000000000025',
    v_maker_c,
    'Eco Bamboo Organizerのライフスタイル卸パートナー募集',
    'ホーム・収納', '全国',
    '天然竹のデスクオーガナイザー。文具・小物収納向け。',
    '天然竹素材を使用したデスクオーガナイザー。文房具や小物をすっきり収納できます。',
    '文具セレクト、ライフスタイルショップ、オフィサプライ',
    '売り場提案資料、同梱チラシ対応',
    'open', 'approved',
    'Eco Bamboo Organizer',
    '天然竹、多区画トレー、デスク向けサイズ',
    '1,800〜2,600円（税別）',
    'wholesale', '掛け率 48%',
    '20個〜', false, 'JP',
    '文具 / ライフスタイル / オフィス',
    '文具・収納雑貨の取扱経験歓迎',
    'DUM-0025', '/product-placeholder.svg',
    now() - interval '1 day', now() - interval '1 day', now() - interval '1 day'
  )
  on conflict (id) do update set
    title = excluded.title,
    category = excluded.category,
    region = excluded.region,
    summary = excluded.summary,
    description = excluded.description,
    ideal_partner = excluded.ideal_partner,
    offer = excluded.offer,
    status = 'open',
    review_status = 'approved',
    product_name = excluded.product_name,
    product_features = excluded.product_features,
    price_band = excluded.price_band,
    sales_format = excluded.sales_format,
    sales_terms = excluded.sales_terms,
    min_order = excluded.min_order,
    is_exclusive = excluded.is_exclusive,
    target_country = excluded.target_country,
    partner_channels = excluded.partner_channels,
    partner_requirements = excluded.partner_requirements,
    sku = excluded.sku,
    product_image_url = excluded.product_image_url,
    updated_at = now(),
    reviewed_at = coalesce(public.cases.reviewed_at, now());
end $$;
