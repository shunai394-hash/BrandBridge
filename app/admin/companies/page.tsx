import type { Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";
import { AdminCompanyList } from "@/components/admin/AdminCompanyList";
import { listAdminCompanies } from "@/lib/admin-companies";

export const metadata: Metadata = {
  title: "企業営業メール",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

/**
 * Auth: app/admin/layout.tsx (diagnoseAdminAccess) only.
 */
export default async function AdminCompaniesPage() {
  noStore();
  const { items, error } = await listAdminCompanies();

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="font-[family-name:var(--font-shippori)] text-3xl text-navy">
        企業営業メール
      </h1>
      <p className="mt-2 mb-8 text-muted">
        登録企業（商品提供企業・販売パートナー）へ公式メールで提携依頼・営業案内を送信します（
        {items.length} 社）。
      </p>
      {error ? (
        <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          取得に失敗しました: {error}
        </div>
      ) : null}
      <AdminCompanyList items={items} />
    </div>
  );
}
