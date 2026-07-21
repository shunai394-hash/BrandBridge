import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getDefaultCommissionRate, listDeals } from "@/lib/deals";
import { enDealsCopy } from "@/lib/en-account-ui";

export const metadata: Metadata = {
  title: "Deals",
  description: enDealsCopy.subtitle,
};

export const dynamic = "force-dynamic";

function formatYen(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export default async function EnglishDealsPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect(`/en/login?next=${encodeURIComponent("/en/deals")}`);
  }

  const t = enDealsCopy;
  const [deals, defaultRate] = await Promise.all([
    listDeals(),
    getDefaultCommissionRate(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 md:py-16" lang="en">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-shippori)] text-3xl text-navy md:text-4xl">
            {t.title}
          </h1>
          <p className="mt-3 text-muted">{t.subtitle}</p>
        </div>
        {user.role === "admin" ? (
          <p className="text-sm text-muted">
            {t.defaultRate(defaultRate)} /{" "}
            <Link
              href="/admin/negotiations"
              className="text-teal hover:underline"
            >
              {t.adminLink}
            </Link>
          </p>
        ) : null}
      </header>

      {deals.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-surface px-5 py-10 text-center text-muted">
          {t.empty}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-surface">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border bg-cream/50 text-xs text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">{t.columns.date}</th>
                <th className="px-4 py-3 font-medium">{t.columns.product}</th>
                <th className="px-4 py-3 font-medium">{t.columns.supplier}</th>
                <th className="px-4 py-3 font-medium">{t.columns.partner}</th>
                <th className="px-4 py-3 font-medium">{t.columns.amount}</th>
                <th className="px-4 py-3 font-medium">{t.columns.fee}</th>
              </tr>
            </thead>
            <tbody>
              {deals.map((deal) => (
                <tr
                  key={deal.id}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    {formatDate(deal.dealClosedAt)}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/en/cases/${deal.caseId}`}
                      className="text-navy hover:text-teal hover:underline"
                    >
                      {deal.caseTitle}
                    </Link>
                    <p className="mt-1 text-xs text-muted">
                      <Link
                        href={`/negotiations/${deal.negotiationId}`}
                        className="hover:underline"
                      >
                        {t.negotiationDetail}
                      </Link>
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/profiles/${deal.makerId}`}
                      className="hover:text-teal hover:underline"
                    >
                      {deal.makerName}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/profiles/${deal.partnerId}`}
                      className="hover:text-teal hover:underline"
                    >
                      {deal.partnerName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {formatYen(deal.dealAmount)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <p>{formatYen(deal.commissionAmount)}</p>
                    <p className="text-xs text-muted">
                      {t.rate(deal.commissionRate)}
                    </p>
                    {deal.commissionNote ? (
                      <p className="mt-1 text-xs text-muted">
                        {deal.commissionNote}
                      </p>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
