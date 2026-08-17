import type { JaBlogArticle } from "@/lib/blog/ja-articles/types";
import { EXISTING_JA_BLOG } from "@/lib/blog/ja-articles/types";

const categoryCtaPartner = {
  heading: "このカテゴリーの海外商品を探している方へ",
  body: "掲載商品の取引条件を確認しながら、取り扱い候補を探せます。ブランド側は、商品情報の掲載から始められます。",
  primary: { href: "/cases", label: "商品一覧を見る" },
  secondary: { href: "/register/partner", label: "販売パートナーとして登録する" },
} as const;

const categoryLinks = [
  { href: "/cases", label: "掲載商品を見る" },
  { href: "/for-partners", label: "販売パートナーの方へ" },
  { href: "/for-makers", label: "商品提供企業の方へ" },
  { href: "/how-to-sell-in-japan", label: "日本で販売する方法" },
  { href: EXISTING_JA_BLOG.path, label: EXISTING_JA_BLOG.title },
] as const;

const regulationNote =
  "表示や許認可の要否は商品と売り方によって異なります。この記事は一般的な確認の視点であり、個別の適法性は断定しません。公的情報や専門家で確認してください。";

export const CATEGORY_ARTICLES: JaBlogArticle[] = [
  {
    slug: "how-to-sell-overseas-cosmetics-in-japan",
    cluster: "category",
    title: "海外コスメブランドを日本で販売するには？",
    description:
      "海外コスメを日本で販売したい事業者・ブランド向け。成分・表示の確認視点、仕入れ条件、販路の選び方を実務目線で整理します。",
    eyebrow: "カテゴリー別ガイド",
    lede: "海外コスメの取り扱いは、世界観の移植より、日本で説明できる成分と表示があるかが先です。",
    intro: [
      "化粧品は、店頭でもECでも説明と表示の比重が大きいカテゴリーです。仕入れ条件が良くても、日本で売ってよいか、何を表示すべきかが不明なまま発注すると、公開できません。",
      "販売方法の全体像は既存ガイドに譲り、ここではコスメ固有の見極めに絞ります。",
    ],
    hero: {
      id: "kyotoStreet",
      alt: "京都の通りを歩く人。日本の売場でコスメを扱うイメージ",
    },
    sections: [
      {
        heading: "販売前に確認する視点",
        paragraphs: [
          "成分、用途、対象者、既存の日本販売の有無です。医薬品的な効能をうたう表現は、特に慎重に扱います。",
          regulationNote,
        ],
        bullets: [
          "全成分や主要成分の開示があるか",
          "日本向けの注意表示が必要そうか",
          "サンプルで色・香り・使用感を確認できるか",
          "賞味・使用期限と輸送温度",
        ],
      },
      {
        heading: "仕入れ条件で見る点",
        paragraphs: [
          "MOQ、卸価格、希望小売価格、返品、バッチごとの差です。色展開が多いと、初回在庫が膨らみます。主力SKUから入る方が扱いやすいです。",
        ],
      },
      {
        heading: "販路の向き",
        paragraphs: [
          "専門店、百貨店、自社EC、モールは、求められる説明量が違います。説明資料が少ないブランドは、店頭より説明文を長く書けるECの方が合うことがあります。",
        ],
      },
      {
        heading: "BrandBridgeでの探し方・載せ方",
        paragraphs: [
          "販売側は、掲載の取引条件を見ながら候補を絞れます。ブランド側は、成分や用途が分かる情報と、卸・MOQを先に載せてください。",
        ],
      },
    ],
    relatedSlugs: [
      "how-to-sell-overseas-supplements-in-japan",
      "how-to-find-overseas-brands-that-can-sell-in-japan",
      EXISTING_JA_BLOG.slug,
    ],
    existingLinks: [...categoryLinks],
    cta: categoryCtaPartner,
  },
  {
    slug: "how-to-sell-overseas-food-brands-in-japan",
    cluster: "category",
    title: "海外食品ブランドを日本で販売するには？",
    description:
      "海外食品を日本で販売したい事業者・ブランド向け。表示・期限・物流の確認視点と、仕入れ条件の見方を解説します。",
    eyebrow: "カテゴリー別ガイド",
    lede: "海外食品は、味の評価より先に、期限、表示、温度帯が日本の販路に載るかを見ます。",
    intro: [
      "食品は、到着後に売れる日数が短いことがあります。卸価格が良くても、船便の日数と賞味期限が合わなければ扱えません。",
      regulationNote,
    ],
    hero: {
      id: "templeLantern",
      alt: "提灯の灯る門。食の場としての日本を示すイメージ",
    },
    sections: [
      {
        heading: "食品で先に確認すること",
        paragraphs: [
          "賞味・消費期限、保存温度、原材料、アレルギー情報、アルコールの有無です。日本の売場では、この情報がページや一括表示の材料になります。",
        ],
        bullets: [
          "輸出時点の残存期限",
          "温度帯（常温、冷蔵、冷凍）",
          "原材料と添加物の開示",
          "ケース入数と破損しやすい包装か",
        ],
      },
      {
        heading: "仕入れと物流",
        paragraphs: [
          "MOQが大きいと、期限切れリスクが上がります。初回は少ないSKU、短い輸送、サンプル確認が扱いやすいです。通関や検疫の要否は案件ごとに確認します。",
        ],
      },
      {
        heading: "販路",
        paragraphs: [
          "専門店、ギフト、ECは、説明の仕方とロットが違います。ギフトは見た目と期限、日常使いの食品は再発注の速さが効きます。",
        ],
      },
      {
        heading: "掲載で出す情報",
        paragraphs: [
          "BrandBridgeでは取引条件を商品と一緒に確認できます。食品は、期限と温度帯が分かる記載があると、問い合わせの質が上がります。",
        ],
      },
    ],
    relatedSlugs: [
      "how-to-sell-overseas-supplements-in-japan",
      "logistics-lead-time-samples-for-import",
      EXISTING_JA_BLOG.slug,
    ],
    existingLinks: [...categoryLinks],
    cta: categoryCtaPartner,
  },
  {
    slug: "how-to-sell-overseas-supplements-in-japan",
    cluster: "category",
    title: "海外サプリ・ウェルネス商品を日本で販売するには？",
    description:
      "海外サプリ・ウェルネス商品を日本で販売する前の確認視点。表現、成分、販路、仕入れ条件を実務目線で整理します。",
    eyebrow: "カテゴリー別ガイド",
    lede: "サプリ・ウェルネスは、効果のうたい方と、食品なのか医薬品的なのかの整理が先です。",
    intro: [
      "海外では一般的な健康訴求でも、日本の販路では使えない表現があります。仕入れの前に、誰に・何と言って売るかを決めておかないと、ページ公開で止まります。",
      regulationNote,
    ],
    hero: {
      id: "fujiSakura",
      alt: "桜と富士。ウェルネス商品を日本の季節感で捉えるイメージ",
    },
    sections: [
      {
        heading: "確認する視点",
        paragraphs: [
          "成分、一日の目安量、対象者、既存の日本販売、広告で使う表現です。機能性や疾病の予防・治療を思わせる表現は、特に確認が必要です。",
        ],
        bullets: [
          "成分表と含有量",
          "剤形（カプセル、粉末、飲料）",
          "期限と保存",
          "ブランド側が使っている効能表現",
        ],
      },
      {
        heading: "仕入れ条件",
        paragraphs: [
          "MOQ、バッチ、期限、返品です。期限が短いと、大きなMOQは在庫リスクになります。サンプルで飲みやすさや匂いを確認できると、返品理由を減らせます。",
        ],
      },
      {
        heading: "販路",
        paragraphs: [
          "専門EC、店舗、卸では、求められる説明と責任が違います。説明を長く書けるチャネルの方が、初回は向きやすいことがあります。",
        ],
      },
      {
        heading: "BrandBridgeでの使い方",
        paragraphs: [
          "販売側は条件を見て候補を絞り、ブランド側は成分と用途が分かる情報を載せてください。最終的な表示や広告の適法性は、掲載の有無では決まりません。",
        ],
      },
    ],
    relatedSlugs: [
      "how-to-sell-overseas-cosmetics-in-japan",
      "how-to-sell-overseas-food-brands-in-japan",
      "japan-product-information-checklist",
    ],
    existingLinks: [...categoryLinks],
    cta: categoryCtaPartner,
  },
  {
    slug: "how-to-sell-overseas-apparel-in-japan",
    cluster: "category",
    title: "海外アパレルブランドを日本で販売するには？",
    description:
      "海外アパレルを日本で販売したい事業者・ブランド向け。サイズ、素材表示、価格、初回SKUの絞り方を解説します。",
    eyebrow: "カテゴリー別ガイド",
    lede: "海外アパレルは、デザインの良さより、日本のサイズと価格帯に載るかが分かれ目です。",
    intro: [
      "原産国のサイズ体系のまま発注すると、店頭で試着できない、ECで返品が増える、といった問題が先に出ます。仕入れは、色とサイズを絞った試験から入る方が扱いやすいです。",
    ],
    hero: {
      id: "kimono",
      alt: "着物。日本の装いと海外アパレルのサイズ感を重ねるイメージ",
    },
    sections: [
      {
        heading: "適合を見る項目",
        paragraphs: [
          "サイズ表（cm）、素材、洗濯表示、価格帯、納期です。表示の制度は商品によって異なるため、必要そうな場合は確認してください。",
        ],
        bullets: [
          "日本向けに換算できる採寸",
          "主力サイズの在庫配分",
          "シーズンと入荷タイミング",
          "返品・不良の写真確認ルール",
        ],
      },
      {
        heading: "初回SKU",
        paragraphs: [
          "全色全サイズを抱えると、MOQと保管が一気に増えます。定番色と中心サイズから入り、再発注で広げる方が在庫リスクは小さいです。",
        ],
      },
      {
        heading: "販路",
        paragraphs: [
          "セレクトショップ、自社EC、モールは、写真と採寸の精度要求が違います。採寸が粗いブランドは、試着できる店頭の方が向くことがあります。",
        ],
      },
      {
        heading: "掲載",
        paragraphs: [
          "BrandBridgeでは卸やMOQなどの条件を確認できます。アパレルは、サイズ情報と納期が書いてあると、販売側の判断が早くなります。",
        ],
      },
    ],
    relatedSlugs: [
      "how-to-sell-overseas-home-lifestyle-in-japan",
      "what-is-moq-for-overseas-products",
      EXISTING_JA_BLOG.slug,
    ],
    existingLinks: [...categoryLinks],
    cta: categoryCtaPartner,
  },
  {
    slug: "how-to-sell-overseas-home-lifestyle-in-japan",
    cluster: "category",
    title: "海外ホーム・ライフスタイル商品を日本で販売するには？",
    description:
      "海外のホーム・ライフスタイル商品を日本で販売する前の確認視点。サイズ、電圧、素材、物流、価格帯の見方を解説します。",
    eyebrow: "カテゴリー別ガイド",
    lede: "ホーム・ライフスタイルは、見た目の好みより、日本の住空間と物流に載るサイズかが先です。",
    intro: [
      "家具、雑貨、キッチン、インテリアは、海外の住宅サイズのままでは棚に置いても、配送や設置で止まることがあります。仕入れ前に、寸法、重量、組立、電圧を確認します。",
    ],
    hero: {
      id: "mtFuji",
      alt: "富士と家並み。日本の暮らしに合うホーム商品を考えるイメージ",
    },
    sections: [
      {
        heading: "先に見る仕様",
        paragraphs: [
          "外寸、重量、材質、組立の要否、電気製品なら電圧とプラグです。日本の住宅や集合住宅の搬入経路に合わない大型は、販路が限られます。",
        ],
        bullets: [
          "梱包サイズと送料の見積もり",
          "割れ物・精密部品の有無",
          "取扱説明の言語",
          "交換部品の供給",
        ],
      },
      {
        heading: "仕入れ条件",
        paragraphs: [
          "ケース入数、MOQ、破損時の責任です。容積が大きい商品は、海上運賃が卸価格以上に効くことがあります。サンプルや実寸写真で、店頭と配送の両方を想像してください。",
        ],
      },
      {
        heading: "販路",
        paragraphs: [
          "インテリア店、雑貨店、ECは、配送負担が違います。大型は店舗受け取りや設置付きの方が向き、小型雑貨はECでも回りやすいです。",
        ],
      },
      {
        heading: "BrandBridgeでの確認",
        paragraphs: [
          "掲載の取引条件に加えて、寸法と送料の負担は商談で埋めてください。ホームカテゴリーは、写真だけでは配送コストが見えません。",
        ],
      },
    ],
    relatedSlugs: [
      "how-to-sell-overseas-apparel-in-japan",
      "logistics-lead-time-samples-for-import",
      "how-to-source-overseas-brands",
    ],
    existingLinks: [...categoryLinks],
    cta: categoryCtaPartner,
  },
];
