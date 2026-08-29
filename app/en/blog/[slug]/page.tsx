import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EnBlogArticle } from "@/components/blog/EnBlogArticle";
import {
  getEnBlogArticle,
  listEnBlogSlugs,
} from "@/lib/blog/en-articles";
import { enBlogPath } from "@/lib/blog/en-articles/types";
import { getJaBlogArticle } from "@/lib/blog/ja-articles";
import {
  pairedLanguageAlternates,
  selfLanguageAlternates,
} from "@/lib/hreflang";

type EnBlogSlugPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return listEnBlogSlugs().map((slug) => ({ slug }));
}

export const dynamic = "force-static";
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: EnBlogSlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getEnBlogArticle(slug);

  if (!article) {
    return {
      title: "Article not found",
      robots: { index: false, follow: false },
    };
  }

  const path = enBlogPath(article.slug);
  const title = article.seoTitle ?? article.title;
  const jaArticle = getJaBlogArticle(article.slug);
  const languageAlternates = jaArticle
    ? pairedLanguageAlternates(`/ja/blog/${jaArticle.slug}`, path, "en")
    : selfLanguageAlternates(path, "en");

  return {
    title,
    description: article.description,
    ...languageAlternates,
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title,
      description: article.description,
      url: path,
      locale: "en_US",
      type: "article",
    },
  };
}

export default async function EnglishBlogArticlePage({
  params,
}: EnBlogSlugPageProps) {
  const { slug } = await params;
  const article = getEnBlogArticle(slug);

  if (!article) {
    notFound();
  }

  return <EnBlogArticle article={article} />;
}
