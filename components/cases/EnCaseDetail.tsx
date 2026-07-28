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
import { canViewMakerCompanyName } from "@/lib/case-company-visibility";
import { resolveEnCatalogDisplay } from "@/lib/en-case-catalog";
import { brandOriginBadge } from "@/lib/en-japan-opportunity";
import { formatMoqEn } from "@/lib/en-listing-display";
import type { Case, SessionUser, TargetCountry } from "@/lib/types";

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

function moqEn(caseItem: Case): string {
  if (caseItem.minOrder?.trim()) return formatMoqEn(caseItem.minOrder);
  const blob = [caseItem.offer, caseItem.description, caseItem.salesTerms]
    .filter(Boolean)
    .join("\n");
  const m = blob.match(/^MOQ:\s*(.+)$/im);
  if (m?.[1]?.trim()) return formatMoqEn(m[1]);
  return "Negotiable MOQ";
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
  user?: SessionUser | null;
  alreadyApplied?: boolean;
};

export function EnCaseDetail({
  caseItem,
  user = null,
  alreadyApplied = false,
}: EnCaseDetailProps) {
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
  const showCompanyName = canViewMakerCompanyName(user, alreadyApplied);
  const origin = brandOriginBadge({
    shipFrom: caseItem.shipFrom,
    targetCountry: caseItem.targetCountry,
  });
  const brand = caseItem.brandName?.trim() || "";

  return (
    <article className="animate-fade-up" lang="en">
      <div className="mb-6">
        <Link href="/en/cases" className="text-sm text-teal hover:underline">
          ← Back to opportunities
        </Link>
      </div>

      <header className="mt-3 space-y-5">
        <CaseImageGallery
          images={caseItem.images}
          productImageUrl={caseItem.productImageUrl}
          alt={en.productName}
          locale="en"
        />

        {brand ? (
          <p className="text-sm font-medium tracking-wide text-teal">{brand}</p>
        ) : null}

        <h1 className="font-[family-name:var(--font-shippori)] text-3xl text-navy md:text-4xl">
          {en.productName}
        </h1>

        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
          Japan Expansion Opportunity
          <span className="mx-2 text-border" aria-hidden="true">
            ·
          </span>
          <span aria-hidden="true">{origin.flag} </span>
          {origin.label}
        </p>

        <dl>
          <InfoRow label="Category" value={en.category} />
          <InfoRow
            label="Wholesale Price"
            value={
              <WholesalePriceRange
                priceBand={wholesaleSource(caseItem)}
                locale="en"
              />
            }
          />
          <InfoRow label="MOQ" value={moqEn(caseItem)} />
          {showCompanyName ? (
            <InfoRow
              label="Company Name"
              value={caseItem.makerName?.trim() || "—"}
            />
          ) : null}
        </dl>
      </header>

      <ProductVideo
        url={caseItem.productVideoUrl}
        locale="en"
        poster={caseItem.productImageUrl}
      />

      <section className="mt-8">
        <h2 className="font-[family-name:var(--font-shippori)] text-xl text-navy">
          About this brand opportunity
        </h2>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-navy">
          {en.description}
        </p>
      </section>

      {en.features ? (
        <section className="mt-8">
          <h2 className="font-[family-name:var(--font-shippori)] text-xl text-navy">
            Brand & product strengths
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

      <DetailSection title="Market background">
        <InfoRow
          label="Sales Track Record"
          value={displayOptionalText(caseItem.salesTrackRecord)}
        />
        <InfoRow
          label="Japan / US Availability"
          value={displayOptionalText(caseItem.marketAvailabilityJpUs)}
        />
        <InfoRow
          label="Suggested Retail Price"
          value={displayOptionalText(caseItem.suggestedRetailPrice)}
        />
        <InfoRow
          label="Lead Time"
          value={displayOptionalText(caseItem.leadTime)}
        />
      </DetailSection>

      <DetailSection title="Partnership terms">
        <InfoRow
          label="Initial Order Terms"
          value={displayOptionalText(caseItem.initialOrderTerms)}
        />
        <InfoRow
          label="Reference wholesale range"
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
        <InfoRow label="Exclusive Option" value={exclusiveEn(caseItem)} />
      </DetailSection>

      <DetailSection title="International terms">
        <InfoRow
          label="Ship From"
          value={displayOptionalText(caseItem.shipFrom)}
        />
        <InfoRow
          label="Expansion market"
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
          Discuss this Japan expansion opportunity
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
          Connect with the brand on BrandBridge to explore distribution,
          exclusivity, and go-to-market partnership in Japan.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          {canStartNegotiation ? (
            <Button href={negotiateHref} prefetch={false}>
              Discuss Partnership
            </Button>
          ) : (
            <p className="text-sm text-muted">
              This opportunity is not open for discussion right now.
            </p>
          )}
          <Button href="/en/cases" variant="ghost">
            Back to opportunities
          </Button>
        </div>
      </section>
    </article>
  );
}
