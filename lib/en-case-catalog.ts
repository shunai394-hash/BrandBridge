/**
 * Temporary English catalog copy for /en/cases (no DB columns).
 * Lookup order: case id → SKU → exact Japanese product name.
 */

export type EnCaseCatalogEntry = {
  productName: string;
  /** Short blurb for cards */
  summary: string;
  /** Longer text for detail “About this product” */
  description: string;
  features?: string;
};

/** Demo seed IDs / SKUs / Japanese product names → English catalog copy */
export const EN_CASE_CATALOG: Record<string, EnCaseCatalogEntry> = {
  // --- by case id ---
  "c0000001-0000-4000-8000-000000000001": {
    productName: "Aoba Moisture Lotion",
    summary:
      "Sensitive-skin toner for specialty retail and beauty e-commerce partners in Japan.",
    description:
      "A plant-based toner series manufactured in a domestic GMP facility, known for high repurchase rates. In-store fixtures and promotional kits are available.",
    features: "Fragrance-free, alcohol-free, tested for sensitive skin",
  },
  "c0000002-0000-4000-8000-000000000002": {
    productName: "Aoba Lip Balm SPF",
    summary:
      "Moisturizing lip balm seeking overseas agents. English packaging ready.",
    description:
      "Lip balm formulated for hot and humid climates with Halal-compliant ingredients, designed for ASEAN markets.",
    features: "SPF formula, travel size, English/Thai packaging",
  },
  "c0000003-0000-4000-8000-000000000003": {
    productName: "Aoba Men's Trial Set",
    summary:
      "Men’s cleanser, toner, and emulsion set for variety retail and gift channels.",
    description:
      "A simple three-step men’s skincare set in gift-ready packaging, suited for variety stores and hotel amenities.",
    features: "Complete 3-step routine, travel sizes available",
  },
  "c0000004-0000-4000-8000-000000000004": {
    productName: "Kita no Megumi Soup Curry",
    summary:
      "Hokkaido-style retort soup curry seeking mass-retail partners nationwide.",
    description:
      "Sapporo-origin soup curry adapted for home cooking. Start with medium and mild SKUs. Event staffing and tasting samples available.",
    features: "Hokkaido vegetables, 1-year ambient shelf life",
  },
  "c0000005-0000-4000-8000-000000000005": {
    productName: "Kita no Megumi Ginger Syrup",
    summary:
      "Craft ginger syrup for cafés and bakeries. Dilutable format.",
    description:
      "Additive-free ginger syrup with recipe cards for sparkling and hot drinks. Glassware lending available for partners.",
    features: "Approx. 20 servings per bottle, 200ml glass",
  },
  "c0000006-0000-4000-8000-000000000006": {
    productName: "Kita no Megumi Tea Gift",
    summary:
      "Premium tea tins for gift and catalog channels, with seasonal flavors.",
    description:
      "Direct-import leaf blends in premium gift formats for Mother’s Day and year-end seasons.",
    features: "Tin, tea bag, or loose-leaf options",
  },
  "c0000007-0000-4000-8000-000000000007": {
    productName: "Protein Bar OEM",
    summary:
      "In-house protein bar OEM with small-lot flexibility.",
    description:
      "High-protein, low-sugar bar OEM with private-label launch support. Formulation consulting and trial runs available.",
    features: "15g protein per bar, allergen labeling support",
  },
  "c0000008-0000-4000-8000-000000000008": {
    productName: "Aoba Plant Vitamin",
    summary:
      "Plant-based vitamin supplement for natural retail and pharmacies.",
    description:
      "Supplement without synthetic colors. Counseling materials and subscription funnels are ready for partners.",
    features: "60 capsules, vegetarian capsule",
  },
  "c0000009-0000-4000-8000-000000000009": {
    productName: "Atelier Cotton Kids",
    summary:
      "Organic cotton apparel for babies and kids—select shops welcome.",
    description:
      "Soft GOTS-certified organic cotton children’s wear with size runs and gift wrapping.",
    features: "GOTS fabric, sewn in Japan",
  },
  "c0000010-0000-4000-8000-000000000010": {
    productName: "Atelier Work Socks",
    summary:
      "Antimicrobial work socks for uniform and corporate channels.",
    description:
      "Cushioned functional socks for standing work, with industry-specific sales materials.",
    features: "Antimicrobial & odor control, support knit",
  },
  "c0000011-0000-4000-8000-000000000011": {
    productName: "Techwear GlowBulb",
    summary:
      "App-connected smart LED bulb for mass retail and home centers.",
    description:
      "Voice-assistant compatible LED bulb with an easy starter kit for partners.",
    features: "Wi-Fi, dimming & color, Alexa compatible",
  },
  "c0000012-0000-4000-8000-000000000012": {
    productName: "Techwear DeskLift",
    summary:
      "Aluminum laptop stand seeking Amazon/Rakuten-focused partners.",
    description:
      "Lightweight foldable laptop stand with co-marketing playbooks for review acquisition.",
    features: "Height adjustable, cable pass-through",
  },
  "c0000013-0000-4000-8000-000000000013": {
    productName: "Techwear TempBand",
    summary:
      "Continuous wearable thermometer for pharmacy and clinic channels.",
    description:
      "Wearable thermometer for families with app sharing and continuous measurement.",
    features: "Continuous reading, app alerts, rechargeable",
  },
  "c0000014-0000-4000-8000-000000000014": {
    productName: "Techwear PowerGo 20K",
    summary:
      "PSE/UL power bank seeking North America wholesale partners.",
    description:
      "High-capacity cabin-compatible power bank with English packaging and manuals.",
    features: "20000mAh, PD, UL certified",
  },
  "c0000015-0000-4000-8000-000000000015": {
    productName: "Atelier Washi Notebook",
    summary:
      "Kyoto washi stationery for select and museum retail.",
    description:
      "Stationery blending traditional craft and modern design—also suited to tourist gift shops.",
    features: "Tactile paper, foil-stamp options",
  },
  "c0000016-0000-4000-8000-000000000016": {
    productName: "Atelier Soy Candle",
    summary:
      "Domestic soy-wax aroma candles for lifestyle retailers.",
    description:
      "Plant-based wax and essential-oil blends with scent sample kits for partners.",
    features: "Approx. 30-hour burn, glass vessel",
  },
  "c0000017-0000-4000-8000-000000000017": {
    productName: "Atelier Kitchen Minimal",
    summary:
      "Stainless minimal kitchen tools seeking EU agents.",
    description:
      "Durable stainless kitchen tool sets with CE marking for European lifestyle wholesale.",
    features: "Dishwasher safe, gift box",
  },
  "c0000018-0000-4000-8000-000000000018": {
    productName: "IPJ FineFilter Series",
    summary:
      "Industrial machine filter consumables for maintenance and trading partners.",
    description:
      "Durable compatible filters with cross-reference charts and replacement guides.",
    features: "Major-brand compatible, shorter lead times",
  },
  "c0000019-0000-4000-8000-000000000019": {
    productName: "IPJ CutGuard Glove",
    summary:
      "Cut-resistant safety gloves for national safety-goods wholesale.",
    description:
      "Lightweight high cut-resistance gloves with size runs and color coding.",
    features: "EN-equivalent rating, touchscreen compatible",
  },
  "c0000020-0000-4000-8000-000000000020": {
    productName: "IPJ Custom Metal Parts",
    summary:
      "Small-lot metal fabrication seeking overseas sales partners.",
    description:
      "Prototype-to-mid-volume metal parts with English quotation and lead-time workflows.",
    features: "CNC / sheet metal, ISO9001 factory",
  },

  // --- by SKU ---
  "HYC-0001": {
    productName: "Aoba Moisture Lotion",
    summary:
      "Sensitive-skin toner for specialty retail and beauty e-commerce partners in Japan.",
    description:
      "A plant-based toner series manufactured in a domestic GMP facility, known for high repurchase rates. In-store fixtures and promotional kits are available.",
    features: "Fragrance-free, alcohol-free, tested for sensitive skin",
  },
  "AOB-0002": {
    productName: "Aoba Lip Balm SPF",
    summary:
      "Moisturizing lip balm seeking overseas agents. English packaging ready.",
    description:
      "Lip balm formulated for hot and humid climates with Halal-compliant ingredients, designed for ASEAN markets.",
    features: "SPF formula, travel size, English/Thai packaging",
  },
  "AOB-0003": {
    productName: "Aoba Men's Trial Set",
    summary:
      "Men’s cleanser, toner, and emulsion set for variety retail and gift channels.",
    description:
      "A simple three-step men’s skincare set in gift-ready packaging, suited for variety stores and hotel amenities.",
    features: "Complete 3-step routine, travel sizes available",
  },
  "HYC-0002": {
    productName: "Kita no Megumi Soup Curry",
    summary:
      "Hokkaido-style retort soup curry seeking mass-retail partners nationwide.",
    description:
      "Sapporo-origin soup curry adapted for home cooking. Start with medium and mild SKUs.",
    features: "Hokkaido vegetables, 1-year ambient shelf life",
  },
  "KTM-0005": {
    productName: "Kita no Megumi Ginger Syrup",
    summary:
      "Craft ginger syrup for cafés and bakeries. Dilutable format.",
    description:
      "Additive-free ginger syrup with recipe cards for sparkling and hot drinks.",
    features: "Approx. 20 servings per bottle, 200ml glass",
  },
  "KTM-0006": {
    productName: "Kita no Megumi Tea Gift",
    summary:
      "Premium tea tins for gift and catalog channels, with seasonal flavors.",
    description:
      "Direct-import leaf blends in premium gift formats for seasonal campaigns.",
    features: "Tin, tea bag, or loose-leaf options",
  },
  "HLH-0007": {
    productName: "Protein Bar OEM",
    summary: "In-house protein bar OEM with small-lot flexibility.",
    description:
      "High-protein, low-sugar bar OEM with private-label launch support.",
    features: "15g protein per bar, allergen labeling support",
  },
  "AOB-0008": {
    productName: "Aoba Plant Vitamin",
    summary:
      "Plant-based vitamin supplement for natural retail and pharmacies.",
    description:
      "Supplement without synthetic colors. Counseling materials ready for partners.",
    features: "60 capsules, vegetarian capsule",
  },
  "ATL-0009": {
    productName: "Atelier Cotton Kids",
    summary:
      "Organic cotton apparel for babies and kids—select shops welcome.",
    description:
      "Soft GOTS-certified organic cotton children’s wear with gift wrapping.",
    features: "GOTS fabric, sewn in Japan",
  },
  "ATL-0010": {
    productName: "Atelier Work Socks",
    summary:
      "Antimicrobial work socks for uniform and corporate channels.",
    description:
      "Cushioned functional socks for standing work, with industry sales materials.",
    features: "Antimicrobial & odor control, support knit",
  },
  "HYC-0003": {
    productName: "Techwear GlowBulb",
    summary:
      "App-connected smart LED bulb for mass retail and home centers.",
    description:
      "Voice-assistant compatible LED bulb with an easy starter kit.",
    features: "Wi-Fi, dimming & color, Alexa compatible",
  },
  "TEC-0012": {
    productName: "Techwear DeskLift",
    summary:
      "Aluminum laptop stand seeking Amazon/Rakuten-focused partners.",
    description:
      "Lightweight foldable laptop stand with co-marketing playbooks.",
    features: "Height adjustable, cable pass-through",
  },
  "TEC-0013": {
    productName: "Techwear TempBand",
    summary:
      "Continuous wearable thermometer for pharmacy and clinic channels.",
    description:
      "Wearable thermometer for families with app sharing.",
    features: "Continuous reading, app alerts, rechargeable",
  },
  "TEC-0014": {
    productName: "Techwear PowerGo 20K",
    summary:
      "PSE/UL power bank seeking North America wholesale partners.",
    description:
      "High-capacity cabin-compatible power bank with English packaging.",
    features: "20000mAh, PD, UL certified",
  },
  "ATL-0015": {
    productName: "Atelier Washi Notebook",
    summary: "Kyoto washi stationery for select and museum retail.",
    description:
      "Stationery blending traditional craft and modern design.",
    features: "Tactile paper, foil-stamp options",
  },
  "ATL-0016": {
    productName: "Atelier Soy Candle",
    summary: "Domestic soy-wax aroma candles for lifestyle retailers.",
    description:
      "Plant-based wax and essential-oil blends with scent sample kits.",
    features: "Approx. 30-hour burn, glass vessel",
  },
  "ATL-0017": {
    productName: "Atelier Kitchen Minimal",
    summary: "Stainless minimal kitchen tools seeking EU agents.",
    description:
      "Durable stainless kitchen tool sets with CE marking.",
    features: "Dishwasher safe, gift box",
  },
  "IPJ-0018": {
    productName: "IPJ FineFilter Series",
    summary:
      "Industrial machine filter consumables for maintenance partners.",
    description:
      "Durable compatible filters with cross-reference charts.",
    features: "Major-brand compatible, shorter lead times",
  },
  "IPJ-0019": {
    productName: "IPJ CutGuard Glove",
    summary:
      "Cut-resistant safety gloves for national safety-goods wholesale.",
    description: "Lightweight high cut-resistance gloves with size runs.",
    features: "EN-equivalent rating, touchscreen compatible",
  },
  "IPJ-0020": {
    productName: "IPJ Custom Metal Parts",
    summary:
      "Small-lot metal fabrication seeking overseas sales partners.",
    description:
      "Prototype-to-mid-volume metal parts with English quotation workflows.",
    features: "CNC / sheet metal, ISO9001 factory",
  },

  // --- by Japanese product name ---
  アオバモイスチャーローション: {
    productName: "Aoba Moisture Lotion",
    summary:
      "Sensitive-skin toner for specialty retail and beauty e-commerce partners in Japan.",
    description:
      "A plant-based toner series manufactured in a domestic GMP facility, known for high repurchase rates.",
    features: "Fragrance-free, alcohol-free, tested for sensitive skin",
  },
  "アオバリップバーム SPF": {
    productName: "Aoba Lip Balm SPF",
    summary:
      "Moisturizing lip balm seeking overseas agents. English packaging ready.",
    description:
      "Lip balm formulated for hot and humid climates with Halal-compliant ingredients.",
    features: "SPF formula, travel size, English/Thai packaging",
  },
  アオバメンズトライアルセット: {
    productName: "Aoba Men's Trial Set",
    summary:
      "Men’s cleanser, toner, and emulsion set for variety retail and gift channels.",
    description:
      "A simple three-step men’s skincare set in gift-ready packaging.",
    features: "Complete 3-step routine, travel sizes available",
  },
  北の恵みスープカレー: {
    productName: "Kita no Megumi Soup Curry",
    summary:
      "Hokkaido-style retort soup curry seeking mass-retail partners nationwide.",
    description:
      "Sapporo-origin soup curry adapted for home cooking.",
    features: "Hokkaido vegetables, 1-year ambient shelf life",
  },
  北の恵みジンジャーシロップ: {
    productName: "Kita no Megumi Ginger Syrup",
    summary:
      "Craft ginger syrup for cafés and bakeries. Dilutable format.",
    description: "Additive-free ginger syrup with recipe cards.",
    features: "Approx. 20 servings per bottle, 200ml glass",
  },
  北の恵みティーギフト: {
    productName: "Kita no Megumi Tea Gift",
    summary:
      "Premium tea tins for gift and catalog channels, with seasonal flavors.",
    description: "Direct-import leaf blends in premium gift formats.",
    features: "Tin, tea bag, or loose-leaf options",
  },
  プロテインバーOEM: {
    productName: "Protein Bar OEM",
    summary: "In-house protein bar OEM with small-lot flexibility.",
    description:
      "High-protein, low-sugar bar OEM with private-label launch support.",
    features: "15g protein per bar, allergen labeling support",
  },
  アオバプラントビタミン: {
    productName: "Aoba Plant Vitamin",
    summary:
      "Plant-based vitamin supplement for natural retail and pharmacies.",
    description: "Supplement without synthetic colors.",
    features: "60 capsules, vegetarian capsule",
  },
  アトリエコットンキッズ: {
    productName: "Atelier Cotton Kids",
    summary:
      "Organic cotton apparel for babies and kids—select shops welcome.",
    description: "Soft GOTS-certified organic cotton children’s wear.",
    features: "GOTS fabric, sewn in Japan",
  },
  アトリエワークソックス: {
    productName: "Atelier Work Socks",
    summary:
      "Antimicrobial work socks for uniform and corporate channels.",
    description: "Cushioned functional socks for standing work.",
    features: "Antimicrobial & odor control, support knit",
  },
  "テックウェア GlowBulb": {
    productName: "Techwear GlowBulb",
    summary:
      "App-connected smart LED bulb for mass retail and home centers.",
    description: "Voice-assistant compatible LED bulb with starter kit.",
    features: "Wi-Fi, dimming & color, Alexa compatible",
  },
  "テックウェア DeskLift": {
    productName: "Techwear DeskLift",
    summary:
      "Aluminum laptop stand seeking Amazon/Rakuten-focused partners.",
    description: "Lightweight foldable laptop stand.",
    features: "Height adjustable, cable pass-through",
  },
  "テックウェア TempBand": {
    productName: "Techwear TempBand",
    summary:
      "Continuous wearable thermometer for pharmacy and clinic channels.",
    description: "Wearable thermometer for families with app sharing.",
    features: "Continuous reading, app alerts, rechargeable",
  },
  "テックウェア PowerGo 20K": {
    productName: "Techwear PowerGo 20K",
    summary:
      "PSE/UL power bank seeking North America wholesale partners.",
    description: "High-capacity cabin-compatible power bank.",
    features: "20000mAh, PD, UL certified",
  },
  アトリエ和紙ノート: {
    productName: "Atelier Washi Notebook",
    summary: "Kyoto washi stationery for select and museum retail.",
    description:
      "Stationery blending traditional craft and modern design.",
    features: "Tactile paper, foil-stamp options",
  },
  アトリエソイキャンドル: {
    productName: "Atelier Soy Candle",
    summary: "Domestic soy-wax aroma candles for lifestyle retailers.",
    description: "Plant-based wax and essential-oil blends.",
    features: "Approx. 30-hour burn, glass vessel",
  },
  アトリエキッチンミニマル: {
    productName: "Atelier Kitchen Minimal",
    summary: "Stainless minimal kitchen tools seeking EU agents.",
    description: "Durable stainless kitchen tool sets with CE marking.",
    features: "Dishwasher safe, gift box",
  },
};

