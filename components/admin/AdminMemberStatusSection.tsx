import Link from "next/link";
import type { AdminMemberStats, MemberRoleKpi } from "@/lib/admin-member-stats";

type AdminMemberStatusSectionProps = {
  stats: AdminMemberStats;
};

function formatMom(percent: number | null): string {
  if (percent === null) return "—";
  const sign = percent > 0 ? "+" : "";
  return `${sign}${percent}%`;
}

function MemberRoleCard({
  title,
  kpi,
  href,
}: {
  title: string;
  kpi: MemberRoleKpi;
  href: string;
}) {
  return (
    <div
      className="rounded-lg border border-border bg-surface p-5"
      data-member-role={title}
    >
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h3 className="font-[family-name:var(--font-shippori)] text-lg text-navy">
          {title}
        </h3>
        <Link
          href={href}
          prefetch={false}
          className="text-sm font-medium text-teal hover:underline"
        >
          一覧
        </Link>
      </div>
      <dl className="grid gap-4 sm:grid-cols-3">
        <div>
          <dt className="text-sm text-muted">総登録数</dt>
          <dd className="mt-1 font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
            {kpi.total}
            <span className="ml-1 text-base font-normal text-muted">社</span>
          </dd>
        </div>
        <div>
          <dt className="text-sm text-muted">今月新規</dt>
          <dd className="mt-1 font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
            +{kpi.newThisMonth}
            <span className="ml-1 text-base font-normal text-muted">社</span>
          </dd>
        </div>
        <div>
          <dt className="text-sm text-muted">先月比</dt>
          <dd
            className={[
              "mt-1 font-[family-name:var(--font-shippori)] text-2xl md:text-3xl",
              kpi.monthOverMonthPercent !== null &&
              kpi.monthOverMonthPercent > 0
                ? "text-teal"
                : kpi.monthOverMonthPercent !== null &&
                    kpi.monthOverMonthPercent < 0
                  ? "text-red-600"
                  : "text-navy",
            ].join(" ")}
          >
            {formatMom(kpi.monthOverMonthPercent)}
          </dd>
        </div>
      </dl>
    </div>
  );
}

/**
 * 運営ダッシュボード最上段「会員状況」。
 * 既存の商品・交渉・手数料・売上カードは変更しない。
 */
export function AdminMemberStatusSection({
  stats,
}: AdminMemberStatusSectionProps) {
  return (
    <section
      data-dashboard-section="members"
      aria-labelledby="admin-dash-members"
      className="mt-8 rounded-lg border border-border bg-cream/40 p-5 md:p-6"
    >
      <div className="mb-4 border-b border-border pb-3">
        <h2
          id="admin-dash-members"
          className="font-[family-name:var(--font-shippori)] text-xl text-navy"
        >
          会員状況
        </h2>
        <p className="mt-1 text-sm text-muted">
          料金化判断向けに、商品提供企業／販売パートナーの登録規模と月次増減を確認します。
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <MemberRoleCard
          title="商品提供企業"
          kpi={stats.makers}
          href="/admin/users"
        />
        <MemberRoleCard
          title="販売パートナー"
          kpi={stats.partners}
          href="/admin/users"
        />
      </div>
    </section>
  );
}
