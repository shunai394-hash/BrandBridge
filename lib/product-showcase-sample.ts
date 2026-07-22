import type { Case, CaseImage } from "@/lib/types";

/** Stable sample id — not a real DB case; showcase pages only. */
export const PRODUCT_SHOWCASE_ID = "showcase-sample-aurora-serum";

const SAMPLE_IMAGE_PATHS = [
  "/images/showcase/aurora-main.jpg",
  "/images/showcase/aurora-2.jpg",
  "/images/showcase/aurora-3.jpg",
] as const;

/** Local skincare product intro clip (not an unrelated YouTube placeholder). */
const SAMPLE_VIDEO = "/videos/showcase/aurora-intro.mp4";

function sampleImages(): CaseImage[] {
  return SAMPLE_IMAGE_PATHS.map((imageUrl, index) => ({
    id: `showcase-img-${index + 1}`,
    caseId: PRODUCT_SHOWCASE_ID,
    imageUrl,
    storagePath: null,
    sortOrder: index,
    createdAt: "2026-01-01T00:00:00.000Z",
  }));
}

function baseSampleCase(
  overrides: Pick<
    Case,
    | "productName"
    | "title"
    | "makerName"
    | "category"
    | "summary"
    | "description"
    | "productFeatures"
    | "offer"
    | "salesTerms"
    | "brandName"
    | "brandOverview"
    | "productStrengths"
    | "idealPartner"
  >,
): Case {
  const images = sampleImages();
  return {
    id: PRODUCT_SHOWCASE_ID,
    caseNumber: "BB-SAMPLE",
    makerId: "showcase-maker",
    title: overrides.title,
    makerName: overrides.makerName,
    makerIndustry: "Beauty & Cosmetics",
    makerHeadquarters: "Los Angeles, USA",
    makerFoundedYear: 2018,
    category: overrides.category,
    region: "Japan (nationwide)",
    summary: overrides.summary,
    description: overrides.description,
    idealPartner: overrides.idealPartner,
    offer: overrides.offer,
    status: "open",
    productName: overrides.productName,
    sku: "AURORA-SERUM-30",
    productFeatures: overrides.productFeatures,
    priceBand: "¥3,000–¥5,000",
    wholesalePrice: null,
    priceConditions: "quote",
    lotPricing: null,
    salesFormat: "wholesale",
    salesTerms: overrides.salesTerms,
    minOrder: "48 units",
    minOrderAmount: null,
    suggestedRetailPrice: "¥8,800",
    sampleAvailable: "yes",
    testSaleAvailable: "negotiable",
    isExclusive: true,
    targetCountry: "JP",
    partnerChannels: "Specialty retail / Department stores / E-commerce",
    partnerRequirements: null,
    productImageUrl: images[0]?.imageUrl ?? null,
    productVideoUrl: SAMPLE_VIDEO,
    brandName: overrides.brandName,
    brandOverview: overrides.brandOverview,
    productStrengths: overrides.productStrengths,
    salesTrackRecord: "Sold in 120+ US boutiques; Amazon Best Seller rank (Beauty)",
    marketAvailabilityJpUs: "Available for Japan; currently sold in the US",
    leadTime: "2–4 weeks after order confirmation",
    initialOrderTerms: "MOQ 48 units · Sample kit available · Net 30 negotiable",
    trademarkStatus: "registered",
    exclusiveDealOption: "conditional",
    shipFrom: "United States",
    currencies: "USD / JPY",
    incoterms: "FOB / CIF / DDP (negotiable)",
    certifications: "Cruelty-free · Dermatologist tested",
    supportLanguages: "English / Japanese (via BrandBridge)",
    images,
    reviewStatus: "approved",
    reviewNote: null,
    createdAt: "2026-01-01T00:00:00.000Z",
  };
}