export const EN_CATEGORY_LABELS: Record<string, string> = {
  "美容・コスメ": "Beauty & Cosmetics",
  "食品・飲料": "Food & Beverage",
  "健康・サプリ": "Health & Supplements",
  ファッション: "Fashion",
  "家電・ガジェット": "Electronics & Gadgets",
  "雑貨・ライフスタイル": "Lifestyle & Goods",
  "製造・産業": "Manufacturing & Industrial",
  その他: "Other",
};

const JP_SCRIPT = /[\u3040-\u30ff\u3400-\u9fff]/;

export function looksLikeJapanese(text: string | null | undefined): boolean {
  return Boolean(text && JP_SCRIPT.test(text));
}

export function lookupEnCaseCatalog(input: {
  id?: string | null;
  sku?: string | null;
  productName?: string | null;
}): EnCaseCatalogEntry | null {
  const id = input.id?.trim();
  if (id && EN_CASE_CATALOG[id]) return EN_CASE_CATALOG[id];

  const sku = input.sku?.trim();
  if (sku && EN_CASE_CATALOG[sku]) return EN_CASE_CATALOG[sku];

  const name = input.productName?.trim();
  if (name && EN_CASE_CATALOG[name]) return EN_CASE_CATALOG[name];

  return null;
}

export function enCategoryLabel(category: string | null | undefined): string {
  const c = category?.trim() || "";
  if (!c) return "—";
  return EN_CATEGORY_LABELS[c] ?? c;
}

