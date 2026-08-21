import type { CaseFaqItem } from "@/lib/case-detail-seo";
import { enCategoryLabel, resolveEnCatalogDisplay } from "@/lib/en-case-catalog";
import { googleProductCategoryJsonLd } from "@/lib/google-product-category";
import { publicJaText } from "@/lib/public-case-text";
import { displayMoqJa } from "@/lib/price-display";
import { getSiteUrl, toOfficialPublicUrl } from "@/lib/site";
import type { Case } from "@/lib/types";
import { salesFormatLabel } from "@/lib/types";
import {
  parseListedOfferPrice,
  type ListedOfferPrice,
} from "@/lib/wholesale-price-display";

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

function jsonLdSku(sku: string | null | undefined): string | undefined {
  const t = sku?.trim();
  if (!t || /\s/.test(t)) return undefined;
  return t;
}

function schemaPrice(amount: number): string {
  return String(amount);
}

function listedOfferFields(listed: ListedOfferPrice): Record<string, unknown> {
  const price = schemaPrice(listed.min);
  const priceSpecification: Record<string, unknown> = {
    "@type": "UnitPriceSpecification",
    price,
    priceCurrency: listed.currency,
  };
  if (listed.max !== listed.min) {
    priceSpecification.minPrice = schemaPrice(listed.min);
    priceSpecification.maxPrice = schemaPrice(listed.max);
  }
  if (listed.valueAddedTaxIncluded === true) {
    priceSpecification.valueAddedTaxIncluded = true;
  } else if (listed.valueAddedTaxIncluded === false) {
    priceSpecification.valueAddedTaxIncluded = false;
  }

  return {
    price,
    priceCurrency: listed.currency,
    priceSpecification,
  };
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
 * Product JSON-LD from fields shown on the public case page.
 * One Offer is generated for merchant listings and product snippets.
 * Price / priceSpecification are omitted when the listing is quote-only.
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
    locale === "en"
      ? en?.description || ""
      : publicJaText(caseItem.summary) ||
        publicJaText(caseItem.description) ||
        ""
  ).slice(0, 5000);
  const image = absoluteImageUrl(caseItem.productImageUrl);
  const sku = jsonLdSku(caseItem.sku);
  const brand = caseItem.brandName?.trim();
  const catalogCategory =
    locale === "en"
      ? enCategoryLabel(caseItem.category)
      : caseItem.category?.trim();
  const inStock =
    caseItem.status === "open" && caseItem.reviewStatus === "approved";

  const listed = parseListedOfferPrice(caseItem.priceBand);
  const offer: Record<string, unknown> | undefined = listed
    ? {
        "@type": "Offer",
        url,
        availability: inStock
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        itemCondition: "https://schema.org/NewCondition",
        ...listedOfferFields(listed),
      }
    : undefined;

  const additionalProperty = [
    propertyValue(
      locale === "en" ? "Category" : "カテゴリ",
      catalogCategory && catalogCategory !== "—" ? catalogCategory : null,
    ),
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
    sku,
    mpn: sku,
    category: googleProductCategoryJsonLd(caseItem.category),
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
