import { PRICE_BAND_QUOTE_REQUIRED, displayPriceBand } from "@/lib/price-display";

/**
 * Approximate FX for dual-currency wholesale display.
 * Stored product data remains JPY (or free text); USD is derived for overseas UI.
 */
export const APPROX_JPY_PER_USD = 150;

/** True when the band is already denominated in a non-JPY currency. */
export function isForeignCurrencyPriceBand(
  value: string | null | undefined,
): boolean {
  const t = value?.trim();
  if (!t) return false;
  if (/\b(USD|EUR|GBP|AUD|CAD|SGD|CNY|KRW|CHF|HKD)\b/i.test(t)) return true;
  if (/[\$€£]/.test(t) && !/円|¥/.test(t)) return true;
  return false;
}

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

  // Never treat overseas currency bands as JPY (e.g. "EUR 24–40", "USD 28–35").
  if (isForeignCurrencyPriceBand(t)) return null;

  // Require ¥ or 円 so bare "24–40" / "EUR 24–40" is not parsed as yen.
  const range = t.match(
    /(?:¥\s*([\d,]+)|([\d,]+)\s*円)\s*[〜～\-–—~]\s*(?:¥\s*([\d,]+)|([\d,]+)\s*円?)/u,
  );
  if (range) {
    const min = parseYenAmount(range[1] || range[2]);
    const max = parseYenAmount(range[3] || range[4]);
    if (min != null && max != null && max >= min) {
      return { type: "range", min, max };
    }
  }

  // "3,800〜5,200円（税別）" — yen mark only on the right side
  const rangeRightYen = t.match(
    /([\d,]+)\s*[〜～\-–—~]\s*([\d,]+)\s*円/u,
  );
  if (rangeRightYen) {
    const min = parseYenAmount(rangeRightYen[1]);
    const max = parseYenAmount(rangeRightYen[2]);
    if (min != null && max != null && max >= min) {
      return { type: "range", min, max };
    }
  }

  const plus = t.match(/(?:¥\s*([\d,]+)|([\d,]+)\s*円)\s*以上/u);
  if (plus) {
    const min = parseYenAmount(plus[1] || plus[2]);
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
  if (parseYenPriceBand(t)) return false;
  const normalized = displayPriceBand(t);
  return (
    normalized === PRICE_BAND_QUOTE_REQUIRED ||
    normalized === "見積条件あり" ||
    /quote\s*required/i.test(t) ||
    /見積/.test(t)
  );
}

/** JA listings: English "quote on request" text should not appear as-is. */
function isEnglishQuotePhrase(value: string): boolean {
  return (
    /quote/i.test(value) ||
    /on request/i.test(value) ||
    /on demand/i.test(value)
  );
}

function quoteLabelEn(value: string): string {
  if (/図面見積/.test(value)) return "Quotation based on drawings";
  if (/取引ごと/.test(value)) return "Negotiated per transaction";
  return "Quote required";
}

function formatJpyListingPrimary(range: YenRange): string {
  if (range.type === "range") {
    if (range.min === range.max) {
      return `JPY ${range.min.toLocaleString("en-US")}`;
    }
    return `JPY ${range.min.toLocaleString("en-US")}–${range.max.toLocaleString("en-US")}`;
  }
  return `JPY ${range.min.toLocaleString("en-US")}+`;
}

/**
 * Resolve dual-currency wholesale display from existing priceBand text.
 * Does not mutate stored data. Unparseable / quote → single safe line.
 */
export function resolveWholesalePriceDisplay(
  priceBand: string | null | undefined,
  locale: WholesalePriceLocale,
): WholesalePriceResolved {
  const rawBand = priceBand?.trim() ?? "";

  if (locale === "en" && isForeignCurrencyPriceBand(rawBand)) {
    return {
      kind: "single",
      primary: rawBand
        .replace(/（FOB相談）/g, " (FOB negotiable)")
        .replace(/\(FOB相談\)/g, " (FOB negotiable)")
        .replace(/FOB相談/g, "FOB negotiable")
        .replace(/（税別）/g, " (excluding tax)")
        .replace(/応相談/g, "negotiable")
        .replace(/[〜～]/g, "–")
        .replace(/\s+/g, " ")
        .trim(),
    };
  }

  if (isQuoteRequired(priceBand)) {
    return {
      kind: "single",
      primary:
        locale === "en" ? quoteLabelEn(rawBand) : PRICE_BAND_QUOTE_REQUIRED,
    };
  }

  if (
    locale === "ja" &&
    isEnglishQuotePhrase(rawBand) &&
    !parseYenPriceBand(rawBand) &&
    !isForeignCurrencyPriceBand(rawBand)
  ) {
    return {
      kind: "single",
      primary: PRICE_BAND_QUOTE_REQUIRED,
    };
  }

  const yen = parseYenPriceBand(priceBand);
  if (!yen) {
    const raw = displayPriceBand(priceBand);
    if (locale === "en") {
      return {
        kind: "single",
        primary: raw
          .replace(/（税別）/g, " (excluding tax)")
          .replace(/円/g, "")
          .replace(/以上/g, "+")
          .replace(/[〜～]/g, "–")
          .trim(),
      };
    }
    return { kind: "single", primary: raw };
  }

  const taxSuffixJa = /税/.test(priceBand ?? "") ? "（税別）" : "";
  const taxSuffixEn = /税/.test(priceBand ?? "") ? " (excluding tax)" : "";

  if (locale === "en") {
    return {
      kind: "dual",
      primary: `${formatJpyListingPrimary(yen)}${taxSuffixEn}`,
      secondary: formatUsdApprox(yen).replace(/^約\s*/, "Approx. "),
    };
  }

  return {
    kind: "dual",
    primary: `${formatYenPrimary(yen)}${taxSuffixJa}`,
    secondary: formatUsdApprox(yen),
  };
}

