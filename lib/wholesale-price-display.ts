import { PRICE_BAND_QUOTE_REQUIRED, displayPriceBand } from "@/lib/price-display";

/**
 * Approximate FX for dual-currency wholesale display.
 * Stored product data remains JPY (or free text); USD is derived for overseas UI.
 */
export const APPROX_JPY_PER_USD = 150;

export type WholesalePriceLocale = "ja" | "en";

export type WholesalePriceResolved =
  | { kind: "single"; primary: string }
  | { kind: "dual"; primary: string; secondary: string };

type YenRange =
  | { type: "range"; min: number; max: number }
  | { type: "minPlus"; min: number };

function parseYenAmount(raw: string): number | null {
  const n = Number(raw.replace(/,/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Best-effort parse of JPY amounts from stored priceBand text. */
export function parseYenPriceBand(
  value: string | null | undefined,
): YenRange | null {
  const t = value?.trim();
  if (!t) return null;

  const range = t.match(
    /¥?\s*([\d,]+)\s*円?\s*[〜～\-–—~]\s*¥?\s*([\d,]+)\s*円?/u,
  );
  if (range) {
    const min = parseYenAmount(range[1]);
    const max = parseYenAmount(range[2]);
    if (min != null && max != null && max >= min) {
      return { type: "range", min, max };
    }
  }

  const plus = t.match(/¥?\s*([\d,]+)\s*円?\s*以上/u);
  if (plus) {
    const min = parseYenAmount(plus[1]);
    if (min != null) return { type: "minPlus", min };
  }

  const singleYenMark = t.match(/¥\s*([\d,]+)/u);
  if (singleYenMark) {
    const n = parseYenAmount(singleYenMark[1]);
    if (n != null) return { type: "range", min: n, max: n };
  }

  const singleYenKanji = t.match(/([\d,]+)\s*円/u);
  if (singleYenKanji) {
    const n = parseYenAmount(singleYenKanji[1]);
    if (n != null) return { type: "range", min: n, max: n };
  }

  return null;
}

function formatYen(n: number): string {
  return `¥${n.toLocaleString("en-US")}`;
}

/** Round USD to a friendly $5 step for range display (e.g. ¥5,000 → $35). */
function jpyToUsdApprox(jpy: number): number {
  const raw = jpy / APPROX_JPY_PER_USD;
  const stepped = Math.round(raw / 5) * 5;
  return Math.max(1, stepped);
}

function formatUsd(n: number): string {
  return `$${n.toLocaleString("en-US")}`;
}

function formatYenPrimary(range: YenRange): string {
  if (range.type === "range") {
    if (range.min === range.max) return formatYen(range.min);
    return `${formatYen(range.min)}–${formatYen(range.max)}`;
  }
  return `${formatYen(range.min)}以上`;
}

function formatUsdPrimary(range: YenRange): string {
  if (range.type === "range") {
    const min = jpyToUsdApprox(range.min);
    const max = jpyToUsdApprox(range.max);
    if (min === max) return `USD ${formatUsd(min)}`;
    return `USD ${formatUsd(min)}–${formatUsd(max)}`;
  }
  return `USD ${formatUsd(jpyToUsdApprox(range.min))}+`;
}

function formatYenApprox(range: YenRange): string {
  if (range.type === "range") {
    if (range.min === range.max) return `Approx. ${formatYen(range.min)}`;
    return `Approx. ${formatYen(range.min)}–${formatYen(range.max)}`;
  }
  return `Approx. ${formatYen(range.min)}+`;
}

function formatUsdApprox(range: YenRange): string {
  if (range.type === "range") {
    const min = jpyToUsdApprox(range.min);
    const max = jpyToUsdApprox(range.max);
    if (min === max) return `約 USD ${formatUsd(min)}`;
    return `約 USD ${formatUsd(min)}–${formatUsd(max)}`;
  }
  return `約 USD ${formatUsd(jpyToUsdApprox(range.min))}+`;
}

function isQuoteRequired(value: string | null | undefined): boolean {
  const t = value?.trim();
  if (!t) return true;
  const normalized = displayPriceBand(t);
  return (
    normalized === PRICE_BAND_QUOTE_REQUIRED ||
    normalized === "見積条件あり" ||
    /quote\s*required/i.test(t) ||
    /見積/.test(t)
  );
}

/**
 * Resolve dual-currency wholesale display from existing priceBand text.
 * Does not mutate stored data. Unparseable / quote → single safe line.
 */
export function resolveWholesalePriceDisplay(
  priceBand: string | null | undefined,
  locale: WholesalePriceLocale,
): WholesalePriceResolved {
  if (isQuoteRequired(priceBand)) {
    return {
      kind: "single",
      primary: locale === "en" ? "Quote required" : PRICE_BAND_QUOTE_REQUIRED,
    };
  }

  const yen = parseYenPriceBand(priceBand);
  if (!yen) {
    const raw = displayPriceBand(priceBand);
    if (locale === "en") {
      return {
        kind: "single",
        primary: raw
          .replace(/以上/g, "+")
          .replace(/[〜～]/g, "–"),
      };
    }
    return { kind: "single", primary: raw };
  }

  const taxSuffix = /税/.test(priceBand ?? "") ? "（税別）" : "";

  if (locale === "en") {
    return {
      kind: "dual",
      primary: formatUsdPrimary(yen),
      secondary: `${formatYenApprox(yen)}${taxSuffix ? " excl. tax" : ""}`,
    };
  }

  return {
    kind: "dual",
    primary: `${formatYenPrimary(yen)}${taxSuffix}`,
    secondary: formatUsdApprox(yen),
  };
}
