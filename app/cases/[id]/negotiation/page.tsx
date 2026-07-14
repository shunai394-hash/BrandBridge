import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ProductCaseImage } from "@/components/cases/ProductCaseImage";
import { NegotiationForm } from "@/components/forms/NegotiationForm";
import { getSessionUser } from "@/lib/auth";
import { getCaseById } from "@/lib/cases";
import { hasAppliedToCase } from "@/lib/negotiations";
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
      ? `交渉開始: ${caseItem.caseNumber}`
      : "交渉開始",
  };
}

export default async function CaseNegotiationPage({ params }: PageProps) {
  const { id } = await params;
  const caseItem = await getCaseById(id);
  if (!caseItem) notFound();

  const user = await getSessionUser();

  // Guests → login, then return here
  if (!user) {
    redirect(
      `/login?next=${encodeURIComponent(`/cases/${id}/negotiation`)}`,
    );
  }

  const alreadyApplied =
    user.role === "partner"
      ? await hasAppliedToCase(caseItem.id, user.id)
      : false;

  return (
    <div className="mx-auto max-w-xl px-5 py-12 md:py-16">
      <Link
        href={`/cases/${caseItem.id}`}
        className="text-sm text-teal hover:underline"
      >
        ← 案件詳細に戻る
      </Link>

      <header className="mt-6 flex gap-4">
        <ProductCaseImage
          src={caseItem.productImageUrl}
          alt={caseItem.productName}
          className="h-20 w-20 shrink-0"
        />
        <div>
          <p className="font-mono text-sm font-medium text-teal">
            {caseItem.caseNumber}
          </p>
          <h1 className="mt-1 font-[family-name:var(--font-shippori)] text-2xl text-navy">
            交渉を開始
          </h1>
          <p className="mt-1 text-sm text-muted">{caseItem.productName}</p>
          <p className="mt-2 text-xs text-muted">
            {caseItem.category} ・{" "}
            {targetCountryLabel(caseItem.targetCountry)} ・{" "}
            {salesFormatLabel(caseItem.salesFormat)}
          </p>
        </div>
      </header>

      <NegotiationForm
        caseId={caseItem.id}
        user={user}
        alreadyApplied={alreadyApplied}
      />
    </div>
  );
}
