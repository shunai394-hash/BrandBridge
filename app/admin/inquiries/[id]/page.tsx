import type { Metadata } from "next";
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { notFound } from "next/navigation";
import {
  getAdminInquiryById,
  inquiryCategoryLabel,
} from "@/lib/admin-inquiries";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

/**
 * Auth is handled only by app/admin/layout.tsx (diagnoseAdminAccess),
 * same as other /admin/* pages — do not call requireAdmin here.
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
  const item = await getAdminInquiryById(id);
  if (!item) notFound();

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <Link
        href="/admin/inquiries"
        className="text-sm text-teal hover:underline"
      >
        ← お問い合わせ一覧
      </Link>

      <h1 className="mt-4 font-[family-name:var(--font-shippori)] text-3xl text-navy">
        お問い合わせ詳細
      </h1>
      <p className="mt-2 text-sm text-muted">{formatDate(item.createdAt)}</p>

      <dl className="mt-8 space-y-5 rounded-lg border border-border bg-surface p-5 text-sm md:p-6">
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
        <div className="grid gap-1 sm:grid-cols-[8rem_1fr] sm:gap-4">
          <dt className="font-medium text-navy">作成日時</dt>
          <dd className="text-muted">{formatDate(item.createdAt)}</dd>
        </div>
        <div className="border-t border-border pt-5">
          <dt className="font-medium text-navy">お問い合わせ内容</dt>
          <dd className="mt-2 whitespace-pre-wrap leading-relaxed text-muted">
            {item.message}
          </dd>
        </div>
      </dl>
    </div>
  );
}
