import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { NegotiationStartForm } from "@/components/forms/NegotiationStartForm";
import { getSessionUser } from "@/lib/auth";
import { getCaseById } from "@/lib/cases";
import { listPartnerThreadsForCase } from "@/lib/negotiations";
import {
  salesFormatLabel,
  targetCountryLabel,
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
  return {
    title: caseItem
      ? `交渉開始: ${caseItem.productName}`
      : "交渉開始",
  };
}

export default async function CaseNegotiationPage({ params }: PageProps) {
  const { id } = await params;
  const caseItem = await getCaseById(id);
  if (!caseItem) notFound();

  const user = await getSessionUser();

  if (!user) {
    redirect(
      `/login?next=${encodeURIComponent(`/cases/${id}/negotiation`)}`,
    );
  }

  const existingThreads =
    user.role === "partner"
      ? await listPartnerThreadsForCase(caseItem.id, user.id)
      : [];

  return (
    <div className="mx-auto max-w-2xl px-5 py-12 md:py-16">
      <Link
        href={`/cases/${caseItem.id}`}
        className="text-sm text-teal hover:underline"
      >
        ← 商品詳細に戻る
      </Link>

      <header className="mt-6 mb-8">
        <h1 className="mt-2 font-[family-name:var(--font-shippori)] text-3xl text-navy">
          交渉を開始
        </h1>
        <p className="mt-2 text-sm text-muted">
          商品コード（SKU）：
          <span className="ml-1 font-mono text-teal">
            {caseItem.sku?.trim() || "—"}
          </span>
        </p>
        <p className="mt-1 text-base font-medium text-navy">
          {caseItem.productName}
        </p>
        <p className="mt-1 text-sm text-muted">
          {caseItem.category} ・{" "}
          {targetCountryLabel(caseItem.targetCountry)} ・{" "}
          {salesFormatLabel(caseItem.salesFormat)}
        </p>
        <p className="mt-3 text-sm text-muted">
          下のメール形式フォームで件名（必須）・本文・添付を送信します。
        </p>
      </header>

      {/* Email compose form: 件名 / 本文 / 添付 → startNegotiationAction */}
      <NegotiationStartForm
        key={`start-form-${caseItem.id}`}
        caseId={caseItem.id}
        caseNumber={caseItem.caseNumber}
        productName={caseItem.productName}
        productSku={caseItem.sku}
        user={user}
        existingThreads={existingThreads}
      />
    </div>
  );
}
