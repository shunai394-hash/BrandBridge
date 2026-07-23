-- BrandBridge demo seed: sample makers/partners + 20 approved cases
-- Run AFTER migrations 001–007 in Supabase SQL Editor.
-- Idempotent for demo emails (@demo.brandbridge.app).
-- Demo login password (all demo users): DemoPass123!

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Remove previous demo data (cascade from auth.users → profiles → cases)
-- ---------------------------------------------------------------------------
do $$
declare
  demo_ids uuid[];
begin
  select coalesce(array_agg(id), '{}')
  into demo_ids
  from auth.users
  where email like '%@demo.brandbridge.app';

  if array_length(demo_ids, 1) is not null then
    delete from public.favorites where user_id = any(demo_ids) or case_id in (
      select id from public.cases where maker_id = any(demo_ids)
    );
    delete from public.deals where maker_id = any(demo_ids) or partner_id = any(demo_ids);
    delete from public.messages where negotiation_id in (
      select id from public.negotiations
      where partner_id = any(demo_ids)
         or case_id in (select id from public.cases where maker_id = any(demo_ids))
    );
    delete from public.negotiations
    where partner_id = any(demo_ids)
       or case_id in (select id from public.cases where maker_id = any(demo_ids));
    delete from public.cases where maker_id = any(demo_ids);
    delete from auth.identities where user_id = any(demo_ids);
    delete from auth.users where id = any(demo_ids);
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Demo user IDs
-- ---------------------------------------------------------------------------
-- makers:  a1111111-1111-4111-a111-11111111110[1-5]
-- partners: a2222222-2222-4222-a222-22222222220[1-2]

