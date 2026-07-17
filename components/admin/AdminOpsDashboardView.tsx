import { AdminDashboard } from "@/components/admin/AdminDashboard";
import type { AdminDashboardStats } from "@/lib/admin-dashboard";

type AdminOpsDashboardViewProps = {
  stats: AdminDashboardStats;
};

/** Ops dashboard body for the existing /admin screen. */
export function AdminOpsDashboardView({ stats }: AdminOpsDashboardViewProps) {
  return (
    <div
      className="mx-auto max-w-6xl px-5 py-12"
      data-admin-dashboard="ops-v2"
      data-admin-dashboard-component="AdminDashboard"
    >
      <h1 className="font-[family-name:var(--font-shippori)] text-3xl text-navy">
        運営ダッシュボード
      </h1>
      <p className="mt-2 text-muted">
        商品掲載・審査・交渉・契約・仲介手数料の流れを確認します。商品代金の決済には関与しません。
      </p>
      <AdminDashboard stats={stats} />
    </div>
  );
}
