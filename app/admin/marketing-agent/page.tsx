import type { Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";
import { MarketingAgentConsole } from "@/components/marketing-agent/MarketingAgentConsole";
import { listAdminCases } from "@/lib/admin";
import { loadMarketingConsole } from "@/lib/marketing-agent";

export const metadata: Metadata = {
  title: "Marketing Agent",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const maxDuration = 120;

/**
 * Internal Marketing Engine. Admin layout already gates with diagnoseAdminAccess.
 * Not a 4th user role.
 */
export default async function MarketingAgentPage() {
  noStore();
  const [data, casesResult] = await Promise.all([
    loadMarketingConsole(),
    listAdminCases(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="font-[family-name:var(--font-shippori)] text-3xl text-navy">
        Marketing Agent
      </h1>
      <p className="mt-2 mb-8 text-muted">
        BrandBridge 専用エンジン：調査 → コンテンツ → 配信 → 計測 → 改善 → 拡大。既存の案件・交渉・契約・Stripe・Resend
        には接続しません。
      </p>
      <MarketingAgentConsole
        data={data}
        cases={casesResult.items.map((item) => ({
          id: item.id,
          caseNumber: item.caseNumber,
          productName: item.productName,
          makerName: item.makerName,
        }))}
        casesError={casesResult.error}
      />
    </div>
  );
}
