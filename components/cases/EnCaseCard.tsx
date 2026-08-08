import Link from "next/link";
import { ProductCaseImage } from "@/components/cases/ProductCaseImage";
import { resolveEnCatalogDisplay } from "@/lib/en-case-catalog";
import {
  brandDisplayName,
  brandOriginBadge,
  lookingForLabel,
  opportunityMoqLabel,
  partnershipLabel,
  targetChannelsLabel,
} from "@/lib/en-japan-opportunity";
import type { Case } from "@/lib/types";

type EnCaseCardProps = {
  caseItem: Pick<
    Case,
    | "id"
    | "productName"
    | "sku"
    | "category"
    | "targetCountry"
    | "salesFormat"
    | "isExclusive"
    | "summary"
    | "description"
    | "productImageUrl"
    | "brandName"
    | "shipFrom"
    | "partnerChannels"
    | "minOrder"
    | "makerName"
  >;
  index?: number;
};

export function EnCaseCard({ caseItem, index = 0 }: EnCaseCardProps) {
  const delayClass = index < 3 ? `delay-${index + 1}` : "";
  const href = `/en/cases/${caseItem.id}`;
  const en = resolveEnCatalogDisplay({
    id: caseItem.id,
    sku: caseItem.sku,
    productName: caseItem.productName,
    category: caseItem.category,
    summary: caseItem.summary,
    description: caseItem.description,
  });
  const origin = brandOriginBadge({
    shipFrom: caseItem.shipFrom,
    targetCountry: caseItem.targetCountry,
  });
  const brand = brandDisplayName({
    brandName: caseItem.brandName,
    productName: en.productName,
    makerName: caseItem.makerName,
  });
  const lookingFor = lookingForLabel(caseItem.salesFormat);
  const partnership = partnershipLabel({
    salesFormat: caseItem.salesFormat,
    isExclusive: caseItem.isExclusive,
  });
  const moq = opportunityMoqLabel(caseItem.minOrder);
  const target = targetChannelsLabel({
    partnerChannels: caseItem.partnerChannels,
    salesFormat: caseItem.salesFormat,
  });

  return (
    <article
      className={`animate-fade-up flex h-full flex-col rounded-lg border border-border bg-surface p-5 transition duration-200 hover:-translate-y-0.5 hover:border-teal/50 hover:shadow-[0_12px_32px_rgba(20,32,51,0.08)] ${delayClass}`}
    >
      <Link href={href} className="group block">
        <div className="mb-3">
          <ProductCaseImage
            src={caseItem.productImageUrl}
            alt={brand}
            size="card"
            locale="en"
            usePlaceholder
          />
        </div>
        <p className="text-sm font-medium text-navy">
          <span aria-hidden="true">{origin.flag} </span>
          {origin.label}
        </p>
        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-teal">
          Japan Expansion Opportunity
        </p>
        <h2 className="mt-2 font-[family-name:var(--font-shippori)] text-lg leading-snug text-navy transition group-hover:text-teal">
          {brand}
        </h2>
      </Link>

      <dl className="mt-3 space-y-1.5 text-sm">
        <div className="grid grid-cols-[6.5rem_1fr] gap-x-2">
          <dt className="text-muted">Looking for</dt>
          <dd className="text-navy">{lookingFor}</dd>
          <dt className="text-muted">Partnership</dt>
          <dd className="text-navy">{partnership}</dd>
          <dt className="text-muted">Category</dt>
          <dd className="text-navy">{en.category}</dd>
          <dt className="text-muted">MOQ</dt>
          <dd className="text-navy">{moq}</dd>
          <dt className="text-muted">Target</dt>
          <dd className="text-navy">{target}</dd>
        </div>
      </dl>

      {en.summary ? (
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-foreground/85">
          {en.summary}
        </p>
      ) : null}

      <div className="mt-4">
        <Link
          href={href}
          className="inline-flex rounded-md bg-teal px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-dark"
        >
          View Opportunity
        </Link>
      </div>
    </article>
  );
}

