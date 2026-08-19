import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  JaCategoryLandingPage,
  jaCategoryMetadata,
} from "@/components/ja/JaCategoryLanding";
import { listOpenCases } from "@/lib/cases";
import {
  getJaCategory,
  listJaCategorySlugs,
  type JaCategoryProductCard,
} from "@/lib/ja-categories";

type JaCategorySlugPageProps = {
  params: Promise<{ slug: string }>;
};

const LISTING_LIMIT = 12;

export function generateStaticParams() {
  return listJaCategorySlugs().map((slug) => ({ slug }));
}

export const dynamic = "force-dynamic";
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: JaCategorySlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getJaCategory(slug);

  if (!category) {
    return { title: "カテゴリーが見つかりません", robots: { index: false } };
  }

  return jaCategoryMetadata(category);
}

async function loadCategoryProducts(
  caseCategory: string,
): Promise<JaCategoryProductCard[]> {
  try {
    const cases = await listOpenCases();
    return cases
      .filter((item) => item.category === caseCategory)
      .slice(0, LISTING_LIMIT)
      .map((item) => ({
        id: item.id,
        productName: item.productName?.trim() || item.title,
        brandName: item.brandName?.trim() || null,
        sku: item.sku?.trim() || null,
        priceBand: item.priceBand,
        minOrder: item.minOrder,
      }));
  } catch {
    return [];
  }
}

export default async function JapaneseCategoryPage({
  params,
}: JaCategorySlugPageProps) {
  const { slug } = await params;
  const category = getJaCategory(slug);

  if (!category) {
    notFound();
  }

  const products = await loadCategoryProducts(category.caseCategory);

  return (
    <JaCategoryLandingPage category={category} products={products} />
  );
}
