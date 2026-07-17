import Link from "next/link";
import {
  adminDashboardSections,
  type AdminDashboardMetricValue,
  type AdminDashboardStats,
} from "@/lib/admin-dashboard";

type AdminDashboardProps = {
  stats: AdminDashboardStats;
};

function formatMetricValue(metric: AdminDashboardMetricValue): string {
  if (metric.kind === "count") {
    return String(metric.value);
  }
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: metric.currency,
    maximumFractionDigits: 0,
  }).format(metric.value);
}

/**
 * Operations dashboard sections (products → negotiations → fees → revenue).
 * Metric keys/section ids are stable for future e-contract / billing hooks.
 */
export function AdminDashboard({ stats }: AdminDashboardProps) {
  return (
    <div
      className="mt-8 space-y-8"
      data-component="AdminDashboard"
      data-dashboard-version="ops-v2"
    >
      {adminDashboardSections.map((section) => (
        <section
          key={section.id}
          data-dashboard-section={section.id}
          aria-labelledby={`admin-dash-${section.id}`}
          className="rounded-lg border border-border bg-cream/40 p-5 md:p-6"
        >
          <div className="mb-4 border-b border-border pb-3">
            <h2
              id={`admin-dash-${section.id}`}
              className="font-[family-name:var(--font-shippori)] text-xl text-navy"
            >
              {section.title}
            </h2>
            <p className="mt-1 text-sm text-muted">{section.description}</p>
          </div>
          <div
            className={`grid gap-4 sm:grid-cols-2 ${
              section.metrics.length >= 3 ? "lg:grid-cols-3" : "lg:grid-cols-2"
            }`}
          >
            {section.metrics.map((metric) => {
              const value = metric.getValue(stats);
              return (
                <Link
                  key={metric.key}
                  href={metric.href}
                  prefetch={false}
                  data-dashboard-metric={metric.key}
                  className="rounded-lg border border-border bg-surface p-5 transition hover:border-teal/40"
                >
                  <p className="text-sm text-muted">{metric.label}</p>
                  <p className="mt-2 font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
                    {formatMetricValue(value)}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
