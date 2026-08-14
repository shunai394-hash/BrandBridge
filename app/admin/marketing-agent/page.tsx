import type { Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";
import { MarketingAgentConsole } from "@/components/admin/marketing-agent/MarketingAgentConsole";
import { loadMarketingAgentPageData } from "@/lib/marketing-agent/store";

export const metadata: Metadata = {
  title: "Marketing Agent",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const maxDuration = 120;

/**
 * Internal SEO / content planning. Admin layout already gates auth.
 * Does not publish pages or post to social.
 */
export default async function AdminMarketingAgentPage() {
  noStore();
  const data = await loadMarketingAgentPageData();

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="font-[family-name:var(--font-shippori)] text-3xl text-navy">
        Marketing Agent
      </h1>
      <p className="mt-2 mb-8 text-muted">
        BrandBridge の集客・SEO・GEO・コンテンツ企画を支援します。生成物は管理画面で確認してから採用してください。自動公開・自動投稿はありません。
      </p>
      <MarketingAgentConsole
        overview={data.overview}
        runs={data.runs}
        ideas={data.ideas}
        drafts={data.drafts}
        recommendations={data.recommendations}
        competitors={data.competitors}
        gaps={data.gaps}
      />
    </div>
  );
}
