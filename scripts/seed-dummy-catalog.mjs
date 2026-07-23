/**
 * Upsert 5 fictional dummy catalog products + dedicated makers.
 * Usage: npm run seed:dummy-catalog
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  const text = readFileSync(filePath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile(resolve(process.cwd(), ".env.local"));
loadEnvFile(resolve(process.cwd(), ".env"));

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
/** Unplayable / black sample must not be attached — hide video section instead. */
const VIDEO = null;
const PASSWORD = "DemoPass123!";

function fail(message) {
  console.error(`[seed-dummy-catalog] ERROR: ${message}`);
  process.exit(1);
}

if (!url || url.includes("placeholder")) fail("NEXT_PUBLIC_SUPABASE_URL 未設定");
if (!serviceKey || serviceKey.includes("placeholder")) {
  fail("SUPABASE_SERVICE_ROLE_KEY 未設定");
}

const MAKERS = [
  {
    id: "a1111111-1111-4111-a111-111111111121",
    email: "maker-nordic@demo.brandbridge.app",
    company_name: "ノルディックリビング合同会社",
    contact_name: "Erik Lindqvist",
    industry: "ホーム・インテリア",
    headquarters: "デンマーク・コペンハーゲン",
    founded_year: 2016,
    description:
      "北欧デザインの照明・家具を企画製造する架空メーカー。日本・EU向け卸を展開。",
  },
  {
    id: "a1111111-1111-4111-a111-111111111122",
    email: "maker-urban@demo.brandbridge.app",
    company_name: "アーバンギアラボ株式会社",
    contact_name: "Casey Morgan",
    industry: "バッグ・旅行用品",
    headquarters: "アメリカ・ポートランド",
    founded_year: 2019,
    description:
      "都市通勤向けバッグを設計する架空メーカー。防水素材とガジェット収納が強み。",
  },
  {
    id: "a1111111-1111-4111-a111-111111111123",
    email: "maker-ceramic@demo.brandbridge.app",
    company_name: "ピュアホーム陶芸株式会社",
    contact_name: "高橋 美咲",
    industry: "キッチン・陶磁器",
    headquarters: "日本・岐阜県多治見市",
    founded_year: 2012,
    description:
      "美濃焼産地の架空窯元。日常使いの磁器マグとギフト向け器を製造。",
  },
  {
    id: "a1111111-1111-4111-a111-111111111124",
    email: "maker-fitness@demo.brandbridge.app",
    company_name: "フィットデイリー工業株式会社",
    contact_name: "Jordan Lee",
    industry: "スポーツ用品",
    headquarters: "韓国・ソウル",
    founded_year: 2018,
    description:
      "真空断熱ボトルとフィットネスギアを手がける架空メーカー。ジム卸が主力。",
  },
  {
    id: "a1111111-1111-4111-a111-111111111125",
    email: "maker-bamboo@demo.brandbridge.app",
    company_name: "バンブーデスク工房株式会社",
    contact_name: "陳 雅婷",
    industry: "ライフスタイル・収納",
    headquarters: "台湾・台中",
    founded_year: 2015,
    description:
      "天然竹のデスク収納を製造する架空工房。文具セレクト向け卸が中心。",
  },
];

