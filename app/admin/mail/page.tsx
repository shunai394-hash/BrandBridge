import type { Metadata } from "next";
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { AdminMailInboxList } from "@/components/admin/AdminMailInboxList";
import {
  AdminMailShell,
  formatMailDate,
} from "@/components/admin/AdminMailShell";
import { MarkInboundRead } from "@/components/admin/MarkInboundRead";
import { getInboundEmailById } from "@/lib/admin-outbound-mail";
import { loadMailShellCounts } from "@/lib/admin-mail-page";

export const metadata: Metadata = {
  title: "営業メール｜受信箱",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

type PageProps = {
  searchParams: Promise<{ inbound?: string }>;
};

/**
 * Auth: app/admin/layout.tsx only.
 * Separate from /admin/inquiries.
 */
export default async function AdminMailInboxPage({ searchParams }: PageProps) {
  noStore();
  const params = await searchParams;
  const shell = await loadMailShellCounts();
  const preview =
    params.inbound ? await getInboundEmailById(params.inbound) : null;

  return (
    <AdminMailShell
      active="inbox"
      unreadCount={shell.unreadCount}
      sentCount={shell.sentCount}
      threadCount={shell.threadCount}
      fromFormatted={shell.fromFormatted}
      replyTo={shell.replyTo}
      envError={shell.envError}
    >
      <h2 className="mb-4 font-[family-name:var(--font-shippori)] text-xl text-navy">
        受信箱
      </h2>
      {shell.inbox.error ? (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          取得に失敗しました: {shell.inbox.error}
        </div>
      ) : null}

      {preview ? (
        <div className="mb-6 rounded-lg border border-border bg-surface p-5 text-sm">
          {preview.readStatus === "unread" ? (
            <MarkInboundRead
              inboundId={preview.id}
              outboundEmailId={preview.outboundEmailId}
              markAllForOutbound={false}
            />
          ) : null}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-medium text-navy">{preview.fromEmail}</p>
            <time className="text-xs text-muted">
              {formatMailDate(preview.receivedAt)}
            </time>
          </div>
          <p className="mt-2 text-navy">{preview.subject || "(件名なし)"}</p>
          <p className="mt-3 whitespace-pre-wrap leading-relaxed text-muted">
            {preview.body}
          </p>
          {preview.outboundEmailId ? (
            <p className="mt-4">
              <Link
                href={`/admin/mail/${preview.outboundEmailId}`}
                prefetch={false}
                className="text-sm font-medium text-teal hover:underline"
              >
                スレッドを開く →
              </Link>
            </p>
          ) : (
            <p className="mt-4 text-xs text-muted">
              対応する送信メールが見つかりませんでした（未マッチ受信）。
            </p>
          )}
        </div>
      ) : null}

      <AdminMailInboxList items={shell.inbox.items} />
    </AdminMailShell>
  );
}
