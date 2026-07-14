import Link from "next/link";
import { ProductCaseImage } from "@/components/cases/ProductCaseImage";
import type { Case } from "@/lib/types";
import { salesFormatLabel, targetCountryLabel } from "@/lib/types";

type CaseCardProps = {
  caseItem: Case;
  index?: number;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export function CaseCard({ caseItem, index = 0 }: CaseCardProps) {
  const delayClass = index < 3 ? `delay-${index + 1}` : "";

  return (
    <article
      className={`animate-fade-up rounded-lg border border-border bg-surface p-5 transition duration-200 hover:-translate-y-0.5 hover:border-teal/50 hover:shadow-[0_12px_32px_rgba(20,32,51,0.08)] ${delayClass}`}
    >
      <Link href={`/cases/${caseItem.id}`} className="group block">
        <div className="mb-3">
          <ProductCaseImage
            src={caseItem.productImageUrl}
            alt={caseItem.productName}
            size="card"
          />
        </div>
        <p className="font-mono text-xs font-medium text-teal">
          {caseItem.caseNumber}
        </p>
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          <span className="rounded bg-cream px-2 py-0.5 text-navy">
            {caseItem.category}
          </span>
          <span className="rounded bg-cream px-2 py-0.5 text-navy">
            {targetCountryLabel(caseItem.targetCountry)}
          </span>
          <span className="rounded bg-cream px-2 py-0.5 text-navy">
            {salesFormatLabel(caseItem.salesFormat)}
          </span>
          {caseItem.isExclusive ? (
            <span className="rounded border border-teal/30 bg-teal/10 px-2 py-0.5 text-teal-dark">
              独占可
            </span>
          ) : null}
          {caseItem.reviewStatus === "pending_review" ? (
            <span className="rounded border border-amber-300 bg-amber-50 px-2 py-0.5 text-amber-800">
              審査待ち（自分の案件）
            </span>
          ) : null}
        </div>
        <h3 className="mt-3 font-[family-name:var(--font-shippori)] text-lg leading-snug text-navy transition group-hover:text-teal">
          {caseItem.title}
        </h3>
        <p className="mt-1 text-sm text-muted">{caseItem.productName}</p>
      </Link>

      {caseItem.priceBand ? (
        <p className="mt-2 text-xs text-muted">価格帯: {caseItem.priceBand}</p>
      ) : null}

      <Link href={`/cases/${caseItem.id}`} className="group mt-3 block">
        <p className="line-clamp-2 text-sm leading-relaxed text-foreground/85">
          {caseItem.summary}
        </p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-teal group-hover:underline">
            詳細を見る →
          </span>
          <span className="text-xs text-muted">
            掲載日 {formatDate(caseItem.createdAt)}
          </span>
        </div>
      </Link>
    </article>
  );
}
