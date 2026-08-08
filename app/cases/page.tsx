import type { Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";

import { CaseList, type CaseListItem } from "@/components/cases/CaseList";
import { PlatformStatsCard } from "@/components/cases/PlatformStatsCard";
import { listOpenCases } from "@/lib/cases";
import { getPlatformStats } from "@/lib/platform-stats";

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
  title: "蝠・刀荳隕ｧ",
  description: "BrandBridgeに掲載中の商品一覧です。",
};

export const dynamic = "force-dynamic";

export default async function CasesPage() {
  noStore();

  const cases = await listOpenCases();

  const listItems = cases.map(toListItem);

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 md:py-16">

      <header className="mb-8">
        <h1 className="font-[family-name:var(--font-shippori)] text-3xl text-navy md:text-4xl">
          蝠・刀荳隕ｧ
        </h1>

        <p className="mt-3 text-muted">
          蝠・刀繧呈ｯ碑ｼ・＠縺ｦ蛟呵｣懊ｒ謗｢縺帙∪縺吶・
        </p>
      </header>

      <PlatformStatsCard stats={await getPlatformStats()} />

      <CaseList
        items={listItems}
      />

    </div>
  );
}



