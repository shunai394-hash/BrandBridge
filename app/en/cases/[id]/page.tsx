import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EnCaseDetail } from "@/components/cases/EnCaseDetail";
import { getSessionUser } from "@/lib/auth";
import { resolveEnCatalogDisplay } from "@/lib/en-case-catalog";
import { getCaseById } from "@/lib/cases";
import { hasAppliedToCase } from "@/lib/negotiations";

type EnglishCaseDetailPageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: EnglishCaseDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const caseItem = await getCaseById(id);

  if (!caseItem) {
    return { title: "Product not found" };
  }

  const en = resolveEnCatalogDisplay({
    id: caseItem.id,
    sku: caseItem.sku,
    productName: caseItem.productName,
    category: caseItem.category,
    summary: caseItem.summary,
    description: caseItem.description,
  });

  return {
    title: en.productName,
    description: en.summary,
  };
}

export default async function EnglishCaseDetailPage({
  params,
}: EnglishCaseDetailPageProps) {
  const { id } = await params;
  const caseItem = await getCaseById(id);

  if (!caseItem) {
    notFound();
  }

  const user = await getSessionUser();
  const alreadyApplied =
    user?.role === "partner"
      ? await hasAppliedToCase(caseItem.id, user.id)
      : false;

  return (
    <div className="mx-auto max-w-4xl px-5 py-12 md:py-16">
      <EnCaseDetail
        caseItem={caseItem}
        user={user}
        alreadyApplied={alreadyApplied}
      />
    </div>
  );
}