-- ---------------------------------------------------------------------------
-- Helpers: insert auth user + identity
-- ---------------------------------------------------------------------------
create or replace function public._demo_upsert_user(
  p_id uuid,
  p_email text,
  p_password text,
  p_meta jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
  ) values (
    '00000000-0000-0000-0000-000000000000',
    p_id,
    'authenticated',
    'authenticated',
    p_email,
    crypt(p_password, gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    p_meta,
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
  on conflict (id) do update set
    email = excluded.email,
    encrypted_password = excluded.encrypted_password,
    raw_user_meta_data = excluded.raw_user_meta_data,
    email_confirmed_at = now(),
    updated_at = now();

  delete from auth.identities where user_id = p_id and provider = 'email';

  insert into auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  ) values (
    gen_random_uuid(),
    p_id,
    jsonb_build_object('sub', p_id::text, 'email', p_email),
    'email',
    p_id::text,
    now(),
    now(),
    now()
  );

  insert into public.profiles (
    id, role, company_name, contact_name, email,
    industry, sales_channel, area, strength
  ) values (
    p_id,
    coalesce(p_meta->>'role', 'maker'),
    coalesce(p_meta->>'company_name', 'Demo'),
    coalesce(p_meta->>'contact_name', 'Demo User'),
    p_email,
    p_meta->>'industry',
    p_meta->>'sales_channel',
    p_meta->>'area',
    p_meta->>'strength'
  )
  on conflict (id) do update set
    role = excluded.role,
    company_name = excluded.company_name,
    contact_name = excluded.contact_name,
    email = excluded.email;
end;
$$;

select public._demo_upsert_user(
  'a1111111-1111-4111-a111-111111111101'::uuid,
  'maker1@demo.brandbridge.app',
  'DemoPass123!',
  jsonb_build_object(
    'role', 'maker',
    'company_name', '青葉コスメティクス株式会社',
    'contact_name', '青葉 美穂',
    'industry', '化粧品'
  )
);

select public._demo_upsert_user(
  'a1111111-1111-4111-a111-111111111102'::uuid,
  'maker2@demo.brandbridge.app',
  'DemoPass123!',
  jsonb_build_object(
    'role', 'maker',
    'company_name', '北の恵みフーズ',
    'contact_name', '佐藤 健',
    'industry', '食品'
  )
);

select public._demo_upsert_user(
  'a1111111-1111-4111-a111-111111111103'::uuid,
  'maker3@demo.brandbridge.app',
  'DemoPass123!',
  jsonb_build_object(
    'role', 'maker',
    'company_name', 'テックウェア合同会社',
    'contact_name', '林 翔',
    'industry', '家電'
  )
);

select public._demo_upsert_user(
  'a1111111-1111-4111-a111-111111111104'::uuid,
  'maker4@demo.brandbridge.app',
  'DemoPass123!',
  jsonb_build_object(
    'role', 'maker',
    'company_name', '暮らし工房アトリエ',
    'contact_name', '中村 咲',
    'industry', '雑貨'
  )
);

select public._demo_upsert_user(
  'a1111111-1111-4111-a111-111111111105'::uuid,
  'maker5@demo.brandbridge.app',
  'DemoPass123!',
  jsonb_build_object(
    'role', 'maker',
    'company_name', '産業パーツジャパン',
    'contact_name', '高橋 誠',
    'industry', '製造'
  )
);

-- Fictional dummy-catalog makers (one per DUM product)
select public._demo_upsert_user(
  'a1111111-1111-4111-a111-111111111121'::uuid,
  'maker-nordic@demo.brandbridge.app',
  'DemoPass123!',
  jsonb_build_object(
    'role', 'maker',
    'company_name', 'ノルディックリビング合同会社',
    'contact_name', 'Erik Lindqvist',
    'industry', 'ホーム・インテリア'
  )
);
select public._demo_upsert_user(
  'a1111111-1111-4111-a111-111111111122'::uuid,
  'maker-urban@demo.brandbridge.app',
  'DemoPass123!',
  jsonb_build_object(
    'role', 'maker',
    'company_name', 'アーバンギアラボ株式会社',
    'contact_name', 'Casey Morgan',
    'industry', 'バッグ・旅行用品'
  )
);
select public._demo_upsert_user(
  'a1111111-1111-4111-a111-111111111123'::uuid,
  'maker-ceramic@demo.brandbridge.app',
  'DemoPass123!',
  jsonb_build_object(
    'role', 'maker',
    'company_name', 'ピュアホーム陶芸株式会社',
    'contact_name', '高橋 美咲',
    'industry', 'キッチン・陶磁器'
  )
);
select public._demo_upsert_user(
  'a1111111-1111-4111-a111-111111111124'::uuid,
  'maker-fitness@demo.brandbridge.app',
  'DemoPass123!',
  jsonb_build_object(
    'role', 'maker',
    'company_name', 'フィットデイリー工業株式会社',
    'contact_name', 'Jordan Lee',
    'industry', 'スポーツ用品'
  )
);
select public._demo_upsert_user(
  'a1111111-1111-4111-a111-111111111125'::uuid,
  'maker-bamboo@demo.brandbridge.app',
  'DemoPass123!',
  jsonb_build_object(
    'role', 'maker',
    'company_name', 'バンブーデスク工房株式会社',
    'contact_name', '陳 雅婷',
    'industry', 'ライフスタイル・収納'
  )
);

update public.profiles set
  headquarters = 'デンマーク・コペンハーゲン', founded_year = 2016,
  description = '北欧デザインの照明・家具を企画製造する架空メーカー。日本・EU向け卸を展開。',
  employee_range = '1-10'
where id = 'a1111111-1111-4111-a111-111111111121';
update public.profiles set
  headquarters = 'アメリカ・ポートランド', founded_year = 2019,
  description = '都市通勤向けバッグを設計する架空メーカー。防水素材とガジェット収納が強み。',
  employee_range = '1-10'
where id = 'a1111111-1111-4111-a111-111111111122';
update public.profiles set
  headquarters = '日本・岐阜県多治見市', founded_year = 2012,
  description = '美濃焼産地の架空窯元。日常使いの磁器マグとギフト向け器を製造。',
  employee_range = '1-10'
where id = 'a1111111-1111-4111-a111-111111111123';
update public.profiles set
  headquarters = '韓国・ソウル', founded_year = 2018,
  description = '真空断熱ボトルとフィットネスギアを手がける架空メーカー。ジム卸が主力。',
  employee_range = '1-10'
where id = 'a1111111-1111-4111-a111-111111111124';
update public.profiles set
  headquarters = '台湾・台中', founded_year = 2015,
  description = '天然竹のデスク収納を製造する架空工房。文具セレクト向け卸が中心。',
  employee_range = '1-10'
where id = 'a1111111-1111-4111-a111-111111111125';

select public._demo_upsert_user(
  'a2222222-2222-4222-a222-222222222201'::uuid,
  'partner1@demo.brandbridge.app',
  'DemoPass123!',
  jsonb_build_object(
    'role', 'partner',
    'company_name', 'リテールブリッジ商事',
    'contact_name', '鈴木 陽子',
    'sales_channel', '量販・専門店',
    'area', '関東',
    'strength', '化粧品・健康食品の棚入れ'
  )
);

select public._demo_upsert_user(
  'a2222222-2222-4222-a222-222222222202'::uuid,
  'partner2@demo.brandbridge.app',
  'DemoPass123!',
  jsonb_build_object(
    'role', 'partner',
    'company_name', 'グローバルシェルフ合同会社',
    'contact_name', 'Chen Wei',
    'sales_channel', '越境EC・卸',
    'area', '全国・ASEAN',
    'strength', '海外展開とオンライン販売'
  )
);

-- Enrich profiles (trigger may have created minimal rows)
update public.profiles set
  company_name = '青葉コスメティクス株式会社',
  contact_name = '青葉 美穂',
  industry = '化粧品',
  product_overview = '自然由来成分にこだわったスキンケアブランドを展開。',
  description = '国内製造のクリーンビューティ製品を中心に、専門店・EC向けの販路開拓を進めています。',
  headquarters = '東京都渋谷区',
  founded_year = 2014,
  employee_range = '11-50',
  website_url = 'https://example.com/aoba-cosmetics'
where id = 'a1111111-1111-4111-a111-111111111101';

update public.profiles set
  company_name = '北の恵みフーズ',
  contact_name = '佐藤 健',
  industry = '食品・飲料',
  product_overview = '北海道産原料の加工食品・飲料を製造。',
  description = 'スーパー・専門店・ギフト向けに、産地ストーリー付きの食品ブランドを展開しています。',
  headquarters = '北海道札幌市',
  founded_year = 2008,
  employee_range = '51-200'
where id = 'a1111111-1111-4111-a111-111111111102';

update public.profiles set
  company_name = 'テックウェア合同会社',
  contact_name = '林 翔',
  industry = '家電・ガジェット',
  product_overview = 'スマートホーム機器とモバイル周辺機器を企画・販売。',
  description = '家電量販・EC・法人向けに、使いやすさ重視のガジェットを提供しています。',
  headquarters = '大阪府大阪市',
  founded_year = 2017,
  employee_range = '11-50'
where id = 'a1111111-1111-4111-a111-111111111103';

update public.profiles set
  company_name = '暮らし工房アトリエ',
  contact_name = '中村 咲',
  industry = '雑貨・ライフスタイル',
  product_overview = '日用品・ステーショナリー・アパレル小物を自社ブランド化。',
  description = 'セレクトショップやオンライン向けに、デザイン性の高いライフスタイル雑貨を展開。',
  headquarters = '京都府京都市',
  founded_year = 2012,
  employee_range = '1-10'
where id = 'a1111111-1111-4111-a111-111111111104';

update public.profiles set
  company_name = '産業パーツジャパン',
  contact_name = '高橋 誠',
  industry = '製造・産業',
  product_overview = '産業用部品・消耗品の開発製造。',
  description = 'BtoB向けに安定供給とカスタム対応を強みとする部品提供企業です。',
  headquarters = '愛知県名古屋市',
  founded_year = 1999,
  employee_range = '51-200'
where id = 'a1111111-1111-4111-a111-111111111105';

update public.profiles set
  company_name = 'リテールブリッジ商事',
  contact_name = '鈴木 陽子',
  sales_channel = '量販・専門店',
  area = '関東',
  strength = '化粧品・健康食品の棚入れと売場提案',
  description = '首都圏の専門店・ドラッグストア向けに新規商材の導入支援を行っています。',
  headquarters = '東京都中央区',
  founded_year = 2010,
  employee_range = '11-50'
where id = 'a2222222-2222-4222-a222-222222222201';

update public.profiles set
  company_name = 'グローバルシェルフ合同会社',
  contact_name = 'Chen Wei',
  sales_channel = '越境EC・卸',
  area = '全国・ASEAN',
  strength = '海外展開とオンライン販売',
  description = '日本ブランドのASEAN・北米向け販売ネットワークを保有しています。',
  headquarters = '東京都港区',
  founded_year = 2018,
  employee_range = '1-10'
where id = 'a2222222-2222-4222-a222-222222222202';

-- ---------------------------------------------------------------------------
-- 25 sample cases (approved / open) — includes 5 fictional dummy catalog SKUs
-- ---------------------------------------------------------------------------
insert into public.cases (
  id, maker_id, title, category, region, summary, description,
  ideal_partner, offer, status, review_status,
  product_name, product_features, price_band, sales_format, sales_terms,
  min_order, is_exclusive, target_country, partner_channels, partner_requirements,
  created_at, updated_at, reviewed_at
) values
(
  'c0000001-0000-4000-8000-000000000001',
  'a1111111-1111-4111-a111-111111111101',
  'クリーンビューティ化粧水の全国展開パートナー募集',
  '美容・コスメ', '全国',
  '敏感肌向け化粧水。専門店・ECでの取扱いパートナーを募集します。',
  '植物由来成分を高配合した化粧水シリーズです。国内GMP工場で製造し、リピート率の高さが特長です。店頭什器と販促キットを用意しています。',
  'スキンケアに強い専門店、ドラッグストア、ビューティEC運営会社',
  '初回ロット割引、販促物無償提供、研修サポート',
  'open', 'approved',
  'アオバモイスチャーローション',
  '無香料・アルコールフリー、敏感肌テスト済',
  '2,800〜4,200円（税別）',
  'wholesale', '掛け率 45〜55%、返品条件は要協議',
  'ケース 12本〜', false, 'JP',
  '専門店 / ドラッグストア / EC',
  '化粧品販売実績、またはビューティ領域の販売チャネル保有',
  now() - interval '2 days', now() - interval '2 days', now() - interval '2 days'
),
(
  'c0000002-0000-4000-8000-000000000002',
  'a1111111-1111-4111-a111-111111111101',
  'ASEAN向けリップバームの代理店募集',
  '美容・コスメ', '全国・海外',
  '保湿リップバームの海外代理店を募集。英語パッケージ対応済み。',
  '高温多湿向け処方のリップバーム。ハラル対応原料を使用し、ASEAN市場向けに設計しています。',
  'ASEANに販路を持つ卸・代理店、越境EC事業者',
  'エリア独占相談可、マーケティング費用の一部負担',
  'open', 'approved',
  'アオバリップバーム SPF',
  'SPF配合、携帯サイズ、英語/タイ語パッケージ',
  '980〜1,480円（税別）',
  'agency', '代理店契約、最低年間発注あり',
  '段ボール 1箱〜', true, 'ASEAN',
  '卸 / 現地小売 / 越境EC',
  '現地法人または輸入実績',
  now() - interval '5 days', now() - interval '5 days', now() - interval '5 days'
),
(
  'c0000003-0000-4000-8000-000000000003',
  'a1111111-1111-4111-a111-111111111101',
  'メンズスキンケア3点セットの卸パートナー',
  '美容・コスメ', '関東',
  '洗顔・化粧水・乳液のメンズ向けセット。バラエティショップ向け。',
  'シンプル設計のメンズスキンケア。ギフト需要にも対応できる化粧箱入りセットです。',
  'バラエティストア、メンズ向けEC、ホテルアメニティ調達',
  'サンプル無償、季節キャンペーン連動',
  'open', 'approved',
  'アオバメンズトライアルセット',
  '3ステップ完結、トラベルサイズあり',
  '3,980円セット（税別）',
  'wholesale', '掛け率 50%',
  '20セット〜', false, 'JP',
  'バラエティ / EC',
  '美容・日用品の取扱実績',
  now() - interval '8 days', now() - interval '8 days', now() - interval '8 days'
),
(
  'c0000004-0000-4000-8000-000000000004',
  'a1111111-1111-4111-a111-111111111102',
  '北海道産スープカレーレトルトの量販導入',
  '食品・飲料', '全国',
  'ご当地レトルトの定番化を目指すパートナー募集。催事実績あり。',
  '札幌発のスープカレーを家庭用レトルト化。中辛・甘口の2SKUからスタートできます。',
  'スーパー、生協、百貨店食品売り場、ギフト卸',
  '催事スタッフ派遣、試食サンプル提供',
  'open', 'approved',
  '北の恵みスープカレー',
  '北海道産野菜使用、常温1年保存',
  '680〜780円（税別）',
  'wholesale', '掛け率 40〜48%',
  'ケース 24個〜', false, 'JP',
  '量販 / ギフト卸',
  '食品衛生に関する取扱体制',
  now() - interval '1 day', now() - interval '1 day', now() - interval '1 day'
),
(
  'c0000005-0000-4000-8000-000000000005',
  'a1111111-1111-4111-a111-111111111102',
  'クラフトジンジャーシロップのカフェ卸',
  '食品・飲料', '関西',
  '希釈タイプのクラフトシロップ。カフェ・ベーカリー向け卸を募集。',
  '無添加製法のジンジャーシロップ。炭酸割り・ホットドリンク提案資料付き。',
  'カフェチェーン、ベーカリー、ホテルラウンジ',
  'メニュー提案サポート、グラス貸出',
  'open', 'approved',
  '北の恵みジンジャーシロップ',
  '希釈約20杯分、ガラス瓶200ml',
  '1,200円（税別）',
  'wholesale', '月次発注、送料別',
  '12本〜', false, 'JP',
  'カフェ / 飲食卸',
  '飲食店向け卸の実績歓迎',
  now() - interval '3 days', now() - interval '3 days', now() - interval '3 days'
),
(
  'c0000006-0000-4000-8000-000000000006',
  'a1111111-1111-4111-a111-111111111102',
  'オーガニック紅茶ギフト缶の通販パートナー',
  '食品・飲料', '全国',
  'ギフト需要向けの紅茶缶。季節限定フレーバーあり。',
  '産地直輸入茶葉をブレンドしたプレミアム紅茶。母の日・お歳暮向けセット展開が可能です。',
  '通販事業者、カタログギフト、百貨店通販',
  '季節限定フレーバーの先行案内、同梱チラシ対応',
  'open', 'approved',
  '北の恵みティーギフト',
  '缶入り・ティーバッグ・リーフ選択可',
  '2,400〜4,800円（税別）',
  'consignment', '委託販売、売れ残り協議',
  '30缶〜', false, 'JP',
  '通販 / ギフト',
  'ギフト商材の販売経験',
  now() - interval '10 days', now() - interval '10 days', now() - interval '10 days'
),
(
  'c0000007-0000-4000-8000-000000000007',
  'a1111111-1111-4111-a111-111111111102',
  'プロテインバーOEM供給パートナー募集',
  '健康・サプリ', '全国',
  '自社工場でのプロテインバーOEM。小ロット対応可。',
  '高タンパク・低糖質処方のバーをOEM供給。プライベートブランド立ち上げ支援も可能です。',
  'フィットネスブランド、パーソナルジム、健康食品EC',
  '処方相談無料、試作2回まで無償',
  'open', 'approved',
  'プロテインバーOEM',
  '1本あたりタンパク15g、アレルギー表示対応',
  '要見積（ロットによる）',
  'oem', 'OEM契約、秘密保持必須',
  '3,000本〜', false, 'JP',
  'PB / EC / ジム',
  '食品表示・品質管理体制',
  now() - interval '4 days', now() - interval '4 days', now() - interval '4 days'
),
(
  'c0000008-0000-4000-8000-000000000008',
  'a1111111-1111-4111-a111-111111111101',
  '植物性サプリメントの専門店展開',
  '健康・サプリ', '関東',
  '植物由来のビタミンサプリ。自然派店舗での取扱いを募集。',
  '合成着色料不使用のサプリメント。カウンセリング用資料と定期購入導線を用意しています。',
  '自然派ストア、薬局、サブスクEC',
  '定期便向け卸価格、教育動画提供',
  'open', 'approved',
  'アオバプラントビタミン',
  '60粒入り、ベジカプセル',
  '3,200円（税別）',
  'wholesale', '掛け率 50%',
  'ケース 24本〜', false, 'JP',
  '自然派 / 薬局 / EC',
  '健康食品の販売資格・実績',
  now() - interval '6 days', now() - interval '6 days', now() - interval '6 days'
),
(
  'c0000009-0000-4000-8000-000000000009',
  'a1111111-1111-4111-a111-111111111104',
  'オーガニックコットンアパレルのセレクト導入',
  'ファッション', '関西',
  'ベビー・キッズ向けオーガニックウェア。セレクトショップ募集。',
  '肌にやさしいオーガニックコットンの子ども服。サイズ展開とギフトラッピング対応あり。',
  'ベビーセレクト、マタニティショップ、百貨店子供服',
  'VMD提案、初回返品条件優遇',
  'open', 'approved',
  'アトリエコットンキッズ',
  'GOTS認証生地、日本縫製',
  '2,800〜6,800円（税別）',
  'wholesale', '掛け率 45%',
  'SKUあたり 6枚〜', false, 'JP',
  'セレクト / 百貨店',
  '子ども服の取扱経験歓迎',
  now() - interval '7 days', now() - interval '7 days', now() - interval '7 days'
),
(
  'c0000010-0000-4000-8000-000000000010',
  'a1111111-1111-4111-a111-111111111104',
  'ワークウェア向け機能ソックスの代理店',
  'ファッション', '全国',
  '抗菌・消臭の機能ソックス。法人・ユニフォーム卸向け。',
  '立ち仕事向けクッション設計の機能ソックス。業種別の提案資料を用意しています。',
  'ユニフォーム卸、ワークウェア専門店、法人購買',
  '大口割引、名入れ対応相談可',
  'open', 'approved',
  'アトリエワークソックス',
  '抗菌消臭、サポート編み',
  '1,480円（税別）',
  'agency', '代理店マージン設定可',
  '100足〜', true, 'JP',
  'ユニフォーム / 法人',
  '法人営業チャネル保有',
  now() - interval '12 days', now() - interval '12 days', now() - interval '12 days'
),
(
  'c0000011-0000-4000-8000-000000000011',
  'a1111111-1111-4111-a111-111111111103',
  'スマートLED電球の家電量販パートナー',
  '家電・ガジェット', '全国',
  'アプリ連携のスマート電球。量販・ホームセンター向け。',
  '音声アシスタント対応のLED電球。設置が簡単なスターターキットも用意しています。',
  '家電量販、ホームセンター、スマートホーム専門店',
  'デモ機貸出、店員向け研修',
  'open', 'approved',
  'テックウェア GlowBulb',
  'Wi-Fi接続、調光・調色、Alexa対応',
  '2,980〜4,980円（税別）',
  'wholesale', '掛け率 55%',
  'カートン 20個〜', false, 'JP',
  '量販 / HC',
  '家電カテゴリの棚確保が可能であること',
  now() - interval '2 days', now() - interval '2 days', now() - interval '2 days'
),
(
  'c0000012-0000-4000-8000-000000000012',
  'a1111111-1111-4111-a111-111111111103',
  'ノートPCスタンドのEC専売パートナー',
  '家電・ガジェット', '全国',
  'アルミ製ノートPCスタンド。Amazon/楽天強化パートナー募集。',
  '軽量・折りたたみ式のノートPCスタンド。レビュー獲得用の同梱施策も共有します。',
  'ガジェット系ECセラー、法人ノベルティ卸',
  '広告費一部負担（条件あり）、在庫預かり相談可',
  'open', 'approved',
  'テックウェア DeskLift',
  '高さ調節、ケーブル穴付き',
  '4,980円（税別）',
  'ec', 'EC販売契約、MAP価格あり',
  '50個〜', false, 'JP',
  'Amazon / 楽天 / 自社EC',
  '月商実績または広告運用経験',
  now() - interval '9 days', now() - interval '9 days', now() - interval '9 days'
),
(
  'c0000013-0000-4000-8000-000000000013',
  'a1111111-1111-4111-a111-111111111103',
  'ウェアラブル体温計の医療周辺販路開拓',
  '家電・ガジェット', '関東',
  '連続測定可能なウェアラブル体温計。薬局・クリニック向け。',
  '子育て世帯向けのウェアラブル体温計。アプリ連携で記録を共有できます。',
  '薬局チェーン、ベビー用品店、クリニック向け卸',
  '医療機器販売関連の資料提供、展示会同行',
  'open', 'approved',
  'テックウェア TempBand',
  '連続測定、アプリ通知、充電式',
  '8,800円（税別）',
  'wholesale', '掛け率 48%',
  '20台〜', false, 'JP',
  '薬局 / ベビー',
  '医療機器または健康機器の取扱経験',
  now() - interval '14 days', now() - interval '14 days', now() - interval '14 days'
),
(
  'c0000014-0000-4000-8000-000000000014',
  'a1111111-1111-4111-a111-111111111103',
  '北米向けモバイルバッテリーの卸パートナー',
  '家電・ガジェット', '全国・海外',
  'PSE/UL対応モバイルバッテリー。北米卸を募集。',
  '大容量かつ機内持込対応のモバイルバッテリー。英語パッケージ・取説付き。',
  '北米向け卸、旅行用品EC、航空関連ショップ',
  'コンテナ単位の価格優遇、現地倉庫連携相談',
  'open', 'approved',
  'テックウェア PowerGo 20K',
  '20000mAh、PD対応、UL認証',
  'USD 28〜35（FOB相談）',
  'wholesale', 'FOB / DDP 要協議',
  '500個〜', true, 'US',
  '卸 / 旅行用品',
  '輸入・通関体制',
  now() - interval '11 days', now() - interval '11 days', now() - interval '11 days'
),
(
  'c0000015-0000-4000-8000-000000000015',
  'a1111111-1111-4111-a111-111111111104',
  '和紙ステーショナリーのセレクトショップ展開',
  '雑貨・ライフスタイル', '関西',
  '京都産和紙を使ったノート・便箋。セレクト導入を募集。',
  '伝統工芸と現代デザインを融合したステーショナリー。観光土産需要にも対応。',
  'セレクトショップ、ミュージアムショップ、旅館売店',
  '什器貸出、季節柄の定期入荷',
  'open', 'approved',
  'アトリエ和紙ノート',
  '手触り重視、箔押しオプション',
  '980〜2,400円（税別）',
  'consignment', '委託販売、月次精算',
  '30冊〜', false, 'JP',
  'セレクト / 観光',
  '雑貨カテゴリの売場あり',
  now() - interval '3 days', now() - interval '3 days', now() - interval '3 days'
),
(
  'c0000016-0000-4000-8000-000000000016',
  'a1111111-1111-4111-a111-111111111104',
  'アロマキャンドルのライフスタイル店舗募集',
  '雑貨・ライフスタイル', '関東',
  '国産ソイワックスのアロマキャンドル。インテリアショップ向け。',
  '植物由来ワックスと精油ブレンド。香りサンプルキットを用意しています。',
  'インテリアショップ、ホテルアメニティ、ギフト店',
  '香りテスター提供、ディスプレイ提案',
  'open', 'approved',
  'アトリエソイキャンドル',
  '燃焼約30時間、ガラス容器',
  '2,200円（税別）',
  'wholesale', '掛け率 45%',
  'ケース 12個〜', false, 'JP',
  'インテリア / ギフト',
  '香り・インテリア商材の取扱',
  now() - interval '15 days', now() - interval '15 days', now() - interval '15 days'
),
(
  'c0000017-0000-4000-8000-000000000017',
  'a1111111-1111-4111-a111-111111111104',
  'ミニマルキッチンツールの欧州向け代理店',
  '雑貨・ライフスタイル', '全国・海外',
  'ステンレス製ミニマルキッチンツール。EU市場の代理店募集。',
  'シンプルで長く使えるキッチンツールセット。CEマーク対応済み。',
  '欧州のライフスタイル卸、デザイン雑貨バイヤー',
  '展示会サンプル支給、エリア独占相談',
  'open', 'approved',
  'アトリエキッチンミニマル',
  '食洗機対応、ギフトボックス',
  'EUR 24〜40',
  'agency', '代理店契約',
  '100セット〜', true, 'EU',
  '欧州卸 / デザイン店',
  'EU域内の販売実績',
  now() - interval '18 days', now() - interval '18 days', now() - interval '18 days'
),
(
  'c0000018-0000-4000-8000-000000000018',
  'a1111111-1111-4111-a111-111111111105',
  '産業用フィルター消耗品の販売パートナー',
  '製造・産業', '中部',
  '工作機械向けフィルター消耗品。メンテ業者・商社を募集。',
  '互換性と耐久性に優れたフィルター。型番対照表と交換ガイドを提供します。',
  '産業資材商社、設備メンテ会社、FA機器ディーラー',
  '在庫預託相談、技術資料一式',
  'open', 'approved',
  'IPJ FineFilter Series',
  '主要ブランド互換、納期短縮',
  '要見積',
  'wholesale', '月次請求、掛売相談',
  'ロット応相談', false, 'JP',
  '産業商社 / メンテ',
  '製造業顧客基盤',
  now() - interval '4 days', now() - interval '4 days', now() - interval '4 days'
),
(
  'c0000019-0000-4000-8000-000000000019',
  'a1111111-1111-4111-a111-111111111105',
  '工場向け安全手袋の全国卸パートナー',
  '製造・産業', '全国',
  '耐切創レベル対応の安全手袋。安全用品卸を募集。',
  '軽量でありながら高い耐切創性。サイズ展開と色分け管理に対応しています。',
  '安全用品卸、作業服専門店、オンラインBtoB',
  'カタログ掲載用データ、展示サンプル',
  'open', 'approved',
  'IPJ CutGuard Glove',
  'EN規格相当、タッチパネル対応',
  '480〜980円（税別）',
  'wholesale', '掛け率 40%',
  'ダース単位', false, 'JP',
  '安全用品 / 作業服',
  '法人向け販売チャネル',
  now() - interval '13 days', now() - interval '13 days', now() - interval '13 days'
),
(
  'c0000020-0000-4000-8000-000000000020',
  'a1111111-1111-4111-a111-111111111105',
  'カスタム金属部品の海外調達窓口パートナー',
  '製造・産業', '全国・海外',
  '小ロット金属加工の海外販売窓口を募集。図面対応可。',
  '試作〜中量産までの金属部品。英語での見積・納期回答フローを整備済みです。',
  '海外機械ブランドの日本窓口、輸出商社、調達代行',
  '共同営業、図面レビュー同席',
  'open', 'approved',
  'IPJ Custom Metal Parts',
  'CNC / 板金、ISO9001工場',
  '図面見積',
  'other', '案件単位の手数料または卸',
  '案件ごと', false, 'GLOBAL',
  '輸出商社 / 調達',
  '英語対応、製造業ネットワーク',
  now() - interval '20 days', now() - interval '20 days', now() - interval '20 days'
),
(
  'c0000021-0000-4000-8000-000000000021',
  'a1111111-1111-4111-a111-111111111121',
  'Nordic Wood Lampの卸パートナー募集',
  'ホーム・インテリア', '全国・海外',
  '天然木ベースとファブリックシェードの北欧テーブルランプ。インテリア卸向け。',
  '天然木とファブリックシェードを組み合わせた北欧スタイルのテーブルランプ。リビングや寝室、カフェ空間にも調和するシンプルなデザインです。オーク材の木目を生かしたベースと、柔らかい拡散光のシェードで落ち着いた空間演出ができます。',
  'インテリアショップ、ライフスタイルセレクト、カフェ備品調達',
  '初回ロット割引、売り場什器提案、販促写真データ一式',
  'open', 'approved',
  'Nordic Wood Lamp',
  'オーク材ベース／リネン混ファブリックシェード／E26口金／高さ42cm／LED電球付属',
  '3,800〜5,200円（税別）',
  'wholesale', '掛率45〜55%、請求書払い（Net 30、与信審査後）',
  '24個〜', true, 'GLOBAL',
  'インテリア / セレクト / カフェ・ホテル',
  'ライフスタイル商材の取扱実績、または店舗・EC販路の保有',
  now() - interval '1 day', now() - interval '1 day', now() - interval '1 day'
),
(
  'c0000022-0000-4000-8000-000000000022',
  'a1111111-1111-4111-a111-111111111122',
  'Urban Travel Backpackの販売パートナー募集',
  'バッグ', '全国・海外',
  'ノートPC収納・防水素材・USBポート付き多機能バックパック。通勤・旅行向け。',
  'ノートPC収納、防水素材、USBポートを備えた多機能バックパック。通勤・通学・旅行まで幅広く対応します。背面クッションと盗難防止ポケットで都市移動の安心感を高めています。',
  'バッグ専門店、旅行用品店、ECモール出品者',
  'サンプル貸出、カタログデータ提供、店頭用ディスプレイ案',
  'open', 'approved',
  'Urban Travel Backpack',
  '15インチPCスリーブ／撥水ナイロン／USB充電ポート／容量28L／重量約980g',
  '4,200〜6,800円（税別）',
  'wholesale', '掛率40〜50%、L/CまたはT/T（条件応相談）',
  '12個〜', false, 'GLOBAL',
  'バッグ専門 / 旅行 / EC',
  'バッグまたはトラベル商材の販売実績',
  now() - interval '1 day', now() - interval '1 day', now() - interval '1 day'
),
(
  'c0000023-0000-4000-8000-000000000023',
  'a1111111-1111-4111-a111-111111111123',
  'Pure Ceramic Mugの卸・ギフト卸パートナー募集',
  'キッチン', '全国',
  'ミニマルデザインのプレミアム磁器マグ。日常使い・ギフト向け。',
  'シンプルで高級感のあるセラミックマグ。日常使いからギフトまで幅広く利用できます。美濃焼の技術を活かした均一な白磁と、持ちやすいハンドル形状が特長です。',
  'キッチン雑貨店、ギフト卸、カフェ・ホテル備品',
  'ギフト箱対応、季節キャンペーン連動、売り場写真提供',
  'open', 'approved',
  'Pure Ceramic Mug',
  '磁器／電子レンジ・食洗機対応／容量320ml／ギフト箱対応可',
  '980〜1,480円（税別）',
  'wholesale', '掛率45%、月末締め翌月末払い（国内与信後）',
  '48個〜', false, 'JP',
  'キッチン雑貨 / ギフト / カフェ',
  '雑貨またはギフト商材の取扱経験',
  now() - interval '1 day', now() - interval '1 day', now() - interval '1 day'
),
(
  'c0000024-0000-4000-8000-000000000024',
  'a1111111-1111-4111-a111-111111111124',
  'Smart Fitness Bottleのスポーツ卸パートナー募集',
  'スポーツ', '全国・海外',
  '真空断熱のスポーツボトル。ジム・アウトドア向け保温・保冷。',
  '真空断熱構造を採用したスポーツボトル。長時間保温・保冷が可能でアウトドアやジムに最適です。漏れ防止キャップとワンハンド開閉でトレーニング中も扱いやすい設計です。',
  'スポーツ用品店、フィットネスジム、アウトドア専門店',
  '店頭什器提案、初回ロット割引、試飲イベント用貸出ボトル',
  'open', 'approved',
  'Smart Fitness Bottle',
  '真空断熱ステンレス／500ml／保温6時間・保冷12時間目安／漏れ防止キャップ',
  '2,400〜3,200円（税別）',
  'wholesale', '掛率45〜52%、T/T（船積み前残金）',
  '24個〜', true, 'GLOBAL',
  'スポーツ / ジム / アウトドア',
  'スポーツ・アウトドア商材の販売実績歓迎',
  now() - interval '1 day', now() - interval '1 day', now() - interval '1 day'
),
(
  'c0000025-0000-4000-8000-000000000025',
  'a1111111-1111-4111-a111-111111111125',
  'Eco Bamboo Organizerのライフスタイル卸パートナー募集',
  'ホーム・収納', '全国',
  '天然竹のデスクオーガナイザー。文具・小物をすっきり収納。',
  '天然竹素材を使用したデスクオーガナイザー。文房具や小物をすっきり収納できます。多区画トレーでペン・ふせん・ケーブル類を分けて置け、在宅ワーク環境の整理に適しています。',
  '文具セレクト、ライフスタイルショップ、オフィサプライ',
  '売り場提案資料、同梱チラシ対応、ノベルティ見積対応',
  'open', 'approved',
  'Eco Bamboo Organizer',
  '天然竹／多区画トレー／W28×D12×H8cm／表面クリア塗装',
  '1,800〜2,600円（税別）',
  'wholesale', '掛率48%、請求書払い（Net 30）またはT/T',
  '20個〜', false, 'JP',
  '文具 / ライフスタイル / オフィス',
  '文具・収納雑貨の取扱経験歓迎',
  now() - interval '1 day', now() - interval '1 day', now() - interval '1 day'
);

-- Demo SKUs (migration 028_cases_sku). Keep existing HYC-* if already set.
update public.cases set sku = 'HYC-0001' where id = 'c0000001-0000-4000-8000-000000000001' and (sku is null or btrim(sku) = '');
update public.cases set sku = 'AOB-0002' where id = 'c0000002-0000-4000-8000-000000000002' and (sku is null or btrim(sku) = '');
update public.cases set sku = 'AOB-0003' where id = 'c0000003-0000-4000-8000-000000000003' and (sku is null or btrim(sku) = '');
update public.cases set sku = 'HYC-0002' where id = 'c0000004-0000-4000-8000-000000000004' and (sku is null or btrim(sku) = '');
update public.cases set sku = 'KTM-0005' where id = 'c0000005-0000-4000-8000-000000000005' and (sku is null or btrim(sku) = '');
update public.cases set sku = 'KTM-0006' where id = 'c0000006-0000-4000-8000-000000000006' and (sku is null or btrim(sku) = '');
update public.cases set sku = 'HLH-0007' where id = 'c0000007-0000-4000-8000-000000000007' and (sku is null or btrim(sku) = '');
update public.cases set sku = 'AOB-0008' where id = 'c0000008-0000-4000-8000-000000000008' and (sku is null or btrim(sku) = '');
update public.cases set sku = 'ATL-0009' where id = 'c0000009-0000-4000-8000-000000000009' and (sku is null or btrim(sku) = '');
update public.cases set sku = 'ATL-0010' where id = 'c0000010-0000-4000-8000-000000000010' and (sku is null or btrim(sku) = '');
update public.cases set sku = 'HYC-0003' where id = 'c0000011-0000-4000-8000-000000000011' and (sku is null or btrim(sku) = '');
update public.cases set sku = 'TEC-0012' where id = 'c0000012-0000-4000-8000-000000000012' and (sku is null or btrim(sku) = '');
update public.cases set sku = 'TEC-0013' where id = 'c0000013-0000-4000-8000-000000000013' and (sku is null or btrim(sku) = '');
update public.cases set sku = 'TEC-0014' where id = 'c0000014-0000-4000-8000-000000000014' and (sku is null or btrim(sku) = '');
update public.cases set sku = 'ATL-0015' where id = 'c0000015-0000-4000-8000-000000000015' and (sku is null or btrim(sku) = '');
update public.cases set sku = 'ATL-0016' where id = 'c0000016-0000-4000-8000-000000000016' and (sku is null or btrim(sku) = '');
update public.cases set sku = 'ATL-0017' where id = 'c0000017-0000-4000-8000-000000000017' and (sku is null or btrim(sku) = '');
update public.cases set sku = 'IPJ-0018' where id = 'c0000018-0000-4000-8000-000000000018' and (sku is null or btrim(sku) = '');
update public.cases set sku = 'IPJ-0019' where id = 'c0000019-0000-4000-8000-000000000019' and (sku is null or btrim(sku) = '');
update public.cases set sku = 'IPJ-0020' where id = 'c0000020-0000-4000-8000-000000000020' and (sku is null or btrim(sku) = '');
update public.cases set sku = 'DUM-0021' where id = 'c0000021-0000-4000-8000-000000000021' and (sku is null or btrim(sku) = '');
update public.cases set sku = 'DUM-0022' where id = 'c0000022-0000-4000-8000-000000000022' and (sku is null or btrim(sku) = '');
update public.cases set sku = 'DUM-0023' where id = 'c0000023-0000-4000-8000-000000000023' and (sku is null or btrim(sku) = '');
update public.cases set sku = 'DUM-0024' where id = 'c0000024-0000-4000-8000-000000000024' and (sku is null or btrim(sku) = '');
update public.cases set sku = 'DUM-0025' where id = 'c0000025-0000-4000-8000-000000000025' and (sku is null or btrim(sku) = '');

-- Full enrichment + media for dummy catalog products (no blanks)
update public.cases set
  product_image_url = '/images/dummy/dum-0021-main.png',
  product_video_url = '/videos/showcase/demo-product-intro.mp4',
  brand_name = 'LUMINA NORD',
  brand_overview = 'LUMINA NORDは北欧の住空間をテーマにした照明ブランドです。素材感と控えめな造形を重視し、インテリアショップ向けに展開しています。',
  product_strengths = '天然木の質感と組み立て簡単設計。カフェ・ホテル客室への導入事例あり。梱包は破損率低減の二層構造。',
  sales_track_record = '北欧・日本のインテリアセレクト計38店舗で定番化。2025年は法人向け客室備品として1,200台納入。',
  market_availability_jp_us = '日本：販売可／米国：UL対応モデルは要確認（相談可）',
  lead_time = '標準4〜6週間（在庫品は2週間）',
  initial_order_terms = '初回はMOQ以上、前金30%・残金出荷前、検品サンプル1台無償添付',
  trademark_status = 'registered',
  exclusive_deal_option = 'conditional',
  ship_from = 'デンマーク（コペンハーゲン近郊倉庫）',
  currencies = 'JPY / EUR / USD',
  incoterms = 'FOB Copenhagen / CIF Tokyo（応相談）',
  certifications = 'CE、RoHS、PSE（日本向けアダプタ付属時）',
  support_languages = '日本語 / English / Dansk',
  suggested_retail_price = '¥12,800（税別）',
  sample_available = 'yes',
  test_sale_available = 'negotiable',
  wholesale_price = '4,200円（税別・24個ロット時）',
  lot_pricing = '24個: 4,200円 / 48個: 3,900円 / 96個: 3,800円（税別）',
  min_order_amount = '100,800円（税別）〜',
  price_conditions = 'fixed'
where id = 'c0000021-0000-4000-8000-000000000021';

update public.cases set
  product_image_url = '/images/dummy/dum-0022-main.png',
  product_video_url = '/videos/showcase/demo-product-intro.mp4',
  brand_name = 'TRAILPATH',
  brand_overview = 'TRAILPATHは都市と短距離旅行をつなぐバッグブランドです。機能性とミニマルな外観を両立したラインナップを展開しています。',
  product_strengths = 'ビジネスとトラベルの兼用設計。カラー3色展開で店頭VMDしやすい。英語取扱説明書同梱。',
  sales_track_record = '北米・日本のバッグ専門店およびECで累計18,000個販売。通勤向けセット販売の実績あり。',
  market_availability_jp_us = '日本：販売可／米国：販売可（英語パッケージ対応済）',
  lead_time = '標準5〜7週間（追加生産時）／在庫カラーは3週間',
  initial_order_terms = 'カラーミックス可、初回発注は前金40%、残金B/L後',
  trademark_status = 'registered',
  exclusive_deal_option = 'conditional',
  ship_from = 'アメリカ・オレゴン州（ポートランドDC）',
  currencies = 'JPY / USD',
  incoterms = 'FOB Portland / DDP Tokyo（応相談）',
  certifications = 'REACH準拠生地、アゾ染料フリー',
  support_languages = 'English / 日本語',
  suggested_retail_price = '¥14,800（税別）',
  sample_available = 'yes',
  test_sale_available = 'yes',
  wholesale_price = '5,400円（税別・12個ロット時）',
  lot_pricing = '12個: 5,400円 / 36個: 4,800円 / 72個: 4,200円（税別）',
  min_order_amount = '64,800円（税別）〜',
  price_conditions = 'fixed'
where id = 'c0000022-0000-4000-8000-000000000022';

update public.cases set
  product_image_url = '/images/dummy/dum-0023-main.png',
  product_video_url = '/videos/showcase/demo-product-intro.mp4',
  brand_name = 'PUREFORM',
  brand_overview = 'PUREFORMは日常のテーブルを整える磁器ブランドです。余計な装飾を排し、長く使える形と質感を追求しています。',
  product_strengths = '割れにくい厚み設計と安定した量産品質。季節ギフトセットへの組み込みが容易。',
  sales_track_record = '国内百貨店・ライフスタイルショップ計52店舗、およびカタログギフト2社で採用。',
  market_availability_jp_us = '日本：販売可／米国：FDA対応釉薬使用（輸出相談可）',
  lead_time = '標準3〜5週間',
  initial_order_terms = '初回は単色48個〜、混色は要相談、サンプル3個まで無償',
  trademark_status = 'pending',
  exclusive_deal_option = 'unavailable',
  ship_from = '日本・岐阜県（多治見倉庫）',
  currencies = 'JPY / USD',
  incoterms = 'EXW Tajimi / FOB Nagoya',
  certifications = '食品衛生法適合、鉛・カドミウム溶出試験済',
  support_languages = '日本語 / English',
  suggested_retail_price = '¥2,800（税別）',
  sample_available = 'yes',
  test_sale_available = 'negotiable',
  wholesale_price = '1,200円（税別・48個ロット時）',
  lot_pricing = '48個: 1,200円 / 96個: 1,080円 / 192個: 980円（税別）',
  min_order_amount = '57,600円（税別）〜',
  price_conditions = 'fixed'
where id = 'c0000023-0000-4000-8000-000000000023';

update public.cases set
  product_image_url = '/images/dummy/dum-0024-main.png',
  product_video_url = '/videos/showcase/demo-product-intro.mp4',
  brand_name = 'HYDROFIT',
  brand_overview = 'HYDROFITはトレーニングシーン向けハイドレーションブランドです。機能性と軽量感を両立したボトルを展開しています。',
  product_strengths = 'ジムロッカーに収まるスリム形状。粉体塗装の指紋がつきにくい仕上げ。カラー5色。',
  sales_track_record = '韓国・日本のフィットネスジム向け卸で累計42,000本。スポーツ専門チェーン3社に導入。',
  market_availability_jp_us = '日本：販売可／米国：FDA対応、販売可',
  lead_time = '標準4〜6週間',
  initial_order_terms = 'カラーあたり12個〜、合計MOQ24個、前金30%',
  trademark_status = 'registered',
  exclusive_deal_option = 'available',
  ship_from = '韓国・仁川（輸出倉庫）',
  currencies = 'JPY / USD / KRW',
  incoterms = 'FOB Incheon / CIF Osaka',
  certifications = 'FDA、LFGB、BPAフリー',
  support_languages = '한국어 / English / 日本語',
  suggested_retail_price = '¥5,980（税別）',
  sample_available = 'yes',
  test_sale_available = 'yes',
  wholesale_price = '2,800円（税別・24個ロット時）',
  lot_pricing = '24個: 2,800円 / 48個: 2,600円 / 120個: 2,400円（税別）',
  min_order_amount = '67,200円（税別）〜',
  price_conditions = 'fixed'
where id = 'c0000024-0000-4000-8000-000000000024';

update public.cases set
  product_image_url = '/images/dummy/dum-0025-main.png',
  product_video_url = '/videos/showcase/demo-product-intro.mp4',
  brand_name = 'BAMBOO NEST',
  brand_overview = 'BAMBOO NESTは竹素材のデスクまわり製品に特化したブランドです。サステナブル素材と実用的な収納設計を組み合わせています。',
  product_strengths = '軽量で組み立て不要。ギフト需要向けクラフト箱対応。FSC認証竹材を使用。',
  sales_track_record = '台湾・日本の文具セレクトとオフィサプライECで累計9,500個。企業ノベルティ案件あり。',
  market_availability_jp_us = '日本：販売可／米国：販売可（英語説明書同梱可）',
  lead_time = '標準3〜4週間',
  initial_order_terms = '初回20個〜、名入れは50個〜、サンプル2個まで無償',
  trademark_status = 'registered',
  exclusive_deal_option = 'conditional',
  ship_from = '台湾・台中',
  currencies = 'JPY / USD / TWD',
  incoterms = 'FOB Taichung / CIF Yokohama',
  certifications = 'FSC竹材、ホルムアルデヒド放散試験済',
  support_languages = '中文 / English / 日本語',
  suggested_retail_price = '¥4,200（税別）',
  sample_available = 'yes',
  test_sale_available = 'negotiable',
  wholesale_price = '2,200円（税別・20個ロット時）',
  lot_pricing = '20個: 2,200円 / 50個: 2,000円 / 100個: 1,800円（税別）',
  min_order_amount = '44,000円（税別）〜',
  price_conditions = 'fixed'
where id = 'c0000025-0000-4000-8000-000000000025';

delete from public.case_images where case_id in (
  'c0000021-0000-4000-8000-000000000021',
  'c0000022-0000-4000-8000-000000000022',
  'c0000023-0000-4000-8000-000000000023',
  'c0000024-0000-4000-8000-000000000024',
  'c0000025-0000-4000-8000-000000000025'
);
insert into public.case_images (case_id, image_url, storage_path, sort_order) values
  ('c0000021-0000-4000-8000-000000000021', '/images/dummy/dum-0021-main.png', null, 0),
  ('c0000022-0000-4000-8000-000000000022', '/images/dummy/dum-0022-main.png', null, 0),
  ('c0000023-0000-4000-8000-000000000023', '/images/dummy/dum-0023-main.png', null, 0),
  ('c0000024-0000-4000-8000-000000000024', '/images/dummy/dum-0024-main.png', null, 0),
  ('c0000025-0000-4000-8000-000000000025', '/images/dummy/dum-0025-main.png', null, 0);

-- Popularity: favorites from demo partners
insert into public.favorites (user_id, case_id, created_at) values
  ('a2222222-2222-4222-a222-222222222201', 'c0000001-0000-4000-8000-000000000001', now() - interval '1 day'),
  ('a2222222-2222-4222-a222-222222222202', 'c0000001-0000-4000-8000-000000000001', now() - interval '1 day'),
  ('a2222222-2222-4222-a222-222222222201', 'c0000004-0000-4000-8000-000000000004', now() - interval '12 hours'),
  ('a2222222-2222-4222-a222-222222222202', 'c0000004-0000-4000-8000-000000000004', now() - interval '10 hours'),
  ('a2222222-2222-4222-a222-222222222201', 'c0000011-0000-4000-8000-000000000011', now() - interval '8 hours'),
  ('a2222222-2222-4222-a222-222222222202', 'c0000002-0000-4000-8000-000000000002', now() - interval '2 days'),
  ('a2222222-2222-4222-a222-222222222201', 'c0000015-0000-4000-8000-000000000015', now() - interval '6 hours'),
  ('a2222222-2222-4222-a222-222222222202', 'c0000007-0000-4000-8000-000000000007', now() - interval '3 days')
on conflict do nothing;

drop function if exists public._demo_upsert_user(uuid, text, text, jsonb);
