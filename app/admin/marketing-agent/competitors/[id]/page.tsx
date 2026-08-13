import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { ActionForm } from "@/components/admin/marketing-agent/ActionForm";
import { StatusBadge } from "@/components/admin/marketing-agent/StatusBadge";
import { setCompetitorStatusAction } from "@/lib/marketing-agent/actions";
import {
  getCompetitorById,
  listGapsForCompetitor,
} from "@/lib/marketing-agent/store";

export const metadata: Metadata = {
  title: "Competitor detail",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CompetitorDetailPage({ params }: PageProps) {
  noStore();
  const { id } = await params;
  let competitor = null;
  let gaps = [];
  try {
    competitor = await getCompetitorById(id);
    gaps = competitor ? await listGapsForCompetitor(competitor.id) : [];
  } catch {
    notFound();
  }
  if (!competitor) notFound();

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <p className="text-sm">
        <Link
          href="/admin/marketing-agent#competitors"
          prefetch={false}
          className="text-teal hover:underline"
        >
          ← Competitor Analysis
        </Link>
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <StatusBadge label={competitor.status} tone="navy" />
        {competitor.category ? (
          <StatusBadge label={competitor.category} />
        ) : null}
      </div>
      <h1 className="mt-3 font-[family-name:var(--font-shippori)] text-3xl text-navy">
        {competitor.companyName}
      </h1>
      {competitor.url ? (
        <p className="mt-2 break-all text-sm text-muted">{competitor.url}</p>
      ) : null}

      <dl className="mt-6 grid gap-4 rounded-lg border border-border bg-surface p-5 text-sm md:grid-cols-2">
        <div>
          <dt className="text-xs text-muted">Target customer</dt>
          <dd className="mt-1">{competitor.targetCustomer ?? "不明（公開情報になし）"}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Service</dt>
          <dd className="mt-1 whitespace-pre-wrap">
            {competitor.serviceSummary ?? "不明（公開情報になし）"}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Strengths</dt>
          <dd className="mt-1 whitespace-pre-wrap">
            {competitor.strengths ?? "不明"}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Weaknesses</dt>
          <dd className="mt-1 whitespace-pre-wrap">
            {competitor.weaknesses ?? "不明"}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted">SEO summary</dt>
          <dd className="mt-1 whitespace-pre-wrap">
            {competitor.seoSummary ?? "—"}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Social summary</dt>
          <dd className="mt-1 whitespace-pre-wrap">
            {competitor.socialSummary ?? "SNSログインチャネル未使用。公開インデックスのみ。"}
          </dd>
        </div>
      </dl>

      <section className="mt-6">
        <h2 className="font-[family-name:var(--font-shippori)] text-xl text-navy">
          Gaps / recommended actions
        </h2>
        {gaps.length === 0 ? (
          <p className="mt-2 text-sm text-muted">この競合に紐づくギャップはまだありません。</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {gaps.map((gap) => (
              <li
                key={gap.id}
                className="rounded-lg border border-border bg-cream/40 p-4 text-sm"
              >
                <p className="font-medium text-navy">
                  [{gap.gapType}] {gap.title}
                </p>
                <p className="mt-1 whitespace-pre-wrap text-muted">
                  {gap.description}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {competitor.status === "candidate" ? (
        <div className="mt-8 flex flex-wrap gap-4">
          <ActionForm
            action={setCompetitorStatusAction}
            label="ウォッチする"
            pendingLabel="更新中…"
          >
            <input type="hidden" name="id" value={competitor.id} />
            <input type="hidden" name="status" value="watch" />
          </ActionForm>
          <ActionForm
            action={setCompetitorStatusAction}
            label="見送り"
            pendingLabel="更新中…"
            variant="outline"
          >
            <input type="hidden" name="id" value={competitor.id} />
            <input type="hidden" name="status" value="dismissed" />
          </ActionForm>
        </div>
      ) : null}
    </div>
  );
}
