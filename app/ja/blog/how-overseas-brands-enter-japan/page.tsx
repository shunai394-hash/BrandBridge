import type { Metadata } from "next";
import Link from "next/link";
import { BlogImage } from "@/components/blog/BlogImage";
import { Button } from "@/components/ui/Button";
import {
  EXISTING_JA_BLOG,
  JA_JAPAN_ENTRY,
  JA_SALES_CAUTIONS,
} from "@/lib/blog/ja-articles/types";
import { selfLanguageAlternates } from "@/lib/hreflang";
import { getSiteUrl } from "@/lib/site";

const PATH = JA_JAPAN_ENTRY.path;
const TITLE = JA_JAPAN_ENTRY.title;
const DESCRIPTION =
  "海外ブランドの日本進出で、販売パートナー・販売代理店・販売先を探す実務ガイド。法人設立の前に揃える条件と、探し方の順を解説します。";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  ...selfLanguageAlternates(PATH, "ja"),
  robots: { index: true, follow: true },
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

const searchRoutes = [
  {
    title: "条件が見える掲載",
    body: "卸価格、MOQ、納期、販売制限を先に出し、日本の事業者が取り扱い可否を判断できる状態にします。問い合わせの質が変わります。",
  },
  {
    title: "展示会・紹介",
    body: "実物と担当者に会えます。その場で独占だけを約束せず、帰国後に役割と数量を文書化してください。",
  },
  {
    title: "業界団体・既存取引先からの紹介",
    body: "信頼の起点にはなります。紹介元と販売チャネルが重なる場合、既存制限がないかを先に確認します。",
  },
] as const;

