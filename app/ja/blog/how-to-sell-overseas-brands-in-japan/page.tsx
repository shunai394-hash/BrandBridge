import type { Metadata } from "next";
import Link from "next/link";
import { BlogImage } from "@/components/blog/BlogImage";
import { Button } from "@/components/ui/Button";
import { getSiteUrl } from "@/lib/site";

const PATH = "/ja/blog/how-to-sell-overseas-brands-in-japan";
const TITLE =
  "海外ブランドの商品を日本で販売するには？EC・卸・小売・バイヤー向け完全ガイド";
const DESCRIPTION =
  "海外ブランドの商品を日本で販売したいEC事業者・卸売業者・小売店・バイヤー向けガイド。卸価格・MOQ・独占条件の確認から、販売パートナー登録まで解説します。";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: PATH,
  },
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

const salesMethods = [
  {
    title: "卸売",
    body: "海外ブランドから商品を仕入れ、日本国内のECサイトや店舗で販売する方法です。仕入れ価格、最低発注数量（MOQ）、納期、輸送条件などを確認したうえで、販売価格と利益率を検討します。",
  },
  {
    title: "EC販売",
    body: "自社ECサイトや既存のECモールなどを利用して販売する方法です。海外ブランドの商品は、日本国内ではまだ競合が少ないケースもあるため、商品の特徴やブランドストーリーを適切に伝えられるかが重要になります。",
  },
  {
    title: "小売店での販売",
    body: "実店舗で販売する場合は、商品のカテゴリー、価格帯、店舗の顧客層との相性が重要です。海外では人気の商品でも、日本の消費者にそのまま受け入れられるとは限りません。",
  },
  {
    title: "代理店・販売パートナー",
    body: "ブランド側と継続的な関係を築き、日本国内で販売活動を行う方法です。単発の仕入れだけではなく、日本市場での販路開拓やマーケティングまで関わりたい事業者に向いています。",
  },
] as const;

const selectionPoints = [
  {
    title: "① 日本市場との相性",
    body: "商品そのものに魅力があるだけでなく、日本の消費者や店舗のニーズに合っているかを確認します。デザイン、サイズ、価格、用途、パッケージなど、日本市場との相性を見ることが重要です。",
  },
  {
    title: "② 卸価格と販売価格",
    body: "卸価格だけを見るのではなく、日本で想定される販売価格から逆算します。輸送費、関税、国内物流、販売手数料、広告費なども含めて、十分な利益を確保できるかを確認しましょう。",
  },
  {
    title: "③ MOQ（最低発注数量）",
    body: "MOQが大きすぎる場合、初回取引のリスクが高くなります。特に初めて扱うブランドでは、少量からテスト販売できるかどうかが重要です。",
  },
  {
    title: "④ 独占販売の条件",
    body: "ブランドによっては、日本国内の独占販売権を設定できる場合があります。独占条件がある場合は、販売目標、契約期間、最低購入数量などを確認する必要があります。",
  },
  {
    title: "⑤ 日本で販売するための条件",
    body: "カテゴリーによっては、日本で販売する前に確認すべき表示、規制、認証などがあります。食品、化粧品、健康関連商品、電気製品などは、特に事前確認が重要です。",
  },
] as const;

const negotiationItems = [
  "卸価格",
  "MOQ",
  "サンプル提供の可否",
  "日本向け販売条件",
  "納期",
  "輸送条件",
  "日本国内での既存販売先",
  "独占販売の可否",
  "マーケティング支援の有無",
] as const;

