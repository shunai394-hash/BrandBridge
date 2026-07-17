import type { Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { getAdminDashboardStats } from "@/lib/admin-dashboard";

export const metadata: Metadata = {
  title: "運営ダッシュボード",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

/**
 * /admin の唯一の表示元。
 * 旧6カード（審査待ち案件 / 公開中案件 / 交渉数 / 成約件数 / 成約金額合計 / 手数料合計）
 * は git HEAD のこのファイルにあった。作業ツリーでは ops 4セクションのみを返す。
 */
export default async function AdminIndexPage() {
  noStore();
  const stats = await getAdminDashboardStats();

  return (
    <div
      className="mx-auto max-w-6xl px-5 py-12"
      data-admin-dashboard="ops-v2"
      data-admin-source="app/admin/page.tsx"
    >
      <h1 className="font-[family-name:var(--font-shippori)] text-3xl text-navy">
        運営ダッシュボード
      </h1>
      <p className="mt-2 text-muted">
        商品掲載・審査・交渉・契約・仲介手数料の流れを確認します。商品代金の決済には関与しません。
      </p>
      <p className="mt-3 text-sm font-medium text-teal">
        表示区分：商品 / 交渉 / 手数料 / 売上
      </p>
      <AdminDashboard stats={stats} />
    </div>
  );
}
