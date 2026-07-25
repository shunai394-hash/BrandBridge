import { parseYenPriceBand } from "@/lib/wholesale-price-display";

/**
 * English display helpers for /en/cases listing (and related EN surfaces).
 * Does not mutate stored Japanese product data.
 */

function formatJpyAmount(n: number): string {
  return n.toLocaleString("en-US");
}

/** Specific quote phrases before generic 見積 handling. */
function resolveQuoteLabelEn(value: string): string | null {
  const t = value.trim();
  if (!t) return "Quote required";
  if (/図面見積/.test(t)) return "Quotation based on drawings";
  if (/取引ごと/.test(t)) return "Negotiated per transaction";
  if (
    t === "見積条件あり" ||
    t === "要見積" ||
    /quote\s*required/i.test(t) ||
    (/見積/.test(t) && !parseYenPriceBand(t))
  ) {
    return "Quote required";
  }
  return null;
}

/**
 * Wholesale price band for English listing tables.
 * e.g. "3,800〜5,200円（税別）" → "JPY 3,800–5,200 (excluding tax)"
 */
export function formatWholesalePriceBandEn(
  value: string | null | undefined,
): string {
  const t = value?.trim();
  if (!t) return "Quote required";

  const quote = resolveQuoteLabelEn(t);
  if (quote) return quote;

  const yen = parseYenPriceBand(t);
  const excl = /税/.test(t) ? " (excluding tax)" : "";

  if (yen) {
    if (yen.type === "range") {
      if (yen.min === yen.max) {
        return `JPY ${formatJpyAmount(yen.min)}${excl}`;
      }
      return `JPY ${formatJpyAmount(yen.min)}–${formatJpyAmount(yen.max)}${excl}`;
    }
    return `JPY ${formatJpyAmount(yen.min)}+${excl}`;
  }

  return t
    .replace(/（税別）/g, " (excluding tax)")
    .replace(/\(税別\)/g, " (excluding tax)")
    .replace(/税別/g, "excluding tax")
    .replace(/円/g, "")
    .replace(/¥/g, "JPY ")
    .replace(/以上/g, "+")
    .replace(/[〜～]/g, "–")
    .replace(/\s+/g, " ")
    .replace(/^JPY\s+JPY\s+/i, "JPY ")
    .trim();
}

/**
 * MOQ for English listing tables.
 * e.g. "24個〜" → "24 units+"
 */
export function formatMoqEn(value: string | null | undefined): string {
  const t = value?.trim();
  if (!t || t === "応相談") return "Negotiable MOQ";
  if (/ロット応相談/.test(t)) return "Negotiable MOQ";
  if (/ダース単位/.test(t)) return "By dozen";

  let m = t.match(/SKUあたり\s*(\d+)\s*枚\s*[〜～\-–—~+＋]?/u);
  if (m) return `${m[1]} pcs per SKU+`;

  m = t.match(/ケース\s*(\d+)\s*本\s*[〜～\-–—~+＋]?/u);
  if (m) return `${m[1]} bottles/case+`;

  m = t.match(/段ボール\s*(\d+)\s*箱\s*[〜～\-–—~+＋]?/u);
  if (m) return `${m[1]} carton+`;

  m = t.match(/(\d+)\s*個\s*[〜～\-–—~+＋]?/u);
  if (m) return `${m[1]} units+`;

  m = t.match(/(\d+)\s*本\s*[〜～\-–—~+＋]?/u);
  if (m) return `${m[1]} bottles+`;

  m = t.match(/(\d+)\s*枚\s*[〜～\-–—~+＋]?/u);
  if (m) return `${m[1]} pcs+`;

  m = t.match(/(\d+)\s*箱\s*[〜～\-–—~+＋]?/u);
  if (m) return `${m[1]} cartons+`;

  return t
    .replace(/SKUあたり/g, "per SKU ")
    .replace(/ケース/g, "case ")
    .replace(/段ボール/g, "carton ")
    .replace(/ダース単位/g, "By dozen")
    .replace(/ロット応相談/g, "Negotiable MOQ")
    .replace(/応相談/g, "Negotiable")
    .replace(/個/g, " units")
    .replace(/本/g, " bottles")
    .replace(/枚/g, " pcs")
    .replace(/箱/g, " cartons")
    .replace(/以上/g, "+")
    .replace(/[〜～]/g, "+")
    .replace(/\s+/g, " ")
    .replace(/\+\+/g, "+")
    .trim();
}
