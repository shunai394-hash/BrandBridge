import type { BlogJapanImageId } from "@/lib/blog/japan-images";

export type JaBlogCluster = "partner" | "maker" | "category";

export type JaBlogImage = {
  id: BlogJapanImageId;
  alt: string;
};

export type JaBlogCard = {
  title: string;
  body: string;
};

export type JaBlogSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  cards?: JaBlogCard[];
  callout?: string;
  image?: JaBlogImage;
};

export type JaBlogCta = {
  heading: string;
  body: string;
  primary: { href: string; label: string };
  secondary?: { href: string; label: string };
};

export type JaBlogArticle = {
  slug: string;
  cluster: JaBlogCluster;
  title: string;
  description: string;
  eyebrow: string;
  lede: string;
  intro: string[];
  hero?: JaBlogImage;
  sections: JaBlogSection[];
  relatedSlugs: string[];
  existingLinks: { href: string; label: string }[];
  cta: JaBlogCta;
};

export const JA_BLOG_CLUSTER_LABEL: Record<JaBlogCluster, string> = {
  partner: "販売パートナー向け",
  maker: "海外ブランド向け",
  category: "カテゴリー別",
};

export const EXISTING_JA_BLOG = {
  slug: "how-to-sell-overseas-brands-in-japan",
  path: "/ja/blog/how-to-sell-overseas-brands-in-japan",
  title: "海外ブランドの商品を日本で販売するには？",
  cluster: "partner" as const,
} as const;

export const JA_WHOLESALE_GUIDE = {
  slug: "how-to-start-overseas-brand-wholesale",
  path: "/ja/blog/how-to-start-overseas-brand-wholesale",
  title:
    "海外ブランドの仕入れ・卸取引を始める方法｜仕入先の探し方・MOQ・輸入まで解説",
  cluster: "partner" as const,
} as const;
