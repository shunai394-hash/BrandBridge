import { CATEGORY_ARTICLES } from "@/lib/blog/ja-articles/category";
import { MAKER_ARTICLES } from "@/lib/blog/ja-articles/maker";
import { MAKER_GUIDE_ARTICLES } from "@/lib/blog/ja-articles/maker-guides";
import { PARTNER_ARTICLES } from "@/lib/blog/ja-articles/partner";
import { PARTNER_GUIDE_ARTICLES } from "@/lib/blog/ja-articles/partner-guides";
import type { JaBlogArticle, JaBlogCluster } from "@/lib/blog/ja-articles/types";

/**
 * Point existing data articles at new guides without rewriting their body copy.
 */
const RELATED_FROM_EXISTING: Record<string, readonly string[]> = {
  "how-to-find-japan-sales-agents": [
    "how-to-find-japanese-distributor",
    "how-to-contact-japanese-sales-partners",
  ],
  "how-to-find-japan-wholesalers": ["how-to-find-wholesale-buyers-in-japan"],
  "how-to-set-japan-wholesale-price": [
    "how-to-set-wholesale-price-for-japan",
    "how-to-set-retail-price-in-japan",
  ],
  "cautions-when-contracting-japan-agents": [
    "how-to-find-exclusive-distributor-in-japan",
  ],
  "japan-product-information-checklist": [
    "how-to-contact-japanese-sales-partners",
  ],
  "japan-moq-for-overseas-brands": ["what-is-moq-for-overseas-products"],
  "japan-logistics-import-basics": [
    "logistics-lead-time-samples-for-import",
  ],
  "how-to-source-overseas-brands": [
    "how-to-find-overseas-product-suppliers",
    "how-to-start-overseas-brand-wholesale",
    "checklist-before-dealing-with-overseas-brands",
  ],
  "how-to-become-japan-agent-for-overseas-brands": [
    "how-to-become-japanese-distributor",
  ],
  "conditions-to-check-before-sourcing-overseas-brands": [
    "checklist-before-dealing-with-overseas-brands",
  ],
  "exclusive-distribution-rights-in-japan": [
    "how-to-find-exclusive-distributor-in-japan",
  ],
  "buyer-guide-to-finding-new-overseas-brands": [
    "how-to-find-overseas-products-to-sell-in-japan",
    "how-to-find-overseas-brands-that-can-sell-in-japan",
  ],
  "common-problems-sourcing-overseas-products": [
    "common-mistakes-entering-japan-market",
  ],
  "how-to-find-overseas-brands-that-can-sell-in-japan": [
    "how-to-find-overseas-products-to-sell-in-japan",
    "steps-to-sell-overseas-products-in-japan",
  ],
  "how-to-sell-overseas-products-in-japan-retail": [
    "steps-to-sell-overseas-products-in-japan",
  ],
  "who-fits-as-japan-sales-partner": ["how-to-become-japanese-distributor"],
  "price-and-moq-negotiation-with-overseas-brands": [
    "how-to-set-wholesale-price-for-japan",
    "checklist-before-dealing-with-overseas-brands",
  ],
  "how-to-trade-directly-with-overseas-makers": [
    "how-to-find-overseas-product-suppliers",
    "how-to-find-overseas-wholesale-suppliers",
  ],
  "how-to-find-overseas-product-suppliers": [
    "how-to-source-overseas-brands",
    "how-to-find-overseas-wholesale-suppliers",
  ],
  "how-to-become-japanese-distributor": [
    "how-to-become-japan-agent-for-overseas-brands",
  ],
  "checklist-before-dealing-with-overseas-brands": [
    "conditions-to-check-before-sourcing-overseas-brands",
  ],
  "how-to-find-overseas-products-to-sell-in-japan": [
    "buyer-guide-to-finding-new-overseas-brands",
    "how-to-find-overseas-brands-that-can-sell-in-japan",
  ],
  "how-to-find-japanese-distributor": [
    "how-to-find-japan-sales-agents",
    "how-to-find-exclusive-distributor-in-japan",
  ],
  "how-to-set-wholesale-price-for-japan": [
    "how-to-set-japan-wholesale-price",
    "how-to-set-retail-price-in-japan",
  ],
  "how-to-find-wholesale-buyers-in-japan": [
    "how-to-find-japan-wholesalers",
  ],
  "common-mistakes-entering-japan-market": [
    "common-problems-sourcing-overseas-products",
  ],
  "how-to-find-exclusive-distributor-in-japan": [
    "exclusive-distribution-rights-in-japan",
  ],
};

function withRelatedFromExisting(article: JaBlogArticle): JaBlogArticle {
  const extra = RELATED_FROM_EXISTING[article.slug];
  if (!extra) {
    return article;
  }

  const relatedSlugs = [...article.relatedSlugs];
  for (const slug of extra) {
    if (!relatedSlugs.includes(slug)) {
      relatedSlugs.push(slug);
    }
  }

  return { ...article, relatedSlugs };
}

const ARTICLES: JaBlogArticle[] = [
  ...PARTNER_ARTICLES,
  ...MAKER_ARTICLES,
  ...CATEGORY_ARTICLES,
  ...PARTNER_GUIDE_ARTICLES,
  ...MAKER_GUIDE_ARTICLES,
].map(withRelatedFromExisting);

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
