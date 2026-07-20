import type { ReactNode } from "react";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { StaleAdminUiGuard } from "@/components/admin/StaleAdminUiGuard";
import { diagnoseAdminAccess } from "@/lib/auth";

export const dynamic = "force-dynamic";

const adminNav = [
  { href: "/admin", label: "ダッシュボード" },
  { href: "/admin/cases", label: "商品審査" },
  { href: "/admin/users", label: "ユーザー管理" },
  { href: "/admin/companies", label: "登録企業メール" },
  { href: "/admin/mail", label: "営業メール" },
  { href: "/admin/negotiations", label: "交渉一覧" },
  { href: "/admin/inquiries", label: "お問い合わせ" },
  { href: "/deals", label: "成約一覧" },
] as const;

function safeNextPath(pathname: string | null): string {
  if (
    pathname &&
    pathname.startsWith("/admin") &&
    !pathname.startsWith("//")
  ) {
    return pathname;
  }
  return "/admin";
}

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const hdrs = await headers();
  const uiProbe =
    process.env.NODE_ENV === "development" &&
    hdrs.get("x-bb-admin-ui-probe") === "1";

  // Always resolve admin via auth.getUser() → profiles.id = auth.uid()
  // Single auth gate for ALL /admin/* pages (including /admin/inquiries).
  const diagnosis = await diagnoseAdminAccess();

  if (!diagnosis.ok && !uiProbe) {
    const params = new URLSearchParams({
      next: safeNextPath(hdrs.get("x-pathname")),
      error: diagnosis.code,
    });
    if (diagnosis.role) params.set("role", diagnosis.role);
    if (diagnosis.authUserId) params.set("uid", diagnosis.authUserId);
    redirect(`/login?${params.toString()}`);
  }

  const email = diagnosis.ok ? diagnosis.user.email : "ui-probe@local";

  return (
    <div className="border-b border-border bg-cream/60">
      <StaleAdminUiGuard />
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-5 py-3 text-sm">
        <span className="font-medium text-navy">管理画面</span>
        <span className="text-xs text-muted">{email}</span>
        {adminNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            prefetch={false}
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
