import type { Metadata } from "next";
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { notFound } from "next/navigation";
import { AdminInquiryReplyForm } from "@/components/admin/AdminInquiryReplyForm";
import {
  getAdminInquiryById,
  inquiryCategoryLabel,
  inquiryReplyStatusLabel,
  listInquiryMessages,
} from "@/lib/admin-inquiries";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

/**
 * Auth is handled only by app/admin/layout.tsx (diagnoseAdminAccess).
 */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const item = await getAdminInquiryById(id);
  return {
    title: item
      ? `お問い合わせ: ${item.contactName}`
      : "お問い合わせ詳細",
  };
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("ja-JP", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default async function AdminInquiryDetailPage({ params }: PageProps) {
  noStore();
  const { id } = await params;
  const [item, messages] = await Promise.all([
    getAdminInquiryById(id),
    listInquiryMessages(id),
  ]);
  if (!item) notFound();

  const defaultSubject = `Re: 【BrandBridge】お問い合わせへのご返信（${item.contactName}様）`;

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <Link
        href="/admin/inquiries"
        className="text-sm text-teal hover:underline"
      >
        ← お問い合わせ一覧
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="font-[family-name:var(--font-shippori)] text-3xl text-navy">
          お問い合わせ詳細
        </h1>
        {item.replyStatus === "replied" ? (
          <span className="rounded-md bg-teal/10 px-2.5 py-1 text-xs font-medium text-teal-dark">
            {inquiryReplyStatusLabel(item.replyStatus)}
          </span>
        ) : (
          <span className="rounded-md bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800">
            {inquiryReplyStatusLabel(item.replyStatus)}
          </span>
        )}
      </div>
      <p className="mt-2 text-sm text-muted">{formatDate(item.createdAt)}</p>

      <section className="mt-8">
        <h2 className="font-[family-name:var(--font-shippori)] text-lg text-navy">
          問い合わせ者情報
        </h2>
        <dl className="mt-3 space-y-4 rounded-lg border border-border bg-surface p-5 text-sm md:p-6">
          <div className="grid gap-1 sm:grid-cols-[8rem_1fr] sm:gap-4">
            <dt className="font-medium text-navy">会社名</dt>
            <dd className="text-muted">{item.companyName?.trim() || "—"}</dd>
          </div>
          <div className="grid gap-1 sm:grid-cols-[8rem_1fr] sm:gap-4">
            <dt className="font-medium text-navy">担当者名</dt>
            <dd className="text-muted">{item.contactName}</dd>
          </div>
          <div className="grid gap-1 sm:grid-cols-[8rem_1fr] sm:gap-4">
            <dt className="font-medium text-navy">メールアドレス</dt>
            <dd className="text-muted">
              <a
                href={`mailto:${item.email}`}
                className="text-teal hover:underline"
              >
                {item.email}
              </a>
            </dd>
          </div>
          <div className="grid gap-1 sm:grid-cols-[8rem_1fr] sm:gap-4">
            <dt className="font-medium text-navy">カテゴリ</dt>
            <dd className="text-muted">
              {inquiryCategoryLabel(item.category)}
            </dd>
          </div>
        </dl>
      </section>

      <section className="mt-8">
        <h2 className="font-[family-name:var(--font-shippori)] text-lg text-navy">
          問い合わせ内容
        </h2>
        <div className="mt-3 rounded-lg border border-border bg-surface p-5 text-sm md:p-6">
          <p className="whitespace-pre-wrap leading-relaxed text-muted">
            {item.message}
          </p>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-[family-name:var(--font-shippori)] text-lg text-navy">
          過去の返信履歴
        </h2>
        {messages.length === 0 ? (
          <p className="mt-3 rounded-lg border border-dashed border-border bg-surface px-5 py-6 text-sm text-muted">
            まだ返信はありません。
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {messages.map((msg) => (
              <li
                key={msg.id}
                className="rounded-lg border border-border bg-surface p-5 text-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium text-navy">
                    {msg.senderType === "admin" ? "管理者" : "問い合わせ者"}
                  </span>
                  <span className="text-xs text-muted">
                    {formatDate(msg.createdAt)}
                  </span>
                </div>
                {msg.subject ? (
                  <p className="mt-2 text-sm text-navy">
                    件名: {msg.subject}
                  </p>
                ) : null}
                <p className="mt-2 whitespace-pre-wrap leading-relaxed text-muted">
                  {msg.message}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <AdminInquiryReplyForm
        inquiryId={item.id}
        defaultSubject={defaultSubject}
      />
    </div>
  );
}
