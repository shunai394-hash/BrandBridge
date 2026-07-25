import {
  isForeignCurrencyPriceBand,
  parseYenPriceBand,
} from "@/lib/wholesale-price-display";

/**
 * English display helpers for /en/cases listing (and related EN surfaces).
 * Does not mutate stored Japanese product data.
 */

function formatJpyAmount(n: number): string {
  return n.toLocaleString("en-US");
}

/** Preserve overseas currency text; translate Japanese notes only. */
function formatForeignCurrencyPriceEn(value: string): string {
  return value
    .replace(/（FOB相談）/g, " (FOB negotiable)")
    .replace(/\(FOB相談\)/g, " (FOB negotiable)")
    .replace(/FOB相談/g, "FOB negotiable")
    .replace(/（税別）/g, " (excluding tax)")
    .replace(/\(税別\)/g, " (excluding tax)")
    .replace(/税別/g, "excluding tax")
    .replace(/応相談/g, "negotiable")
    .replace(/以上/g, "+")
    .replace(/[〜～]/g, "–")
    .replace(/\s+/g, " ")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .trim();
}

/** Specific quote phrases before generic 見積 handling. */
function resolveQuoteLabelEn(value: string): string | null {
  const t = value.trim();
  if (!t) return "Quote required";
  if (isForeignCurrencyPriceBand(t)) return null;
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
 * Overseas currencies (USD / EUR / …) are kept in the original currency.
 */
export function formatWholesalePriceBandEn(
  value: string | null | undefined,
): string {
  const t = value?.trim();
  if (!t) return "Quote required";

  if (isForeignCurrencyPriceBand(t)) {
    return formatForeignCurrencyPriceEn(t);
  }

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

  // e.g. "3,980円セット（税別）"
  const singleYen = t.match(/([\d,]+)\s*円/u);
  if (singleYen) {
    const n = Number(singleYen[1].replace(/,/g, ""));
    if (Number.isFinite(n) && n > 0) {
      return `JPY ${n.toLocaleString("en-US")}${excl}`;
    }
  }

  return t
    .replace(/（税別）/g, " (excluding tax)")
    .replace(/\(税別\)/g, " (excluding tax)")
    .replace(/税別/g, "excluding tax")
    .replace(/円セット/g, "")
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
  if (t === "取引ごと" || /^取引ごと/.test(t)) return "Per transaction";
  if (/ダース単位/.test(t)) return "By dozen";

  let m = t.match(/SKUあたり\s*(\d+)\s*枚\s*[〜～\-–—~+＋]?/u);
  if (m) return `${m[1]} pcs per SKU+`;

  m = t.match(/ケース\s*(\d+)\s*本\s*[〜～\-–—~+＋]?/u);
  if (m) return `${m[1]} bottles/case+`;

  m = t.match(/ケース\s*(\d+)\s*袋\s*[〜～\-–—~+＋]?/u);
  if (m) return `${m[1]} bags/case+`;

  m = t.match(/ケース\s*(\d+)\s*個\s*[〜～\-–—~+＋]?/u);
  if (m) return `${m[1]} units/case+`;

  m = t.match(/(?:段ボール|ダンボール)\s*(\d+)\s*箱\s*[〜～\-–—~+＋]?/u);
  if (m) return `${m[1]} carton+`;

  m = t.match(/(\d+)\s*セット\s*[〜～\-–—~+＋]?/u);
  if (m) return `${m[1]} sets+`;

  m = t.match(/(\d+)\s*冊\s*[〜～\-–—~+＋]?/u);
  if (m) return `${m[1]} books+`;

  m = t.match(/(\d+)\s*足\s*[〜～\-–—~+＋]?/u);
  if (m) return `${m[1]} pairs+`;

  m = t.match(/(\d+)\s*台\s*[〜～\-–—~+＋]?/u);
  if (m) return `${m[1]} units+`;

  m = t.match(/(\d+)\s*缶\s*[〜～\-–—~+＋]?/u);
  if (m) return `${m[1]} cans+`;

  m = t.match(/(\d+)\s*個\s*[〜～\-–—~+＋]?/u);
  if (m) return `${m[1]} units+`;

  m = t.match(/(\d+)\s*本\s*[〜～\-–—~+＋]?/u);
  if (m) return `${m[1]} bottles+`;

  m = t.match(/(\d+)\s*枚\s*[〜～\-–—~+＋]?/u);
  if (m) return `${m[1]} pcs+`;

  m = t.match(/(\d+)\s*袋\s*[〜～\-–—~+＋]?/u);
  if (m) return `${m[1]} bags+`;

  m = t.match(/(\d+)\s*箱\s*[〜～\-–—~+＋]?/u);
  if (m) return `${m[1]} cartons+`;

  return t
    .replace(/SKUあたり/g, "per SKU ")
    .replace(/ケース/g, "case ")
    .replace(/段ボール|ダンボール/g, "carton ")
    .replace(/ダース単位/g, "By dozen")
    .replace(/ロット応相談/g, "Negotiable MOQ")
    .replace(/取引ごと/g, "Per transaction")
    .replace(/応相談/g, "Negotiable")
    .replace(/セット/g, " sets")
    .replace(/冊/g, " books")
    .replace(/足/g, " pairs")
    .replace(/台/g, " units")
    .replace(/缶/g, " cans")
    .replace(/個/g, " units")
    .replace(/本/g, " bottles")
    .replace(/枚/g, " pcs")
    .replace(/袋/g, " bags")
    .replace(/箱/g, " cartons")
    .replace(/以上/g, "+")
    .replace(/[〜～]/g, "+")
    .replace(/\s+/g, " ")
    .replace(/\+\+/g, "+")
    .trim();
}
