import type { Metadata } from "next";
import Link from "next/link";
import { CaseList } from "@/components/cases/CaseList";
import { getSessionUser } from "@/lib/auth";
import {
  diagnoseOwnCases,
  isBetaAutoApproveCases,
  listOpenCases,
} from "@/lib/cases";

export const metadata: Metadata = {
  title: "案件一覧",
  description: "BrandBridgeに掲載中のメーカー案件一覧です。",
};

export const dynamic = "force-dynamic";

type CasesPageProps = {
  searchParams: Promise<{
    category?: string;
    welcome?: string;
    created?: string;
  }>;
};

export default async function CasesPage({ searchParams }: CasesPageProps) {
  const params = await searchParams;
  const [cases, ownDiag, sessionUser] = await Promise.all([
    listOpenCases(),
    diagnoseOwnCases(),
    getSessionUser(),
  ]);
  const betaAutoApprove = isBetaAutoApproveCases();
  const ownPending = cases.filter(
    (c) =>
      ownDiag.authUid &&
      c.makerId === ownDiag.authUid &&
      c.reviewStatus === "pending_review",
  );
  const createdVisible = params.created
    ? cases.some((c) => c.id === params.created) ||
      ownDiag.rows.some((r) => r.id === params.created)
    : false;
  const createdCase = cases.find((c) => c.id === params.created);
  const createdLabel = createdCase?.productName ?? null;
  const createdNumber = createdCase?.caseNumber ?? null;

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 md:py-16">
      {params.welcome === "partner" ? (
        <div className="mb-8 rounded-xl border border-teal/30 bg-cream px-5 py-4">
          <p className="font-medium text-navy">パートナー登録ありがとうございます</p>
          <p className="mt-1 text-sm text-muted">
            公開中（approved）の案件から探せます。
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
                案件番号:{" "}
                <Link
                  href={`/cases/${params.created}`}
                  className="font-mono text-teal hover:underline"
                >
                  {createdNumber ?? params.created}
                </Link>
                {createdLabel ? ` / ${createdLabel}` : ""}
                {" ・ "}
                <Link href="/maker/cases" className="text-teal hover:underline">
                  マイ案件で管理
                </Link>
              </p>
            </>
          ) : (
            <p className="text-sm text-muted">
              登録ID {params.created} が一覧に見つかりません。マイ案件またはDBを確認してください。
              {ownDiag.error ? `（${ownDiag.error}）` : ""}
            </p>
          )}
        </div>
      ) : null}

      {betaAutoApprove ? (
        <div className="mb-8 rounded-xl border border-teal/30 bg-cream px-5 py-4">
          <p className="font-medium text-navy">ベータ公開中</p>
          <p className="mt-1 text-sm text-muted">
            新規案件は自動承認される場合があります。一般公開は approved + open のみです。
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
          案件一覧
        </h1>
        <p className="mt-3 max-w-3xl text-muted">
          案件を比較して候補を絞り込み、詳細で商品画像・説明を確認してから交渉を開始できます。
          {ownDiag.authUid
            ? ` ログイン中は自分の open 案件も追加表示（${ownDiag.rows.filter((r) => r.status === "open").length} 件）。`
            : null}
        </p>
      </header>
      <CaseList
        key={params.category ?? "すべて"}
        cases={cases}
        initialCategory={params.category}
        viewerRole={sessionUser?.role ?? null}
      />
    </div>
  );
}
