import Link from "next/link";
import type { InboundEmail } from "@/lib/admin-outbound-mail";
import { formatMailDate } from "@/components/admin/AdminMailShell";

type Props = {
  items: InboundEmail[];
};

export function AdminMailInboxList({ items }: Props) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-surface px-5 py-10 text-center text-sm text-muted">
        受信メールはまだありません。相手が Reply-To へ返信するとここに表示されます。
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <ul className="divide-y divide-border">
        {items.map((item) => {
          const href = item.outboundEmailId
            ? `/admin/mail/${item.outboundEmailId}?inbound=${item.id}`
            : `/admin/mail?inbound=${item.id}`;
          const unread = item.readStatus === "unread";
          return (
            <li key={item.id}>
              <Link
                href={href}
                prefetch={false}
                className={
                  unread
                    ? "block bg-teal/[0.04] px-4 py-3 transition hover:bg-teal/[0.08]"
                    : "block px-4 py-3 transition hover:bg-cream/60"
                }
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    {unread ? (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-teal" />
                    ) : (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-transparent" />
                    )}
                    <span
                      className={
                        unread
                          ? "truncate font-semibold text-navy"
                          : "truncate text-navy"
                      }
                    >
                      {item.fromEmail}
                    </span>
                    <span className="shrink-0 text-xs text-muted">
                      {unread ? "未読" : "既読"}
                    </span>
                  </div>
                  <time className="text-xs text-muted">
                    {formatMailDate(item.receivedAt)}
                  </time>
                </div>
                <p
                  className={
                    unread
                      ? "mt-1 truncate text-sm font-medium text-navy"
                      : "mt-1 truncate text-sm text-navy"
                  }
                >
                  {item.subject || "(件名なし)"}
                </p>
                <p className="mt-0.5 truncate text-sm text-muted">
                  {item.body}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