export type EnCatalogDisplay = {
  productName: string;
  summary: string;
  description: string;
  features: string | null;
  category: string;
};

import { ENGLISH_CASE_MARKER } from "@/lib/inquiry-language";

function stripEnMarkers(text: string): string {
  return text
    .replace(new RegExp(`${ENGLISH_CASE_MARKER.replace(/[[\]]/g, "\\$&")}\\s*`, "g"), "")
    .replace(/^Country of Origin:\s*.+$/gim, "")
    .replace(/^Brand:\s*.+$/gim, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Resolve English catalog fields for list/detail (map first, then non-JP original). */
export function resolveEnCatalogDisplay(input: {
  id: string;
  sku?: string | null;
  productName: string;
  category: string;
  summary: string;
  description?: string | null;
  productFeatures?: string | null;
}): EnCatalogDisplay {
  const mapped = lookupEnCaseCatalog(input);
  const category = enCategoryLabel(input.category);

  if (mapped) {
    return {
      productName: mapped.productName,
      summary: mapped.summary,
      description: mapped.description,
      features: mapped.features?.trim() || null,
      category,
    };
  }

  const productName = looksLikeJapanese(input.productName)
    ? "BrandBridge Product Listing"
    : input.productName.trim() || "BrandBridge Product";

  const rawSummary = stripEnMarkers(input.summary?.trim() || "");
  const summary = looksLikeJapanese(rawSummary)
    ? "Product details are available in Japanese. Contact BrandBridge for an English briefing."
    : rawSummary ||
      "Explore this listing and contact BrandBridge to learn more.";

  const rawDescription = stripEnMarkers(
    input.description?.trim() || input.summary?.trim() || "",
  );
  const description = looksLikeJapanese(rawDescription)
    ? "A full Japanese product description is on file. Contact BrandBridge for English details, samples, and partner terms."
    : rawDescription ||
      "Product description is not available yet. Contact BrandBridge for details.";

  const rawFeatures = input.productFeatures?.trim() || "";
  const features =
    rawFeatures && !looksLikeJapanese(rawFeatures) ? rawFeatures : null;

  return { productName, summary, description, features, category };
}
