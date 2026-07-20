import type { Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";
import { AdminOutboundMailComposeForm } from "@/components/admin/AdminOutboundMailComposeForm";
import { AdminOutboundMailList } from "@/components/admin/AdminOutboundMailList";
import { listOutboundEmails } from "@/lib/admin-outbound-mail";
import { getMailFrom } from "@/lib/mail-from";

export const metadata: Metadata = {
  title: "営業メール（未登録企業）",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

/**
 * Auth: app/admin/layout.tsx only.
 * Separate from /admin/inquiries and /admin/companies.
 */
export default async function AdminOutboundMailPage() {
  noStore();
  const { items, error } = await listOutboundEmails();
  const from = getMailFrom();

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="font-[family-name:var(--font-shippori)] text-3xl text-navy">
        営業メール（未登録企業）
      </h1>
      <p className="mt-2 text-muted">
        未登録企業へ提携依頼メールを送信し、スレッドでやり取りを管理します。
      </p>
      <p className="mt-2 text-xs text-muted">
        送信元: {from.formatted}（MAIL_FROM_NAME / MAIL_FROM_ADDRESS で変更可）
      </p>

      <div className="mt-8">
        <AdminOutboundMailComposeForm />
      </div>

      <section className="mt-12">
        <h2 className="mb-4 font-[family-name:var(--font-shippori)] text-xl text-navy">
          送信履歴（{items.length}）
        </h2>
        {error ? (
          <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            取得に失敗しました: {error}
          </div>
        ) : null}
        <AdminOutboundMailList items={items} />
      </section>
    </div>
  );
}
