import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminCaseReviewForm } from "@/components/admin/AdminCaseReviewForm";
import { getCaseById } from "@/lib/cases";
import {
  salesFormatLabel,
  targetCountryLabel,
  reviewStatusLabels,
} from "@/lib/types";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const caseItem = await getCaseById(id);
  return { title: caseItem ? `審査: ${caseItem.title}` : "案件審査" };
}

export default async function AdminCaseDetailPage({ params }: PageProps) {
  const { id } = await params;
  const caseItem = await getCaseById(id);
  if (!caseItem) notFound();

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <Link href="/admin/cases" className="text-sm text-teal hover:underline">
        ← 案件審査一覧
      </Link>
      <p className="mt-4 font-mono text-sm font-medium text-teal">
        案件番号 {caseItem.caseNumber}
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-shippori)] text-3xl text-navy">
        {caseItem.title}
      </h1>
      <p className="mt-2 text-sm text-muted">
        {caseItem.makerName} ・ {reviewStatusLabels[caseItem.reviewStatus]} ・{" "}
        {targetCountryLabel(caseItem.targetCountry)} ・{" "}
        {salesFormatLabel(caseItem.salesFormat)}
      </p>

      <section className="mt-8 space-y-4 rounded-lg border border-border bg-surface p-5 text-sm">
        <p>
          <span className="text-muted">商品名:</span> {caseItem.productName}
        </p>
        <p className="whitespace-pre-wrap leading-relaxed">{caseItem.description}</p>
        <p className="whitespace-pre-wrap leading-relaxed">
          <span className="text-muted">提供条件:</span> {caseItem.offer}
        </p>
        <p className="whitespace-pre-wrap leading-relaxed">
          <span className="text-muted">求めるパートナー:</span>{" "}
          {caseItem.idealPartner}
        </p>
      </section>

      <AdminCaseReviewForm caseItem={caseItem} />
    </div>
  );
}
