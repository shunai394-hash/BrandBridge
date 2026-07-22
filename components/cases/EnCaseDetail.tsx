import type { ReactNode } from "react";
import Link from "next/link";
import { CaseImageGallery } from "@/components/cases/CaseImageGallery";
import { ProductVideo } from "@/components/cases/ProductVideo";
import { WholesalePriceRange } from "@/components/cases/WholesalePriceRange";
import { Button } from "@/components/ui/Button";
import {
  displayExclusiveDealOption,
  displayOptionalText,
  displaySampleDealLabel,
  displayTrademarkStatus,
} from "@/lib/case-detail-display";
import { resolveEnCatalogDisplay } from "@/lib/en-case-catalog";
import type { Case, SalesFormat, TargetCountry } from "@/lib/types";

const SALES_FORMAT_EN: Record<SalesFormat, string> = {
  wholesale: "Wholesale",
  consignment: "Consignment",
  agency: "Agency",
  oem: "OEM / ODM",
  ec: "E-commerce",
  other: "Other",
};

const TARGET_MARKET_EN: Record<TargetCountry, string> = {
  JP: "Japan",
  US: "United States",
  CN: "China",
  ASEAN: "ASEAN",
  EU: "Europe",
  GLOBAL: "Global",
  OTHER: "Other",
};

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid gap-1 border-b border-border py-3 sm:grid-cols-[11rem_1fr] sm:gap-4">
      <dt className="text-sm font-medium text-muted">{label}</dt>
      <dd className="whitespace-pre-wrap text-sm leading-relaxed text-navy">
        {value}
      </dd>
    </div>
  );
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-8">
      <h2 className="font-[family-name:var(--font-shippori)] text-xl text-navy">
        {title}
      </h2>
      <dl className="mt-2">{children}</dl>
    </section>
  );
}

function displayMoqEn(value: string | null | undefined): string {
  const t = value?.trim();
  return t ? t : "Negotiable";
}

function trademarkEn(value: string | null | undefined): string {
  if (value === "registered") return "Registered";
  if (value === "pending") return "Pending";
  if (value === "unregistered") return "Unregistered";
  const ja = displayTrademarkStatus(value);
  return ja === "—" ? "—" : ja;
}

function exclusiveOptionEn(value: string | null | undefined): string {
  if (value === "available") return "Exclusive available";
  if (value === "conditional") return "Available by territory (conditional)";
  if (value === "unavailable") return "Not available";
  const ja = displayExclusiveDealOption(value);
  return ja === "—" ? "—" : ja;
}

function sampleEn(value: string | null | undefined): string {
  if (value === "yes") return "Available";
  if (value === "negotiable") return "Negotiable";
  if (value === "no") return "Not available";
  const ja = displaySampleDealLabel(value);
  return ja === "—" ? "—" : ja;
}

/** Prefer shipFrom; else embedded English line; else target market. */
function countryOfOriginEn(caseItem: Case): string {
  const fromShip = caseItem.shipFrom?.trim();
  if (fromShip) return fromShip;

  const blob = [caseItem.description, caseItem.offer, caseItem.summary]
    .filter(Boolean)
    .join("\n");
  const m = blob.match(/Country of Origin:\s*(.+)/i);
  if (m?.[1]?.trim()) return m[1].trim();

  return (
    TARGET_MARKET_EN[caseItem.targetCountry] ?? caseItem.targetCountry ?? "—"
  );
}

function moqEn(caseItem: Case): string {
  if (caseItem.minOrder?.trim()) return displayMoqEn(caseItem.minOrder);
  const blob = [caseItem.offer, caseItem.description, caseItem.salesTerms]
    .filter(Boolean)
    .join("\n");
  const m = blob.match(/^MOQ:\s*(.+)$/im);
  if (m?.[1]?.trim()) return m[1].trim();
  return "Negotiable";
}

function wholesaleSource(caseItem: Case): string | null {
  if (caseItem.priceBand?.trim()) return caseItem.priceBand;
  const blob = [caseItem.offer, caseItem.description, caseItem.salesTerms]
    .filter(Boolean)
    .join("\n");
  const m = blob.match(/^Wholesale Price:\s*(.+)$/im);
  return m?.[1]?.trim() || null;
}

function exclusiveEn(caseItem: Case): string {
  const fromOption = exclusiveOptionEn(caseItem.exclusiveDealOption);
  if (fromOption !== "—") return fromOption;

  const blob = [caseItem.offer, caseItem.description].filter(Boolean).join("\n");
  if (/Exclusive Availability:\s*Available/i.test(blob)) {
    return "Exclusive available";
  }
  if (/Exclusive Availability:\s*Non-exclusive/i.test(blob)) {
    return "Non-exclusive";
  }
  return caseItem.isExclusive ? "Exclusive available" : "Non-exclusive";
}

type EnCaseDetailProps = {
  caseItem: Case;
};

