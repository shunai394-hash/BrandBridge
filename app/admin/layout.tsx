import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { diagnoseAdminAccess } from "@/lib/auth";

export const dynamic = "force-dynamic";

const adminNav = [
  { href: "/admin", label: "ダッシュボード" },
  { href: "/admin/cases", label: "案件審査" },
  { href: "/admin/users", label: "ユーザー管理" },
  { href: "/admin/negotiations", label: "交渉一覧" },
  { href: "/deals", label: "成約一覧" },
];

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Always resolve admin via auth.getUser() → profiles.id = auth.uid()
  const diagnosis = await diagnoseAdminAccess();

  if (!diagnosis.ok) {
    const params = new URLSearchParams({ next: "/admin", error: diagnosis.code });
    if (diagnosis.role) params.set("role", diagnosis.role);
    if (diagnosis.authUserId) params.set("uid", diagnosis.authUserId);
    redirect(`/login?${params.toString()}`);
  }

  return (
    <div className="border-b border-border bg-cream/60">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-5 py-3 text-sm">
        <span className="font-medium text-navy">管理画面</span>
        <span className="text-xs text-muted">{diagnosis.user.email}</span>
        {adminNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-muted transition hover:text-teal"
          >
            {item.label}
          </Link>
        ))}
      </div>
      {children}
    </div>
  );
}
