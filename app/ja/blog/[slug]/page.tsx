import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JaBlogArticle } from "@/components/blog/JaBlogArticle";
import { getEnBlogArticle } from "@/lib/blog/en-articles";
import { enBlogPath } from "@/lib/blog/en-articles/types";
import {
  getJaBlogArticle,
  listJaBlogSlugs,
} from "@/lib/blog/ja-articles";
import {
  pairedLanguageAlternates,
  selfLanguageAlternates,
} from "@/lib/hreflang";

type JaBlogSlugPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return listJaBlogSlugs().map((slug) => ({ slug }));
}

export const dynamic = "force-static";
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: JaBlogSlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getJaBlogArticle(slug);

  if (!article) {
    return {
      title: "記事が見つかりません",
      robots: { index: false, follow: false },
    };
  }

  const path = `/ja/blog/${article.slug}`;
  const title = article.seoTitle ?? article.title;
  const enArticle = getEnBlogArticle(article.slug);
  const languageAlternates = enArticle
    ? pairedLanguageAlternates(path, enBlogPath(enArticle.slug), "ja")
    : selfLanguageAlternates(path, "ja");

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
      locale: "ja_JP",
      type: "article",
    },
  };
}

export default async function JapaneseBlogArticlePage({
  params,
}: JaBlogSlugPageProps) {
  const { slug } = await params;
  const article = getJaBlogArticle(slug);

  if (!article) {
    notFound();
  }

  return <JaBlogArticle article={article} />;
}
