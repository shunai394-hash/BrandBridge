import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm } from "@/components/marketing-agent/ActionForm";
import { StatusBadge } from "@/components/marketing-agent/StatusBadge";
import {
  generateArticleAction,
  setOpportunityStatusAction,
} from "@/lib/marketing-agent/actions";
import { getOpportunity } from "@/lib/marketing-agent/store";

export const metadata: Metadata = { title: "Content Opportunity" };
export const dynamic = "force-dynamic";

export default async function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getOpportunity(id);
  if (!item) notFound();

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <Link
        href="/admin/marketing-agent"
        prefetch={false}
        className="text-sm text-teal hover:underline"
      >
        ← Marketing Agent
      </Link>
      <h1 className="mt-4 font-[family-name:var(--font-shippori)] text-3xl text-navy">
        {item.title}
      </h1>
      <div className="mt-3 flex flex-wrap gap-2">
        <StatusBadge value={item.status} />
        <StatusBadge value={item.priority} />
      </div>
      <dl className="mt-8 grid gap-3 text-sm">
        {[
          ["topic", item.topic],
          ["keyword", item.keyword],
          ["searchIntent", item.searchIntent],
          ["targetAudience", item.targetAudience],
          ["targetCountry", item.targetCountry],
          ["language", item.language],
          ["platform", item.platform],
          ["source", item.source],
          ["sourceUrl", item.sourceUrl],
        ].map(([k, v]) => (
          <div key={k}>
            <dt className="text-xs text-muted">{k}</dt>
            <dd className="text-navy">{v || "—"}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-6 text-sm text-muted">{item.reason}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <ActionForm
          action={generateArticleAction}
          label="記事下書きを作成"
          hidden={{ opportunityId: item.id }}
        />
        <ActionForm
          action={setOpportunityStatusAction}
          label="Archive"
          hidden={{ opportunityId: item.id, status: "archived" }}
        />
      </div>
    </div>
  );
}