/** @type {Array<Record<string, unknown>>} */
const PRODUCTS = [
  {
    id: "c0000021-0000-4000-8000-000000000021",
    maker_id: MAKERS[0].id,
    sku: "DUM-0021",
    title: "Nordic Wood Lampの卸パートナー募集",
    category: "ホーム・インテリア",
    region: "全国・海外",
    summary:
      "天然木ベースとファブリックシェードの北欧テーブルランプ。インテリア卸向け。",
    description:
      "天然木とファブリックシェードを組み合わせた北欧スタイルのテーブルランプ。リビングや寝室、カフェ空間にも調和するシンプルなデザインです。オーク材の木目を生かしたベースと、柔らかい拡散光のシェードで落ち着いた空間演出ができます。",
    ideal_partner: "インテリアショップ、ライフスタイルセレクト、カフェ備品調達",
    offer: "初回ロット割引、売り場什器提案、販促写真データ一式",
    product_name: "Nordic Wood Lamp",
    product_features:
      "オーク材ベース／リネン混ファブリックシェード／E26口金／高さ42cm／LED電球付属",
    price_band: "3,800〜5,200円（税別）",
    wholesale_price: "4,200円（税別・24個ロット時）",
    lot_pricing: "24個: 4,200円 / 48個: 3,900円 / 96個: 3,800円（税別）",
    price_conditions: "fixed",
    sales_format: "wholesale",
    sales_terms: "掛率45〜55%、請求書払い（Net 30、与信審査後）",
    min_order: "24個〜",
    min_order_amount: "100,800円（税別）〜",
    suggested_retail_price: "¥12,800（税別）",
    sample_available: "yes",
    test_sale_available: "negotiable",
    is_exclusive: true,
    target_country: "GLOBAL",
    partner_channels: "インテリア / セレクト / カフェ・ホテル",
    partner_requirements: "ライフスタイル商材の取扱実績、または店舗・EC販路の保有",
    product_image_url: "/images/dummy/dum-0021-main.png",
    product_video_url: VIDEO,
    brand_name: "LUMINA NORD",
    brand_overview:
      "LUMINA NORDは北欧の住空間をテーマにした照明ブランドです。素材感と控えめな造形を重視し、インテリアショップ向けに展開しています。",
    product_strengths:
      "天然木の質感と組み立て簡単設計。カフェ・ホテル客室への導入事例あり。梱包は破損率低減の二層構造。",
    sales_track_record:
      "北欧・日本のインテリアセレクト計38店舗で定番化。2025年は法人向け客室備品として1,200台納入。",
    market_availability_jp_us:
      "日本：販売可／米国：UL対応モデルは要確認（相談可）",
    lead_time: "標準4〜6週間（在庫品は2週間）",
    initial_order_terms:
      "初回はMOQ以上、前金30%・残金出荷前、検品サンプル1台無償添付",
    trademark_status: "registered",
    exclusive_deal_option: "conditional",
    ship_from: "デンマーク（コペンハーゲン近郊倉庫）",
    currencies: "JPY / EUR / USD",
    incoterms: "FOB Copenhagen / CIF Tokyo（応相談）",
    certifications: "CE、RoHS、PSE（日本向けアダプタ付属時）",
    support_languages: "日本語 / English / Dansk",
  },
  {
    id: "c0000022-0000-4000-8000-000000000022",
    maker_id: MAKERS[1].id,
    sku: "DUM-0022",
    title: "Urban Travel Backpackの販売パートナー募集",
    category: "バッグ",
    region: "全国・海外",
    summary:
      "ノートPC収納・防水素材・USBポート付き多機能バックパック。通勤・旅行向け。",
    description:
      "ノートPC収納、防水素材、USBポートを備えた多機能バックパック。通勤・通学・旅行まで幅広く対応します。背面クッションと盗難防止ポケットで都市移動の安心感を高めています。",
    ideal_partner: "バッグ専門店、旅行用品店、ECモール出品者",
    offer: "サンプル貸出、カタログデータ提供、店頭用ディスプレイ案",
    product_name: "Urban Travel Backpack",
    product_features:
      "15インチPCスリーブ／撥水ナイロン／USB充電ポート／容量28L／重量約980g",
    price_band: "4,200〜6,800円（税別）",
    wholesale_price: "5,400円（税別・12個ロット時）",
    lot_pricing: "12個: 5,400円 / 36個: 4,800円 / 72個: 4,200円（税別）",
    price_conditions: "fixed",
    sales_format: "wholesale",
    sales_terms: "掛率40〜50%、L/CまたはT/T（条件応相談）",
    min_order: "12個〜",
    min_order_amount: "64,800円（税別）〜",
    suggested_retail_price: "¥14,800（税別）",
    sample_available: "yes",
    test_sale_available: "yes",
    is_exclusive: false,
    target_country: "GLOBAL",
    partner_channels: "バッグ専門 / 旅行 / EC",
    partner_requirements: "バッグまたはトラベル商材の販売実績",
    product_image_url: "/images/dummy/dum-0022-main.png",
    product_video_url: VIDEO,
    brand_name: "TRAILPATH",
    brand_overview:
      "TRAILPATHは都市と短距離旅行をつなぐバッグブランドです。機能性とミニマルな外観を両立したラインナップを展開しています。",
    product_strengths:
      "ビジネスとトラベルの兼用設計。カラー3色展開で店頭VMDしやすい。英語取扱説明書同梱。",
    sales_track_record:
      "北米・日本のバッグ専門店およびECで累計18,000個販売。通勤向けセット販売の実績あり。",
    market_availability_jp_us:
      "日本：販売可／米国：販売可（英語パッケージ対応済）",
    lead_time: "標準5〜7週間（追加生産時）／在庫カラーは3週間",
    initial_order_terms: "カラーミックス可、初回発注は前金40%、残金B/L後",
    trademark_status: "registered",
    exclusive_deal_option: "conditional",
    ship_from: "アメリカ・オレゴン州（ポートランドDC）",
    currencies: "JPY / USD",
    incoterms: "FOB Portland / DDP Tokyo（応相談）",
    certifications: "REACH準拠生地、アゾ染料フリー",
    support_languages: "English / 日本語",
  },
  {
    id: "c0000023-0000-4000-8000-000000000023",
    maker_id: MAKERS[2].id,
    sku: "DUM-0023",
    title: "Pure Ceramic Mugの卸・ギフト卸パートナー募集",
    category: "キッチン",
    region: "全国",
    summary:
      "ミニマルデザインのプレミアム磁器マグ。日常使い・ギフト向け。",
    description:
      "シンプルで高級感のあるセラミックマグ。日常使いからギフトまで幅広く利用できます。美濃焼の技術を活かした均一な白磁と、持ちやすいハンドル形状が特長です。",
    ideal_partner: "キッチン雑貨店、ギフト卸、カフェ・ホテル備品",
    offer: "ギフト箱対応、季節キャンペーン連動、売り場写真提供",
    product_name: "Pure Ceramic Mug",
    product_features:
      "磁器／電子レンジ・食洗機対応／容量320ml／ギフト箱対応可",
    price_band: "980〜1,480円（税別）",
    wholesale_price: "1,200円（税別・48個ロット時）",
    lot_pricing: "48個: 1,200円 / 96個: 1,080円 / 192個: 980円（税別）",
    price_conditions: "fixed",
    sales_format: "wholesale",
    sales_terms: "掛率45%、月末締め翌月末払い（国内与信後）",
    min_order: "48個〜",
    min_order_amount: "57,600円（税別）〜",
    suggested_retail_price: "¥2,800（税別）",
    sample_available: "yes",
    test_sale_available: "negotiable",
    is_exclusive: false,
    target_country: "JP",
    partner_channels: "キッチン雑貨 / ギフト / カフェ",
    partner_requirements: "雑貨またはギフト商材の取扱経験",
    product_image_url: "/images/dummy/dum-0023-main.png",
    product_video_url: VIDEO,
    brand_name: "PUREFORM",
    brand_overview:
      "PUREFORMは日常のテーブルを整える磁器ブランドです。余計な装飾を排し、長く使える形と質感を追求しています。",
    product_strengths:
      "割れにくい厚み設計と安定した量産品質。季節ギフトセットへの組み込みが容易。",
    sales_track_record:
      "国内百貨店・ライフスタイルショップ計52店舗、およびカタログギフト2社で採用。",
    market_availability_jp_us:
      "日本：販売可／米国：FDA対応釉薬使用（輸出相談可）",
    lead_time: "標準3〜5週間",
    initial_order_terms:
      "初回は単色48個〜、混色は要相談、サンプル3個まで無償",
    trademark_status: "pending",
    exclusive_deal_option: "unavailable",
    ship_from: "日本・岐阜県（多治見倉庫）",
    currencies: "JPY / USD",
    incoterms: "EXW Tajimi / FOB Nagoya",
    certifications: "食品衛生法適合、鉛・カドミウム溶出試験済",
    support_languages: "日本語 / English",
  },
  {
    id: "c0000024-0000-4000-8000-000000000024",
    maker_id: MAKERS[3].id,
    sku: "DUM-0024",
    title: "Smart Fitness Bottleのスポーツ卸パートナー募集",
    category: "スポーツ",
    region: "全国・海外",
    summary: "真空断熱のスポーツボトル。ジム・アウトドア向け保温・保冷。",
    description:
      "真空断熱構造を採用したスポーツボトル。長時間保温・保冷が可能でアウトドアやジムに最適です。漏れ防止キャップとワンハンド開閉でトレーニング中も扱いやすい設計です。",
    ideal_partner: "スポーツ用品店、フィットネスジム、アウトドア専門店",
    offer: "店頭什器提案、初回ロット割引、試飲イベント用貸出ボトル",
    product_name: "Smart Fitness Bottle",
    product_features:
      "真空断熱ステンレス／500ml／保温6時間・保冷12時間目安／漏れ防止キャップ",
    price_band: "2,400〜3,200円（税別）",
    wholesale_price: "2,800円（税別・24個ロット時）",
    lot_pricing: "24個: 2,800円 / 48個: 2,600円 / 120個: 2,400円（税別）",
    price_conditions: "fixed",
    sales_format: "wholesale",
    sales_terms: "掛率45〜52%、T/T（船積み前残金）",
    min_order: "24個〜",
    min_order_amount: "67,200円（税別）〜",
    suggested_retail_price: "¥5,980（税別）",
    sample_available: "yes",
    test_sale_available: "yes",
    is_exclusive: true,
    target_country: "GLOBAL",
    partner_channels: "スポーツ / ジム / アウトドア",
    partner_requirements: "スポーツ・アウトドア商材の販売実績歓迎",
    product_image_url: "/images/dummy/dum-0024-main.png",
    product_video_url: VIDEO,
    brand_name: "HYDROFIT",
    brand_overview:
      "HYDROFITはトレーニングシーン向けハイドレーションブランドです。機能性と軽量感を両立したボトルを展開しています。",
    product_strengths:
      "ジムロッカーに収まるスリム形状。粉体塗装の指紋がつきにくい仕上げ。カラー5色。",
    sales_track_record:
      "韓国・日本のフィットネスジム向け卸で累計42,000本。スポーツ専門チェーン3社に導入。",
    market_availability_jp_us: "日本：販売可／米国：FDA対応、販売可",
    lead_time: "標準4〜6週間",
    initial_order_terms: "カラーあたり12個〜、合計MOQ24個、前金30%",
    trademark_status: "registered",
    exclusive_deal_option: "available",
    ship_from: "韓国・仁川（輸出倉庫）",
    currencies: "JPY / USD / KRW",
    incoterms: "FOB Incheon / CIF Osaka",
    certifications: "FDA、LFGB、BPAフリー",
    support_languages: "한국어 / English / 日本語",
  },
  {
    id: "c0000025-0000-4000-8000-000000000025",
    maker_id: MAKERS[4].id,
    sku: "DUM-0025",
    title: "Eco Bamboo Organizerのライフスタイル卸パートナー募集",
    category: "ホーム・収納",
    region: "全国",
    summary: "天然竹のデスクオーガナイザー。文具・小物をすっきり収納。",
    description:
      "天然竹素材を使用したデスクオーガナイザー。文房具や小物をすっきり収納できます。多区画トレーでペン・ふせん・ケーブル類を分けて置け、在宅ワーク環境の整理に適しています。",
    ideal_partner: "文具セレクト、ライフスタイルショップ、オフィサプライ",
    offer: "売り場提案資料、同梱チラシ対応、ノベルティ見積対応",
    product_name: "Eco Bamboo Organizer",
    product_features: "天然竹／多区画トレー／W28×D12×H8cm／表面クリア塗装",
    price_band: "1,800〜2,600円（税別）",
    wholesale_price: "2,200円（税別・20個ロット時）",
    lot_pricing: "20個: 2,200円 / 50個: 2,000円 / 100個: 1,800円（税別）",
    price_conditions: "fixed",
    sales_format: "wholesale",
    sales_terms: "掛率48%、請求書払い（Net 30）またはT/T",
    min_order: "20個〜",
    min_order_amount: "44,000円（税別）〜",
    suggested_retail_price: "¥4,200（税別）",
    sample_available: "yes",
    test_sale_available: "negotiable",
    is_exclusive: false,
    target_country: "JP",
    partner_channels: "文具 / ライフスタイル / オフィス",
    partner_requirements: "文具・収納雑貨の取扱経験歓迎",
    product_image_url: "/images/dummy/dum-0025-main.png",
    product_video_url: VIDEO,
    brand_name: "BAMBOO NEST",
    brand_overview:
      "BAMBOO NESTは竹素材のデスクまわり製品に特化したブランドです。サステナブル素材と実用的な収納設計を組み合わせています。",
    product_strengths:
      "軽量で組み立て不要。ギフト需要向けクラフト箱対応。FSC認証竹材を使用。",
    sales_track_record:
      "台湾・日本の文具セレクトとオフィサプライECで累計9,500個。企業ノベルティ案件あり。",
    market_availability_jp_us:
      "日本：販売可／米国：販売可（英語説明書同梱可）",
    lead_time: "標準3〜4週間",
    initial_order_terms: "初回20個〜、名入れは50個〜、サンプル2個まで無償",
    trademark_status: "registered",
    exclusive_deal_option: "conditional",
    ship_from: "台湾・台中",
    currencies: "JPY / USD / TWD",
    incoterms: "FOB Taichung / CIF Yokohama",
    certifications: "FSC竹材、ホルムアルデヒド放散試験済",
    support_languages: "中文 / English / 日本語",
  },
];

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function authErrText(error) {
  if (!error) return "";
  const parts = [error.message, error.status, error.code, error.name]
    .filter((v) => v != null && String(v).trim() !== "")
    .map(String);
  return parts.length ? parts.join(" | ") : JSON.stringify(error);
}