/** English showcase listing (sales-email preview). */
export function getEnglishProductShowcaseSample(): Case {
  return baseSampleCase({
    productName: "Aurora Hydrating Serum 30ml",
    title: "Aurora Hydrating Serum — Japan partner opportunity",
    makerName: "Northstar Beauty Co.",
    category: "Beauty & Cosmetics",
    brandName: "Aurora",
    brandOverview:
      "Northstar Beauty Co. creates clean, clinical-leaning skincare for discerning consumers. Aurora is our hero serum line for hydration and barrier support.",
    productStrengths:
      "Lightweight texture · Clean formula · Strong US retail proof · Ready English / Japanese sell sheets",
    summary:
      "A clean hydrating serum with US retail traction—seeking Japanese wholesale and specialty partners.",
    description:
      "Aurora Hydrating Serum delivers lasting moisture with a lightweight finish suited to Japan’s humid climate and daily routines.\n\nFormulated for sensitive-leaning skin, it layers well under sunscreen and makeup. Ideal for specialty beauty retailers, department store counters, and curated e-commerce stores looking for a differentiated US brand.",
    productFeatures:
      "• 30ml glass bottle with premium dropper\n• Fragrance-light, clean formula\n• Strong repeat purchase in US boutiques\n• Marketing assets: product photos, short intro video, English fact sheet\n• Samples available for partner evaluation",
    offer:
      "Wholesale to Japanese sales partners\nMOQ: 48 units\nReference wholesale band: ¥3,000–¥5,000\nExclusive option: available by territory (conditional)\nSamples: available\nIncoterms: FOB / CIF / DDP negotiable",
    salesTerms:
      "Payment: wire / Wise (negotiable)\nLead time: 2–4 weeks\nSupport: English-speaking brand team; Japanese partners welcome",
    idealPartner:
      "Specialty beauty retailers, department stores, and e-commerce partners with skincare expertise in Japan",
  });
}

/** Japanese showcase listing (same product, JP copy). */
export function getJapaneseProductShowcaseSample(): Case {
  return baseSampleCase({
    productName: "オーロラ ハイドレーティングセラム 30ml",
    title: "オーロラ ハイドレーティングセラム — 日本パートナー募集",
    makerName: "Northstar Beauty Co.",
    category: "美容・コスメ",
    brandName: "Aurora（オーロラ）",
    brandOverview:
      "Northstar Beauty Co. は、クリーンでクリニック寄りのスキンケアを展開する米国ブランドです。Aurora は保湿・バリアケアの主力セラムシリーズです。",
    productStrengths:
      "軽い使用感 · クリーン処方 · 米国小売での実績 · 英語/日本語の販売資料を用意可能",
    summary:
      "米国で実績のあるクリーン保湿セラム。日本の卸・専門店パートナーを募集しています。",
    description:
      "オーロラ ハイドレーティングセラムは、日本の気候や日常使いにも合う軽い仕上がりで、うるおいをキープします。\n\n敏感寄りな肌にも配慮した処方で、日焼け止めやメイクの下にも使いやすい一本です。専門美容店、百貨店、セレクト系ECなど、差別化できる海外ブランドを探す販路に適しています。",
    productFeatures:
      "• 30ml ガラスボトル（プレミアムドロッパー）\n• 低香料・クリーン処方\n• 米国ブティックでのリピート実績\n• 商品写真・紹介動画・英語ファクトシートあり\n• パートナー向けサンプル提供可",
    offer:
      "日本の販売パートナー向け卸販売\nMOQ：48本\n参考卸価格帯：¥3,000〜¥5,000\n独占：エリア条件つきで相談可\nサンプル：提供可\nIncoterms：FOB / CIF / DDP（応相談）",
    salesTerms:
      "支払い：銀行送金 / Wise（応相談）\nリードタイム：2〜4週間\nサポート：英語対応ブランドチーム（日本語はBrandBridge経由で調整可）",
    idealPartner:
      "スキンケアに強い専門店・百貨店・ECなど、日本での販売経験があるパートナー",
  });
}
