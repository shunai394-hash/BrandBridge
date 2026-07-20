import Link from "next/link";
import type { OutboundEmail } from "@/lib/admin-outbound-mail";
import { formatMailDate } from "@/components/admin/AdminMailShell";

type AdminOutboundMailListProps = {
  items: OutboundEmail[];
};

function StatusBadge({ status }: { status: OutboundEmail["status"] }) {
  if (status === "replied") {
    return (
      <span className="inline-flex rounded-md bg-teal/10 px-2 py-0.5 text-xs font-medium text-teal-dark">
        replied
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span className="inline-flex rounded-md bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
        failed
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">
      sent
    </span>
  );
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
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-border last:border-0">
              <td className="px-4 py-3">
                <StatusBadge status={item.status} />
              </td>
              <td className="px-4 py-3 text-muted">{item.toEmail}</td>
              <td className="px-4 py-3">
                <Link
                  href={`/admin/mail/${item.id}`}
                  prefetch={false}
                  className="font-medium text-navy hover:text-teal hover:underline"
                >
                  {item.subject}
                </Link>
              </td>
              <td className="max-w-[14rem] truncate px-4 py-3 text-muted">
                {item.body}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-muted">
                {formatMailDate(item.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
