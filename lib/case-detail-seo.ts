import { getJaBlogArticle } from "@/lib/blog/ja-articles";
import { getDedicatedJaBlog } from "@/lib/blog/ja-articles/types";
import {
  displayExclusiveDealOption,
  displaySampleDealLabel,
} from "@/lib/case-detail-display";
import {
  getJaCategoryByCaseCategory,
  jaCategoryCasesHref,
  jaCategoryPath,
  listJaCategories,
  type JaCategoryLanding,
} from "@/lib/ja-categories";
import { displayMoqJa } from "@/lib/price-display";
import { salesFormatLabel, type Case } from "@/lib/types";
import { resolveWholesalePriceDisplay } from "@/lib/wholesale-price-display";

export type CaseSeoLink = {
  href: string;
  label: string;
};

export type CaseFaqItem = {
  q: string;
  a: string;
};

const GENERIC_BUYER_BLOGS = [
  "how-to-start-overseas-brand-wholesale",
  "what-is-moq-for-overseas-products",
  "how-to-find-overseas-wholesale-suppliers",
  "cautions-when-selling-overseas-brands-in-japan",
] as const;

const NEARBY_CATEGORY: Record<string, readonly string[]> = {
  "食品・飲料": ["美容・コスメ", "健康・サプリ"],
  "美容・コスメ": ["健康・サプリ", "食品・飲料"],
  "健康・サプリ": ["美容・コスメ", "食品・飲料"],
  ファッション: ["ホーム・インテリア", "美容・コスメ"],
  "ホーム・インテリア": ["ファッション", "食品・飲料"],
  "雑貨・ライフスタイル": ["ホーム・インテリア", "ファッション"],
  バッグ: ["ファッション", "ホーム・インテリア"],
  キッチン: ["ホーム・インテリア", "食品・飲料"],
  "ホーム・収納": ["ホーム・インテリア", "ファッション"],
  スポーツ: ["ホーム・インテリア", "健康・サプリ"],
  "家電・ガジェット": ["ホーム・インテリア", "ファッション"],
};

function blogLink(slug: string): CaseSeoLink | null {
  const dedicated = getDedicatedJaBlog(slug);
  if (dedicated) {
    return { href: dedicated.path, label: dedicated.title };
  }
  const item = getJaBlogArticle(slug);
  return item ? { href: `/ja/blog/${item.slug}`, label: item.title } : null;
}

export function relatedJaCategoryLinks(caseCategory: string): CaseSeoLink[] {
  const links: CaseSeoLink[] = [];
  const seen = new Set<string>();

  const push = (href: string, label: string) => {
    if (seen.has(href)) return;
    seen.add(href);
    links.push({ href, label });
  };

  const matched = getJaCategoryByCaseCategory(caseCategory);
  if (matched) {
    push(jaCategoryPath(matched.slug), `${matched.label}のカテゴリー`);
    push(
      jaCategoryCasesHref(matched.caseCategory),
      `${matched.caseCategory}の商品一覧`,
    );
  }

  push("/ja/categories", "カテゴリー一覧");
  push("/cases", "商品一覧");

  const nearbyNames = NEARBY_CATEGORY[caseCategory] ?? [];
  for (const name of nearbyNames) {
    const nearby = getJaCategoryByCaseCategory(name);
    if (nearby) {
      push(jaCategoryPath(nearby.slug), `${nearby.label}のカテゴリー`);
    }
  }

  if (!matched) {
    for (const item of listJaCategories().slice(0, 2)) {
      push(jaCategoryPath(item.slug), `${item.label}のカテゴリー`);
    }
  }

  return links;
}

export function relatedJaBlogLinks(caseCategory: string): CaseSeoLink[] {
  const matched: JaCategoryLanding | undefined =
    getJaCategoryByCaseCategory(caseCategory);
  const slugs = [
    ...(matched?.relatedBlogSlugs ?? []),
    ...GENERIC_BUYER_BLOGS,
  ];
  const links: CaseSeoLink[] = [];
  const seen = new Set<string>();
  for (const slug of slugs) {
    const link = blogLink(slug);
    if (!link || seen.has(link.href)) continue;
    seen.add(link.href);
    links.push(link);
    if (links.length >= 6) break;
  }
  return links;
}

export function caseDetailFaqs(caseItem: Case): CaseFaqItem[] {
  const product = caseItem.productName?.trim() || caseItem.title;
  const wholesale = resolveWholesalePriceDisplay(caseItem.priceBand, "ja");
  const moq = displayMoqJa(caseItem.minOrder);
  const sample = displaySampleDealLabel(caseItem.sampleAvailable);
  const exclusive = displayExclusiveDealOption(caseItem.exclusiveDealOption);
  const format = salesFormatLabel(caseItem.salesFormat);
  const lead = caseItem.leadTime?.trim();

  const faqs: CaseFaqItem[] = [
    {
      q: `${product}の卸売価格は公開されていますか？`,
      a: `参考の卸売価格帯は「${wholesale.primary}」です。正確な卸価格やロット条件は、販売パートナーとしてログイン後に確認できます。最終条件は商談で確定します。`,
    },
    {
      q: "MOQ（最低注文数量）はどのくらいですか？",
      a: `この商品のMOQは「${moq}」です。初回だけ小さくできるかは、問い合わせ時に確認してください。`,
    },
    {
      q: "サンプルは取り寄せできますか？",
      a:
        sample === "—"
          ? "サンプル提供の可否は、商品詳細の取引条件を確認するか、問い合わせで聞いてください。"
          : `サンプル提供は「${sample}」です。送料負担や本発注への充当は、商談で確認します。`,
    },
    {
      q: "日本での独占販売は可能ですか？",
      a:
        exclusive === "—"
          ? `販売形式は「${format}」です。独占の範囲は契約前に、地域とチャネルを分けて確認してください。`
          : `独占販売の扱いは「${exclusive}」です。全国か特定チャネルかなど、範囲は商談で確認してください。`,
    },
  ];

  if (lead) {
    faqs.push({
      q: "納期・リードタイムの目安はありますか？",
      a: `リードタイムの記載は「${lead}」です。繁忙期や再発注時の日数は、発注前に改めて確認してください。`,
    });
  }

  faqs.push({
    q: "取引を始めるにはどうすればよいですか？",
    a: "商品詳細でカテゴリーと取引条件を確認し、販売パートナーとしてログインしたうえで問い合わせ・商談へ進めます。BrandBridgeは輸入代行や在庫の買い取りは行いません。",
  });

  return faqs;
}

export function caseSeoDescription(caseItem: Case): string {
  const product = caseItem.productName?.trim() || caseItem.title;
  const category = caseItem.category?.trim();
  const summary = caseItem.summary?.trim();
  if (summary) {
    return summary.slice(0, 180);
  }
  const moq = displayMoqJa(caseItem.minOrder);
  const format = salesFormatLabel(caseItem.salesFormat);
  const bits = [
    `${product}の販売パートナー募集。`,
    category ? `カテゴリーは${category}。` : "",
    `販売形式は${format}、MOQは${moq}。`,
    "取引条件を確認して商談できます。",
  ];
  return bits.filter(Boolean).join("").slice(0, 180);
}
