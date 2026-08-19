export type PrVideoEngine = "brandbridge" | "moneyprinterturbo";

export type PrVideoGenerationMode = "manual" | "auto";

export function resolvePrVideoEngine(): PrVideoEngine {
  const raw = process.env.PR_VIDEO_ENGINE?.trim().toLowerCase();
  if (raw === "brandbridge") return "brandbridge";
  if (raw === "mpt") return "moneyprinterturbo";
  return "moneyprinterturbo";
}

export function parsePrVideoGenerationMode(
  value: unknown,
): PrVideoGenerationMode {
  const raw = String(value ?? "")
    .trim()
    .toLowerCase();
  if (raw === "auto" || raw === "automatic") return "auto";
  return "manual";
}

export type PrVideoProductContext = {
  productName: string;
  brandName?: string | null;
  category?: string | null;
  description?: string | null;
  country?: string | null;
  moq?: string | null;
  sellingPoint?: string | null;
  cta?: string | null;
};
