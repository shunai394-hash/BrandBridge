import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ModelCaseDetail } from "@/components/cases/ModelCaseDetail";
import {
  getModelCaseBySlug,
  listModelCaseSlugs,
  MODEL_CASE_DISCLAIMER,
} from "@/lib/model-cases";
import { getSiteUrl } from "@/lib/site";
import { selfLanguageAlternates } from "@/lib/hreflang";

type ModelCasePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return listModelCaseSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: ModelCasePageProps): Promise<Metadata> {
  const { slug } = await params;
  const modelCase = getModelCaseBySlug(slug);

  if (!modelCase) {
    return { title: "Model Case not found" };
  }

  return {
    title: `${modelCase.title} | BrandBridge`,
    description: modelCase.description,
    ...selfLanguageAlternates(`/en/model-cases/${modelCase.slug}`, "en"),
  };
}

export default async function EnglishModelCasePage({
  params,
}: ModelCasePageProps) {
  const { slug } = await params;
  const modelCase = getModelCaseBySlug(slug);

  if (!modelCase) {
    notFound();
  }

  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/en/model-cases/${modelCase.slug}`;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${siteUrl}/en`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Japan Expansion Opportunities",
        item: `${siteUrl}/en/cases`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: modelCase.shortTitle,
        item: pageUrl,
      },
    ],
  };

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: modelCase.title,
    description: modelCase.description,
    url: pageUrl,
    about: MODEL_CASE_DISCLAIMER,
  };

  return (
    <div className="mx-auto max-w-4xl px-5 py-12 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webPageJsonLd),
        }}
      />
      <ModelCaseDetail modelCase={modelCase} />
    </div>
  );
}
