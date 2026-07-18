import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseDetailView } from "@/components/cases/CaseDetail";
import { getSessionUser } from "@/lib/auth";
import { getCaseById } from "@/lib/cases";
import { isFavorite } from "@/lib/favorites";
import { hasAppliedToCase } from "@/lib/negotiations";

type CaseDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ pending?: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: CaseDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const caseItem = await getCaseById(id);

  if (!caseItem) {
    return { title: "商品が見つかりません" };
  }

  return {
    title: caseItem.title,
    description: caseItem.summary,
  };
}

export default async function CaseDetailPage({
  params,
  searchParams,
}: CaseDetailPageProps) {
  const { id } = await params;
  const { pending } = await searchParams;
  const caseItem = await getCaseById(id);

  if (!caseItem) {
    notFound();
  }

  const user = await getSessionUser();
  const alreadyApplied =
    user?.role === "partner"
      ? await hasAppliedToCase(caseItem.id, user.id)
      : false;
  const favorited = user ? await isFavorite(user.id, caseItem.id) : false;

  return (
    <div className="mx-auto max-w-4xl px-5 py-12 md:py-16">
      <CaseDetailView
        caseItem={caseItem}
        user={user}
        alreadyApplied={alreadyApplied}
        isFavorited={favorited}
        showPendingBanner={pending === "1"}
      />
    </div>
  );
}
