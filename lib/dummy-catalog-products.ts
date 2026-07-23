/**
 * Fictional demo catalog products (no real brands).
 * JA copy lives in DB; EN overlay uses lib/en-case-catalog.ts.
 */

import { getCaseById } from "@/lib/cases";
import type { Case } from "@/lib/types";

/**
 * Dummy products intentionally omit video URLs until a verified playable
 * asset is available. Unplayable URLs must not render a black player.
 */
export const DUMMY_CATALOG_VIDEO: string | null = null;

export type DummyMakerDef = {
  id: string;
  email: string;
  companyName: string;
  contactName: string;
  industry: string;
  headquarters: string;
  foundedYear: number;
  description: string;
};

export type DummyCatalogProductDef = {
  id: string;
  sku: string;
  maker: DummyMakerDef;
  productName: string;
  brandName: string;
  categoryJa: string;
  categoryEn: string;
  titleJa: string;
  summaryJa: string;
  descriptionJa: string;
  featuresJa: string;
  summaryEn: string;
  descriptionEn: string;
  featuresEn: string;
  brandOverview: string;
  productStrengths: string;
  salesTrackRecord: string;
  marketAvailabilityJpUs: string;
  leadTime: string;
  initialOrderTerms: string;
  salesTerms: string;
  suggestedRetailPrice: string;
  sampleAvailable: "yes" | "negotiable" | "no";
  testSaleAvailable: "yes" | "negotiable" | "no";
  trademarkStatus: "registered" | "pending" | "unregistered";
  exclusiveDealOption: "available" | "conditional" | "unavailable";
  shipFrom: string;
  currencies: string;
  incoterms: string;
  certifications: string;
  supportLanguages: string;
  priceBand: string;
  wholesalePrice: string;
  lotPricing: string;
  minOrder: string;
  minOrderAmount: string;
  priceConditions: string;
  salesFormat: "wholesale";
  isExclusive: boolean;
  targetCountry: "JP" | "GLOBAL" | "EU" | "ASEAN" | "US";
  region: string;
  idealPartner: string;
  offer: string;
  partnerChannels: string;
  partnerRequirements: string;
  imageUrl: string;
  videoUrl: string | null;
};

const MAKERS = {
  nordic: {
    id: "a1111111-1111-4111-a111-111111111121",
    email: "maker-nordic@demo.brandbridge.app",
    companyName: "ノルディックリビング合同会社",
    contactName: "Erik Lindqvist",
    industry: "ホーム・インテリア",
    headquarters: "デンマーク・コペンハーゲン",
    foundedYear: 2016,
    description:
      "北欧デザインの照明・家具を企画製造する架空メーカー。日本・EU向け卸を展開。",
  },
  urban: {
    id: "a1111111-1111-4111-a111-111111111122",
    email: "maker-urban@demo.brandbridge.app",
    companyName: "アーバンギアラボ株式会社",
    contactName: "Casey Morgan",
    industry: "バッグ・旅行用品",
    headquarters: "アメリカ・ポートランド",
    foundedYear: 2019,
    description:
      "都市通勤向けバッグを設計する架空メーカー。防水素材とガジェット収納が強み。",
  },
  ceramic: {
    id: "a1111111-1111-4111-a111-111111111123",
    email: "maker-ceramic@demo.brandbridge.app",
    companyName: "ピュアホーム陶芸株式会社",
    contactName: "高橋 美咲",
    industry: "キッチン・陶磁器",
    headquarters: "日本・岐阜県多治見市",
    foundedYear: 2012,
    description:
      "美濃焼産地の架空窯元。日常使いの磁器マグとギフト向け器を製造。",
  },
  fitness: {
    id: "a1111111-1111-4111-a111-111111111124",
    email: "maker-fitness@demo.brandbridge.app",
    companyName: "フィットデイリー工業株式会社",
    contactName: "Jordan Lee",
    industry: "スポーツ用品",
    headquarters: "韓国・ソウル",
    foundedYear: 2018,
    description:
      "真空断熱ボトルとフィットネスギアを手がける架空メーカー。ジム卸が主力。",
  },
  bamboo: {
    id: "a1111111-1111-4111-a111-111111111125",
    email: "maker-bamboo@demo.brandbridge.app",
    companyName: "バンブーデスク工房株式会社",
    contactName: "陳 雅婷",
    industry: "ライフスタイル・収納",
    headquarters: "台湾・台中",
    foundedYear: 2015,
    description:
      "天然竹のデスク収納を製造する架空工房。文具セレクト向け卸が中心。",
  },
} as const satisfies Record<string, DummyMakerDef>;

