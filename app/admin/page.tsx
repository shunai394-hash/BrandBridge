import type { Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AdminMemberStatusSection } from "@/components/admin/AdminMemberStatusSection";
import { getAdminDashboardStats } from "@/lib/admin-dashboard";
import { getAdminMemberStats } from "@/lib/admin-member-stats";

export const metadata: Metadata = {
  title: "運営ダッシュボード",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

/**
 * /admin の唯一の表示元。
 * 会員状況 → 商品 / 交渉 / 手数料 / 売上
 */
export default async function AdminIndexPage() {
  noStore();
  const [stats, memberStats] = await Promise.all([
    getAdminDashboardStats(),
    getAdminMemberStats(),
  ]);

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
        表示区分：会員状況 / 商品 / 交渉 / 手数料 / 売上
      </p>
      <AdminMemberStatusSection stats={memberStats} />
      <AdminDashboard stats={stats} />
    </div>
  );
}
