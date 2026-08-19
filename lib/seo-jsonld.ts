import type { CaseFaqItem } from "@/lib/case-detail-seo";
import { enCategoryLabel, resolveEnCatalogDisplay } from "@/lib/en-case-catalog";
import { PRICE_BAND_QUOTE_REQUIRED, displayMoqJa } from "@/lib/price-display";
import { getSiteUrl, toOfficialPublicUrl } from "@/lib/site";
import type { Case } from "@/lib/types";
import { salesFormatLabel } from "@/lib/types";
import { parseYenPriceBand } from "@/lib/wholesale-price-display";

export type BreadcrumbItem = {
  name: string;
  path?: string;
};

export function jsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

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

export function faqPageJsonLd(faqs: CaseFaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
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
  return /見積|quote|on request|on demand/i.test(t);
}

function propertyValue(name: string, value: string | null | undefined) {
  const v = value?.trim();
  if (!v) return null;
  return {
    "@type": "PropertyValue",
    name,
    value: v,
  };
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
  const en =
    locale === "en"
      ? resolveEnCatalogDisplay({
          id: caseItem.id,
          sku: caseItem.sku,
          productName: caseItem.productName,
          category: caseItem.category,
          summary: caseItem.summary,
          description: caseItem.description,
        })
      : null;
  const name =
    en?.productName || caseItem.productName?.trim() || caseItem.title;
  const description = (
    (locale === "en" ? en?.description : null) ||
    caseItem.summary?.trim() ||
    caseItem.description?.trim() ||
    ""
  ).slice(0, 5000);
  const image = absoluteImageUrl(caseItem.productImageUrl);
  const sku = caseItem.sku?.trim();
  const brand = caseItem.brandName?.trim();
  const category =
    locale === "en"
      ? enCategoryLabel(caseItem.category)
      : caseItem.category?.trim();
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

  const additionalProperty = [
    propertyValue(
      locale === "en" ? "MOQ" : "MOQ",
      locale === "en" ? caseItem.minOrder : displayMoqJa(caseItem.minOrder),
    ),
    propertyValue(
      locale === "en" ? "Sales format" : "販売形式",
      locale === "en"
        ? caseItem.salesFormat
        : salesFormatLabel(caseItem.salesFormat),
    ),
    propertyValue(
      locale === "en" ? "Lead time" : "リードタイム",
      caseItem.leadTime,
    ),
    propertyValue("Incoterms", caseItem.incoterms),
    propertyValue(
      locale === "en" ? "Ship from" : "原産国・出荷元",
      caseItem.shipFrom,
    ),
  ].filter(Boolean);

  const product: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    url,
    description: description || undefined,
    image: image ? [image] : undefined,
    sku: sku || undefined,
    mpn: sku || undefined,
    category: category || undefined,
    countryOfOrigin: caseItem.shipFrom?.trim() || undefined,
    brand: brand
      ? {
          "@type": "Brand",
          name: brand,
        }
      : undefined,
    additionalProperty:
      additionalProperty.length > 0 ? additionalProperty : undefined,
    offers: offer,
  };

  return product;
}