export const DUMMY_CATALOG_MAKERS: DummyMakerDef[] = Object.values(MAKERS);

export const DUMMY_CATALOG_PRODUCTS: DummyCatalogProductDef[] = [
  {
    id: "c0000021-0000-4000-8000-000000000021",
    sku: "DUM-0021",
    maker: MAKERS.nordic,
    productName: "Nordic Wood Lamp",
    brandName: "LUMINA NORD",
    categoryJa: "ホーム・インテリア",
    categoryEn: "Home & Interior",
    titleJa: "Nordic Wood Lampの卸パートナー募集",
    summaryJa:
      "天然木ベースとファブリックシェードの北欧テーブルランプ。インテリア卸向け。",
    descriptionJa:
      "天然木とファブリックシェードを組み合わせた北欧スタイルのテーブルランプ。リビングや寝室、カフェ空間にも調和するシンプルなデザインです。オーク材の木目を生かしたベースと、柔らかい拡散光のシェードで落ち着いた空間演出ができます。",
    featuresJa:
      "オーク材ベース／リネン混ファブリックシェード／E26口金／高さ42cm／LED電球付属",
    summaryEn:
      "Scandinavian-style table lamp with a natural wood base and fabric shade for interior wholesale.",
    descriptionEn:
      "A Scandinavian-style table lamp featuring a natural wood base and fabric shade. Perfect for living rooms, bedrooms, cafés, and modern interiors. Oak grain base with soft diffused light for calm spaces.",
    featuresEn:
      "Oak wood base / linen-blend fabric shade / E26 socket / 42cm height / LED bulb included",
    brandOverview:
      "LUMINA NORDは北欧の住空間をテーマにした照明ブランドです。素材感と控えめな造形を重視し、インテリアショップ向けに展開しています。",
    productStrengths:
      "天然木の質感と組み立て簡単設計。カフェ・ホテル客室への導入事例あり。梱包は破損率低減の二層構造。",
    salesTrackRecord:
      "北欧・日本のインテリアセレクト計38店舗で定番化。2025年は法人向け客室備品として1,200台納入。",
    marketAvailabilityJpUs: "日本：販売可／米国：UL対応モデルは要確認（相談可）",
    leadTime: "標準4〜6週間（在庫品は2週間）",
    initialOrderTerms: "初回はMOQ以上、前金30%・残金出荷前、検品サンプル1台無償添付",
    salesTerms: "掛率45〜55%、請求書払い（Net 30、与信審査後）",
    suggestedRetailPrice: "¥12,800（税別）",
    sampleAvailable: "yes",
    testSaleAvailable: "negotiable",
    trademarkStatus: "registered",
    exclusiveDealOption: "conditional",
    shipFrom: "デンマーク（コペンハーゲン近郊倉庫）",
    currencies: "JPY / EUR / USD",
    incoterms: "FOB Copenhagen / CIF Tokyo（応相談）",
    certifications: "CE、RoHS、PSE（日本向けアダプタ付属時）",
    supportLanguages: "日本語 / English / Dansk",
    priceBand: "3,800〜5,200円（税別）",
    wholesalePrice: "4,200円（税別・24個ロット時）",
    lotPricing: "24個: 4,200円 / 48個: 3,900円 / 96個: 3,800円（税別）",
    minOrder: "24個〜",
    minOrderAmount: "100,800円（税別）〜",
    priceConditions: "fixed",
    salesFormat: "wholesale",
    isExclusive: true,
    targetCountry: "GLOBAL",
    region: "全国・海外",
    idealPartner: "インテリアショップ、ライフスタイルセレクト、カフェ備品調達",
    offer: "初回ロット割引、売り場什器提案、販促写真データ一式",
    partnerChannels: "インテリア / セレクト / カフェ・ホテル",
    partnerRequirements: "ライフスタイル商材の取扱実績、または店舗・EC販路の保有",
    imageUrl: "/images/dummy/dum-0021-main.png",
    videoUrl: DUMMY_CATALOG_VIDEO,
  },
  {
    id: "c0000022-0000-4000-8000-000000000022",
    sku: "DUM-0022",
    maker: MAKERS.urban,
    productName: "Urban Travel Backpack",
    brandName: "TRAILPATH",
    categoryJa: "バッグ",
    categoryEn: "Bags",
    titleJa: "Urban Travel Backpackの販売パートナー募集",
    summaryJa:
      "ノートPC収納・防水素材・USBポート付き多機能バックパック。通勤・旅行向け。",
    descriptionJa:
      "ノートPC収納、防水素材、USBポートを備えた多機能バックパック。通勤・通学・旅行まで幅広く対応します。背面クッションと盗難防止ポケットで都市移動の安心感を高めています。",
    featuresJa:
      "15インチPCスリーブ／撥水ナイロン／USB充電ポート／容量28L／重量約980g",
    summaryEn:
      "Multifunctional backpack with laptop sleeve, waterproof fabric, and USB port.",
    descriptionEn:
      "A multifunctional backpack with a laptop compartment, waterproof fabric, and USB charging port. Ideal for commuting, school, and travel. Padded back panel and anti-theft pocket for city mobility.",
    featuresEn:
      "15-inch laptop sleeve / water-resistant nylon / USB charging port / 28L / approx. 980g",
    brandOverview:
      "TRAILPATHは都市と短距離旅行をつなぐバッグブランドです。機能性とミニマルな外観を両立したラインナップを展開しています。",
    productStrengths:
      "ビジネスとトラベルの兼用設計。カラー3色展開で店頭VMDしやすい。英語取扱説明書同梱。",
    salesTrackRecord:
      "北米・日本のバッグ専門店およびECで累計18,000個販売。通勤向けセット販売の実績あり。",
    marketAvailabilityJpUs: "日本：販売可／米国：販売可（英語パッケージ対応済）",
    leadTime: "標準5〜7週間（追加生産時）／在庫カラーは3週間",
    initialOrderTerms: "カラーミックス可、初回発注は前金40%、残金B/L後",
    salesTerms: "掛率40〜50%、L/CまたはT/T（条件応相談）",
    suggestedRetailPrice: "¥14,800（税別）",
    sampleAvailable: "yes",
    testSaleAvailable: "yes",
    trademarkStatus: "registered",
    exclusiveDealOption: "conditional",
    shipFrom: "アメリカ・オレゴン州（ポートランドDC）",
    currencies: "JPY / USD",
    incoterms: "FOB Portland / DDP Tokyo（応相談）",
    certifications: "REACH準拠生地、アゾ染料フリー",
    supportLanguages: "English / 日本語",
    priceBand: "4,200〜6,800円（税別）",
    wholesalePrice: "5,400円（税別・12個ロット時）",
    lotPricing: "12個: 5,400円 / 36個: 4,800円 / 72個: 4,200円（税別）",
    minOrder: "12個〜",
    minOrderAmount: "64,800円（税別）〜",
    priceConditions: "fixed",
    salesFormat: "wholesale",
    isExclusive: false,
    targetCountry: "GLOBAL",
    region: "全国・海外",
    idealPartner: "バッグ専門店、旅行用品店、ECモール出品者",
    offer: "サンプル貸出、カタログデータ提供、店頭用ディスプレイ案",
    partnerChannels: "バッグ専門 / 旅行 / EC",
    partnerRequirements: "バッグまたはトラベル商材の販売実績",
    imageUrl: "/images/dummy/dum-0022-main.png",
    videoUrl: DUMMY_CATALOG_VIDEO,
  },
  {
    id: "c0000023-0000-4000-8000-000000000023",
    sku: "DUM-0023",
    maker: MAKERS.ceramic,
    productName: "Pure Ceramic Mug",
    brandName: "PUREFORM",
    categoryJa: "キッチン",
    categoryEn: "Kitchen",
    titleJa: "Pure Ceramic Mugの卸・ギフト卸パートナー募集",
    summaryJa:
      "ミニマルデザインのプレミアム磁器マグ。日常使い・ギフト向け。",
    descriptionJa:
      "シンプルで高級感のあるセラミックマグ。日常使いからギフトまで幅広く利用できます。美濃焼の技術を活かした均一な白磁と、持ちやすいハンドル形状が特長です。",
    featuresJa: "磁器／電子レンジ・食洗機対応／容量320ml／ギフト箱対応可",
    summaryEn:
      "Premium ceramic mug with a clean minimalist design for everyday and gift channels.",
    descriptionEn:
      "A premium ceramic mug with a clean minimalist design. Suitable for everyday use and gift collections. Even white porcelain and an easy-grip handle crafted with Mino ware expertise.",
    featuresEn:
      "Porcelain / microwave & dishwasher safe / 320ml / gift-box ready",
    brandOverview:
      "PUREFORMは日常のテーブルを整える磁器ブランドです。余計な装飾を排し、長く使える形と質感を追求しています。",
    productStrengths:
      "割れにくい厚み設計と安定した量産品質。季節ギフトセットへの組み込みが容易。",
    salesTrackRecord:
      "国内百貨店・ライフスタイルショップ計52店舗、およびカタログギフト2社で採用。",
    marketAvailabilityJpUs: "日本：販売可／米国：FDA対応釉薬使用（輸出相談可）",
    leadTime: "標準3〜5週間",
    initialOrderTerms: "初回は単色48個〜、混色は要相談、サンプル3個まで無償",
    salesTerms: "掛率45%、月末締め翌月末払い（国内与信後）",
    suggestedRetailPrice: "¥2,800（税別）",
    sampleAvailable: "yes",
    testSaleAvailable: "negotiable",
    trademarkStatus: "pending",
    exclusiveDealOption: "unavailable",
    shipFrom: "日本・岐阜県（多治見倉庫）",
    currencies: "JPY / USD",
    incoterms: "EXW Tajimi / FOB Nagoya",
    certifications: "食品衛生法適合、鉛・カドミウム溶出試験済",
    supportLanguages: "日本語 / English",
    priceBand: "980〜1,480円（税別）",
    wholesalePrice: "1,200円（税別・48個ロット時）",
    lotPricing: "48個: 1,200円 / 96個: 1,080円 / 192個: 980円（税別）",
    minOrder: "48個〜",
    minOrderAmount: "57,600円（税別）〜",
    priceConditions: "fixed",
    salesFormat: "wholesale",
    isExclusive: false,
    targetCountry: "JP",
    region: "全国",
    idealPartner: "キッチン雑貨店、ギフト卸、カフェ・ホテル備品",
    offer: "ギフト箱対応、季節キャンペーン連動、売り場写真提供",
    partnerChannels: "キッチン雑貨 / ギフト / カフェ",
    partnerRequirements: "雑貨またはギフト商材の取扱経験",
    imageUrl: "/images/dummy/dum-0023-main.png",
    videoUrl: DUMMY_CATALOG_VIDEO,
  },
  {
    id: "c0000024-0000-4000-8000-000000000024",
    sku: "DUM-0024",
    maker: MAKERS.fitness,
    productName: "Smart Fitness Bottle",
    brandName: "HYDROFIT",
    categoryJa: "スポーツ",
    categoryEn: "Sports",
    titleJa: "Smart Fitness Bottleのスポーツ卸パートナー募集",
    summaryJa: "真空断熱のスポーツボトル。ジム・アウトドア向け保温・保冷。",
    descriptionJa:
      "真空断熱構造を採用したスポーツボトル。長時間保温・保冷が可能でアウトドアやジムに最適です。漏れ防止キャップとワンハンド開閉でトレーニング中も扱いやすい設計です。",
    featuresJa:
      "真空断熱ステンレス／500ml／保温6時間・保冷12時間目安／漏れ防止キャップ",
    summaryEn:
      "Vacuum-insulated sports bottle that keeps drinks hot or cold for hours.",
    descriptionEn:
      "A vacuum-insulated sports bottle that keeps drinks hot or cold for hours. Perfect for gyms, outdoor activities, and everyday use. Leak-resistant lid with one-hand open design for workouts.",
    featuresEn:
      "Vacuum-insulated stainless steel / 500ml / keeps warm ~6h, cold ~12h / leak-resistant lid",
    brandOverview:
      "HYDROFITはトレーニングシーン向けハイドレーションブランドです。機能性と軽量感を両立したボトルを展開しています。",
    productStrengths:
      "ジムロッカーに収まるスリム形状。粉体塗装の指紋がつきにくい仕上げ。カラー5色。",
    salesTrackRecord:
      "韓国・日本のフィットネスジム向け卸で累計42,000本。スポーツ専門チェーン3社に導入。",
    marketAvailabilityJpUs: "日本：販売可／米国：FDA対応、販売可",
    leadTime: "標準4〜6週間",
    initialOrderTerms: "カラーあたり12個〜、合計MOQ24個、前金30%",
    salesTerms: "掛率45〜52%、T/T（船積み前残金）",
    suggestedRetailPrice: "¥5,980（税別）",
    sampleAvailable: "yes",
    testSaleAvailable: "yes",
    trademarkStatus: "registered",
    exclusiveDealOption: "available",
    shipFrom: "韓国・仁川（輸出倉庫）",
    currencies: "JPY / USD / KRW",
    incoterms: "FOB Incheon / CIF Osaka",
    certifications: "FDA、LFGB、BPAフリー",
    supportLanguages: "한국어 / English / 日本語",
    priceBand: "2,400〜3,200円（税別）",
    wholesalePrice: "2,800円（税別・24個ロット時）",
    lotPricing: "24個: 2,800円 / 48個: 2,600円 / 120個: 2,400円（税別）",
    minOrder: "24個〜",
    minOrderAmount: "67,200円（税別）〜",
    priceConditions: "fixed",
    salesFormat: "wholesale",
    isExclusive: true,
    targetCountry: "GLOBAL",
    region: "全国・海外",
    idealPartner: "スポーツ用品店、フィットネスジム、アウトドア専門店",
    offer: "店頭什器提案、初回ロット割引、試飲イベント用貸出ボトル",
    partnerChannels: "スポーツ / ジム / アウトドア",
    partnerRequirements: "スポーツ・アウトドア商材の販売実績歓迎",
    imageUrl: "/images/dummy/dum-0024-main.png",
    videoUrl: DUMMY_CATALOG_VIDEO,
  },
  {
    id: "c0000025-0000-4000-8000-000000000025",
    sku: "DUM-0025",
    maker: MAKERS.bamboo,
    productName: "Eco Bamboo Organizer",
    brandName: "BAMBOO NEST",
    categoryJa: "ホーム・収納",
    categoryEn: "Home Storage",
    titleJa: "Eco Bamboo Organizerのライフスタイル卸パートナー募集",
    summaryJa: "天然竹のデスクオーガナイザー。文具・小物をすっきり収納。",
    descriptionJa:
      "天然竹素材を使用したデスクオーガナイザー。文房具や小物をすっきり収納できます。多区画トレーでペン・ふせん・ケーブル類を分けて置け、在宅ワーク環境の整理に適しています。",
    featuresJa: "天然竹／多区画トレー／W28×D12×H8cm／表面クリア塗装",
    summaryEn:
      "Natural bamboo desktop organizer for tidy office supplies and accessories.",
    descriptionEn:
      "A desktop organizer made from natural bamboo. Keeps office supplies and accessories neatly arranged. Multi-compartment tray for pens, sticky notes, and cables—ideal for home offices.",
    featuresEn:
      "Natural bamboo / multi-compartment tray / W28×D12×H8cm / clear-coated finish",
    brandOverview:
      "BAMBOO NESTは竹素材のデスクまわり製品に特化したブランドです。サステナブル素材と実用的な収納設計を組み合わせています。",
    productStrengths:
      "軽量で組み立て不要。ギフト需要向けクラフト箱対応。FSC認証竹材を使用。",
    salesTrackRecord:
      "台湾・日本の文具セレクトとオフィサプライECで累計9,500個。企業ノベルティ案件あり。",
    marketAvailabilityJpUs: "日本：販売可／米国：販売可（英語説明書同梱可）",
    leadTime: "標準3〜4週間",
    initialOrderTerms: "初回20個〜、名入れは50個〜、サンプル2個まで無償",
    salesTerms: "掛率48%、請求書払い（Net 30）またはT/T",
    suggestedRetailPrice: "¥4,200（税別）",
    sampleAvailable: "yes",
    testSaleAvailable: "negotiable",
    trademarkStatus: "registered",
    exclusiveDealOption: "conditional",
    shipFrom: "台湾・台中",
    currencies: "JPY / USD / TWD",
    incoterms: "FOB Taichung / CIF Yokohama",
    certifications: "FSC竹材、ホルムアルデヒド放散試験済",
    supportLanguages: "中文 / English / 日本語",
    priceBand: "1,800〜2,600円（税別）",
    wholesalePrice: "2,200円（税別・20個ロット時）",
    lotPricing: "20個: 2,200円 / 50個: 2,000円 / 100個: 1,800円（税別）",
    minOrder: "20個〜",
    minOrderAmount: "44,000円（税別）〜",
    priceConditions: "fixed",
    salesFormat: "wholesale",
    isExclusive: false,
    targetCountry: "JP",
    region: "全国",
    idealPartner: "文具セレクト、ライフスタイルショップ、オフィサプライ",
    offer: "売り場提案資料、同梱チラシ対応、ノベルティ見積対応",
    partnerChannels: "文具 / ライフスタイル / オフィス",
    partnerRequirements: "文具・収納雑貨の取扱経験歓迎",
    imageUrl: "/images/dummy/dum-0025-main.png",
    videoUrl: DUMMY_CATALOG_VIDEO,
  },
];

export const DUMMY_CATALOG_IDS = DUMMY_CATALOG_PRODUCTS.map((p) => p.id);

/** Load approved dummy products from DB for showcase / listing helpers. */
export async function listDummyCatalogCases(): Promise<Case[]> {
  const rows = await Promise.all(
    DUMMY_CATALOG_IDS.map((id) => getCaseById(id)),
  );
  return rows.filter((c): c is Case => Boolean(c));
}
