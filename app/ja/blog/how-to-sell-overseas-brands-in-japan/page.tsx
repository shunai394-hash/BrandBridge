import type { Metadata } from "next";
import Link from "next/link";
import { BlogImage } from "@/components/blog/BlogImage";
import { Button } from "@/components/ui/Button";
import { EXISTING_JA_BLOG } from "@/lib/blog/ja-articles/types";
import { selfLanguageAlternates } from "@/lib/hreflang";
import { getSiteUrl } from "@/lib/site";

const PATH = EXISTING_JA_BLOG.path;
const TITLE = EXISTING_JA_BLOG.title;
const DESCRIPTION =
  "海外ブランドが日本で販売を始める実務ガイド。販売チャネルの選び方、販売パートナーの探し方、契約条件、輸入・表示の確認、初回のMOQ・価格・納期まで順に整理します。";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  ...selfLanguageAlternates(PATH, "ja"),
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PATH,
    locale: "ja_JP",
    type: "article",
  },
};

function BulletList({ items }: { items: readonly string[] }) {
  return (
    <ul className="mt-4 list-none space-y-2.5">
      {items.map((item) => (
        <li
          key={item}
          className="flex gap-2.5 text-sm leading-relaxed text-muted md:text-base"
        >
          <span
            className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal"
            aria-hidden
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

const channelCards = [
  {
    title: "卸売",
    body: "日本の卸売業者が在庫を持ち、小売やECへ再販する形です。自社は輸出条件と卸価格を先に示します。初回数量は大きくなりやすい一方、相手が販路を持つため、日本での営業負担は相対的に小さくなります。",
  },
  {
    title: "代理店",
    body: "販売、紹介、場合によっては在庫や価格の運用まで任せる形です。役割の範囲を先に決めないと、独占の話だけが先行します。契約前に、何を任せて何を自社に残すかを文書化します。",
  },
  {
    title: "小売・専門店",
    body: "店舗や専門店が直接仕入れて販売する形です。SKUを絞り、店頭に載る条件（サイズ、価格帯、納期）が具体的であるほど話が進みます。全SKUの一括導入を最初から求めない方が現実的です。",
  },
] as const;

export default function HowToSellOverseasBrandsInJapanPage() {
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}${PATH}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "ホーム",
            item: siteUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "日本語ガイド",
            item: `${siteUrl}/ja/blog`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: TITLE,
            item: pageUrl,
          },
        ],
      },
      {
        "@type": "Article",
        headline: TITLE,
        description: DESCRIPTION,
        inLanguage: "ja",
        mainEntityOfPage: pageUrl,
        url: pageUrl,
      },
    ],
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="relative overflow-hidden bg-navy-deep text-white">
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_30%,rgba(26,138,138,0.35),transparent_55%),radial-gradient(ellipse_at_80%_70%,rgba(20,111,111,0.25),transparent_50%)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl px-5 py-14 md:py-20">
          <p className="text-xs font-medium tracking-wider text-teal">
            海外ブランド向け日本市場ガイド
          </p>
          <h1 className="mt-5 font-[family-name:var(--font-shippori)] text-[1.55rem] leading-[1.3] text-white sm:text-3xl md:text-4xl">
            {TITLE}
          </h1>
          <p className="mt-5 text-sm leading-relaxed text-white/80 md:text-base">
            日本で販売したい海外ブランド向けに、販売チャネル、パートナー探し、契約、輸入の確認項目を実務の順に整理します。
          </p>
          <BlogImage
            id="citySkyline"
            alt="日本の都市のスカイライン。海外ブランドが日本市場を見渡すイメージ"
            variant="hero"
            look="onDark"
            priority
          />
        </div>
      </section>

      <article className="border-b border-border bg-surface">
        <div className="mx-auto max-w-3xl px-5 py-12 md:py-16">
          <p className="text-xs text-muted">
            <Link href="/ja/blog" className="text-teal hover:underline">
              日本語ガイド
            </Link>
            <span aria-hidden> / </span>
            海外ブランド向け
          </p>

          <div className="mt-6 space-y-5 text-sm leading-relaxed text-muted md:text-base">
            <p>
              日本で販売したい海外ブランドが最初に直面するのは、店舗を出すことより、「誰が、どの条件で売るのか」が見えないことです。
            </p>
            <p>
              日本の卸・小売・ECは、世界観だけでなく、卸価格、MOQ、納期、日本での販売制限を見ます。条件が空のままパートナーを探すと、興味はあっても発注判断に進みません。
            </p>
            <p>
              この記事は海外ブランド側の実務です。販売パートナーの探し方は
              <Link
                href="/ja/blog/how-overseas-brands-enter-japan"
                className="text-teal hover:underline"
              >
                日本進出ガイド
              </Link>
              、食品・化粧品・雑貨の注意は
              <Link
                href="/ja/blog/cautions-when-selling-overseas-brands-in-japan"
                className="text-teal hover:underline"
              >
                日本販売の注意点
              </Link>
              で扱っています。日本の事業者が仕入れを始める手順は、
              <Link
                href="/ja/blog/how-to-start-overseas-brand-wholesale"
                className="text-teal hover:underline"
              >
                卸取引の始め方
              </Link>
              と
              <Link
                href="/ja/blog/how-to-source-overseas-brands"
                className="text-teal hover:underline"
              >
                仕入れ方法のガイド
              </Link>
              です。
            </p>
          </div>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              1. 海外ブランドが日本で販売を始める方法
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              日本参入は、現地法人や大規模広告から始める必要はありません。多くのブランドは、商品情報と取引条件を揃え、日本の販売パートナー経由で初回取引を試します。
            </p>
            <BlogImage
              id="mtFuji"
              alt="雲海の上に見える富士山。海外ブランドが目指す日本市場の象徴"
            />
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              先に決めるのは、自社が担う範囲です。在庫を日本に置くのか、輸出して相手に任せるのか、独占を求めるのか。ここが空だと、チャネルの話が噛み合いません。進め方の入口は
              <Link href="/for-makers" className="text-teal hover:underline">
                商品提供企業の方へ
              </Link>
              でも確認できます。
            </p>
            <p className="mt-5 rounded-lg border border-border bg-cream/60 px-5 py-4 text-sm font-medium leading-relaxed text-navy md:text-base">
              最初の仕事は、認知を取る広告より、日本側が判断できる条件を出すことです。
            </p>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              2. 日本の販売パートナーを探す方法
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              探し方は、展示会、紹介、業界団体、条件が見える掲載に大別できます。名簿の件数より、相手が「この数量なら扱える」と判断できる情報があるかが分かれ目です。
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              日本の事業者は、
              <Link href="/cases" className="text-teal hover:underline">
                商品一覧
              </Link>
              のように、カテゴリや取引条件を先に比較します。ブランド側も同じ粒度で、卸価格、MOQ、納期、販売可能なチャネルを出せると、問い合わせの質が変わります。
            </p>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              3. 卸売・代理店・小売の違い
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              販売、在庫、価格決定、店舗開拓は別の仕事です。全部を一人に求めると、候補が極端に減ります。初回はチャネルを限定した方が、話が具体的です。
            </p>
            <ul className="mt-8 grid gap-4">
              {channelCards.map((item) => (
                <li
                  key={item.title}
                  className="rounded-xl border border-border bg-background px-5 py-5"
                >
                  <h3 className="font-[family-name:var(--font-shippori)] text-lg text-navy">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted md:text-base">
                    {item.body}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              4. 日本販売前に確認する契約条件
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              契約書の法的レビューは専門家へ依頼してください。ここでは、商談前に言語化しておく実務項目に留めます。口頭合意だけで発注しないことが、後の食い違いを防ぎます。
            </p>
            <BlogImage
              id="handshake"
              alt="商談がまとまったときの握手。販売パートナーとの条件確認を表す"
            />
            <BulletList
              items={[
                "販売可能な地域とチャネル（ECのみ、店舗不可など）",
                "独占の有無、期間、対象範囲",
                "最低購入数量や販売目標があるか",
                "価格改定のタイミングと通貨",
                "サンプル、不良、返品の責任分界",
                "日本国内の既存販売先の開示",
              ]}
            />
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              5. 輸入・表示・規制の確認
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              海外で流通していることと、日本で販売してよいことは別です。食品、化粧品、健康関連、電気製品などは、表示や認証の確認が先になります。この記事では適法性を断定しません。該当しそうなカテゴリーは、発注前に専門家へ確認してください。
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              ブランド側が先に出せると話が早いのは、成分・材質、賞味・使用期限、電圧、梱包サイズ、誰が輸入者になるか、です。詳細が後回しだと、日本側は在庫を持てません。
            </p>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              6. 初回取引で確認すべきMOQ・価格・納期
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              日本の事業者は、単価の安さより、初回数量を売り切れるかを見ます。MOQが大きいほど、相手の在庫リスクが先に固定されます。初回だけ小さくできるか、サンプルで中身を確認できるかを先に示してください。
            </p>
            <BulletList
              items={[
                "卸価格と通貨、価格の有効期限",
                "MOQ（数量または金額）と、初回例外の有無",
                "標準納期と、繁忙期の遅れ方",
                "再発注のリードタイムと最小単位",
                "送料・保険の負担とインコタームズ",
              ]}
            />
            <p className="mt-5 text-sm leading-relaxed text-muted md:text-base">
              インコタームズは費用と危険の分岐を整理する方法です。FOBやEXWが出てきたら、運賃・通関の負担がどちらにあるかを確認します。解釈は案件ごとに分かれるため、注文請書の文言を優先してください。
            </p>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              7. 日本の販売パートナー選定ポイント
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              知名度や規模だけで選ぶと、自社商品のチャネルと合いません。見るべきなのは、得意な販路、扱える数量、日本語での条件確認ができるかです。
            </p>
            <BulletList
              items={[
                "卸・店舗・ECのどれが本業か",
                "初回で抱えられる数量",
                "既存の競合ブランドや販売制限",
                "サンプル確認と再発注の運用",
                "条件を文書に残せるか",
              ]}
            />
            <p className="mt-5 text-sm leading-relaxed text-muted md:text-base">
              条件の伝え方で行き詰まった場合は、
              <Link href="/contact" className="text-teal hover:underline">
                お問い合わせ
              </Link>
              から掲載の進め方を質問できます。
            </p>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              8. BrandBridgeを使うメリット
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              BrandBridgeは、海外ブランドが商品と取引条件を掲載し、日本の販売パートナーが取り扱い可否を確認してから商談へ進む場です。紹介だけで終わらせず、MOQや卸の目安が見える状態で候補と接点を作れます。
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              掲載条件は目安であり、最終条件は個別確認です。輸入代行や在庫の買い取りは行いません。写真や世界観だけでなく、数量と納期を先に揃えてください。
            </p>
          </section>
        </div>
      </article>

      <section className="relative overflow-hidden bg-navy-deep text-white">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 20% 50%, rgba(26,138,138,0.55), transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(20,111,111,0.35), transparent 50%)",
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl px-5 py-14 text-center md:py-16">
          <h2 className="font-[family-name:var(--font-shippori)] text-2xl leading-snug md:text-3xl">
            日本の販売パートナーを探す
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/75 md:text-base">
            商品と取引条件を掲載し、日本の卸・小売・ECとの接点を作れます。登録は無料です。
          </p>
          <div className="mx-auto mt-8 flex w-full max-w-lg flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
            <Button
              href="/for-makers"
              className="w-full py-3.5 text-base sm:w-auto sm:min-w-[200px]"
            >
              日本の販売パートナーを探す
            </Button>
            <Button
              href="/register/maker"
              variant="outline"
              className="w-full border-white/40 py-3.5 text-base text-white hover:border-white hover:bg-white/10 hover:text-white sm:w-auto sm:min-w-[180px]"
            >
              商品提供企業として登録
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
