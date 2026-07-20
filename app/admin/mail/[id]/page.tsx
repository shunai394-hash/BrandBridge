import type { Metadata } from "next";
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { notFound } from "next/navigation";
import { AdminOutboundThreadForms } from "@/components/admin/AdminOutboundThreadForms";
import { MarkInboundRead } from "@/components/admin/MarkInboundRead";
import { formatMailDate } from "@/components/admin/AdminMailShell";
import {
  getOutboundEmailById,
  listThreadMessages,
} from "@/lib/admin-outbound-mail";
import { getReplyToEmail } from "@/lib/outbound-mail";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ inbound?: string }>;
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

function StatusLabel({ status }: { status: string }) {
  if (status === "replied") {
    return <span className="font-medium text-teal">replied（返信あり）</span>;
  }
  if (status === "failed") {
    return <span className="font-medium text-red-600">failed</span>;
  }
  return <span className="font-medium text-amber-800">sent（返信待ち）</span>;
}

export default async function AdminOutboundMailDetailPage({
  params,
  searchParams,
}: PageProps) {
  noStore();
  const { id } = await params;
  const sp = await searchParams;
  const [item, threads] = await Promise.all([
    getOutboundEmailById(id),
    listThreadMessages(id),
  ]);
  if (!item) notFound();

  const replyTo = item.replyToEmail ?? getReplyToEmail();

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      {item.unreadInboundCount > 0 || sp.inbound ? (
        <MarkInboundRead
          inboundId={sp.inbound}
          outboundEmailId={item.id}
          markAllForOutbound={item.unreadInboundCount > 0}
        />
      ) : null}

      <div className="flex flex-wrap gap-4 text-sm">
        <Link href="/admin/mail" className="text-teal hover:underline">
          ← 受信箱
        </Link>
        <Link href="/admin/mail/sent" className="text-teal hover:underline">
          送信済み
        </Link>
        <Link href="/admin/mail/threads" className="text-teal hover:underline">
          スレッド一覧
        </Link>
      </div>

      <h1 className="mt-4 font-[family-name:var(--font-shippori)] text-3xl text-navy">
        {item.subject}
      </h1>
      <p className="mt-2 text-sm text-muted">
        {item.toEmail} とのスレッド（時系列）
      </p>

      <dl className="mt-6 grid gap-3 rounded-lg border border-border bg-surface p-5 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs text-muted">状態</dt>
          <dd className="mt-1">
            <StatusLabel status={item.status} />
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted">送信日時</dt>
          <dd className="mt-1 text-navy">{formatMailDate(item.createdAt)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">送信元</dt>
          <dd className="mt-1 text-muted">{item.fromEmail}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Reply-To</dt>
          <dd className="mt-1 text-muted">{replyTo ?? "（未設定）"}</dd>
        </div>
      </dl>

      <section className="mt-8">
        <h2 className="font-[family-name:var(--font-shippori)] text-lg text-navy">
          会話（{threads.length}）
        </h2>
        {threads.length === 0 ? (
          <p className="mt-3 text-sm text-muted">メッセージはまだありません。</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {threads.map((msg) => {
              const isAdmin = msg.senderType === "admin";
              return (
                <li
                  key={msg.id}
                  className={
                    isAdmin
                      ? "rounded-lg border border-border bg-surface p-4 text-sm"
                      : "rounded-lg border border-teal/30 bg-teal/5 p-4 text-sm"
                  }
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium text-navy">
                      {isAdmin ? "BrandBridge" : item.toEmail}
                    </span>
                    <span className="text-xs text-muted">
                      {formatMailDate(msg.createdAt)}
                    </span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap leading-relaxed text-muted">
                    {msg.message}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <AdminOutboundThreadForms outboundEmailId={item.id} />
    </div>
  );
}
