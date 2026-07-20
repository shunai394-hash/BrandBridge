/**
 * Reference wholesale price band + availability helpers for partner-facing UI.
 */

export const PRICE_BAND_QUOTE_REQUIRED = "見積条件あり";

/** Preset bands for forms (select). Empty form value also displays as 見積条件あり. */
export const priceBandPresets = [
  "¥3,000〜¥5,000",
  "¥8,000〜¥12,000",
  "¥50,000以上",
  PRICE_BAND_QUOTE_REQUIRED,
] as const;

export type PriceBandPreset = (typeof priceBandPresets)[number];

export const PRICE_BAND_CUSTOM = "__custom__";

export type PriceConditionCode = "fixed" | "quote";

export const priceConditionOptions: {
  value: PriceConditionCode | "";
  label: string;
}[] = [
  { value: "", label: "未設定" },
  { value: "fixed", label: "固定価格" },
  { value: "quote", label: "見積条件あり" },
];

export type AvailabilityOption = "yes" | "no" | "negotiable";

export const availabilityOptions: {
  value: AvailabilityOption | "";
  label: string;
}[] = [
  { value: "", label: "未設定" },
  { value: "yes", label: "可" },
  { value: "no", label: "不可" },
  { value: "negotiable", label: "応相談" },
];

/** MOQ filter presets for /cases */
export const moqFilterPresets = [
  "すべて",
  "応相談",
  "1〜49",
  "50〜99",
  "100〜499",
  "500以上",
] as const;

export function displayPriceBand(
  value: string | null | undefined,
): string {
  const trimmed = value?.trim();
  if (!trimmed) return PRICE_BAND_QUOTE_REQUIRED;
  return trimmed;
}

export function displayMoq(value: string | null | undefined): string {
  const trimmed = value?.trim();
  if (!trimmed) return "応相談";
  return trimmed;
}

export function displayAvailability(
  value: string | null | undefined,
): string {
  if (value === "yes") return "可";
  if (value === "no") return "不可";
  if (value === "negotiable") return "応相談";
  return "未設定";
}

export function displayPriceCondition(
  value: string | null | undefined,
): string {
  if (value === "fixed") return "固定価格";
  if (value === "quote") return "見積条件あり";
  const t = value?.trim();
  if (!t) return "未設定";
  return t;
}

export function normalizeAvailability(
  value: unknown,
): AvailabilityOption | "" {
  const v = typeof value === "string" ? value.trim() : "";
  if (v === "yes" || v === "no" || v === "negotiable") return v;
  return "";
}

export function normalizePriceCondition(
  value: unknown,
): PriceConditionCode | "" {
  const v = typeof value === "string" ? value.trim() : "";
  if (v === "fixed" || v === "quote") return v;
  if (/見積|quote/i.test(v)) return "quote";
  if (/固定|fixed/i.test(v)) return "fixed";
  return "";
}

/** Whether a stored priceBand matches a preset (for select UI). */
export function priceBandSelectValue(stored: string): string {
  const t = stored.trim();
  if (!t) return PRICE_BAND_QUOTE_REQUIRED;
  if ((priceBandPresets as readonly string[]).includes(t)) return t;
  return PRICE_BAND_CUSTOM;
}

/**
 * Best-effort MOQ numeric parse for filter buckets.
 * Returns null when unparseable (treated as 応相談).
 */
export function parseMoqNumber(value: string | null | undefined): number | null {
  const t = value?.trim();
  if (!t) return null;
  const m = t.replace(/,/g, "").match(/(\d+)/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
}

export function matchesMoqFilter(
  minOrder: string | null | undefined,
  filter: string,
): boolean {
  if (!filter || filter === "すべて") return true;
  const n = parseMoqNumber(minOrder);
  if (filter === "応相談") return n == null;
  if (filter === "1〜49") return n != null && n >= 1 && n <= 49;
  if (filter === "50〜99") return n != null && n >= 50 && n <= 99;
  if (filter === "100〜499") return n != null && n >= 100 && n <= 499;
  if (filter === "500以上") return n != null && n >= 500;
  return true;
}
