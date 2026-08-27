import type { JaBlogArticle } from "@/lib/blog/ja-articles/types";
import { JA_BLOG_HUB } from "@/lib/blog/ja-articles/types";

const makerCta = {
  heading: "日本の販売パートナーを探している方へ",
  body: "商品情報と取引条件を掲載し、日本の卸・小売・EC・バイヤーとの接点を作れます。登録は無料です。個別の相談はお問い合わせからも受け付けています。",
  primary: { href: "/for-makers", label: "日本の販売パートナーを探す" },
  secondary: { href: "/register/maker", label: "商品提供企業として登録" },
} as const;

const makerLinks = [
  { href: JA_BLOG_HUB.path, label: JA_BLOG_HUB.label },
  { href: "/how-to-sell-in-japan", label: "日本で販売する方法" },
  { href: "/for-makers", label: "商品提供企業の方へ" },
  { href: "/register/maker", label: "メーカー登録" },
  { href: "/contact", label: "お問い合わせ" },
] as const;

export const MAKER_ARTICLES: JaBlogArticle[] = [
  {
    slug: "how-to-find-japan-sales-agents",
    cluster: "maker",
    title: "日本の販売代理店を探す方法｜海外ブランド向け実務ガイド",
    seoTitle: "日本の販売代理店｜役割の決め方",
    description:
      "海外ブランドが日本の販売代理店を探す前に、役割を決める実務ガイド。代理店と卸の違い、先に出す条件。種類の見分けと失敗例は代理店の探し方記事です。",
    eyebrow: "海外ブランド向け日本市場ガイド",
    lede: "代理店探しは、名簿集めより、日本側が判断できる条件を先に出すことです。",
    intro: [
      "「日本の代理店を探している」と伝えるだけでは、相手は何を任されるのか分かりません。在庫を持つのか、紹介だけか、独占なのかを先に言語化します。",
    ],
    hero: {
      id: "fushimiTorii",
      alt: "鳥居が続く参道。日本の販売代理店を探す道のりのイメージ",
    },
    sections: [
      {
        heading: "代理店に何を任せるか",
        paragraphs: [
          "販売、在庫、価格決定、店舗開拓、EC運営は、別の仕事です。全部を一人に求めると、候補が極端に減ります。初回は販売チャネルを限定した方が、話が具体的です。",
        ],
      },
      {
        heading: "相手が知りたい条件",
        paragraphs: [
          "日本の事業者は、卸価格、MOQ、納期、既存の日本販売の有無を先に見ます。条件が空だと、代理店契約の話に入れません。",
        ],
        bullets: [
          "希望する役割（卸、紹介、独占の有無）",
          "初回数量の目安",
          "サンプルの出し方",
          "日本での既存販売チャネル",
        ],
      },
      {
        heading: "探し方",
        paragraphs: [
          "展示会、紹介、業界団体、条件が見える掲載です。BrandBridgeでは、商品と取引条件を掲載し、販売パートナーからの確認を待てます。代理店契約の法的レビューは、別途専門家へ依頼してください。",
        ],
      },
    ],
    relatedSlugs: [
      "cautions-when-contracting-japan-agents",
      "how-to-find-japan-wholesalers",
      "how-overseas-brands-enter-japan",
      "cautions-when-selling-overseas-brands-in-japan",
    ],
    existingLinks: [...makerLinks],
    cta: makerCta,
  },
  {
    slug: "how-to-find-japan-wholesalers",
    cluster: "maker",
    title: "日本の卸売業者を探す方法｜海外メーカーが知るべき流れ",
    seoTitle: "日本の卸売業者の探し方｜条件の出し方",
    description:
      "海外メーカーが日本の卸売業者に出す条件の整え方。卸が見る情報、初回数量。卸と商社の違い、卸先の探し方は別記事です。",
    eyebrow: "海外ブランド向け日本市場ガイド",
    lede: "日本の卸は、ブランドの知名度より、再販できる条件が揃っているかを見ます。",
    intro: [
      "卸売業者は、自社の小売・EC先に載せる商品を探しています。海外メーカー側が先に揃えるべきなのは、卸価格、MOQ、納期、日本での販売制限です。",
    ],
    hero: {
      id: "shoppingStreet",
      alt: "日本の商店街。卸を通じて店頭に商品が届くイメージ",
    },
    sections: [
      {
        heading: "卸が判断に使う情報",
        paragraphs: [
          "希望小売価格との差、最低数量、再発注の速さ、返品時の窓口です。カタログ写真だけでは、在庫を持つ判断になりません。",
        ],
      },
      {
        heading: "探し方の流れ",
        paragraphs: [
          "自社条件を文書化する、候補チャネルを決める、条件が見える場に載せる、問い合わせに数量と納期で返す、です。展示会で名刺を集めたあとも、同じ文書が必要です。",
        ],
      },
      {
        heading: "BrandBridgeでの掲載",
        paragraphs: [
          "商品登録時に価格や販売条件を載せられます。日本の卸・販売パートナーが、取り扱い可否を先に判断するための材料です。",
        ],
      },
    ],
    relatedSlugs: [
      "how-to-find-japan-sales-agents",
      "how-to-set-japan-wholesale-price",
      "japan-moq-for-overseas-brands",
    ],
    existingLinks: [...makerLinks],
    cta: makerCta,
  },
  {
    slug: "how-to-pitch-japan-retailers",
    cluster: "maker",
    title: "日本の小売店に商品を売り込む方法｜海外ブランド向け",
    seoTitle: "日本の小売店への売り込み｜海外ブランド向け",
    description:
      "海外ブランドが日本の小売店に商品を売り込むときの実務。店頭適合、価格、納品、説明資料の揃え方を解説します。",
    eyebrow: "海外ブランド向け日本市場ガイド",
    lede: "日本の小売店への売り込みは、ブランドストーリーより、棚に置ける理由を先に渡すことです。",
    intro: [
      "店舗のバイヤーは、客層、価格、サイズ、補充のしやすさを見ます。海外での評価は参考情報であり、発注の根拠にはなりにくいです。",
    ],
    hero: {
      id: "souvenirShop",
      alt: "店頭に並ぶ商品。日本の小売棚に載せるイメージ",
    },
    sections: [
      {
        heading: "店頭が知りたいこと",
        paragraphs: [
          "誰が買うか、いくらで売るか、何個から発注できるか、欠品時に何日で補充できるかです。長いブランド史より、この4つが先です。",
        ],
        bullets: [
          "希望小売価格の目安",
          "最小発注とケース入数",
          "店頭用の短い説明文",
          "日本語の注意表示が必要そうか",
        ],
      },
      {
        heading: "直接営業とパートナー経由",
        paragraphs: [
          "自社で店舗を回る場合は、日本語対応と納品体制が必要です。卸や販売パートナー経由なら、相手の既存店舗網に乗る代わりに、条件交渉が発生します。",
        ],
      },
      {
        heading: "掲載を起点にする",
        paragraphs: [
          "BrandBridgeに商品と条件を載せておくと、小売や卸が先に適合を判断できます。売り込み資料の代わりに、取引条件が見える状態を作ることが目的です。",
        ],
      },
    ],
    relatedSlugs: [
      "how-to-find-japan-ec-partners",
      "how-to-find-japan-wholesalers",
      "japan-product-information-checklist",
    ],
    existingLinks: [...makerLinks],
    cta: makerCta,
  },
  {
    slug: "how-to-find-japan-ec-partners",
    cluster: "maker",
    title: "日本のEC販売パートナーを探す方法｜海外D2Cブランド向け",
    seoTitle: "日本のEC販売パートナーの探し方｜D2C向け",
    description:
      "海外D2Cブランドが日本のEC販売パートナーを探す方法。必要な商品情報、数量、ページ公開に必要なデータの揃え方を解説します。",
    eyebrow: "海外ブランド向け日本市場ガイド",
    lede: "日本のECパートナーは、世界観の移植より、ページを公開できるデータの有無を見ます。",
    intro: [
      "D2Cで自国では直販していても、日本では言語、決済、返品、広告の負荷が大きいことがあります。EC事業者に販売を任せる場合、相手がページを作れる情報が先です。",
    ],
    hero: {
      id: "akihabara",
      alt: "夜の商業地区。日本のECで海外D2Cを扱うイメージ",
    },
    sections: [
      {
        heading: "ECパートナーが求めるもの",
        paragraphs: [
          "画像、サイズ、成分や材質、使い方、返品時の扱い、納期です。広告用の短い説明も、あると公開が早いです。",
        ],
      },
      {
        heading: "数量と在庫の話",
        paragraphs: [
          "ECは欠品が見えやすいチャネルです。MOQが大きく、再発注が遅いと、パートナーは在庫リスクを嫌います。初回SKUを絞る提案の方が、話が進みやすいことがあります。",
        ],
      },
      {
        heading: "BrandBridgeでの探し方",
        paragraphs: [
          "商品と取引条件を掲載し、ECを販路に持つ販売パートナーからの確認を待ちます。越境で自社サイトを日本向けに作る話とは別に、日本側の事業者が仕入れて売る形です。",
        ],
      },
    ],
    relatedSlugs: [
      "how-to-pitch-japan-retailers",
      "japan-product-information-checklist",
      "how-overseas-brands-enter-japan",
    ],
    existingLinks: [...makerLinks],
    cta: makerCta,
  },
  {
    slug: "how-to-set-japan-wholesale-price",
    cluster: "maker",
    title: "卸値の決め方｜日本向け卸価格を小売から逆算する",
    seoTitle: "卸値の決め方｜小売からの逆算",
    description:
      "卸値の決め方の短い実務メモ。希望小売から逆算し、パートナー粗利と通貨を揃える考え方。FOB/CIFと流通コストの詳細は関連記事へ。",
    eyebrow: "海外ブランド向け日本市場ガイド",
    lede: "卸値の決め方は、自国の卸値コピーではなく、日本の希望小売から逆算するのが基本です。",
    intro: [
      "自国で成立している卸率でも、日本では輸送、関税、国内物流、販売手数料が乗ります。卸価格だけを自国と同じにすると、日本側の利益が残らないことがあります。",
      "税率や関税の金額はこの記事では示しません。案件ごとに確認してください。詳細な卸値設計（原価・卸率・各層の利益）は関連の実務記事を参照してください。",
    ],
    hero: {
      id: "zenGarden",
      alt: "整った庭。卸価格と小売価格のバランスを整えるイメージ",
    },
    sections: [
      {
        heading: "逆算の順番",
        paragraphs: [
          "日本で並びそうな希望小売価格を仮置きし、そこから販売側の粗利、国内コスト、輸入関連コストを引いた残りが、卸として成立するかを見ます。",
        ],
        bullets: [
          "日本での希望小売価格の仮置き",
          "販売パートナーが必要とする粗利の余地",
          "送料と梱包",
          "通貨と価格の有効期限",
        ],
      },
      {
        heading: "避けたい決め方",
        paragraphs: [
          "自国小売価格をそのまま円換算する、卸を極端に高くして独占だけを求める、条件を口頭の「相談可」だけにする、です。日本側は発注判断ができません。",
        ],
      },
      {
        heading: "掲載での出し方",
        paragraphs: [
          "BrandBridgeの商品登録では価格や販売条件を載せられます。目安でも書いておくと、問い合わせの質が上がります。最終条件は商談で確定します。",
        ],
      },
    ],
    relatedSlugs: [
      "japan-moq-for-overseas-brands",
      "price-and-moq-negotiation-with-overseas-brands",
      "how-to-find-japan-wholesalers",
    ],
    existingLinks: [...makerLinks],
    cta: makerCta,
  },
  {
    slug: "japan-moq-for-overseas-brands",
    cluster: "maker",
    title: "日本市場向けMOQの考え方｜海外ブランドの商品条件設計",
    seoTitle: "日本向けMOQの考え方｜ブランド側の設計",
    description:
      "海外ブランドが日本向けMOQを設計する考え方。初回を小さくする理由と生産ロットとの折り合い。仕入れ側が見るMOQの意味は専用ガイドです。",
    eyebrow: "海外ブランド向け日本市場ガイド",
    lede: "日本向けMOQは、自社の生産効率だけでなく、相手が試験販売できる単位で設計します。",
    intro: [
      "自国の卸と同じMOQを日本に出すと、まだ販路がないパートナーは在庫を抱えられません。初回だけSKUや数量を落とす設計の方が、接点は増えやすいです。",
    ],
    hero: {
      id: "villageRoad",
      alt: "細い道。日本では小さな初回数量から始めるイメージ",
    },
    sections: [
      {
        heading: "日本側が見ているリスク",
        paragraphs: [
          "売れない在庫、保管、キャッシュです。単価が良くても、数量が大きすぎると見送りになります。",
        ],
      },
      {
        heading: "設計の選択肢",
        paragraphs: [
          "初回SKUを絞る、色を減らす、ケース入数を小さくする、継続発注で単価を見直す、です。生産ロットと完全一致しなくても、輸出梱包の単位で折り合えることがあります。",
        ],
      },
      {
        heading: "掲載での伝え方",
        paragraphs: [
          "MOQの目安を商品情報に書いておくと、日本の事業者は問い合わせ前に判断できます。数字が未定なら、その旨と相談可能な範囲を書く方が、空欄より親切です。",
        ],
      },
    ],
    relatedSlugs: [
      "what-is-moq-for-overseas-products",
      "how-to-set-japan-wholesale-price",
      "how-overseas-brands-enter-japan",
    ],
    existingLinks: [...makerLinks],
    cta: makerCta,
  },
  {
    slug: "cautions-when-contracting-japan-agents",
    cluster: "maker",
    title: "日本の販売代理店と契約するときの注意点",
    seoTitle: "日本の代理店契約｜注意点",
    description:
      "海外ブランドが日本の販売代理店と契約するときの注意点。範囲、期間、解除。総代理店の探し方と独占の付け方は別記事です。",
    eyebrow: "海外ブランド向け日本市場ガイド",
    lede: "代理店契約で先に決めるのは、肩書ではなく、売ってよい範囲と、やめ方です。",
    intro: [
      "日本の代理店契約は、独占、最低購入、活動報告がセットになることがあります。この記事は一般的な確認項目であり、法的助言ではありません。契約書は専門家に確認してください。",
    ],
    hero: {
      id: "goldenPavilion",
      alt: "金閣。契約範囲を慎重に見極めるイメージ",
    },
    sections: [
      {
        heading: "範囲を文章にする",
        paragraphs: [
          "日本全国か、特定チャネルか、ECを含むか、再卸を許すかです。「日本の窓口」だけでは、後から解釈が分かれます。",
        ],
        bullets: [
          "対象地域とチャネル",
          "対象SKU",
          "既存の日本販売をどう扱うか",
          "期間と更新",
        ],
      },
      {
        heading: "義務と解除",
        paragraphs: [
          "最低数量、報告頻度、ブランド表示のルール、契約終了後の在庫処理です。達成できない数量を書くと、関係が早く壊れます。",
        ],
      },
      {
        heading: "契約前の実務",
        paragraphs: [
          "試験的な取り扱いのあとで範囲を決める方が、双方の判断材料が増えます。BrandBridgeはマッチングの場であり、契約の当事者にはなりません。",
        ],
      },
    ],
    relatedSlugs: [
      "how-to-find-japan-sales-agents",
      "exclusive-distribution-rights-in-japan",
      "how-to-become-japan-agent-for-overseas-brands",
    ],
    existingLinks: [...makerLinks],
    cta: makerCta,
  },
  {
    slug: "japan-logistics-import-basics",
    cluster: "maker",
    title: "日本で海外商品を販売する際の物流・納期・輸入実務の基礎",
    seoTitle: "日本販売の物流・納期｜ブランドが出す情報",
    description:
      "海外ブランドが日本のパートナーに伝える物流・納期・輸入者の基礎。仕入れ側が確認する費用と条件の詳細は輸入ガイドです。",
    eyebrow: "海外ブランド向け日本市場ガイド",
    lede: "日本側が発注できない理由の多くは、価格ではなく、着日と輸入者の不明です。",
    intro: [
      "海外ブランドが日本のパートナーに出す情報で不足しやすいのが、出荷から到着までの内訳です。税率や許可の要否は案件ごとに異なるため、ここでは確認項目だけを書きます。",
    ],
    hero: {
      id: "chureitoPagoda",
      alt: "塔と山。商品が日本に届くまでの距離のイメージ",
    },
    sections: [
      {
        heading: "役割を分ける",
        paragraphs: [
          "輸出者、輸入者、国内配送は別人であることがあります。BrandBridgeはつなぐ場であり、通関や輸送の代行はしません。誰が輸入者になるかを、商談の早い段階で確認してください。",
        ],
      },
      {
        heading: "納期の伝え方",
        paragraphs: [
          "生産、輸出準備、海上または航空、到着後、に分けると、日本側は販売開始日を置けます。「4週間」だけだと、起算日で揉めます。",
        ],
      },
      {
        heading: "サンプル",
        paragraphs: [
          "有償か、送料はどちらか、量産と同じか。日本の事業者は、サンプルを見てから数量を決めることが多いです。",
        ],
      },
    ],
    relatedSlugs: [
      "logistics-lead-time-samples-for-import",
      "japan-product-information-checklist",
      "how-overseas-brands-enter-japan",
    ],
    existingLinks: [...makerLinks],
    cta: makerCta,
  },
  {
    slug: "japan-product-information-checklist",
    cluster: "maker",
    title: "日本市場向けの商品情報の作り方｜海外ブランド向けチェックリスト",
    seoTitle: "日本向け商品情報のチェックリスト",
    description:
      "海外ブランドが日本の販売パートナーに渡す商品情報のチェックリスト。画像、仕様、価格、MOQ、販売制限の揃え方です。",
    eyebrow: "海外ブランド向け日本市場ガイド",
    lede: "日本の事業者は、美しい写真より、発注判断に足りる項目が埋まっているかを見ます。",
    intro: [
      "商品情報は、マーケティング資料と取引条件の両方です。どちらか一方だと、問い合わせは来ても発注に進みません。",
    ],
    hero: {
      id: "gardenTsukubai",
      alt: "手水鉢。商品情報を一つずつ整えるイメージ",
    },
    sections: [
      {
        heading: "商品そのもの",
        paragraphs: [
          "画像、サイズ、重量、材質や成分、賞味・使用期限、対象年齢や用途、注意書きです。カテゴリーによって必要な項目は増えます。規制の要否は断定せず、該当しそうなら確認してください。",
        ],
      },
      {
        heading: "取引条件",
        paragraphs: [
          "卸価格、通貨、MOQ、納期、サンプル、販売可能な地域とチャネル、独占の可否です。BrandBridgeの商品登録でも、価格や販売条件を載せられます。",
        ],
        bullets: [
          "卸価格と希望小売価格の目安",
          "MOQ",
          "標準納期",
          "既存の日本販売の有無",
        ],
      },
      {
        heading: "渡し方",
        paragraphs: [
          "長い紹介文に情報を詰め込むより、項目が後から更新できる形が扱いやすいです。日本語がなくても、英語で項目が揃っていれば、日本側が翻訳を判断できます。空欄より「未定・相談可」と書いた方が商談が早いです。",
        ],
      },
    ],
    relatedSlugs: [
      "how-overseas-brands-enter-japan",
      "how-to-set-japan-wholesale-price",
      "how-to-sell-overseas-cosmetics-in-japan",
    ],
    existingLinks: [...makerLinks],
    cta: makerCta,
  },
];
