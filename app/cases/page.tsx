import type { Metadata } from "next";
import { CaseList } from "@/components/cases/CaseList";
import { listOpenCases } from "@/lib/cases";

export const metadata: Metadata = {
  title: "案件一覧",
  description: "BrandBridgeに掲載中のメーカー案件一覧です。",
};

export const dynamic = "force-dynamic";

type CasesPageProps = {
  searchParams: Promise<{ category?: string }>;
};

export default async function CasesPage({ searchParams }: CasesPageProps) {
  const params = await searchParams;
  const cases = await listOpenCases();

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 md:py-16">
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
