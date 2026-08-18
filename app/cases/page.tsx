import type { Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";

import { CaseList, type CaseListItem } from "@/components/cases/CaseList";
import { PlatformStatsCard } from "@/components/cases/PlatformStatsCard";
import { listOpenCases } from "@/lib/cases";
import { pairedLanguageAlternates } from "@/lib/hreflang";
import { getPlatformStats } from "@/lib/platform-stats";
import { caseCategories } from "@/lib/types";

function toListItem(
  item: Awaited<ReturnType<typeof listOpenCases>>[number],
): CaseListItem {
  return {
    id: item.id,
    title: item.title,
    productName: item.productName,
    sku: item.sku,
    summary: item.summary,
    makerName: item.makerName,
    category: item.category,
    targetCountry: item.targetCountry,
    shipFrom: item.shipFrom ?? null,
    salesFormat: item.salesFormat,
    isExclusive: item.isExclusive,
    productImageUrl: item.productImageUrl,
    priceBand: item.priceBand,
    minOrder: item.minOrder,
    applicationCount: item.applicationCount ?? 0,
    status: item.status,
    reviewStatus: item.reviewStatus,
    hasDeal: item.hasDeal ?? false,
  };
}

export const metadata: Metadata = {
  title: "事例一覧",
  description: "BrandBridgeに掲載中の商品一覧です。",
  ...pairedLanguageAlternates("/cases", "/en/cases", "ja"),
};

export const dynamic = "force-dynamic";

type CasesPageProps = {
  searchParams: Promise<{ category?: string }>;
};

export default async function CasesPage({ searchParams }: CasesPageProps) {
  noStore();

  const params = await searchParams;
  const requested = params.category?.trim() ?? "";
  const initialCategory = (caseCategories as readonly string[]).includes(
    requested,
  )
    ? requested
    : undefined;

  const cases = await listOpenCases();
  const listItems = cases.map(toListItem);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <header className="mb-8">
        <h1 className="font-[family-name:var(--font-shippori)] text-3xl text-navy md:text-4xl">
          事例一覧
        </h1>

        <p className="mt-3 text-muted">
          実際の導入事例・成果をご紹介します。
        </p>
      </header>

      <PlatformStatsCard stats={await getPlatformStats()} />

      <CaseList items={listItems} initialCategory={initialCategory} />
    </main>
  );
}
