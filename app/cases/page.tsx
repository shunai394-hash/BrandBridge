import type { Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";

import { CaseList, type CaseListItem } from "@/components/cases/CaseList";
import { PlatformStatsCard } from "@/components/cases/PlatformStatsCard";
import { PageBreadcrumbs } from "@/components/seo/PageBreadcrumbs";
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

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "海外ブランドの商品一覧",
    description:
      "日本の卸・小売・EC事業者が、海外ブランドの商品をカテゴリや取引条件から探せる一覧です。MOQや卸価格を確認してから商談に進めます。",
    ...pairedLanguageAlternates("/cases", "/en/cases", "ja"),
  };
}

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
      <PageBreadcrumbs
        items={[
          { name: "ホーム", path: "/" },
          { name: "商品一覧", path: "/cases" },
        ]}
      />
      <header className="mb-8">
        <h1 className="font-[family-name:var(--font-shippori)] text-3xl text-navy md:text-4xl">
          商品一覧
        </h1>

        <p className="mt-3 text-muted">
          海外ブランドの商品を、カテゴリや取引条件から探せます。
        </p>
      </header>

      <PlatformStatsCard stats={await getPlatformStats()} />

      <CaseList items={listItems} initialCategory={initialCategory} />
    </main>
  );
}
