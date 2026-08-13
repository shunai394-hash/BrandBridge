import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { ActionForm } from "@/components/admin/marketing-agent/ActionForm";
import {
  StatusBadge,
} from "@/components/admin/marketing-agent/StatusBadge";
import { setDraftStatusAction } from "@/lib/marketing-agent/actions";
import { getDraftById } from "@/lib/marketing-agent/store";

export const metadata: Metadata = {
  title: "Marketing Agent draft",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function MarketingAgentDraftPage({ params }: PageProps) {
  noStore();
  const { id } = await params;
  let draft = null;
  try {
    draft = await getDraftById(id);
  } catch {
    notFound();
  }
  if (!draft) notFound();

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <p className="text-sm">
        <Link
          href="/admin/marketing-agent"
          prefetch={false}
          className="text-teal hover:underline"
        >
          ← Marketing Agent
        </Link>
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <StatusBadge label={draft.status} tone="navy" />
        <StatusBadge label={draft.language} />
        <span className="text-xs text-muted">自動公開なし</span>
      </div>
      <h1 className="mt-3 font-[family-name:var(--font-shippori)] text-3xl text-navy">
        {draft.title}
      </h1>
      <p className="mt-2 font-mono text-sm text-muted">/{draft.slug}</p>

      <dl className="mt-6 grid gap-4 rounded-lg border border-border bg-surface p-5 text-sm md:grid-cols-2">
        <div>
          <dt className="text-xs text-muted">SEO title</dt>
          <dd className="mt-1 text-navy">{draft.metaTitle ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Meta description</dt>
          <dd className="mt-1 text-navy">{draft.metaDescription ?? "—"}</dd>
        </div>
      </dl>

      {draft.seoNotes ? (
        <section className="mt-6">
          <h2 className="font-[family-name:var(--font-shippori)] text-xl text-navy">
            SEO notes
          </h2>
          <pre className="mt-2 whitespace-pre-wrap rounded-lg border border-border bg-cream/40 p-4 text-sm text-navy">
            {draft.seoNotes}
          </pre>
        </section>
      ) : null}

      {draft.geoNotes ? (
        <section className="mt-6">
          <h2 className="font-[family-name:var(--font-shippori)] text-xl text-navy">
            GEO notes / JSON-LD
          </h2>
          <pre className="mt-2 whitespace-pre-wrap rounded-lg border border-border bg-cream/40 p-4 text-sm text-navy">
            {draft.geoNotes}
          </pre>
        </section>
      ) : null}

      <section className="mt-6">
        <h2 className="font-[family-name:var(--font-shippori)] text-xl text-navy">
          Draft
        </h2>
        <pre className="mt-2 whitespace-pre-wrap rounded-lg border border-border bg-surface p-5 text-sm leading-relaxed text-navy">
          {draft.content}
        </pre>
      </section>

      {draft.status === "draft" ? (
        <div className="mt-8 flex flex-wrap gap-4">
          <ActionForm
            action={setDraftStatusAction}
            label="採用（公開はしない）"
            pendingLabel="更新中…"
          >
            <input type="hidden" name="id" value={draft.id} />
            <input type="hidden" name="status" value="accepted" />
          </ActionForm>
          <ActionForm
            action={setDraftStatusAction}
            label="見送り"
            pendingLabel="更新中…"
            variant="outline"
          >
            <input type="hidden" name="id" value={draft.id} />
            <input type="hidden" name="status" value="rejected" />
          </ActionForm>
        </div>
      ) : null}
    </div>
  );
}
