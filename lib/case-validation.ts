import type { CaseCreateInput, SalesFormat, TargetCountry } from "@/lib/types";
import { salesFormatOptions, targetCountryOptions } from "@/lib/types";
import {
  normalizeAvailability,
  normalizePriceCondition,
} from "@/lib/price-display";

/** Soft app-level limits (DB columns are unbounded `text`). */
export const CASE_TEXT_LIMITS = {
  title: 200,
  /** Listing card / table blurb — keep short */
  summary: 280,
  description: 10000,
  /** Maker-managed SKU (not a platform product ID) */
  sku: 50,
  productName: 200,
  productFeatures: 5000,
  idealPartner: 5000,
  offer: 5000,
  salesTerms: 5000,
  partnerChannels: 1000,
  partnerRequirements: 5000,
  priceBand: 200,
  wholesalePrice: 200,
  priceConditions: 50,
  lotPricing: 2000,
  minOrder: 200,
  minOrderAmount: 200,
  suggestedRetailPrice: 200,
} as const;

/** Allowed: ASCII letters, digits, hyphen, underscore */
const SKU_PATTERN = /^[A-Za-z0-9_-]+$/;

const salesFormats = new Set(salesFormatOptions.map((o) => o.value));
const targetCountries = new Set(targetCountryOptions.map((o) => o.value));

function asText(value: unknown): string {
  if (typeof value === "string") return value;
  if (value == null) return "";
  return String(value);
}

/** Trim SKU; empty → "" for form state. */
export function normalizeSkuInput(value: unknown): string {
  return asText(value).trim();
}

/** Empty string → null for DB storage. */
export function skuForDb(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** Coerce server-action payload so .trim() never throws. */
export function normalizeCaseCreateInput(
  input: CaseCreateInput,
): CaseCreateInput {
  return {
    title: asText(input.title),
    category: asText(input.category),
    region: asText(input.region),
    summary: asText(input.summary),
    description: asText(input.description),
    idealPartner: asText(input.idealPartner),
    offer: asText(input.offer),
    sku: normalizeSkuInput(input.sku),
    productName: asText(input.productName),
    productFeatures: asText(input.productFeatures),
    priceBand: asText(input.priceBand),
    wholesalePrice: asText(input.wholesalePrice),
    priceConditions: normalizePriceCondition(input.priceConditions),
    lotPricing: asText(input.lotPricing),
    salesFormat: asText(input.salesFormat) as SalesFormat,
    salesTerms: asText(input.salesTerms),
    minOrder: asText(input.minOrder),
    minOrderAmount: asText(input.minOrderAmount),
    suggestedRetailPrice: asText(input.suggestedRetailPrice),
    sampleAvailable: normalizeAvailability(input.sampleAvailable),
    testSaleAvailable: normalizeAvailability(input.testSaleAvailable),
    isExclusive: Boolean(input.isExclusive),
    targetCountry: asText(input.targetCountry) as TargetCountry,
    partnerChannels: asText(input.partnerChannels),
    partnerRequirements: asText(input.partnerRequirements),
    productImageUrl:
      input.productImageUrl == null
        ? null
        : asText(input.productImageUrl).trim() || null,
  };
}

export function validateCaseCreateInput(
  input: CaseCreateInput,
): string | null {
  const n = normalizeCaseCreateInput(input);

  if (!n.title.trim()) return "商品名を入力してください";
  if (!n.productName.trim()) return "商品名を入力してください";
  if (!n.summary.trim()) return "一覧用サマリーを入力してください";
  if (!n.description.trim()) return "商品説明を入力してください";
  if (!n.idealPartner.trim()) return "求めるパートナー像を入力してください";
  if (!n.offer.trim()) return "商品提供企業の提供条件を入力してください";
  if (!n.category.trim()) return "カテゴリを選択してください";
  if (!n.region.trim()) return "募集エリアを選択してください";

  if (!salesFormats.has(n.salesFormat)) {
    return `販売形式が不正です: ${n.salesFormat}`;
  }
  if (!targetCountries.has(n.targetCountry)) {
    return `対象国が不正です: ${n.targetCountry}`;
  }
  if (
    n.priceConditions &&
    n.priceConditions !== "fixed" &&
    n.priceConditions !== "quote"
  ) {
    return "価格条件は「固定価格」または「見積条件あり」を選択してください";
  }

  if (n.sku.length > CASE_TEXT_LIMITS.sku) {
    return `商品コード（SKU）は${CASE_TEXT_LIMITS.sku}文字以内にしてください`;
  }
  if (n.sku && !SKU_PATTERN.test(n.sku)) {
    return "商品コード（SKU）は英数字・ハイフン・アンダースコアのみ使用できます";
  }

  if (n.title.length > CASE_TEXT_LIMITS.title) {
    return `商品名は${CASE_TEXT_LIMITS.title}文字以内にしてください`;
  }
  if (n.summary.length > CASE_TEXT_LIMITS.summary) {
    return `一覧用サマリーは${CASE_TEXT_LIMITS.summary}文字以内の短文にしてください`;
  }
  if (n.description.length > CASE_TEXT_LIMITS.description) {
    return `商品説明は${CASE_TEXT_LIMITS.description}文字以内にしてください`;
  }
  if (n.productName.length > CASE_TEXT_LIMITS.productName) {
    return `商品名は${CASE_TEXT_LIMITS.productName}文字以内にしてください`;
  }
  if (n.productFeatures.length > CASE_TEXT_LIMITS.productFeatures) {
    return `商品特徴は${CASE_TEXT_LIMITS.productFeatures}文字以内にしてください`;
  }
  if (n.priceBand.length > CASE_TEXT_LIMITS.priceBand) {
    return `参考卸価格帯は${CASE_TEXT_LIMITS.priceBand}文字以内にしてください`;
  }
  if (n.wholesalePrice.length > CASE_TEXT_LIMITS.wholesalePrice) {
    return `正確な卸価格は${CASE_TEXT_LIMITS.wholesalePrice}文字以内にしてください`;
  }
  if (n.lotPricing.length > CASE_TEXT_LIMITS.lotPricing) {
    return `ロット別価格は${CASE_TEXT_LIMITS.lotPricing}文字以内にしてください`;
  }
  if (n.minOrder.length > CASE_TEXT_LIMITS.minOrder) {
    return `MOQは${CASE_TEXT_LIMITS.minOrder}文字以内にしてください`;
  }
  if (n.minOrderAmount.length > CASE_TEXT_LIMITS.minOrderAmount) {
    return `最小発注金額は${CASE_TEXT_LIMITS.minOrderAmount}文字以内にしてください`;
  }
  if (n.suggestedRetailPrice.length > CASE_TEXT_LIMITS.suggestedRetailPrice) {
    return `希望小売価格は${CASE_TEXT_LIMITS.suggestedRetailPrice}文字以内にしてください`;
  }

  return null;
}

export function formatSupabaseError(
  prefix: string,
  error: {
    message?: string;
    code?: string;
    details?: string;
    hint?: string;
  } | null,
): string {
  if (!error?.message) return prefix;
  const parts = [
    prefix,
    error.message,
    error.code ? `code=${error.code}` : null,
    error.details || null,
    error.hint || null,
  ].filter(Boolean);
  return parts.join(" / ");
}
