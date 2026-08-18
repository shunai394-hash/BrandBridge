import type { Case } from "@/lib/types";
import { PRICE_BAND_QUOTE_REQUIRED } from "@/lib/price-display";
import { getSiteUrl, toOfficialPublicUrl } from "@/lib/site";
import { parseYenPriceBand } from "@/lib/wholesale-price-display";

export type BreadcrumbItem = {
  name: string;
  path?: string;
};

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  const origin = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => {
      const entry: Record<string, unknown> = {
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
      };
      if (item.path) {
        entry.item = item.path.startsWith("http")
          ? item.path
          : `${origin}${item.path === "/" ? "" : item.path}`;
      }
      return entry;
    }),
  };
}

function absoluteImageUrl(url: string | null | undefined): string | undefined {
  const trimmed = url?.trim();
  if (!trimmed) return undefined;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return toOfficialPublicUrl(trimmed);
}

function isQuoteOnlyPrice(priceBand: string | null | undefined): boolean {
  const t = priceBand?.trim() || "";
  if (!t) return true;
  if (t === PRICE_BAND_QUOTE_REQUIRED) return true;
  return /見積|quote/i.test(t);
}

/**
 * Product JSON-LD from fields that are shown on the public case page.
 * Numeric price is included only when a yen band can be parsed; quote-only
 * listings omit price instead of inventing one.
 */
export function productJsonLd(
  caseItem: Case,
  locale: "ja" | "en",
): Record<string, unknown> {
  const origin = getSiteUrl();
  const path =
    locale === "en" ? `/en/cases/${caseItem.id}` : `/cases/${caseItem.id}`;
  const url = `${origin}${path}`;
  const name = caseItem.productName?.trim() || caseItem.title;
  const description = (
    caseItem.summary?.trim() ||
    caseItem.description?.trim() ||
    ""
  ).slice(0, 5000);
  const image = absoluteImageUrl(caseItem.productImageUrl);
  const sku = caseItem.sku?.trim();
  const brand = caseItem.brandName?.trim();
  const inStock =
    caseItem.status === "open" && caseItem.reviewStatus === "approved";

  const offer: Record<string, unknown> = {
    "@type": "Offer",
    url,
    availability: inStock
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock",
  };

  const yen = parseYenPriceBand(caseItem.priceBand);
  if (yen && !isQuoteOnlyPrice(caseItem.priceBand)) {
    offer.priceCurrency = "JPY";
    if (yen.type === "range") {
      offer["@type"] = "AggregateOffer";
      offer.lowPrice = String(yen.min);
      offer.highPrice = String(yen.max);
    } else {
      offer.price = String(yen.min);
    }
  }

  const product: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    url,
    description: description || undefined,
    image: image ? [image] : undefined,
    sku: sku || undefined,
    brand: brand
      ? {
          "@type": "Brand",
          name: brand,
        }
      : undefined,
    offers: offer,
  };

  return product;
}
