import type { CaseCategory } from "@/lib/types";

export type JaCategorySlug =
  | "food"
  | "cosmetics"
  | "apparel"
  | "home"
  | "health";

export type JaCategoryLanding = {
  slug: JaCategorySlug;
  label: string;
  caseCategory: CaseCategory;
  title: string;
  description: string;
  h1: string;
  lede: string;
  intro: string;
  checkHeading: string;
  checks: readonly string[];
  relatedBlogSlug: string;
};

export const JA_CATEGORIES: readonly JaCategoryLanding[] = [
  {
    slug: "food",
    label: "食品",
    caseCategory: "食品・飲料",
    title: "海外食品を仕入れる｜日本の卸・小売・EC向け",
    description:
      "海外食品・飲料の取り扱いを検討する日本の事業者向け。取引条件を確認し、掲載商品から候補を探せます。",
    h1: "海外食品・飲料を探している日本の事業者へ",
    lede: "卸・小売・ECで扱える海外食品を、条件を見ながら探せます。",
    intro:
      "バイヤー、卸売業者、小売店、EC事業者が海外食品を仕入れるときは、味の印象より先に、期限・温度帯・最低発注数量が見えるかが分かれ目です。ここでは掲載商品から候補を絞る入口を用意しています。",
    checkHeading: "海外食品を仕入れる前に確認したいこと",
    checks: [
      "賞味・消費期限と、入荷後に売れる日数",
      "常温・冷蔵・冷凍の温度帯",
      "MOQとケース入数",
      "卸価格と、送料を含めた利益の見方",
      "サンプルの取り寄せ可否",
    ],
    relatedBlogSlug: "how-to-sell-overseas-food-brands-in-japan",
  },
  {
    slug: "cosmetics",
    label: "コスメ",
    caseCategory: "美容・コスメ",
    title: "海外コスメを仕入れる｜日本の販売パートナー向け",
    description:
      "海外美容・コスメ商品を探すバイヤー・小売・EC向け。条件を確認しながら掲載商品を比較できます。",
    h1: "海外コスメを探している日本の事業者へ",
    lede: "店頭やECで扱いたい海外コスメを、取引条件から比較できます。",
    intro:
      "海外コスメを仕入れたい日本の販売事業者は、世界観だけでなく、卸価格、MOQ、サンプル、販売制限を先に確認する必要があります。掲載されている条件を見てから、商談へ進めます。",
    checkHeading: "海外コスメを仕入れる前に確認したいこと",
    checks: [
      "主力SKUの卸価格と希望小売価格",
      "初回で抱えられるMOQ",
      "サンプルの有無と送料負担",
      "日本での販売制限や既存パートナーの有無",
      "納期と再発注のリードタイム",
    ],
    relatedBlogSlug: "how-to-sell-overseas-cosmetics-in-japan",
  },
  {
    slug: "apparel",
    label: "アパレル",
    caseCategory: "ファッション",
    title: "海外アパレルを仕入れる｜日本の卸・小売・EC向け",
    description:
      "海外ファッション商品の取り扱いを検討する日本の事業者向け。サイズや条件を確認し、掲載商品から探せます。",
    h1: "海外アパレルを探している日本の事業者へ",
    lede: "サイズと数量が見える海外ファッション商品を探せます。",
    intro:
      "海外アパレルの仕入れでは、デザインより先に、日本の売場に載るサイズ配分と初回数量が問題になります。掲載の取引条件を確認し、試験的に扱えるSKUから探す使い方が向いています。",
    checkHeading: "海外アパレルを仕入れる前に確認したいこと",
    checks: [
      "採寸・サイズ展開",
      "初回SKUを絞れるか",
      "MOQと色・サイズの内訳",
      "納期とシーズンのずれ",
      "不良・返品時の確認方法",
    ],
    relatedBlogSlug: "how-to-sell-overseas-apparel-in-japan",
  },
  {
    slug: "home",
    label: "ホーム",
    caseCategory: "ホーム・インテリア",
    title: "海外ホーム・インテリア商品を仕入れる｜日本の事業者向け",
    description:
      "海外のホーム・インテリア商品を探す卸・小売・EC向け。寸法や物流条件を確認し、掲載商品へ進めます。",
    h1: "海外ホーム・インテリア商品を探している日本の事業者へ",
    lede: "寸法と送料が見える海外ホーム商品から、取り扱い候補を探せます。",
    intro:
      "ホーム・インテリアは、見た目が良くても梱包サイズと重量で利益が消えることがあります。日本の卸・小売・ECが仕入れる前に、条件と物流の負担を確認するための入口です。",
    checkHeading: "海外ホーム商品を仕入れる前に確認したいこと",
    checks: [
      "外寸・重量と梱包単位",
      "送料の負担者と輸送手段",
      "MOQと保管スペース",
      "組立の要否",
      "破損時の写真確認ルール",
    ],
    relatedBlogSlug: "how-to-sell-overseas-home-lifestyle-in-japan",
  },
  {
    slug: "health",
    label: "ヘルスケア",
    caseCategory: "健康・サプリ",
    title: "海外サプリ・ウェルネス商品を仕入れる｜日本の事業者向け",
    description:
      "海外の健康・サプリ商品を探す卸・小売・EC向け。条件を確認し、掲載商品から候補を探せます。",
    h1: "海外サプリ・ヘルスケア商品を探している日本の事業者へ",
    lede: "成分と発注条件が見える海外ウェルネス商品を探せます。",
    intro:
      "海外サプリを仕入れたい日本の事業者は、効能のうたい方より先に、数量、期限、卸条件が揃っているかを見ます。掲載商品から候補を絞り、条件を確認してから商談へ進めます。",
    checkHeading: "海外サプリを仕入れる前に確認したいこと",
    checks: [
      "成分表と一日の目安量の開示",
      "期限と保存条件",
      "MOQとバッチ単位",
      "卸価格と希望小売価格の差",
      "サンプルで中身を確認できるか",
    ],
    relatedBlogSlug: "how-to-sell-overseas-supplements-in-japan",
  },
] as const;

const BY_SLUG = new Map(JA_CATEGORIES.map((item) => [item.slug, item]));

export function listJaCategories(): readonly JaCategoryLanding[] {
  return JA_CATEGORIES;
}

export function getJaCategory(slug: string): JaCategoryLanding | undefined {
  return BY_SLUG.get(slug as JaCategorySlug);
}

export function listJaCategorySlugs(): JaCategorySlug[] {
  return JA_CATEGORIES.map((item) => item.slug);
}

export function jaCategoryPath(slug: JaCategorySlug): string {
  return `/ja/categories/${slug}`;
}

export function jaCategoryCasesHref(caseCategory: CaseCategory): string {
  return `/cases?category=${encodeURIComponent(caseCategory)}`;
}
