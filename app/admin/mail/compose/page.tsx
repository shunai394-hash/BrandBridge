import type { Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";
import { AdminMailShell } from "@/components/admin/AdminMailShell";
import { AdminOutboundMailComposeForm } from "@/components/admin/AdminOutboundMailComposeForm";
import { loadMailShellCounts } from "@/lib/admin-mail-page";

export const metadata: Metadata = {
  title: "営業メール｜新規作成",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function AdminMailComposePage() {
  noStore();
  const shell = await loadMailShellCounts();

  return (
    <AdminMailShell
      active="compose"
      unreadCount={shell.unreadCount}
      sentCount={shell.sentCount}
      threadCount={shell.threadCount}
      fromFormatted={shell.fromFormatted}
      replyTo={shell.replyTo}
      envError={shell.envError}
    >
      <AdminOutboundMailComposeForm />
    </AdminMailShell>
  );
}
