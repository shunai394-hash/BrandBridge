/**
 * Product detail enrichment: enums, labels, empty-safe display helpers.
 * Does not change TOP / list / header copy.
 */

export type TrademarkStatus = "registered" | "pending" | "unregistered";

export type ExclusiveDealOption =
  | "available"
  | "conditional"
  | "unavailable";

export const trademarkStatusOptions: {
  value: TrademarkStatus | "";
  label: string;
}[] = [
  { value: "", label: "未設定" },
  { value: "registered", label: "商標登録済み" },
  { value: "pending", label: "出願中" },
  { value: "unregistered", label: "未登録" },
];

export const exclusiveDealOptions: {
  value: ExclusiveDealOption | "";
  label: string;
}[] = [
  { value: "", label: "未設定" },
  { value: "available", label: "独占可能" },
  { value: "conditional", label: "条件付き可能" },
  { value: "unavailable", label: "不可" },
];

/** 商談情報向けサンプル表示（可能 / 条件付き / 不可） */
export function displaySampleDealLabel(
  value: string | null | undefined,
): string {
  if (value === "yes") return "可能";
  if (value === "negotiable") return "条件付き";
  if (value === "no") return "不可";
  return "—";
}

export function displayTrademarkStatus(
  value: string | null | undefined,
): string {
  if (value === "registered") return "商標登録済み";
  if (value === "pending") return "出願中";
  if (value === "unregistered") return "未登録";
  return "—";
}

export function displayExclusiveDealOption(
  value: string | null | undefined,
): string {
  if (value === "available") return "独占可能";
  if (value === "conditional") return "条件付き可能";
  if (value === "unavailable") return "不可";
  return "—";
}

export function displayOptionalText(
  value: string | null | undefined,
): string {
  const t = value?.trim();
  return t ? t : "—";
}

export function normalizeTrademarkStatus(value: unknown): string {
  const t = typeof value === "string" ? value.trim() : "";
  if (t === "registered" || t === "pending" || t === "unregistered") return t;
  return "";
}

export function normalizeExclusiveDealOption(value: unknown): string {
  const t = typeof value === "string" ? value.trim() : "";
  if (t === "available" || t === "conditional" || t === "unavailable") {
    return t;
  }
  return "";
}
