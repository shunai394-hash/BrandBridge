import type { BlogJapanImageId } from "@/lib/blog/japan-images";

export type EnBlogImage = {
  id: BlogJapanImageId;
  alt: string;
};

export type EnBlogCard = {
  title: string;
  body: string;
};

export type EnBlogSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  cards?: EnBlogCard[];
  callout?: string;
  image?: EnBlogImage;
};

export type EnBlogFaq = {
  q: string;
  a: string;
};

export type EnBlogCta = {
  heading: string;
  body: string;
  primary: { href: string; label: string };
  secondary?: { href: string; label: string };
};

export type EnBlogArticle = {
  slug: string;
  title: string;
  seoTitle?: string;
  description: string;
  eyebrow: string;
  lede: string;
  intro: string[];
  hero?: EnBlogImage;
  sections: EnBlogSection[];
  faqs?: EnBlogFaq[];
  faqHeading?: string;
  relatedSlugs: string[];
  existingLinks: { href: string; label: string }[];
  cta: EnBlogCta;
};

export const EN_BLOG_HUB = {
  path: "/en/blog",
  label: "English Blog",
} as const;

export const EN_BLOG_ENTER_JAPAN = {
  slug: "how-to-enter-the-japanese-market",
  path: "/en/blog/how-to-enter-the-japanese-market",
  title: "How to Enter the Japanese Market: A Complete Guide for Foreign Brands",
} as const;

export const EN_BLOG_FIND_DISTRIBUTOR = {
  slug: "how-to-find-a-distributor-in-japan",
  path: "/en/blog/how-to-find-a-distributor-in-japan",
  title: "How to Find a Distributor in Japan",
} as const;

export const EN_BLOG_SELL_PRODUCTS = {
  slug: "how-to-sell-products-in-japan",
  path: "/en/blog/how-to-sell-products-in-japan",
  title: "How to Sell Products in Japan: A Guide for Foreign Brands",
} as const;

export const EN_BLOG_FIND_RETAILERS = {
  slug: "how-to-find-japanese-retailers",
  path: "/en/blog/how-to-find-japanese-retailers",
  title: "How to Find Japanese Retailers for Your Brand",
} as const;

export const EN_BLOG_ENTRY_COST = {
  slug: "japan-market-entry-cost",
  path: "/en/blog/japan-market-entry-cost",
  title: "How Much Does It Cost to Enter the Japanese Market?",
} as const;

export const EN_BLOG_DISTRIBUTOR_VS_DIRECT = {
  slug: "japan-distributor-vs-direct-sales",
  path: "/en/blog/japan-distributor-vs-direct-sales",
  title:
    "Japan Distributor vs. Direct Sales: Which Is Better for Your Brand?",
} as const;

export const EN_BLOG_IMPORT_REQUIREMENTS = {
  slug: "japan-import-requirements",
  path: "/en/blog/japan-import-requirements",
  title: "Japan Import Requirements for Overseas Brands",
} as const;

export const EN_BLOG_BUSINESS_PARTNER = {
  slug: "how-to-find-a-business-partner-in-japan",
  path: "/en/blog/how-to-find-a-business-partner-in-japan",
  title: "How to Find a Business Partner in Japan",
} as const;

export const EN_BLOG_MOQ = {
  slug: "moq-japan-market-entry",
  path: "/en/blog/moq-japan-market-entry",
  title:
    "MOQ for Entering the Japanese Market: What Overseas Brands Should Know",
} as const;

export function enBlogPath(slug: string): string {
  return `/en/blog/${slug}`;
}

/** Search-intent groups for the English hub and blog index. */
export const EN_BLOG_INTENT_GROUPS = [
  {
    heading: "Market Entry",
    slugs: [EN_BLOG_ENTER_JAPAN.slug],
  },
  {
    heading: "Distributors",
    slugs: [
      EN_BLOG_FIND_DISTRIBUTOR.slug,
      EN_BLOG_BUSINESS_PARTNER.slug,
      EN_BLOG_DISTRIBUTOR_VS_DIRECT.slug,
    ],
  },
  {
    heading: "Retailers",
    slugs: [EN_BLOG_FIND_RETAILERS.slug, EN_BLOG_SELL_PRODUCTS.slug],
  },
  {
    heading: "Import Requirements",
    slugs: [EN_BLOG_IMPORT_REQUIREMENTS.slug],
  },
  {
    heading: "Costs",
    slugs: [EN_BLOG_ENTRY_COST.slug],
  },
  {
    heading: "MOQ",
    slugs: [EN_BLOG_MOQ.slug],
  },
] as const;
