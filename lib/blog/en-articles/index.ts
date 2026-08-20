import { DISTRIBUTOR_VS_DIRECT_ARTICLE } from "@/lib/blog/en-articles/distributor-vs-direct";
import { ENTER_JAPAN_ARTICLE } from "@/lib/blog/en-articles/enter-japan";
import { ENTRY_COST_ARTICLE } from "@/lib/blog/en-articles/entry-cost";
import { FIND_DISTRIBUTOR_ARTICLE } from "@/lib/blog/en-articles/find-distributor";
import { FIND_RETAILERS_ARTICLE } from "@/lib/blog/en-articles/find-retailers";
import { SELL_PRODUCTS_ARTICLE } from "@/lib/blog/en-articles/sell-products";
import type { EnBlogArticle } from "@/lib/blog/en-articles/types";

const ARTICLES: EnBlogArticle[] = [
  ENTER_JAPAN_ARTICLE,
  FIND_DISTRIBUTOR_ARTICLE,
  SELL_PRODUCTS_ARTICLE,
  FIND_RETAILERS_ARTICLE,
  ENTRY_COST_ARTICLE,
  DISTRIBUTOR_VS_DIRECT_ARTICLE,
];

const BY_SLUG = new Map(ARTICLES.map((article) => [article.slug, article]));

export function listEnBlogArticles(): EnBlogArticle[] {
  return ARTICLES;
}

export function getEnBlogArticle(slug: string): EnBlogArticle | undefined {
  return BY_SLUG.get(slug);
}

export function listEnBlogSlugs(): string[] {
  return ARTICLES.map((article) => article.slug);
}
