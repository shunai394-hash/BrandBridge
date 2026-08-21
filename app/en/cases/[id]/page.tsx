import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { EnCaseDetail } from "@/components/cases/EnCaseDetail";
import { PageBreadcrumbs } from "@/components/seo/PageBreadcrumbs";
import { getSessionUser } from "@/lib/auth";
import { resolveKnownCanonicalCaseId } from "@/lib/case-canonical";
import { resolveEnCatalogDisplay } from "@/lib/en-case-catalog";
import { getCaseById } from "@/lib/cases";
import { pairedLanguageAlternates } from "@/lib/hreflang";
import { hasAppliedToCase } from "@/lib/negotiations";
import { jsonLdString, productJsonLd } from "@/lib/seo-jsonld";

type EnglishCaseDetailPageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

function redirectDuplicateCase(id: string) {
  const canonicalId = resolveKnownCanonicalCaseId(id);
  if (canonicalId && canonicalId !== id) {
    permanentRedirect(`/en/cases/${canonicalId}`);
  }
}

export async function generateMetadata({
  params,
}: EnglishCaseDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  redirectDuplicateCase(id);
  const caseItem = await getCaseById(id);

  if (!caseItem) {
    return { title: "Opportunity not found", robots: { index: false } };
  }

  const en = resolveEnCatalogDisplay({
    id: caseItem.id,
    sku: caseItem.sku,
    productName: caseItem.productName,
    category: caseItem.category,
    summary: caseItem.summary,
    description: caseItem.description,
  });
  const brand = caseItem.brandName?.trim() || en.productName;
  const title = `${en.productName} | ${brand}`;
  const description = (
    en.summary ||
    `${en.productName} is seeking a Japanese sales partner on BrandBridge.`
  ).slice(0, 180);
  const canIndex =
    caseItem.reviewStatus === "approved" && caseItem.status === "open";

  return {
    title,
    description,
    ...pairedLanguageAlternates(`/cases/${id}`, `/en/cases/${id}`, "en"),
    robots: {
      index: canIndex,
      follow: true,
    },
    openGraph: {
      title,
      description,
      url: `/en/cases/${id}`,
      type: "website",
      images: caseItem.productImageUrl
        ? [{ url: caseItem.productImageUrl }]
        : undefined,
    },
  };
}

export default async function EnglishCaseDetailPage({
  params,
}: EnglishCaseDetailPageProps) {
  const { id } = await params;
  redirectDuplicateCase(id);
  const caseItem = await getCaseById(id);

  if (!caseItem) {
    notFound();
  }

  const user = await getSessionUser();
  const alreadyApplied =
    user?.role === "partner"
      ? await hasAppliedToCase(caseItem.id, user.id)
      : false;
  const en = resolveEnCatalogDisplay({
    id: caseItem.id,
    sku: caseItem.sku,
    productName: caseItem.productName,
    category: caseItem.category,
    summary: caseItem.summary,
    description: caseItem.description,
  });
  const canIndex =
    caseItem.reviewStatus === "approved" && caseItem.status === "open";

  return (
    <div className="mx-auto max-w-4xl px-5 py-12 md:py-16">
      <PageBreadcrumbs
        items={[
          { name: "Home", path: "/en" },
          { name: "Opportunities", path: "/en/cases" },
          { name: en.productName },
        ]}
      />
      {canIndex ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLdString(productJsonLd(caseItem, "en")),
          }}
        />
      ) : null}
      <EnCaseDetail
        caseItem={caseItem}
        user={user}
        alreadyApplied={alreadyApplied}
      />
    </div>
  );
}
