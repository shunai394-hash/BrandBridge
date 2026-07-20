import Link from "next/link";
import type { EmailThreadSummary } from "@/lib/admin-outbound-mail";
import { formatMailDate } from "@/components/admin/AdminMailShell";

type Props = {
  items: EmailThreadSummary[];
};

export function AdminMailThreadList({ items }: Props) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-surface px-5 py-10 text-center text-sm text-muted">
        スレッドはまだありません。
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <ul className="divide-y divide-border">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              href={`/admin/mail/${item.outboundEmailId}`}
              prefetch={false}
              className="block px-4 py-3 transition hover:bg-cream/60"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="truncate font-medium text-navy">
                    {item.toEmail}
                  </span>
                  <span className="text-xs text-muted">
                    {item.status}
                    {item.unreadCount > 0
                      ? ` · 未読 ${item.unreadCount}`
                      : ""}
                  </span>
                </div>
                <time className="text-xs text-muted">
                  {formatMailDate(item.lastMessageAt)}
                </time>
              </div>
              <p className="mt-1 truncate text-sm text-navy">{item.subject}</p>
              <p className="mt-0.5 truncate text-sm text-muted">
                {item.lastPreview}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
