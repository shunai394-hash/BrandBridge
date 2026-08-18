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
  title: "海外ブランドを日本で販売する方法｜販売チャネル・契約・輸入の基本",
  cluster: "maker" as const,
} as const;

export const JA_WHOLESALE_GUIDE = {
  slug: "how-to-start-overseas-brand-wholesale",
  path: "/ja/blog/how-to-start-overseas-brand-wholesale",
  title:
    "海外ブランドの仕入れ・卸取引を始める方法｜仕入先の探し方・MOQ・輸入まで解説",
  cluster: "partner" as const,
} as const;

export type JaDedicatedGuide = {
  slug: string;
  path: string;
  title: string;
  cluster: JaBlogCluster;
};

export const JA_SUPPLIER_FINDER = {
  slug: "how-to-find-overseas-wholesale-suppliers",
  path: "/ja/blog/how-to-find-overseas-wholesale-suppliers",
  title:
    "海外商品の仕入れ先を探す方法｜メーカー・卸・展示会・マッチングの比較",
  cluster: "partner" as const,
} as const;

export const JA_MOQ_GUIDE = {
  slug: "what-is-moq-for-overseas-products",
  path: "/ja/blog/what-is-moq-for-overseas-products",
  title: "海外商品のMOQとは？小ロット仕入れで確認すべきポイント",
  cluster: "partner" as const,
} as const;

export const JA_SALES_CAUTIONS = {
  slug: "cautions-when-selling-overseas-brands-in-japan",
  path: "/ja/blog/cautions-when-selling-overseas-brands-in-japan",
  title: "海外ブランドを日本で販売する際の注意点｜食品・化粧品・雑貨",
  cluster: "maker" as const,
} as const;

export const JA_JAPAN_ENTRY = {
  slug: "how-overseas-brands-enter-japan",
  path: "/ja/blog/how-overseas-brands-enter-japan",
  title: "海外ブランドの日本進出｜販売パートナーを探す方法",
  cluster: "maker" as const,
} as const;

export const JA_IMPORT_COST = {
  slug: "logistics-lead-time-samples-for-import",
  path: "/ja/blog/logistics-lead-time-samples-for-import",
  title: "海外商品の輸入・仕入れで確認すべき費用と条件",
  cluster: "partner" as const,
} as const;

export const JA_DEDICATED_GUIDES: readonly JaDedicatedGuide[] = [
  EXISTING_JA_BLOG,
  JA_WHOLESALE_GUIDE,
  JA_SUPPLIER_FINDER,
  JA_MOQ_GUIDE,
  JA_SALES_CAUTIONS,
  JA_JAPAN_ENTRY,
  JA_IMPORT_COST,
];

export function getDedicatedJaBlog(
  slug: string,
): JaDedicatedGuide | undefined {
  return JA_DEDICATED_GUIDES.find((item) => item.slug === slug);
}

export function listDedicatedJaBlogsByCluster(
  cluster: JaBlogCluster,
): readonly JaDedicatedGuide[] {
  return JA_DEDICATED_GUIDES.filter((item) => item.cluster === cluster);
}
