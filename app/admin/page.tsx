import type { Metadata } from "next";
import Link from "next/link";
import { getAdminStats } from "@/lib/admin";

export const metadata: Metadata = {
  title: "管理画面",
};

export const dynamic = "force-dynamic";

function formatYen(n: number) {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(n);
}

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  const cards = [
    {
      label: "審査待ち案件",
      value: String(stats.pendingReviews),
      href: "/admin/cases?status=pending_review",
    },
    {
      label: "公開中案件",
      value: String(stats.approvedCases),
      href: "/admin/cases?status=approved",
    },
    {
      label: "交渉数",
      value: String(stats.totalNegotiations),
      href: "/admin/negotiations",
    },
    {
      label: "成約件数",
      value: String(stats.dealCount),
      href: "/deals",
    },
    {
      label: "成約金額合計",
      value: formatYen(stats.totalDealAmount),
      href: "/deals",
    },
    {
      label: "手数料合計",
      value: formatYen(stats.totalCommission),
      href: "/deals",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="font-[family-name:var(--font-shippori)] text-3xl text-navy">
        運営ダッシュボード
      </h1>
      <p className="mt-2 text-muted">
        案件審査・交渉・成約・手数料の状況を確認します。
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-lg border border-border bg-surface p-5 transition hover:border-teal/40"
          >
            <p className="text-sm text-muted">{card.label}</p>
            <p className="mt-2 font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              {card.value}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
