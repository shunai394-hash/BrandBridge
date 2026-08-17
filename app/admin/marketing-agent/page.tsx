import type { Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";
import { MarketingAgentConsole } from "@/components/admin/marketing-agent/MarketingAgentConsole";
import { loadMarketingAgentPageData } from "@/lib/marketing-agent/store";
import { loadSocialDashboard } from "@/lib/social/dashboard";

export const metadata: Metadata = {
  title: "Marketing Agent",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const maxDuration = 120;

/**
 * Internal SEO / content planning. Admin layout already gates auth.
 * Does not auto-publish pages or auto-post to social. X can be posted after review.
 */
export default async function AdminMarketingAgentPage({
  searchParams,
}: {
  searchParams: Promise<{ linkedin?: string; detail?: string }>;
}) {
  noStore();
  const query = await searchParams;
  const [data, social] = await Promise.all([
    loadMarketingAgentPageData(),
    loadSocialDashboard(),
  ]);

  const linkedInNotice =
    query.linkedin === "connected"
      ? { tone: "ok" as const, text: "LinkedIn 個人プロフィールの認証が完了しました。" }
      : query.linkedin === "error"
        ? {
            tone: "error" as const,
            text:
              query.detail?.trim() ||
              "LinkedIn 認証に失敗しました。会社ページの作成は行いません。",
          }
        : null;

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="font-[family-name:var(--font-shippori)] text-3xl text-navy">
        Marketing Agent
      </h1>
      <p className="mt-2 mb-8 text-muted">
        BrandBridge の集客・SEO・GEO・コンテンツ企画を支援します。生成物は管理画面で確認してから採用してください。自動公開・自動投稿はありません。X は確認後に手動で投稿できます。
      </p>
      <MarketingAgentConsole
        overview={data.overview}
        runs={data.runs}
        ideas={data.ideas}
        drafts={data.drafts}
        recommendations={data.recommendations}
        competitors={data.competitors}
        gaps={data.gaps}
        publishedPages={data.publishedPages}
        social={social}
        linkedInNotice={linkedInNotice}
      />
    </div>
  );
}
