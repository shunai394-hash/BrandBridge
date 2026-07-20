import Link from "next/link";
import type { OutboundEmail } from "@/lib/admin-outbound-mail";

type AdminOutboundMailListProps = {
  items: OutboundEmail[];
};

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

function preview(text: string): string {
  const one = text.replace(/\s+/g, " ").trim();
  return one.length > 60 ? `${one.slice(0, 60)}…` : one;
}

export function AdminOutboundMailList({ items }: AdminOutboundMailListProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-surface px-5 py-10 text-center text-sm text-muted">
        送信履歴はまだありません。
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-border bg-cream/50 text-xs text-muted">
          <tr>
            <th className="px-4 py-3 font-medium">状態</th>
            <th className="px-4 py-3 font-medium">宛先</th>
            <th className="px-4 py-3 font-medium">件名</th>
            <th className="px-4 py-3 font-medium">本文</th>
            <th className="px-4 py-3 font-medium">送信日時</th>
            <th className="px-4 py-3 font-medium">操作</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-border last:border-0">
              <td className="px-4 py-3">
                {item.status === "sent" ? (
                  <span className="inline-flex rounded-md bg-teal/10 px-2 py-0.5 text-xs font-medium text-teal-dark">
                    sent
                  </span>
                ) : (
                  <span className="inline-flex rounded-md bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
                    failed
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-muted">{item.toEmail}</td>
              <td className="px-4 py-3 font-medium text-navy">{item.subject}</td>
              <td className="max-w-xs px-4 py-3 text-muted">
                {preview(item.body)}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-muted">
                {formatDate(item.createdAt)}
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/admin/mail/${item.id}`}
                  prefetch={false}
                  className="font-medium text-teal hover:underline"
                >
                  スレッド
                  {item.threadCount > 0 ? `（${item.threadCount}）` : ""}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