function isUserExistsError(error) {
  const text = `${error?.message ?? ""} ${error?.code ?? ""}`.toLowerCase();
  return (
    text.includes("already") ||
    text.includes("exists") ||
    text.includes("duplicate") ||
    error?.status === 422
  );
}

async function ensureMaker(maker) {
  let user = null;

  const { data: byId, error: byIdError } =
    await supabase.auth.admin.getUserById(maker.id);
  if (!byIdError && byId?.user) {
    user = byId.user;
  }

  if (!user) {
    const { data, error } = await supabase.auth.admin.createUser({
      id: maker.id,
      email: maker.email,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: {
        role: "maker",
        company_name: maker.company_name,
        contact_name: maker.contact_name,
        industry: maker.industry,
      },
    });
    if (error) {
      if (isUserExistsError(error)) {
        const { data: again, error: againError } =
          await supabase.auth.admin.getUserById(maker.id);
        if (againError || !again?.user) {
          fail(
            `createUser ${maker.email}: ${authErrText(error)}; getUserById retry: ${authErrText(againError)}`,
          );
        }
        user = again.user;
      } else {
        fail(`createUser ${maker.email}: ${authErrText(error)}`);
      }
    } else {
      user = data.user;
    }
  }

  const profileId = user?.id || maker.id;
  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: profileId,
      role: "maker",
      company_name: maker.company_name,
      contact_name: maker.contact_name,
      email: maker.email,
      industry: maker.industry,
      headquarters: maker.headquarters,
      founded_year: maker.founded_year,
      description: maker.description,
      employee_range: "1-10",
    },
    { onConflict: "id" },
  );
  if (profileError) fail(`profiles ${maker.email}: ${profileError.message}`);
  return profileId;
}

