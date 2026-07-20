import type { Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";
import { AdminInquiryList } from "@/components/admin/AdminInquiryList";
import { listAdminInquiries } from "@/lib/admin-inquiries";

export const metadata: Metadata = {
  title: "お問い合わせ管理",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

/**
 * Auth is handled only by app/admin/layout.tsx (diagnoseAdminAccess),
 * same as /admin and /admin/negotiations — do not call requireAdmin here.
 */
export default async function AdminInquiriesPage() {
  noStore();
  const { items, error } = await listAdminInquiries();

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="font-[family-name:var(--font-shippori)] text-3xl text-navy">
        お問い合わせ管理
      </h1>
      <p className="mt-2 mb-8 text-muted">
        フォームから送信されたお問い合わせを確認します（{items.length} 件）。
      </p>
      {error ? (
        <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          取得に失敗しました: {error}
        </div>
      ) : null}
      <AdminInquiryList items={items} />
    </div>
  );
}
