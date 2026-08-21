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
import { publicJaText } from "@/lib/public-case-text";
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
  if (!seen.has("/ja/blog")) {
    links.push({ href: "/ja/blog", label: "日本語ブログ" });
  }
  if (!seen.has("/how-to-sell-in-japan")) {
    links.push({
      href: "/how-to-sell-in-japan",
      label: "海外ブランドが日本で販売する方法",
    });
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
  const lead = publicJaText(caseItem.leadTime);
  const channels = publicJaText(caseItem.partnerChannels);
  const summary = publicJaText(caseItem.summary);

  const faqs: CaseFaqItem[] = [
    {
      q: `${product}は、どのような商品ですか？`,
      a: summary
        ? summary
        : `${product}は、カテゴリー「${caseItem.category?.trim() || "海外商品"}」として掲載されています。詳細は、このページの商品説明と取引条件を確認してください。掲載のない仕様は断定できません。`,
    },
    {
      q: "どのような販売チャネルに向いていますか？",
      a: channels
        ? `掲載の対応チャネルは「${channels}」です。販売形式は「${format}」です。実際の向きは、MOQと説明資料の厚みを見て判断してください。`
        : `販売形式の記載は「${format}」です。卸・小売・ECのどれが合うかは、MOQ・希望小売・説明資料を見て判断してください。このページでは、未登録の販路適性を断定しません。`,
    },
    {
      q: "MOQはいくらですか？",
      a: `この商品のMOQは「${moq}」です。初回だけ小さくできるかは、問い合わせ時に確認してください。`,
    },
    {
      q: "卸価格は確認できますか？",
      a: `参考の卸売価格帯は「${wholesale.primary}」です。正確な卸価格やロット条件は、販売パートナーとしてログイン後に確認できます。最終条件は商談で確定します。`,
    },
    {
      q: "日本で販売するには何が必要ですか？",
      a: "輸入、表示、販路の確認は、商品と売り方で異なります。このページでは適法性を断定しません。カテゴリーの関連ガイドと取引条件を見たうえで、必要なら専門家や公的情報で確認してください。BrandBridgeは輸入代行を行いません。",
    },
  ];

  if (sample !== "—") {
    faqs.push({
      q: "サンプルは取り寄せできますか？",
      a: `サンプル提供は「${sample}」です。送料負担や本発注への充当は、商談で確認します。`,
    });
  }

  faqs.push({
    q: "日本での独占販売は可能ですか？",
    a:
      exclusive === "—"
        ? `販売形式は「${format}」です。独占の範囲は契約前に、地域とチャネルを分けて確認してください。`
        : `独占販売の扱いは「${exclusive}」です。全国か特定チャネルかなど、範囲は商談で確認してください。`,
  });

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

const CATEGORY_INTENT: Record<string, string> = {
  "食品・飲料":
    "食品は、期限・温度帯・ケース入数が、店頭とECの扱いやすさを分けます。",
  "美容・コスメ":
    "コスメは、サンプルと成分の開示、日本での販売制限を先に見てください。",
  "健康・サプリ":
    "サプリ・ヘルスケアは、説明できる成分情報と期限が、公開の可否を左右します。",
  ファッション:
    "アパレルは、サイズ配分と初回SKUの絞り込みが、在庫リスクを決めます。",
  "ホーム・インテリア":
    "ホーム商品は、寸法・重量と送料が、卸価格以上に利益へ効くことがあります。",
  "雑貨・ライフスタイル":
    "雑貨は、割れ物や梱包単位を見てから、店頭向きかEC向きかを分けてください。",
  バッグ: "バッグは、サイズ展開と季節需要を、初回数量と照らして見てください。",
  キッチン:
    "キッチン用品は、材質・耐熱と破損時の確認方法を、発注前に見てください。",
  スポーツ:
    "スポーツ用品は、サイズとシーズンの納期が合うかを先に確認してください。",
  "ホーム・収納":
    "収納用品は、外寸と保管スペースが、MOQより先に制約になることがあります。",
  "家電・ガジェット":
    "家電は、電圧・プラグ・認証の要否を、売り方とあわせて確認してください。",
  "製造・産業":
    "製造・産業向けは、図面・ロット・納期の確認が、価格表より先になります。",
};

function shortenTitle(text: string, max: number): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

export function caseSeoTitle(caseItem: Case): string {
  const product = caseItem.productName?.trim() || caseItem.title;
  const brand = caseItem.brandName?.trim();
  const category = caseItem.category?.trim();
  const short = shortenTitle(product, brand ? 20 : 24);
  if (brand && category) {
    return `${short}｜${shortenTitle(brand, 12)}の${category}`;
  }
  if (category) return `${short}｜${category}の仕入れ`;
  return `${short}｜卸・仕入れ`;
}

export function caseSeoDescription(caseItem: Case): string {
  const product = caseItem.productName?.trim() || caseItem.title;
  const category = caseItem.category?.trim();
  const moq = displayMoqJa(caseItem.minOrder);
  const format = salesFormatLabel(caseItem.salesFormat);
  const wholesale = resolveWholesalePriceDisplay(caseItem.priceBand, "ja").primary;
  const summary = publicJaText(caseItem.summary);
  const lead = summary
    ? summary.replace(/\s+/g, " ")
    : `${product}の日本向け卸・仕入れ情報です。`;
  const facts = [
    category ? `カテゴリーは${category}` : "",
    `販売形式は${format}`,
    `MOQは${moq}`,
    wholesale ? `参考卸価格帯は${wholesale}` : "",
  ]
    .filter(Boolean)
    .join("、");
  return `${lead} ${facts}。取引条件を確認して商談できます。`.slice(0, 180);
}

const FORMAT_CHANNEL_NOTE: Record<string, string> = {
  wholesale:
    "掲載の販売形式は卸売です。在庫を持って小売・専門店・ECへ供給する事業者との相性を、MOQとあわせて見てください。",
  consignment:
    "掲載の販売形式は委託販売です。売れた分の精算条件と、返品・滞留時の扱いを商談で確認してください。",
  agency:
    "掲載の販売形式は代理店です。在庫を持つか紹介中心か、販売地域の範囲を契約前に分けてください。",
  oem: "掲載の販売形式はOEM / ODMです。仕様・ロット・納期の確認が、価格表より先になります。",
  ec: "掲載の販売形式はEC販売です。写真・説明文・問い合わせ対応の厚みを、店頭条件とは別に見てください。",
  other:
    "販売形式はその他として掲載されています。実際の取引の形は、問い合わせで確認してください。",
};

export function caseJapanMarketNotes(caseItem: Case): string[] {
  const notes: string[] = [];
  const formatNote = FORMAT_CHANNEL_NOTE[caseItem.salesFormat];
  if (formatNote) notes.push(formatNote);

  const channels = publicJaText(caseItem.partnerChannels);
  if (channels) {
    notes.push(`掲載されている対応チャネルは「${channels}」です。`);
  }

  const intent = CATEGORY_INTENT[caseItem.category];
  if (intent) notes.push(intent);

  notes.push(
    "未登録の販路（例: サロン専用、全国量販）を、このページが保証するものではありません。",
  );
  return notes;
}

export function casePartnerFitNotes(caseItem: Case): string[] {
  const notes: string[] = [];
  const partner = publicJaText(caseItem.idealPartner);
  if (partner) {
    notes.push(`想定している販売パートナー像の記載は、「${partner}」です。`);
  }
  const requirements = publicJaText(caseItem.partnerRequirements);
  if (requirements) {
    notes.push(`パートナーへの要望の記載は、「${requirements}」です。`);
  }
  const format = salesFormatLabel(caseItem.salesFormat);
  const moq = displayMoqJa(caseItem.minOrder);
  notes.push(
    `販売形式は「${format}」、MOQは「${moq}」です。自社の在庫と販路がこの条件に合うかを先に見てください。`,
  );
  if (!partner) {
    notes.push(
      "理想のパートナー像は未記載です。カテゴリーと取引条件から、卸・小売・ECのどれで扱うかを検討してください。",
    );
  }
  return notes;
}

export function caseBuyerOverview(caseItem: Case): string[] {
  const product = caseItem.productName?.trim() || caseItem.title;
  const category = caseItem.category?.trim() || "海外商品";
  const format = salesFormatLabel(caseItem.salesFormat);
  const moq = displayMoqJa(caseItem.minOrder);
  const wholesale = resolveWholesalePriceDisplay(caseItem.priceBand, "ja").primary;
  const origin = publicJaText(caseItem.shipFrom);
  const exclusive = displayExclusiveDealOption(caseItem.exclusiveDealOption);
  const summary = publicJaText(caseItem.summary);

  const paragraphs = [
    summary ||
      `${product}は、${category}の海外ブランド商品として、日本の卸・小売・EC事業者が仕入れを検討できます。`,
    `販売形式は${format}、MOQは${moq}、参考の卸売価格帯は${wholesale}です。`,
  ];

  if (origin) {
    paragraphs.push(
      `原産国・出荷元の記載は「${origin}」です。誰が輸入する想定か、Incotermsとあわせて確認してください。`,
    );
  }
  if (exclusive !== "—") {
    paragraphs.push(
      `独占販売の扱いは「${exclusive}」です。地域やチャネルの範囲は、契約前に文書で確認してください。`,
    );
  }
  paragraphs.push(
    "BrandBridgeは輸入代行や在庫の買い取りは行いません。最終条件は商談で確定します。",
  );
  return paragraphs;
}
