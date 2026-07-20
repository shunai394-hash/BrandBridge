import type { Metadata } from "next";
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { notFound } from "next/navigation";
import { AdminOutboundThreadForms } from "@/components/admin/AdminOutboundThreadForms";
import {
  getOutboundEmailById,
  listEmailThreadMessages,
} from "@/lib/admin-outbound-mail";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const item = await getOutboundEmailById(id);
  return {
    title: item ? `営業メール: ${item.subject}` : "営業メール詳細",
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

export default async function AdminOutboundMailDetailPage({
  params,
}: PageProps) {
  noStore();
  const { id } = await params;
  const [item, threads] = await Promise.all([
    getOutboundEmailById(id),
    listEmailThreadMessages(id),
  ]);
  if (!item) notFound();

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <Link href="/admin/mail" className="text-sm text-teal hover:underline">
        ← 営業メール一覧
      </Link>

      <h1 className="mt-4 font-[family-name:var(--font-shippori)] text-3xl text-navy">
        メールスレッド
      </h1>

      <dl className="mt-6 space-y-3 rounded-lg border border-border bg-surface p-5 text-sm">
        <div className="grid gap-1 sm:grid-cols-[6rem_1fr] sm:gap-4">
          <dt className="font-medium text-navy">状態</dt>
          <dd
            className={
              item.status === "sent" ? "text-teal" : "text-red-600"
            }
          >
            {item.status}
          </dd>
        </div>
        <div className="grid gap-1 sm:grid-cols-[6rem_1fr] sm:gap-4">
          <dt className="font-medium text-navy">宛先</dt>
          <dd className="text-muted">{item.toEmail}</dd>
        </div>
        <div className="grid gap-1 sm:grid-cols-[6rem_1fr] sm:gap-4">
          <dt className="font-medium text-navy">送信元</dt>
          <dd className="text-muted">{item.fromEmail}</dd>
        </div>
        <div className="grid gap-1 sm:grid-cols-[6rem_1fr] sm:gap-4">
          <dt className="font-medium text-navy">件名</dt>
          <dd className="text-navy">{item.subject}</dd>
        </div>
        <div className="grid gap-1 sm:grid-cols-[6rem_1fr] sm:gap-4">
          <dt className="font-medium text-navy">送信日時</dt>
          <dd className="text-muted">{formatDate(item.createdAt)}</dd>
        </div>
        <div className="border-t border-border pt-4">
          <dt className="font-medium text-navy">初回本文</dt>
          <dd className="mt-2 whitespace-pre-wrap leading-relaxed text-muted">
            {item.body}
          </dd>
        </div>
      </dl>

      <section className="mt-8">
        <h2 className="font-[family-name:var(--font-shippori)] text-lg text-navy">
          スレッド（{threads.length}）
        </h2>
        {threads.length === 0 ? (
          <p className="mt-3 text-sm text-muted">スレッドメッセージはまだありません。</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {threads.map((msg) => (
              <li
                key={msg.id}
                className="rounded-lg border border-border bg-surface p-4 text-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium text-navy">
                    {msg.sender === "admin" ? "運営" : "先方"}
                  </span>
                  <span className="text-xs text-muted">
                    {formatDate(msg.createdAt)}
                  </span>
                </div>
                <p className="mt-2 whitespace-pre-wrap leading-relaxed text-muted">
                  {msg.message}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <AdminOutboundThreadForms outboundEmailId={item.id} />
    </div>
  );
}
