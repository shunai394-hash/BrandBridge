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
  compareHeading: string;
  compare: readonly string[];
  listingHeading: string;
  listingLead: string;
  relatedBlogSlugs: readonly string[];
  cta: JaCategoryCta;
};

export type JaCategoryProductCard = {
  id: string;
  productName: string;
  brandName: string | null;
  sku: string | null;
  priceBand: string | null;
  minOrder: string | null;
};

const buyerProductCta: JaCategoryCta = {
  introPrimaryLabel: "商品一覧を見る",
  introSecondary: {
    href: "/contact",
    label: "商品について問い合わせる",
  },
  productListLabel: "このカテゴリーの商品をすべて見る",
  footerPrimary: "cases",
};

export const JA_CATEGORIES: readonly JaCategoryLanding[] = [
  {
    slug: "food",
    label: "食品",
    caseCategory: "食品・飲料",
    title: "海外食品の仕入れ｜卸・小売・EC向け取引条件",
    description:
      "海外食品・飲料を仕入れたい日本の卸・小売・EC向け。賞味期限、温度帯、MOQ、卸条件を確認し、掲載商品から候補を探せます。",
    h1: "海外食品・飲料を仕入れたい日本の事業者へ",
    lede: "期限とロットが見える海外食品を、取引条件から比較できます。",
    intro: [
      "海外食品の仕入れを検討する日本の卸売業者、小売店、EC事業者は、味やパッケージより先に、自社の販路で売り切れる条件が見えるかを確認します。最低ロット、温度帯、入荷後に売れる日数が揃っていないと、店頭にもECにも載せにくいです。",
      "このページは、海外食品・飲料を探す入口です。掲載の卸価格、MOQ、サンプル可否を見ながら、まとめ買いするか、店舗・ECで試験的に扱うかを判断できます。ケース入数と再発注の間隔が、回転と合うかも合わせて見てください。",
      "表示や輸入の手続きは商品ごとに異なります。このページでは適法性を断定しません。原材料、添加物、アレルゲン、アルコールの有無など、自社で扱えそうかを洗い出し、必要に応じて専門家や関係機関へ確認してください。",
      "BrandBridgeは輸入代行や在庫の買い取りは行いません。気になる商品は詳細で条件を確認し、問い合わせへ進めます。",
    ],
    checkHeading: "海外食品を仕入れる前に確認したいこと",
    checks: [
      "賞味・消費期限と、入荷後に売れる日数",
      "常温・冷蔵・冷凍の温度帯",
      "MOQとケース入数",
      "卸価格と、送料を含めた利益の見方",
      "サンプルの取り寄せ可否",
    ],
    compareHeading: "このカテゴリーの掲載商品の見方",
    compare: [
      "期限が短い商品は、MOQが大きいほど在庫リスクが先に出ます。",
      "冷蔵・冷凍は国内配送まで含めて、着地コストを見てください。",
      "ギフト需要と業務用では、入数と価格帯の向きが違います。",
    ],
    listingHeading: "海外食品・飲料の掲載商品",
    listingLead:
      "カテゴリー「食品・飲料」の公開商品です。気になる候補は商品詳細で条件を確認し、問い合わせできます。",
    relatedBlogSlugs: [
      "how-to-sell-overseas-food-brands-in-japan",
      "cautions-when-selling-overseas-brands-in-japan",
      "logistics-lead-time-samples-for-import",
      "what-is-moq-for-overseas-products",
      "how-to-find-overseas-products-to-sell-in-japan",
      "checklist-before-dealing-with-overseas-brands",
    ],
    cta: buyerProductCta,
  },
  {
    slug: "cosmetics",
    label: "コスメ",
    caseCategory: "美容・コスメ",
    title: "海外コスメの仕入れ｜日本の卸・小売・EC向け",
    description:
      "海外美容・コスメを探す日本の販売事業者向け。卸価格、MOQ、サンプル、販売制限を確認しながら掲載商品を比較できます。",
    h1: "海外コスメを仕入れたい日本の事業者へ",
    lede: "店頭やECで扱える海外コスメを、取引条件から比較できます。",
    intro: [
      "海外コスメを仕入れたい日本の卸・小売・ECは、世界観だけでなく、卸価格、MOQ、サンプル、日本での販売制限を先に確認する必要があります。説明資料が薄いと、店頭でもECでも公開までに時間がかかります。",
      "このページは、海外美容・コスメを探す入口です。掲載条件を見ながら、専門店向けか、ECで説明文を厚くできるかを判断できます。色展開が多いブランドは、主力SKUから入る方が初回在庫を抑えられます。",
      "成分表示や効能のうたい方は商品と売り方で異なります。このページでは適法性を断定しません。全成分の開示、対象者、注意表示を先に洗い出し、必要に応じて専門家や公的情報で確認してください。",
      "BrandBridgeは輸入代行を行いません。条件が見える商品から問い合わせへ進めます。",
    ],
    checkHeading: "海外コスメを仕入れる前に確認したいこと",
    checks: [
      "主力SKUの卸価格と希望小売価格",
      "初回で抱えられるMOQ",
      "サンプルの有無と送料負担",
      "日本での販売制限や既存パートナーの有無",
      "納期と再発注のリードタイム",
    ],
    compareHeading: "このカテゴリーの掲載商品の見方",
    compare: [
      "希望小売の目安と卸の差が説明できない商品は、店頭採用が遅れます。",
      "サンプルで色・香り・使用感を見られるかを、発注前に確認します。",
      "公式ECがすでに安い場合、店舗仕入れと衝突することがあります。",
    ],
    listingHeading: "海外コスメの掲載商品",
    listingLead:
      "カテゴリー「美容・コスメ」の公開商品です。取引条件を比較してから、詳細ページへ進んでください。",
    relatedBlogSlugs: [
      "how-to-sell-overseas-cosmetics-in-japan",
      "cautions-when-selling-overseas-brands-in-japan",
      "what-is-moq-for-overseas-products",
      "how-to-start-overseas-brand-wholesale",
      "how-to-find-overseas-product-suppliers",
      "how-to-find-overseas-products-to-sell-in-japan",
    ],
    cta: {
      introPrimaryLabel: "コスメの商品を探す",
      introSecondary: {
        href: "/register/partner",
        label: "販売パートナーとして登録",
      },
      productListLabel: "美容・コスメの商品をすべて見る",
      footerPrimary: "register-partner",
    },
  },
  {
    slug: "apparel",
    label: "アパレル",
    caseCategory: "ファッション",
    title: "海外アパレルの仕入れ｜サイズ・MOQ・納期の確認",
    description:
      "海外ファッションを仕入れたい日本の卸・小売・EC向け。サイズ展開、初回SKU、MOQ、納期を確認し、掲載商品から候補を探せます。",
    h1: "海外アパレルを仕入れたい日本の事業者へ",
    lede: "サイズと数量が見える海外ファッション商品を探せます。",
    intro: [
      "海外ブランドのアパレル仕入れでは、デザインの好みより先に、日本の売場に載るサイズ配分と初回数量が問題になります。色とサイズを絞れないと、在庫が先に固定されます。",
      "このページは、海外ファッション商品を探す入口です。掲載の取引条件を見ながら、どのSKUから扱うか、再発注がシーズンに合うかを比較できます。全色全サイズを初回から揃える必要はありません。",
      "採寸、素材、洗濯表示の要否は商品によって異なります。制度の適否はこのページでは断定しません。店頭で試着するか、ECで返品が増えそうかを先に見積もってください。",
      "BrandBridgeは輸入代行を行いません。気になる商品は詳細で条件を確認し、問い合わせへ進めます。",
    ],
    checkHeading: "海外アパレルを仕入れる前に確認したいこと",
    checks: [
      "採寸・サイズ展開",
      "初回SKUを絞れるか",
      "MOQと色・サイズの内訳",
      "納期とシーズンのずれ",
      "不良・返品時の確認方法",
    ],
    compareHeading: "このカテゴリーの掲載商品の見方",
    compare: [
      "SKUあたりのMOQが色展開に乗ると、実効在庫はすぐに膨らみます。",
      "納期がシーズンを越える商品は、初回数量を小さくしてください。",
      "定番色と中心サイズから入る方が、試験販売向きです。",
    ],
    listingHeading: "海外アパレルの掲載商品",
    listingLead:
      "カテゴリー「ファッション」の公開商品です。サイズとMOQを見てから、詳細へ進んでください。",
    relatedBlogSlugs: [
      "how-to-sell-overseas-apparel-in-japan",
      "how-to-start-overseas-brand-wholesale",
      "what-is-moq-for-overseas-products",
      "how-to-source-overseas-brands",
      "steps-to-sell-overseas-products-in-japan",
      "how-to-find-overseas-product-suppliers",
    ],
    cta: buyerProductCta,
  },
  {
    slug: "home",
    label: "ホーム",
    caseCategory: "ホーム・インテリア",
    title: "海外ホーム・雑貨の仕入れ｜寸法と物流条件",
    description:
      "海外のホーム・インテリア・雑貨を仕入れたい日本の事業者向け。寸法、重量、送料、MOQを確認し、掲載商品から候補を探せます。",
    h1: "海外ホーム・インテリアを仕入れたい日本の事業者へ",
    lede: "寸法と送料が見える海外ホーム商品から、取り扱い候補を探せます。",
    intro: [
      "海外雑貨の仕入れを検討する日本の卸・小売・ECは、見た目より先に、日本の住空間と物流に載るサイズかを確認します。写真が良くても、梱包サイズと重量で利益が消えることがあります。",
      "このページは、海外のホーム・インテリアを探す入口です。店舗に置くか、ECで届けるか、初回で抱えられる数量かを、掲載条件から比較できます。容積が大きい商品は、卸価格より輸送の方が効くことがあります。",
      "電圧、プラグ、材質、対象年齢などの要否は商品によって異なります。適法性は断定しません。搬入経路、保管スペース、破損時の写真確認を洗い出してください。",
      "BrandBridgeは輸入代行や在庫の買い取りは行いません。他カテゴリーも見たい場合は、商品一覧から条件を横断できます。",
    ],
    checkHeading: "海外ホーム商品を仕入れる前に確認したいこと",
    checks: [
      "外寸・重量と梱包単位",
      "送料の負担者と輸送手段",
      "MOQと保管スペース",
      "組立の要否",
      "破損時の写真確認ルール",
    ],
    compareHeading: "このカテゴリーの掲載商品の見方",
    compare: [
      "割れ物・電池・塗装のある商品は、検品と返品のルールを先に見てください。",
      "小型雑貨でも、ケース入数が倉庫スペースを決めることがあります。",
      "EC配送向きか、店頭展示向きかは、重量と破損リスクで分かれます。",
    ],
    listingHeading: "海外ホーム・インテリアの掲載商品",
    listingLead:
      "カテゴリー「ホーム・インテリア」の公開商品です。寸法とMOQを確認してから詳細へ進んでください。",
    relatedBlogSlugs: [
      "how-to-sell-overseas-home-lifestyle-in-japan",
      "logistics-lead-time-samples-for-import",
      "cautions-when-selling-overseas-brands-in-japan",
      "how-to-source-overseas-brands",
      "how-to-find-overseas-product-suppliers",
      "what-is-moq-for-overseas-products",
    ],
    cta: buyerProductCta,
  },
  {
    slug: "health",
    label: "ヘルスケア",
    caseCategory: "健康・サプリ",
    title: "海外サプリの仕入れ｜ヘルスケア商品の取引条件",
    description:
      "海外のサプリ・ヘルスケアを探す日本の卸・小売・EC向け。成分情報、期限、MOQ、卸条件を確認しながら掲載商品を比較できます。",
    h1: "海外サプリ・ヘルスケアを仕入れたい日本の事業者へ",
    lede: "成分と発注条件が見える海外ウェルネス商品を探せます。",
    intro: [
      "海外のサプリやヘルスケアを仕入れる日本の卸・小売・ECは、効能のうたい方より先に、数量、期限、卸条件が揃っているかを見ます。説明できる情報がないと、店頭にもECにも載せられません。",
      "このページは、海外の健康・サプリ商品を探す入口です。試験的に扱えるロットか、再発注が間に合うかを、掲載条件から比較できます。最低ロットが大きいほど、期限の短い商品は在庫リスクになります。",
      "成分、一日の目安量、対象者、広告表現の扱いは商品ごとに異なります。適法性は断定しません。自社の販路で説明できる開示があるかを洗い出し、必要に応じて専門家や関係機関へ確認してください。",
      "BrandBridgeは輸入代行を行いません。食品カテゴリーと隣接する確認事項は、関連ガイドも参照できます。",
    ],
    checkHeading: "海外サプリを仕入れる前に確認したいこと",
    checks: [
      "成分表と一日の目安量の開示",
      "期限と保存条件",
      "MOQとバッチ単位",
      "卸価格と希望小売価格の差",
      "サンプルで中身を確認できるか",
    ],
    compareHeading: "このカテゴリーの掲載商品の見方",
    compare: [
      "説明できない効能表現がある商品は、公開前に止めてください。",
      "バッチ単位のMOQは、期限との両立を先に計算します。",
      "食品に近い商品は、温度帯と表示の確認も重ねて見てください。",
    ],
    listingHeading: "海外サプリ・ヘルスケアの掲載商品",
    listingLead:
      "カテゴリー「健康・サプリ」の公開商品です。成分情報とMOQを見てから、詳細へ進んでください。",
    relatedBlogSlugs: [
      "how-to-sell-overseas-supplements-in-japan",
      "cautions-when-selling-overseas-brands-in-japan",
      "how-to-sell-overseas-food-brands-in-japan",
      "what-is-moq-for-overseas-products",
      "checklist-before-dealing-with-overseas-brands",
      "how-to-find-overseas-products-to-sell-in-japan",
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

export function getJaCategoryByCaseCategory(
  caseCategory: string,
): JaCategoryLanding | undefined {
  return JA_CATEGORIES.find((item) => item.caseCategory === caseCategory);
}
