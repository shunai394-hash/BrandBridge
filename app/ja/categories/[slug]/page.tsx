import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  JaCategoryLandingPage,
  jaCategoryMetadata,
} from "@/components/ja/JaCategoryLanding";
import {
  getJaCategory,
  listJaCategorySlugs,
} from "@/lib/ja-categories";

type JaCategorySlugPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return listJaCategorySlugs().map((slug) => ({ slug }));
}

export const dynamic = "force-static";
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: JaCategorySlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getJaCategory(slug);

  if (!category) {
    return { title: "カテゴリーが見つかりません" };
  }

  return jaCategoryMetadata(category);
}

export default async function JapaneseCategoryPage({
  params,
}: JaCategorySlugPageProps) {
  const { slug } = await params;
  const category = getJaCategory(slug);

  if (!category) {
    notFound();
  }

  return <JaCategoryLandingPage category={category} />;
}
