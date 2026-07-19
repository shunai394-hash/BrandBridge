import type { Metadata } from "next";
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { CaseList, type CaseListItem } from "@/components/cases/CaseList";
import { PlatformStatsCard } from "@/components/cases/PlatformStatsCard";
import { StaleProductListGuard } from "@/components/cases/StaleProductListGuard";
import {
  diagnoseOwnCases,
  isBetaAutoApproveCases,
  listOpenCases,
} from "@/lib/cases";
import { getPlatformStats } from "@/lib/platform-stats";
import { createClient } from "@/lib/supabase/server";

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
    salesFormat: item.salesFormat,
    isExclusive: item.isExclusive,
    applicationCount: item.applicationCount ?? 0,
    status: item.status,
    reviewStatus: item.reviewStatus,
    hasDeal: item.hasDeal ?? false,
  };
}

export const metadata: Metadata = {
  title: "商品一覧",
  description: "BrandBridgeに掲載中の、商品提供企業の商品一覧です。",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

type CasesPageProps = {
  searchParams: Promise<{
    category?: string;
    welcome?: string;
    created?: string;
  }>;
};

/**
 * Guest and logged-in: same listOpenCases → attachNegotiationCounts → CaseList.
 */
export default async function CasesPage({ searchParams }: CasesPageProps) {
  noStore();
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [cases, ownDiag] = await Promise.all([
    listOpenCases(),
    diagnoseOwnCases(),
  ]);

  console.log("CASE PAGE AUTH", {
    userId: user?.id,
    count: cases?.length,
    firstCase: cases?.[0],
    atl0010: cases?.find((c) => c.sku?.trim() === "ATL-0010"),
    hyc0003: cases?.find((c) => c.sku?.trim() === "HYC-0003"),
    aob0002: cases?.find((c) => c.sku?.trim() === "AOB-0002"),
  });

  const betaAutoApprove = isBetaAutoApproveCases();
  const ownPending = ownDiag.rows.filter(
    (r) => r.status === "open" && r.review_status === "pending_review",
  );
  const createdVisible = params.created
    ? cases.some((c) => c.id === params.created) ||
      ownDiag.rows.some((r) => r.id === params.created)
    : false;
  const createdCase = cases.find((c) => c.id === params.created);
  const createdLabel = createdCase?.productName ?? null;
  const createdSku = createdCase?.sku?.trim() || null;
  const listItems = cases.map(toListItem);

  const pageAuthDebug = {
    userId: user?.id ?? null,
    count: cases.length,
    atl0010: (() => {
      const c = cases.find((x) => x.sku?.trim() === "ATL-0010");
      return c
        ? {
            sku: c.sku,
            applicationCount: c.applicationCount ?? 0,
            hasDeal: c.hasDeal ?? false,
          }
        : null;
    })(),
    hyc0003: (() => {
      const c = cases.find((x) => x.sku?.trim() === "HYC-0003");
      return c
        ? {
            sku: c.sku,
            applicationCount: c.applicationCount ?? 0,
            hasDeal: c.hasDeal ?? false,
          }
        : null;
    })(),
    aob0002: (() => {
      const c = cases.find((x) => x.sku?.trim() === "AOB-0002");
      return c
        ? {
            sku: c.sku,
            applicationCount: c.applicationCount ?? 0,
            hasDeal: c.hasDeal ?? false,
          }
        : null;
    })(),
  };

  const listKey = `cases-v19-${listItems.map((i) => i.id).join("|")}`;

  return (
    <div
      className="mx-auto max-w-7xl px-5 py-12 md:py-16"
      data-cases-page="v19"
      data-cases-source="listOpenCases"
    >
      {params.welcome === "partner" ? (
        <div className="mb-8 rounded-xl border border-teal/30 bg-cream px-5 py-4">
          <p className="font-medium text-navy">パートナー登録ありがとうございます</p>
          <p className="mt-1 text-sm text-muted">
            公開中（approved）の商品から探せます。
          </p>
        </div>
      ) : null}

      {params.created ? (
        <div
          className={[
            "mb-8 rounded-xl border px-5 py-4",
            createdVisible
              ? "border-teal/40 bg-cream"
              : "border-amber-200 bg-amber-50",
          ].join(" ")}
        >
          {createdVisible ? (
            <>
              <p className="font-medium text-navy">商品登録が完了しました</p>
              <p className="mt-1 text-sm text-muted">
                商品コード（SKU）:{" "}
                <Link
                  href={`/cases/${params.created}`}
                  className="font-mono text-teal hover:underline"
                >
                  {createdSku || "—"}
                </Link>
                {createdLabel ? ` / ${createdLabel}` : ""}
                {" ・ "}
                <Link href="/maker/cases" className="text-teal hover:underline">
                  マイ商品で管理
                </Link>
              </p>
            </>
          ) : (
            <p className="text-sm text-muted">
              登録ID {params.created} が一覧に見つかりません。マイ商品またはDBを確認してください。
              {ownDiag.error ? `（${ownDiag.error}）` : ""}
            </p>
          )}
        </div>
      ) : null}

      {betaAutoApprove ? (
        <div className="mb-8 rounded-xl border border-teal/30 bg-cream px-5 py-4">
          <p className="font-medium text-navy">ベータ公開中</p>
          <p className="mt-1 text-sm text-muted">
            新規商品は自動承認される場合があります。一般公開は approved + open のみです。
          </p>
        </div>
      ) : null}

      {ownPending.length > 0 ? (
        <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
          <p className="font-medium text-navy">
            あなたの審査待ち商品が {ownPending.length} 件あります
          </p>
          <p className="mt-1 text-sm text-muted">
            本人には表示されます。パートナーへの公開は管理者承認後です。
          </p>
        </div>
      ) : null}

      <header className="mb-8">
        <h1 className="font-[family-name:var(--font-shippori)] text-3xl text-navy md:text-4xl">
          商品一覧
        </h1>
        <p className="mt-3 max-w-3xl text-muted">
          商品を比較して候補を絞り込み、詳細で商品画像・説明を確認してから交渉を開始できます。
          {ownDiag.authUid
            ? ` ログイン中は自分の公開商品も追加表示（${ownDiag.rows.filter((r) => r.status === "open").length} 件）。`
            : null}
        </p>
      </header>

      <PlatformStatsCard stats={getPlatformStats()} />

      <StaleProductListGuard />
      <CaseList
        key={listKey}
        items={listItems}
        initialCategory={params.category}
        pageAuthDebug={pageAuthDebug}
      />
    </div>
  );
}
