import type { CaseCategory } from "@/lib/types";

export type JaCategorySlug =
  | "food"
  | "cosmetics"
  | "apparel"
  | "home"
  | "health";

export type JaCategoryCta = {
  introPrimaryLabel: string;
  introSecondary: { href: string; label: string };
  productListLabel: string;
  footerPrimary: "cases" | "register-partner";
};

export type JaCategoryLanding = {
  slug: JaCategorySlug;
  label: string;
  caseCategory: CaseCategory;
  title: string;
  description: string;
  h1: string;
  lede: string;
  intro: readonly string[];
  checkHeading: string;
  checks: readonly string[];
  relatedBlogSlugs: readonly string[];
  cta: JaCategoryCta;
};

const buyerProductCta: JaCategoryCta = {
  introPrimaryLabel: "商品一覧を見る",
  introSecondary: {
    href: "/contact",
    label: "商品について問い合わせる",
  },
  productListLabel: "商品一覧を見る",
  footerPrimary: "cases",
};

export const JA_CATEGORIES: readonly JaCategoryLanding[] = [
  {
    slug: "food",
    label: "食品",
    caseCategory: "食品・飲料",
    title: "海外食品の仕入れ・卸｜日本の販売事業者向け",
    description:
      "海外食品・飲料を仕入れたい日本の卸・小売・EC向け。期限、温度帯、MOQなどの取引条件を確認し、掲載商品から候補を探せます。",
    h1: "海外食品・飲料を探している日本の事業者へ",
    lede: "卸・小売・ECで扱える海外食品を、条件を見ながら探せます。",
    intro: [
      "海外食品の仕入れを検討する日本の卸売業者、小売店、EC事業者は、味やパッケージの印象より先に、自社の販路で売り切れる条件が見えるかを確認します。海外ブランドの食品・飲料は、卸の最低ロット、温度帯、入荷後に売れる日数が揃っていないと、店頭にもECにも載せにくいです。",
      "このページは、海外食品を探す入口です。掲載されている取引条件を見ながら、卸としてまとめ買いするか、店舗・ECで試験的に扱うかを判断できます。価格表の一行だけでは着地コストは分からないため、送料や保管の負担もあわせて見る使い方を想定しています。海外食品の卸では、ケース入数と再発注の間隔が、店舗やECの回転と合うかも見てください。",
      "食品は、表示や輸入の手続きが商品ごとに異なります。このページでは適法性を断定しません。原材料、添加物、アレルゲン、アルコールの有無など、自社で扱えそうかを先に洗い出し、必要に応じて専門家や関係機関へ確認してください。確認項目の詳細は関連ガイド、候補の比較は商品一覧へ進みます。",
      "BrandBridgeは輸入代行や在庫の買い取りは行いません。気になる海外ブランドがあれば、商品詳細で条件を確認し、問い合わせへ進めます。",
    ],
    checkHeading: "海外食品を仕入れる前に確認したいこと",
    checks: [
      "賞味・消費期限と、入荷後に売れる日数",
      "常温・冷蔵・冷凍の温度帯",
      "MOQとケース入数",
      "卸価格と、送料を含めた利益の見方",
      "サンプルの取り寄せ可否",
    ],
    relatedBlogSlugs: [
      "how-to-sell-overseas-food-brands-in-japan",
      "cautions-when-selling-overseas-brands-in-japan",
      "logistics-lead-time-samples-for-import",
      "what-is-moq-for-overseas-products",
    ],
    cta: buyerProductCta,
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
    intro: [
      "海外コスメを仕入れたい日本の販売事業者は、世界観だけでなく、卸価格、MOQ、サンプル、販売制限を先に確認する必要があります。掲載されている条件を見てから、商談へ進めます。",
    ],
    checkHeading: "海外コスメを仕入れる前に確認したいこと",
    checks: [
      "主力SKUの卸価格と希望小売価格",
      "初回で抱えられるMOQ",
      "サンプルの有無と送料負担",
      "日本での販売制限や既存パートナーの有無",
      "納期と再発注のリードタイム",
    ],
    relatedBlogSlugs: [
      "how-to-sell-overseas-cosmetics-in-japan",
      "cautions-when-selling-overseas-brands-in-japan",
      "what-is-moq-for-overseas-products",
    ],
    cta: {
      introPrimaryLabel: "コスメの商品を探す",
      introSecondary: {
        href: "/register/partner",
        label: "販売パートナーとして登録",
      },
      productListLabel: "美容・コスメの商品一覧を見る",
      footerPrimary: "register-partner",
    },
  },
  {
    slug: "apparel",
    label: "アパレル",
    caseCategory: "ファッション",
    title: "海外アパレルブランドの仕入れ｜日本の卸・小売・EC向け",
    description:
      "海外ファッション・アパレルを仕入れたい日本の事業者向け。サイズ、MOQ、納期を確認し、掲載商品から候補を探せます。",
    h1: "海外アパレルを探している日本の事業者へ",
    lede: "サイズと数量が見える海外ファッション商品を探せます。",
    intro: [
      "海外ブランドのアパレル仕入れでは、デザインの好みより先に、日本の売場に載るサイズ配分と初回数量が問題になります。卸でまとめて抱える場合も、小売・ECで試験販売する場合も、色とサイズを絞れないと在庫が先に固定されます。",
      "このページは、海外ファッション商品を探す入口です。掲載の取引条件を見ながら、どのSKUから扱うか、再発注のリードタイムがシーズンに合うかを比較できます。全色全サイズを初回から揃える必要はありません。定番色と中心サイズから入る使い方が向いています。海外ブランドのアパレル仕入れは、単価だけでなく、サイズ配分の偏りが在庫リスクになります。",
      "採寸、素材、洗濯表示の要否は商品によって異なります。このページでは制度の適否を断定しません。店頭で試着するか、ECで返品が増えそうかを先に見積もり、必要に応じて専門家へ確認してください。",
      "BrandBridgeは輸入代行を行いません。気になる商品は詳細ページで条件を確認し、問い合わせへ進めます。仕入れ全体の進め方は関連ガイドも参照できます。",
    ],
    checkHeading: "海外アパレルを仕入れる前に確認したいこと",
    checks: [
      "採寸・サイズ展開",
      "初回SKUを絞れるか",
      "MOQと色・サイズの内訳",
      "納期とシーズンのずれ",
      "不良・返品時の確認方法",
    ],
    relatedBlogSlugs: [
      "how-to-sell-overseas-apparel-in-japan",
      "how-to-start-overseas-brand-wholesale",
      "what-is-moq-for-overseas-products",
      "how-to-source-overseas-brands",
    ],
    cta: buyerProductCta,
  },
  {
    slug: "home",
    label: "ホーム",
    caseCategory: "ホーム・インテリア",
    title: "海外雑貨・ホーム商品の仕入れ｜日本の事業者向け",
    description:
      "海外の雑貨・ホーム・インテリアを仕入れたい卸・小売・EC向け。寸法や物流条件を確認し、掲載商品から候補を探せます。",
    h1: "海外ホーム・インテリア商品を探している日本の事業者へ",
    lede: "寸法と送料が見える海外ホーム商品から、取り扱い候補を探せます。",
    intro: [
      "海外雑貨の仕入れを検討する日本の卸・小売・EC事業者は、見た目の好みより先に、日本の住空間と物流に載るサイズかを確認します。ホーム・インテリアは写真が良くても、梱包サイズと重量で利益が消えることがあります。小型の雑貨でも、割れ物や電池の扱いで着地コストが変わることがあります。",
      "このページは、海外のホーム商品を探す入口です。掲載の取引条件を見ながら、店舗に置くか、ECで届けるか、初回で抱えられる数量かを比較できます。容積が大きい商品は、卸価格より輸送の方が効くことがあるため、寸法と送料負担を先に見てください。海外雑貨の仕入れでも、割れ物・電池・塗装の扱いは、着地コストに影響します。",
      "電圧、プラグ、材質、対象年齢などの要否は商品によって異なります。このページでは適法性を断定しません。搬入経路や保管スペースに合うか、破損時の写真確認があるかを洗い出し、必要に応じて専門家や関係機関へ確認してください。",
      "BrandBridgeは輸入代行や在庫の買い取りは行いません。雑貨を含む他カテゴリーも見たい場合は、商品一覧から条件を横断して比較できます。気になる商品は詳細から問い合わせへ進めます。",
    ],
    checkHeading: "海外ホーム商品を仕入れる前に確認したいこと",
    checks: [
      "外寸・重量と梱包単位",
      "送料の負担者と輸送手段",
      "MOQと保管スペース",
      "組立の要否",
      "破損時の写真確認ルール",
    ],
    relatedBlogSlugs: [
      "how-to-sell-overseas-home-lifestyle-in-japan",
      "logistics-lead-time-samples-for-import",
      "cautions-when-selling-overseas-brands-in-japan",
      "how-to-source-overseas-brands",
    ],
    cta: buyerProductCta,
  },
  {
    slug: "health",
    label: "ヘルスケア",
    caseCategory: "健康・サプリ",
    title: "海外ウェルネス商品の仕入れ｜サプリ・ヘルスケア",
    description:
      "海外のサプリ・ウェルネス商品を探す日本の卸・小売・EC向け。成分と発注条件を確認しながら、掲載商品から候補を比較できます。",
    h1: "海外サプリ・ヘルスケア商品を探している日本の事業者へ",
    lede: "成分と発注条件が見える海外ウェルネス商品を探せます。",
    intro: [
      "海外ウェルネス商品の仕入れを検討する日本の卸・小売・EC事業者は、効能のうたい方より先に、数量、期限、卸条件が揃っているかを見ます。サプリやヘルスケアは、説明の書き方と在庫の回転が、店頭でもECでも販売判断に直結します。",
      "このページは、海外の健康・サプリ商品を探す入口です。掲載されている取引条件を見ながら、試験的に扱えるロットか、再発注が間に合うかを比較できます。大きな最低ロットは、期限が短い商品ほど在庫リスクになります。サンプルで中身を確認できるかも、問い合わせ前に見てください。海外ウェルネス商品の仕入れでは、説明できる情報の有無が、店頭とECのどちらに載せるかを左右します。",
      "成分、一日の目安量、対象者、広告で使う表現の扱いが商品ごとに異なります。このページでは適法性を断定しません。自社の販路で説明できる情報があるかを先に洗い出し、必要に応じて専門家や関係機関へ確認してください。",
      "BrandBridgeは輸入代行を行いません。気になる海外ブランドは商品詳細で条件を確認し、問い合わせへ進めます。食品カテゴリーと隣接する確認事項は、関連ガイドも参照できます。",
    ],
    checkHeading: "海外サプリを仕入れる前に確認したいこと",
    checks: [
      "成分表と一日の目安量の開示",
      "期限と保存条件",
      "MOQとバッチ単位",
      "卸価格と希望小売価格の差",
      "サンプルで中身を確認できるか",
    ],
    relatedBlogSlugs: [
      "how-to-sell-overseas-supplements-in-japan",
      "cautions-when-selling-overseas-brands-in-japan",
      "how-to-sell-overseas-food-brands-in-japan",
      "what-is-moq-for-overseas-products",
    ],
    cta: buyerProductCta,
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
