import type { Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";
import { AdminMailShell } from "@/components/admin/AdminMailShell";
import { AdminMailThreadList } from "@/components/admin/AdminMailThreadList";
import { loadMailShellCounts } from "@/lib/admin-mail-page";

export const metadata: Metadata = {
  title: "営業メール｜スレッド",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function AdminMailThreadsPage() {
  noStore();
  const shell = await loadMailShellCounts();

  return (
    <AdminMailShell
      active="threads"
      unreadCount={shell.unreadCount}
      sentCount={shell.sentCount}
      threadCount={shell.threadCount}
      fromFormatted={shell.fromFormatted}
      replyTo={shell.replyTo}
      envError={shell.envError}
    >
      <h2 className="mb-4 font-[family-name:var(--font-shippori)] text-xl text-navy">
        スレッド一覧
      </h2>
      {shell.threads.error ? (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          取得に失敗しました: {shell.threads.error}
        </div>
      ) : null}
      <AdminMailThreadList items={shell.threads.items} />
    </AdminMailShell>
  );
}
