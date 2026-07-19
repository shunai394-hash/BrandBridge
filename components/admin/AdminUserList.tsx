"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { setUserActiveAction } from "@/lib/actions";
import { Button } from "@/components/ui/Button";
import type { AdminUserListItem } from "@/lib/admin";

const roleLabels: Record<string, string> = {
  maker: "商品提供企業",
  partner: "パートナー",
  admin: "管理者",
};

type AdminUserListProps = {
  items: AdminUserListItem[];
  currentAdminId: string;
};

export function AdminUserList({ items, currentAdminId }: AdminUserListProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function toggle(userId: string, nextActive: boolean) {
    setError("");
    setLoadingId(userId);
    const result = await setUserActiveAction({
      userId,
      isActive: nextActive,
    });
    setLoadingId(null);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="overflow-x-auto rounded-lg border border-border bg-surface">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-border bg-cream/50 text-xs text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">会社</th>
              <th className="px-4 py-3 font-medium">種別</th>
              <th className="px-4 py-3 font-medium">メール</th>
              <th className="px-4 py-3 font-medium">状態</th>
              <th className="px-4 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {items.map((user) => (
              <tr key={user.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium text-navy">{user.companyName}</p>
                  <p className="text-xs text-muted">{user.contactName}</p>
                </td>
                <td className="px-4 py-3">{roleLabels[user.role] ?? user.role}</td>
                <td className="px-4 py-3 text-muted">{user.email}</td>
                <td className="px-4 py-3">
                  {user.isActive ? (
                    <span className="text-teal">有効</span>
                  ) : (
                    <span className="text-red-600">停止</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {user.id === currentAdminId ? (
                    <span className="text-xs text-muted">（自分）</span>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => toggle(user.id, !user.isActive)}
                      disabled={loadingId === user.id}
                    >
                      {loadingId === user.id
                        ? "..."
                        : user.isActive
                          ? "停止"
                          : "有効化"}
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
