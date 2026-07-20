import Link from "next/link";
import type { ReactNode } from "react";

export type MailTab = "inbox" | "sent" | "threads" | "compose";

type AdminMailShellProps = {
  active: MailTab;
  unreadCount: number;
  sentCount: number;
  threadCount: number;
  fromFormatted: string;
  replyTo: string | null;
  envError?: string;
  children: ReactNode;
};

const tabs: Array<{ id: MailTab; href: string; label: string }> = [
  { id: "inbox", href: "/admin/mail", label: "受信箱" },
  { id: "sent", href: "/admin/mail/sent", label: "送信済み" },
  { id: "threads", href: "/admin/mail/threads", label: "スレッド一覧" },
  { id: "compose", href: "/admin/mail/compose", label: "新規メール作成" },
];

export function AdminMailShell({
  active,
  unreadCount,
  sentCount,
  threadCount,
  fromFormatted,
  replyTo,
  envError,
  children,
}: AdminMailShellProps) {
  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <header className="mb-6">
        <h1 className="font-[family-name:var(--font-shippori)] text-3xl text-navy">
          営業メール
        </h1>
        <p className="mt-2 text-sm text-muted">
          未登録企業への掲載案内・提携依頼。送受信をスレッドで管理します（お問い合わせ管理とは別機能です）。
        </p>
        <p className="mt-2 text-xs text-muted">
          送信元: {fromFormatted}
          {" ／ "}
          返信先: {replyTo ?? "（未設定）"}
        </p>
        {envError ? (
          <p className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            環境変数不足: {envError}
          </p>
        ) : null}
      </header>

      <div className="flex flex-col gap-6 md:flex-row">
        <aside className="w-full shrink-0 md:w-52">
          <nav className="space-y-1 rounded-lg border border-border bg-surface p-2">
            {tabs.map((tab) => {
              const badge =
                tab.id === "inbox"
                  ? unreadCount
                  : tab.id === "sent"
                    ? sentCount
                    : tab.id === "threads"
                      ? threadCount
                      : 0;
              const isActive = active === tab.id;
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  prefetch={false}
                  className={
                    isActive
                      ? "flex items-center justify-between rounded-md bg-teal/10 px-3 py-2 text-sm font-medium text-teal-dark"
                      : "flex items-center justify-between rounded-md px-3 py-2 text-sm text-muted transition hover:bg-cream hover:text-navy"
                  }
                >
                  <span>{tab.label}</span>
                  {badge > 0 ? (
                    <span
                      className={
                        tab.id === "inbox" && unreadCount > 0
                          ? "rounded-md bg-teal px-1.5 text-xs text-white"
                          : "rounded-md bg-cream px-1.5 text-xs text-muted"
                      }
                    >
                      {badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}

export function formatMailDate(iso: string): string {
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
