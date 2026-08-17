import { CATEGORY_ARTICLES } from "@/lib/blog/ja-articles/category";
import { MAKER_ARTICLES } from "@/lib/blog/ja-articles/maker";
import { PARTNER_ARTICLES } from "@/lib/blog/ja-articles/partner";
import type { JaBlogArticle, JaBlogCluster } from "@/lib/blog/ja-articles/types";

const ARTICLES: JaBlogArticle[] = [
  ...PARTNER_ARTICLES,
  ...MAKER_ARTICLES,
  ...CATEGORY_ARTICLES,
];

const BY_SLUG = new Map(ARTICLES.map((article) => [article.slug, article]));

export function listJaBlogArticles(): JaBlogArticle[] {
  return ARTICLES;
}

export function getJaBlogArticle(slug: string): JaBlogArticle | undefined {
  return BY_SLUG.get(slug);
}

export function listJaBlogArticlesByCluster(
  cluster: JaBlogCluster,
): JaBlogArticle[] {
  return ARTICLES.filter((article) => article.cluster === cluster);
}

export function listJaBlogSlugs(): string[] {
  return ARTICLES.map((article) => article.slug);
}
