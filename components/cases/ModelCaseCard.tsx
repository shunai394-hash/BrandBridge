import Link from "next/link";
import {
  MODEL_CASE_TYPE_LABEL,
  type ModelCase,
} from "@/lib/model-cases";

type ModelCaseCardProps = {
  modelCase: ModelCase;
};

export function ModelCaseCard({ modelCase }: ModelCaseCardProps) {
  const href = `/en/model-cases/${modelCase.slug}`;

  return (
    <article className="flex h-full flex-col rounded-lg border border-teal/25 bg-cream/40 p-5 transition duration-200 hover:-translate-y-0.5 hover:border-teal/50 hover:shadow-[0_12px_32px_rgba(20,32,51,0.08)]">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded border border-teal/30 bg-teal/10 px-2 py-0.5 text-[11px] font-semibold tracking-[0.12em] text-teal-dark">
          {MODEL_CASE_TYPE_LABEL[modelCase.type]}
        </span>
        <span className="text-xs text-muted">Illustrative sample flow</span>
      </div>

      <h3 className="mt-3 font-[family-name:var(--font-shippori)] text-xl leading-snug text-navy">
        <Link href={href} className="transition hover:text-teal">
          {modelCase.shortTitle}
        </Link>
      </h3>

      <dl className="mt-4 space-y-1.5 text-sm">
        <div className="grid grid-cols-[7rem_1fr] gap-x-2">
          <dt className="text-muted">Country</dt>
          <dd className="text-navy">{modelCase.country}</dd>
          <dt className="text-muted">Category</dt>
          <dd className="text-navy">{modelCase.category}</dd>
          <dt className="text-muted">Looking for</dt>
          <dd className="text-navy">{modelCase.targetPartner}</dd>
        </div>
      </dl>

      <p className="mt-4 text-xs leading-relaxed text-muted">
        Not a completed transaction. Example conditions for understanding the
        BrandBridge discussion flow.
      </p>

      <div className="mt-5">
        <Link
          href={href}
          className="text-sm font-medium text-teal hover:underline"
        >
          View Model Case →
        </Link>
      </div>
    </article>
  );
}
