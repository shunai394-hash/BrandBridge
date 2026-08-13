import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm } from "@/components/marketing-agent/ActionForm";
import { NarrationDownloadForm } from "@/components/marketing-agent/NarrationDownloadForm";
import { StatusBadge } from "@/components/marketing-agent/StatusBadge";
import {
  repurposeContentAction,
  saveContentAction,
  setContentStatusAction,
} from "@/lib/marketing-agent/actions";
import { getContent } from "@/lib/marketing-agent/store";

export const metadata: Metadata = { title: "Marketing Content" };
export const dynamic = "force-dynamic";

export default async function ContentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getContent(id);
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
      <p className="mt-2 text-sm text-muted">
        GEO対応のCMS下書きです。既存の公開ルートは変更しません。
      </p>
      <div className="mt-3">
        <StatusBadge value={item.status} />
      </div>

      <ActionForm action={saveContentAction} label="保存">
        <input type="hidden" name="contentId" value={item.id} />
        <Field name="title" label="Title" defaultValue={item.title} />
        <Field name="metaTitle" label="Meta title" defaultValue={item.metaTitle} />
        <Field
          name="metaDescription"
          label="Meta description"
          defaultValue={item.metaDescription}
          textarea
        />
        <Field name="slug" label="Slug" defaultValue={item.slug} />
        <Field name="h1" label="H1" defaultValue={item.h1} />
        <Field
          name="definition"
          label="Definition (GEO)"
          defaultValue={item.definition}
          textarea
        />
        <Field name="body" label="Article body" defaultValue={item.body} textarea rows={18} />
        <Field
          name="targetKeyword"
          label="Target keyword"
          defaultValue={item.targetKeyword}
        />
        <Field
          name="searchIntent"
          label="Search intent"
          defaultValue={item.searchIntent}
        />
        <Field
          name="targetCountry"
          label="Target country"
          defaultValue={item.targetCountry}
        />
        <Field
          name="targetAudience"
          label="Target audience"
          defaultValue={item.targetAudience}
        />
        <Field name="cta" label="CTA" defaultValue={item.cta} />
        <Field name="language" label="Language" defaultValue={item.language} />
        <Field
          name="authorOrgInfo"
          label="Author / company"
          defaultValue={item.authorOrgInfo}
          textarea
        />
      </ActionForm>

      <div className="mt-6">
        <p className="text-sm font-medium text-navy">H2</p>
        <ul className="mt-1 list-disc pl-5 text-sm text-muted">
          {item.h2.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-navy">FAQ</p>
        <ul className="mt-1 space-y-2 text-sm text-muted">
          {item.faq.map((f) => (
            <li key={f.question}>
              <strong className="text-navy">{f.question}</strong>
              <p>{f.answer}</p>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-navy">Internal links</p>
        <ul className="mt-1 list-disc pl-5 text-sm text-muted">
          {item.internalLinks.map((l) => (
            <li key={l.path}>
              {l.anchor} → {l.path}
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-navy">Citations</p>
        <ul className="mt-1 list-disc pl-5 text-sm text-muted">
          {item.citations.map((c) => (
            <li key={c.url}>
              {c.title} ({c.url})
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <ActionForm
          action={setContentStatusAction}
          label="Review"
          hidden={{ contentId: item.id, status: "review" }}
        />
        <ActionForm
          action={setContentStatusAction}
          label="Approve"
          hidden={{ contentId: item.id, status: "approved" }}
        />
        <ActionForm
          action={repurposeContentAction}
          label="各媒体向けに再構成"
          hidden={{ contentId: item.id }}
        />
      </div>
      <div className="mt-6 rounded-md border border-border p-4">
        <h2 className="text-lg text-navy">Narration / Voice</h2>
        <NarrationDownloadForm contentId={item.id} />
      </div>
    </div>
  );
}

function Field({
  name,
  label,
  defaultValue,
  textarea,
  rows,
}: {
  name: string;
  label: string;
  defaultValue: string | null;
  textarea?: boolean;
  rows?: number;
}) {
  const cls =
    "mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm";
  return (
    <label className="block text-sm">
      <span className="font-medium text-navy">{label}</span>
      {textarea ? (
        <textarea
          name={name}
          rows={rows ?? 4}
          defaultValue={defaultValue ?? ""}
          className={`${cls} resize-y`}
        />
      ) : (
        <input name={name} defaultValue={defaultValue ?? ""} className={cls} />
      )}
    </label>
  );
}