export function EnCaseDetail({ caseItem }: EnCaseDetailProps) {
  const negotiateHref = `/cases/${caseItem.id}/negotiation`;
  const canStartNegotiation =
    caseItem.reviewStatus === "approved" && caseItem.status === "open";
  const en = resolveEnCatalogDisplay({
    id: caseItem.id,
    sku: caseItem.sku,
    productName: caseItem.productName,
    category: caseItem.category,
    summary: caseItem.summary,
    description: caseItem.description,
    productFeatures: caseItem.productFeatures,
  });
  const companyName = caseItem.makerName?.trim() || "—";

  return (
    <article className="animate-fade-up" lang="en">
      <div className="mb-6">
        <Link href="/en/cases" className="text-sm text-teal hover:underline">
          ← Back to products
        </Link>
      </div>

      <p className="text-xs font-medium tracking-wider text-teal">
        BrandBridge Product
      </p>

      <header className="mt-3 space-y-5">
        <CaseImageGallery
          images={caseItem.images}
          productImageUrl={caseItem.productImageUrl}
          alt={en.productName}
          locale="en"
        />

        <h1 className="font-[family-name:var(--font-shippori)] text-3xl text-navy md:text-4xl">
          {en.productName}
        </h1>

        <dl>
          <InfoRow label="Product Name" value={en.productName} />
          <InfoRow label="Company Name" value={companyName} />
          <InfoRow
            label="Country of Origin"
            value={countryOfOriginEn(caseItem)}
          />
          <InfoRow label="Category" value={en.category} />
          <InfoRow
            label="Sales Format"
            value={
              SALES_FORMAT_EN[caseItem.salesFormat] ?? caseItem.salesFormat
            }
          />
          <InfoRow label="MOQ" value={moqEn(caseItem)} />
          <InfoRow
            label="Wholesale Price Range"
            value={
              <WholesalePriceRange
                priceBand={wholesaleSource(caseItem)}
                locale="en"
              />
            }
          />
          <InfoRow
            label="Currency"
            value={displayOptionalText(caseItem.currencies)}
          />
          <InfoRow label="Exclusive Option" value={exclusiveEn(caseItem)} />
          <InfoRow
            label="Samples Availability"
            value={sampleEn(caseItem.sampleAvailable)}
          />
        </dl>
      </header>

      <ProductVideo url={caseItem.productVideoUrl} locale="en" />

      <section className="mt-8">
        <h2 className="font-[family-name:var(--font-shippori)] text-xl text-navy">
          Product Description
        </h2>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-navy">
          {en.description}
        </p>
      </section>

      {en.features ? (
        <section className="mt-8">
          <h2 className="font-[family-name:var(--font-shippori)] text-xl text-navy">
            Product Features
          </h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-navy">
            {en.features}
          </p>
        </section>
      ) : null}

      <DetailSection title="Brand information">
        <InfoRow
          label="Brand name"
          value={displayOptionalText(caseItem.brandName)}
        />
        <InfoRow
          label="Brand Overview"
          value={displayOptionalText(caseItem.brandOverview)}
        />
        <InfoRow
          label="Product Strengths"
          value={displayOptionalText(caseItem.productStrengths)}
        />
      </DetailSection>

      <DetailSection title="Deal terms">
        <InfoRow
          label="Initial Order Terms"
          value={displayOptionalText(caseItem.initialOrderTerms)}
        />
        <InfoRow
          label="Wholesale Price Range"
          value={
            <WholesalePriceRange
              priceBand={wholesaleSource(caseItem)}
              locale="en"
            />
          }
        />
        <InfoRow label="MOQ" value={moqEn(caseItem)} />
        <InfoRow
          label="Payment Terms"
          value={displayOptionalText(caseItem.salesTerms)}
        />
        <InfoRow
          label="Samples Availability"
          value={sampleEn(caseItem.sampleAvailable)}
        />
        <InfoRow
          label="Trademark / License"
          value={trademarkEn(caseItem.trademarkStatus)}
        />
        <InfoRow
          label="Exclusive Option"
          value={exclusiveEn(caseItem)}
        />
      </DetailSection>

      <DetailSection title="International terms">
        <InfoRow
          label="Ship From"
          value={displayOptionalText(caseItem.shipFrom)}
        />
        <InfoRow
          label="Target Market"
          value={
            TARGET_MARKET_EN[caseItem.targetCountry] ?? caseItem.targetCountry
          }
        />
        <InfoRow
          label="Currency"
          value={displayOptionalText(caseItem.currencies)}
        />
        <InfoRow
          label="Incoterms"
          value={displayOptionalText(caseItem.incoterms)}
        />
        <InfoRow
          label="Certifications"
          value={displayOptionalText(caseItem.certifications)}
        />
        <InfoRow
          label="Support Languages"
          value={displayOptionalText(caseItem.supportLanguages)}
        />
      </DetailSection>

      <section className="mt-10 border-t border-border pt-8">
        <h2 className="font-[family-name:var(--font-shippori)] text-xl text-navy">
          Start a business discussion
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
          Open a negotiation with the product supplier on BrandBridge—same flow
          as the Japanese product detail page.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          {canStartNegotiation ? (
            <Button href={negotiateHref} prefetch={false}>
              Start Negotiation
            </Button>
          ) : (
            <p className="text-sm text-muted">
              This product is not open for negotiation right now.
            </p>
          )}
          <Button href="/en/cases" variant="ghost">
            Back to listings
          </Button>
        </div>
      </section>
    </article>
  );
}