export default function HowOverseasBrandsEnterJapanPage() {
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}${PATH}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "ホーム", item: siteUrl },
          {
            "@type": "ListItem",
            position: 2,
            name: "日本語ガイド",
            item: `${siteUrl}/ja/blog`,
          },
          { "@type": "ListItem", position: 3, name: TITLE, item: pageUrl },
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
            日本進出の最初の仕事は、現地法人より、誰がどの条件で売るかを決めることです。</p>
          <BlogImage
            id="citySkyline"
            alt="日本の都市のスカイライン。海外ブランドの日本進出イメージ"
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
              「日本の販売代理店を探している」と伝えるだけでは、相手は在庫を持つのか、紹介だけか、独占なのか分かりません。日本進出は、パートナー探しの前に、自社が任せる範囲を言語化するところから始まります。</p>
            <p>
              チャネル・契約・輸入の基本は
              <Link href={EXISTING_JA_BLOG.path} className="text-teal hover:underline">
                日本で販売する方法
              </Link>
              、食品・化粧品・雑貨の注意は
              <Link href={JA_SALES_CAUTIONS.path} className="text-teal hover:underline">
                日本販売の注意点
              </Link>
              で扱っています。この記事は、販売パートナーの探し方に絞ります。</p>
          </div>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              探す前に揃える条件
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              日本の卸・小売・ECは、世界観だけでなく、卸価格、MOQ、納期、既存の日本販売の有無を見ます。条件が空だと、販売先の話に入れません。</p>
            <BulletList
              items={[
                "希望する役割（卸、紹介、在庫、独占の有無）",
                "初回で出せる数量",
                "サンプルの出し方",
                "日本での価格の目安",
                "既存の日本販売チャネル",
              ]}
            />
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              販売パートナーの探し方
            </h2>
            <BlogImage
              id="fushimiTorii"
              alt="鳥居が続く参道。日本の販売パートナーを探す道のりのイメージ"
            />
            <ul className="mt-8 grid gap-4">
              {searchRoutes.map((item) => (
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
            <p className="mt-6 text-sm leading-relaxed text-muted md:text-base">
              日本の事業者は
              <Link href="/cases" className="text-teal hover:underline">
                商品一覧
              </Link>
              のように条件を先に比較します。ブランド側も同じ粒度で情報を出すと、販売代理店・卸・小売のどれに声をかけるかが決まります。</p>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              販売先の種類を混同しない
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              販売代理店、卸売業者、小売店、EC事業者は、在庫と顧客の持ち方が違います。全部を一人に求めると、候補が極端に減ります。初回はチャネルを限定した方が、話が具体的です。代理店契約の法的レビューは専門家へ依頼してください。</p>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              日本進出で現地法人を先に作ると、パートナーが決まる前に固定費だけが増えることがあります。まずは輸出条件と商品情報を揃え、日本側が仕入れ判断できる状態にしてから、法人の要否を検討する順が実務的です。</p>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              最初に渡す資料
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              カタログ写真だけでは、日本の販売先は発注判断に進めません。仕様、卸の目安、MOQ、納期、サンプル条件、日本での既存販売の有無を一枚にまとめると、卸にも小売にも同じ説明ができます。</p>
            <BulletList
              items={[
                "主力SKUの仕様と希望小売の目安",
                "初回数量と再発注リードタイム",
                "インコタームズと出荷地",
                "日本での販売制限の有無",
                "担当者と返信可能な言語",
              ]}
            />
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              BrandBridgeでの次の一歩
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              商品と取引条件を掲載し、日本の販売パートナーからの確認を待てます。輸入代行や在庫の買い取りは行いません。登録の流れは
              <Link href="/for-makers" className="text-teal hover:underline">
                商品提供企業の方へ
              </Link>
              から確認できます。</p>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              問い合わせへの返し方
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              日本の販売先からの最初の質問は、ブランドストーリーより、卸の目安、初回数量、納期、既存の日本販売の有無に集中します。返事が遅い、または「後で送ります」が続くと、候補から外れます。担当者と返信可能な言語、営業時間の目安を先に書いておくと、時差のあるやりとりが止まりにくくなります。</p>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              独占を急いで求めると、相手は在庫リスクを取る前に契約だけを求められていると感じます。初回は地域やチャネルを限定した試験販売の方が、販売パートナーを探しやすいです。独占の法的な効力は、この記事では断定しません。契約書のレビューは専門家へ依頼してください。
            </p>
            <BulletList
              items={[
                "最初の返信で出す条件の一覧",
                "サンプル送付までの日数目安",
                "試験販売の期間と数量",
                "独占を話す前に確認する既存販売",
              ]}
            />
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              販売代理店と販売パートナーの違い
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              「日本の販売代理店」と検索して来る海外ブランドでも、実際に必要なのは卸、小売、EC事業者であることがあります。代理店は地域やチャネルの権限、報告、目標を含むことが多く、販売パートナーは仕入れて売る、または紹介する、という幅の広い呼び方です。肩書を先に決めると、合う相手を取りこぼします。
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              日本進出の初期は、販売先の種類を一つに限定した方が動きやすいです。全国独占の代理店を探すより、特定カテゴリーの卸や、実店舗を持つ小売に試験数量を出す方が、条件の確認が具体的になります。代理店契約の法的な中身は専門家へ依頼してください。
            </p>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              日本側が話を止める典型
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              日本の販売先が興味を示しても、卸価格の通貨と有効期限、MOQ、納期、日本での既存販売が空だと、社内稟議に載せられません。カタログだけ送って「あとは任せる」は、相手に輸入者と在庫の全部を押し付ける形になります。先に出す資料の粒度が、販売パートナー探しの速度を決めます。
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              食品・化粧品・雑貨は、注意点の確認が終わるまで発注判断が進まないことがあります。
              <Link href={JA_SALES_CAUTIONS.path} className="text-teal hover:underline">
                日本販売の注意点
              </Link>
              を先に読み、足りない情報を資料に足してください。BrandBridgeでは条件を掲載してから、日本側の確認を待てます。
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
            商品情報と取引条件を先に揃え、日本の卸・小売・ECとの接点を作れます。</p>
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
