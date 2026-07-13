import type { Metadata } from "next";
import { AdminUserList } from "@/components/admin/AdminUserList";
import { requireAdmin } from "@/lib/auth";
import { listAdminUsers } from "@/lib/admin";

export const metadata: Metadata = {
  title: "ユーザー管理",
};

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const admin = await requireAdmin();
  const users = await listAdminUsers();

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="font-[family-name:var(--font-shippori)] text-3xl text-navy">
        ユーザー管理
      </h1>
      <p className="mt-2 mb-8 text-muted">
        登録ユーザーの確認と、アカウントの有効 / 停止を切り替えます。
      </p>
      <AdminUserList items={users} currentAdminId={admin.id} />
    </div>
  );
}
