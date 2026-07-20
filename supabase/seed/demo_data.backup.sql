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
-- 20 sample cases (approved / open)
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
);

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
