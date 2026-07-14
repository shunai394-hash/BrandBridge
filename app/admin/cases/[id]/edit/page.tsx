import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminCaseEditForm } from "@/components/admin/AdminCaseEditForm";
import { CaseImageUploader } from "@/components/forms/CaseImageUploader";
import { getCaseById } from "@/lib/cases";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const caseItem = await getCaseById(id);
  return {
    title: caseItem
      ? `案件編集: ${caseItem.caseNumber}`
      : "案件編集",
  };
}

export default async function AdminCaseEditPage({ params }: PageProps) {
  const { id } = await params;
  const caseItem = await getCaseById(id);
  if (!caseItem) notFound();

  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <Link
        href={`/admin/cases/${caseItem.id}`}
        className="text-sm text-teal hover:underline"
      >
        ← 審査詳細に戻る
      </Link>
      <header className="mb-6 mt-4">
        <h1 className="font-[family-name:var(--font-shippori)] text-3xl text-navy">
          案件を編集
        </h1>
        <p className="mt-2 text-sm text-muted">
          商品情報・販売条件を更新できます。画像は上部から登録・差し替えできます。
        </p>
      </header>

      {/* 最上部に必ず表示（フォームの外） */}
      <CaseImageUploader
        caseId={caseItem.id}
        productImageUrl={caseItem.productImageUrl}
      />

      <AdminCaseEditForm key={caseItem.id} caseItem={caseItem} />
    </div>
  );
}