const testSteps = [
  "商品を選ぶ",
  "ブランド側と条件を確認する",
  "サンプルを確認する",
  "小規模に販売する",
  "売れ行きを確認する",
  "販売数量を増やす",
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
            販売パートナー向けガイド
          </p>
          <h1 className="mt-5 font-[family-name:var(--font-shippori)] text-[1.55rem] leading-[1.3] text-white sm:text-3xl md:text-4xl">
            {TITLE}
          </h1>
          <p className="mt-5 text-sm leading-relaxed text-white/80 md:text-base">
            EC事業者、卸売業者、小売店、バイヤー、販売代理店が、海外ブランドの商品を日本で販売するための実務ガイドです。
          </p>
          <BlogImage
            id="mtFuji"
            alt="雲海の上に見える富士山。海外ブランドが目指す日本市場の象徴"
            variant="hero"
            look="onDark"
            priority
          />
        </div>
      </section>

      <article className="border-b border-border bg-surface">
        <div className="mx-auto max-w-3xl px-5 py-12 md:py-16">
          <div className="space-y-5 text-sm leading-relaxed text-muted md:text-base">
            <p>海外ブランドの商品を日本で販売したい。</p>
            <p>
              そう考えているEC事業者、卸売業者、小売店、バイヤー、販売代理店にとって、最初の壁になるのが「どの商品を、どの条件で仕入れ、どう販売するか」という問題です。
            </p>
            <p>
              海外には日本ではまだ知られていない魅力的なブランドや商品が数多くあります。一方で、海外ブランド側も日本市場で販売できるパートナーを探しています。
            </p>
            <p>重要なのは、単に海外の商品を探すことではありません。</p>
            <p className="rounded-lg border border-border bg-cream/60 px-5 py-4 font-medium text-navy">
              日本で売れる可能性のある商品を見つけ、適切な取引条件を確認し、ブランド側と具体的な商談につなげることです。
            </p>
          </div>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              1. 海外ブランドの商品を日本で販売する方法
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              海外ブランドの商品を日本で販売する方法には、いくつかの選択肢があります。
            </p>
            <BlogImage
              id="shoppingStreet"
              alt="日本の商店街。小売店や街中での販売チャネルをイメージした風景"
            />
            <ul className="mt-8 grid gap-4">
              {salesMethods.map((item) => (
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
              2. 海外ブランドを選ぶときに確認したい5つのポイント
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              海外商品を仕入れる前に、最低限次のポイントを確認しましょう。
            </p>
            <BlogImage
              id="consultant"
              alt="取引条件や数字を確認する手元。卸価格やMOQなどの確認作業"
            />
            <ul className="mt-8 space-y-4">
              {selectionPoints.map((item) => (
                <li
                  key={item.title}
                  className="rounded-xl border border-border bg-background px-5 py-5"
                >
                  <h3 className="font-medium text-navy">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted md:text-base">
                    {item.body}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              3. 「良い商品」だけでは日本で売れない
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              海外ブランドの商品を探すときにありがちな失敗が、「海外で売れているから日本でも売れるだろう」と考えてしまうことです。
            </p>
            <BlogImage
              id="kyotoStreet"
              alt="京都の通りを歩く舞妓。日本の消費者や街の空気感に合うかを見極めるイメージ"
            />
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              実際には、海外で人気の商品でも、日本では認知度が低く、販売方法を工夫する必要があります。
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              逆に、海外ではまだ大きなブランドではなくても、日本の特定の顧客層に強く刺さる商品もあります。
            </p>
            <p className="mt-5 rounded-lg border border-border bg-cream/60 px-5 py-4 text-sm font-medium leading-relaxed text-navy md:text-base">
              ブランドの知名度だけではなく、日本市場での販売可能性を見ることが重要です。
            </p>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              4. 海外ブランド側との商談で確認すること
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              興味のある商品が見つかったら、次はブランド側との商談です。最初の段階では、次の情報を確認するとスムーズです。
            </p>
            <BlogImage
              id="handshake"
              alt="商談がまとまったときの握手。海外ブランド側との取引開始を表す"
            />
            <BulletList items={negotiationItems} />
            <p className="mt-5 text-sm leading-relaxed text-muted md:text-base">
              特に重要なのが、
              <strong className="font-medium text-navy">
                日本国内ですでに販売パートナーがいるかどうか
              </strong>
              です。すでに独占契約が存在する場合、新しい販売パートナーとして参入することが難しくなる可能性があります。
            </p>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              5. 最初から大量発注する必要はない
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              初めて扱う海外ブランドでは、いきなり大きな数量を発注するよりも、まず市場反応を確認する方法があります。例えば、
            </p>
            <BlogImage
              id="analytics"
              alt="タブレットで販売データを確認する様子。テスト販売の反応を見るイメージ"
            />
            <ol className="mt-6 space-y-3">
              {testSteps.map((step, index) => (
                <li key={step} className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal text-sm font-medium text-white">
                    {index + 1}
                  </span>
                  <span className="pt-0.5 text-sm leading-relaxed text-navy md:text-base">
                    {step}
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-6 text-sm leading-relaxed text-muted md:text-base">
              という流れです。特にEC事業者にとっては、テスト販売によって広告反応や顧客の反応を確認できるため、初期リスクを抑えやすくなります。
            </p>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              6. 海外ブランドを探すなら、販売条件まで比較する
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              海外ブランドを探す際には、商品の写真や説明だけで判断するのではなく、
              <strong className="font-medium text-navy">
                価格・MOQ・販売形式・原産国・独占条件などを比較すること
              </strong>
              が重要です。
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              BrandBridgeでは、海外・国内の商品を、販売条件を含めて比較しながら候補を探すことができます。商品を見つけた後は、ブランド側との商談へ進むこともできます。
            </p>
            <p className="mt-5">
              <Link href="/cases" className="text-teal hover:underline">
                掲載商品を見る
              </Link>
            </p>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              7. 日本で販売できる海外ブランドを探しているなら
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              「海外の商品を日本で販売したい」「自社ECで新しいブランドを取り扱いたい」「店舗で販売できる海外商品を探している」「日本国内でまだ知られていないブランドを発掘したい」という事業者は、商品を探すだけでなく、ブランド側と直接商談できる環境を持つことが重要です。
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              BrandBridgeは、海外ブランドと日本の販売パートナーをつなぐことを目的としたプラットフォームです。商品の条件を確認しながら、自社の販売チャネルに合う商品を探すことができます。
            </p>
            <h3 className="mt-8 font-[family-name:var(--font-shippori)] text-xl text-navy">
              販売パートナーとして登録する
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              海外ブランドの商品を日本で販売したいEC事業者、卸売業者、小売店、バイヤー、販売代理店の方は、BrandBridgeの
              <Link
                href="/register/partner"
                className="text-teal hover:underline"
              >
                販売パートナーとして登録
              </Link>
              できます。新しい海外ブランドとの取引先を探しているなら、まずは
              <Link href="/cases" className="text-teal hover:underline">
                掲載商品
              </Link>
              を確認してみてください。
            </p>
            <p className="mt-5 rounded-lg border border-border bg-cream/60 px-5 py-4 text-sm font-medium leading-relaxed text-navy md:text-base">
              日本市場で販売できる海外ブランドとの新しい取引を、ここから始められます。
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
            販売パートナーとして登録する
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/75 md:text-base">
            海外ブランドの商品を日本で販売したいEC事業者、卸、小売、バイヤーの方は、BrandBridgeに登録して掲載商品と取引条件を確認できます。
          </p>
          <div className="mx-auto mt-8 flex w-full max-w-lg flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
            <Button
              href="/register/partner"
              className="w-full py-3.5 text-base sm:w-auto sm:min-w-[200px]"
            >
              販売パートナー登録を開始する
            </Button>
            <Button
              href="/cases"
              variant="outline"
              className="w-full border-white/40 py-3.5 text-base text-white hover:border-white hover:bg-white/10 hover:text-white sm:w-auto sm:min-w-[180px]"
            >
              掲載商品を見る
            </Button>
          </div>
          <p className="mt-4 text-sm text-white/65">登録無料・初期費用なし</p>
        </div>
      </section>
    </div>
  );
}
