import type { Metadata } from "next";
import { AdminNegotiationBoard } from "@/components/admin/AdminNegotiationBoard";
import { listAdminNegotiations } from "@/lib/admin";
import { getDefaultCommissionRate } from "@/lib/deals";

export const metadata: Metadata = {
  title: "交渉一覧",
};

export const dynamic = "force-dynamic";

export default async function AdminNegotiationsPage() {
  const [items, defaultCommissionRate] = await Promise.all([
    listAdminNegotiations(),
    getDefaultCommissionRate(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="font-[family-name:var(--font-shippori)] text-3xl text-navy">
        交渉状況一覧
      </h1>
      <p className="mt-2 mb-8 text-muted">
        パイプライン管理と成約化（成約金額・仲介手数料の登録）を行います。
      </p>
      <AdminNegotiationBoard
        items={items}
        defaultCommissionRate={defaultCommissionRate}
      />
    </div>
  );
}
