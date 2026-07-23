import Link from "next/link";
import { ProductCaseImage } from "@/components/cases/ProductCaseImage";
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

  return (
    <article
      className={`animate-fade-up rounded-lg border border-border bg-surface p-5 transition duration-200 hover:-translate-y-0.5 hover:border-teal/50 hover:shadow-[0_12px_32px_rgba(20,32,51,0.08)] ${delayClass}`}
    >
      <Link href={href} className="group block">
        <div className="mb-3">
          <ProductCaseImage
            src={caseItem.productImageUrl}
            alt={en.productName}
            size="card"
            locale="en"
            usePlaceholder
          />
        </div>
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          <span className="rounded bg-cream px-2 py-0.5 text-navy">
            {en.category}
          </span>
          <span className="rounded bg-cream px-2 py-0.5 text-navy">
            {TARGET_MARKET_EN[caseItem.targetCountry] ?? caseItem.targetCountry}
          </span>
          <span className="rounded bg-cream px-2 py-0.5 text-navy">
            {SALES_FORMAT_EN[caseItem.salesFormat] ?? caseItem.salesFormat}
          </span>
          {caseItem.isExclusive ? (
            <span className="rounded border border-teal/30 bg-teal/10 px-2 py-0.5 text-teal-dark">
              Exclusive available
            </span>
          ) : (
            <span className="rounded bg-cream px-2 py-0.5 text-navy">
              Non-exclusive
            </span>
          )}
        </div>
        <h2 className="mt-3 font-[family-name:var(--font-shippori)] text-lg leading-snug text-navy transition group-hover:text-teal">
          {en.productName}
        </h2>
      </Link>

      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-foreground/85">
        {en.summary}
      </p>

      <div className="mt-4">
        <Link
          href={href}
          className="inline-flex rounded-md bg-teal px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-dark"
        >
          View Product
        </Link>
      </div>
    </article>
  );
}
