import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/marketing-agent/StatusBadge";
import { getCompetitor } from "@/lib/marketing-agent/store";

export const metadata: Metadata = { title: "Competitor" };
export const dynamic = "force-dynamic";

export default async function CompetitorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const row = await getCompetitor(id);
  if (!row) notFound();
  const { competitor, gaps } = row;

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
        {competitor.name}
      </h1>
      {competitor.url ? (
        <p className="mt-2 break-all text-sm text-teal">{competitor.url}</p>
      ) : null}
      <p className="mt-4 text-sm text-muted">{competitor.summary}</p>
      <p className="mt-2 text-sm text-navy">{competitor.positioning}</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <List title="Strengths" items={competitor.strengths} />
        <List title="Weaknesses" items={competitor.weaknesses} />
        <List title="Topics" items={competitor.contentTopics} />
        <List title="Keywords" items={competitor.keywords} />
      </div>
      <h2 className="mt-10 font-[family-name:var(--font-shippori)] text-xl text-navy">
        Gaps
      </h2>
      <ul className="mt-4 space-y-3">
        {gaps.map((g) => (
          <li key={g.id} className="rounded-md border border-border p-3">
            <div className="flex flex-wrap gap-2">
              <StatusBadge value={g.gapType} />
              <StatusBadge value={g.priority} />
            </div>
            <p className="mt-1 font-medium text-navy">{g.title}</p>
            <p className="text-sm text-muted">{g.detail}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-sm font-medium text-navy">{title}</p>
      <ul className="mt-1 list-disc pl-5 text-sm text-muted">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
