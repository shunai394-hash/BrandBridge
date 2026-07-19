import type { PlatformStats } from "@/lib/platform-stats";

type PlatformStatsCardProps = {
  stats: PlatformStats;
};

const items: {
  key: keyof PlatformStats;
  label: string;
  unit: string;
}[] = [
  { key: "listedProducts", label: "掲載商品数", unit: "件" },
  { key: "activeNegotiations", label: "進行中商談", unit: "件" },
  { key: "closedDeals", label: "成立案件", unit: "件" },
  { key: "registeredCompanies", label: "登録企業数", unit: "社" },
];

/**
 * /cases 上部の全体実績カード。商品ごとの応募件数表示とは独立。
 */
export function PlatformStatsCard({ stats }: PlatformStatsCardProps) {
  return (
    <section
      className="mb-8 overflow-hidden rounded-xl border border-border bg-surface shadow-[0_12px_32px_rgba(20,32,51,0.06)]"
      aria-labelledby="platform-stats-heading"
    >
      <div className="border-b border-border bg-[linear-gradient(135deg,#142033_0%,#1a3a4a_55%,#146f6f_100%)] px-5 py-4 md:px-6">
        <p className="text-xs font-medium tracking-wider text-teal/90">
          TRUST SIGNAL
        </p>
        <h2
          id="platform-stats-heading"
          className="mt-1 font-[family-name:var(--font-shippori)] text-xl text-white md:text-2xl"
        >
          BrandBridge実績
        </h2>
        <p className="mt-1 text-sm text-white/70">
          サービス全体の活動状況です。各商品の応募件数とは別に表示しています。
        </p>
      </div>
      <dl className="grid grid-cols-2 gap-px bg-border md:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.key}
            className="bg-surface px-5 py-5 md:px-6 md:py-6"
          >
            <dt className="text-xs font-medium tracking-wide text-muted md:text-sm">
              {item.label}
            </dt>
            <dd className="mt-2 font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              {stats[item.key].toLocaleString("ja-JP")}
              <span className="ml-1 text-base font-normal text-muted">
                {item.unit}
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
