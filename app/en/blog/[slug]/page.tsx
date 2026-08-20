import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EnBlogArticle } from "@/components/blog/EnBlogArticle";
import {
  getEnBlogArticle,
  listEnBlogSlugs,
} from "@/lib/blog/en-articles";
import { selfLanguageAlternates } from "@/lib/hreflang";
import { enBlogPath } from "@/lib/blog/en-articles/types";

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

  return {
    title,
    description: article.description,
    ...selfLanguageAlternates(path, "en"),
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