const now = new Date().toISOString();
const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

console.log("[seed-dummy-catalog] ensuring makers…");
const makerIdByKey = {};
for (const maker of MAKERS) {
  const id = await ensureMaker(maker);
  makerIdByKey[maker.id] = id;
  console.log(`  maker OK: ${maker.company_name} (${id})`);
}

const caseRows = PRODUCTS.map((p) => ({
  ...p,
  maker_id: makerIdByKey[p.maker_id] || p.maker_id,
  status: "open",
  review_status: "approved",
  created_at: dayAgo,
  updated_at: now,
  reviewed_at: dayAgo,
}));

console.log("[seed-dummy-catalog] upserting cases…");
const { error: caseError } = await supabase.from("cases").upsert(caseRows, {
  onConflict: "id",
});
if (caseError) fail(`cases upsert: ${caseError.message}`);

console.log("[seed-dummy-catalog] syncing case_images…");
for (const p of PRODUCTS) {
  await supabase.from("case_images").delete().eq("case_id", p.id);
  const { error: imgError } = await supabase.from("case_images").insert({
    case_id: p.id,
    image_url: p.product_image_url,
    storage_path: null,
    sort_order: 0,
  });
  if (imgError) fail(`case_images ${p.sku}: ${imgError.message}`);
}

console.log(
  `[seed-dummy-catalog] done: ${PRODUCTS.length} products, ${MAKERS.length} makers`,
);
for (const p of PRODUCTS) {
  console.log(`  ${p.sku} ${p.product_name} / ${p.brand_name}`);
}
process.exit(0);
