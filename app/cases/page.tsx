import type { Metadata } from "next";
import Link from "next/link";
import { CaseList } from "@/components/cases/CaseList";
import { listOpenCases } from "@/lib/cases";

export const metadata: Metadata = {
  title: "案件一覧",
  description: "BrandBridgeに掲載中のメーカー案件一覧です。",
};

export const dynamic = "force-dynamic";

type CasesPageProps = {
  searchParams: Promise<{ category?: string; welcome?: string }>;
};

export default async function CasesPage({ searchParams }: CasesPageProps) {
  const params = await searchParams;
  const cases = await listOpenCases();

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 md:py-16">
      {params.welcome === "partner" ? (
        <div className="mb-8 rounded-xl border border-teal/30 bg-cream px-5 py-4">
          <p className="font-medium text-navy">パートナー登録ありがとうございます</p>
          <p className="mt-1 text-sm text-muted">
            プロフィールを元に案件を探せます。気になる商品があれば詳細から交渉を申し込んでください。
          </p>
          <p className="mt-2 text-sm">
            <Link href="/profile/edit" className="text-teal hover:underline">
              プロフィールを充実させる
            </Link>
          </p>
        </div>
      ) : null}
      <header className="mb-8">
        <h1 className="font-[family-name:var(--font-shippori)] text-3xl text-navy md:text-4xl">
          案件一覧
        </h1>
        <p className="mt-3 max-w-2xl text-muted">
          カテゴリ・国・販売形式で、あなたに合う販売案件を探せます。
        </p>
      </header>
      <CaseList
        key={params.category ?? "すべて"}
        cases={cases}
        initialCategory={params.category}
      />
    </div>
  );
}
