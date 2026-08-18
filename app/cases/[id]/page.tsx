import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { CaseDetailView } from "@/components/cases/CaseDetail";
import { PageBreadcrumbs } from "@/components/seo/PageBreadcrumbs";
import { getSessionUser } from "@/lib/auth";
import { resolveKnownCanonicalCaseId } from "@/lib/case-canonical";
import {
  applyPricingVisibility,
  canViewPartnerPricing,
} from "@/lib/case-pricing-access";
import { getCaseById } from "@/lib/cases";
import { isFavorite } from "@/lib/favorites";
import { pairedLanguageAlternates } from "@/lib/hreflang";
import { hasAppliedToCase } from "@/lib/negotiations";
import { productJsonLd } from "@/lib/seo-jsonld";

type CaseDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ pending?: string }>;
};

export const dynamic = "force-dynamic";

function redirectDuplicateCase(id: string, locale: "ja" | "en") {
  const canonicalId = resolveKnownCanonicalCaseId(id);
  if (canonicalId && canonicalId !== id) {
    permanentRedirect(
      locale === "en" ? `/en/cases/${canonicalId}` : `/cases/${canonicalId}`,
    );
  }
}

export async function generateMetadata({
  params,
}: CaseDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  redirectDuplicateCase(id, "ja");
  const caseItem = await getCaseById(id);

  if (!caseItem) {
    return { title: "商品が見つかりません", robots: { index: false } };
  }

  const productName = caseItem.productName?.trim() || caseItem.title;
  const brand = caseItem.brandName?.trim();
  const title = brand ? `${productName}｜${brand}` : productName;
  const description = (
    caseItem.summary?.trim() ||
    `${productName}の販売パートナー募集。取引条件を確認して商談できます。`
  ).slice(0, 180);

  return {
    title,
    description,
    ...pairedLanguageAlternates(`/cases/${id}`, `/en/cases/${id}`, "ja"),
    openGraph: {
      title,
      description,
      url: `/cases/${id}`,
      type: "website",
      images: caseItem.productImageUrl
        ? [{ url: caseItem.productImageUrl }]
        : undefined,
    },
  };
}

export default async function CaseDetailPage({
  params,
  searchParams,
}: CaseDetailPageProps) {
  const { id } = await params;
  redirectDuplicateCase(id, "ja");
  const { pending } = await searchParams;
  const raw = await getCaseById(id);

  if (!raw) {
    notFound();
  }

  const user = await getSessionUser();
  const showPartnerPricing = canViewPartnerPricing(raw, user);
  const caseItem = applyPricingVisibility(raw, user);

  const alreadyApplied =
    user?.role === "partner"
      ? await hasAppliedToCase(caseItem.id, user.id)
      : false;
  const favorited = user ? await isFavorite(user.id, caseItem.id) : false;
  const productName = caseItem.productName?.trim() || caseItem.title;

  return (
    <div className="mx-auto max-w-4xl px-5 py-12 md:py-16">
      <PageBreadcrumbs
        items={[
          { name: "ホーム", path: "/" },
          { name: "商品一覧", path: "/cases" },
          { name: productName },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd(caseItem, "ja")),
        }}
      />
      <CaseDetailView
        caseItem={caseItem}
        user={user}
        alreadyApplied={alreadyApplied}
        isFavorited={favorited}
        showPendingBanner={pending === "1"}
        showPartnerPricing={showPartnerPricing}
      />
    </div>
  );
}
