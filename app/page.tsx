import type { Metadata } from "next";
import { CaseCard } from "@/components/cases/CaseCard";
import { Button } from "@/components/ui/Button";
import { getLatestCases, getPopularCases } from "@/lib/cases";
import { pairedLanguageAlternates } from "@/lib/hreflang";
import { jaCategoryPath, listJaCategories } from "@/lib/ja-categories";
import {
  jsonLdString,
  organizationJsonLd,
  websiteJsonLd,
} from "@/lib/seo-jsonld";
import { caseCategories } from "@/lib/types";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    absolute:
      "BrandBridge｜海外ブランドの日本進出・販売パートナーマッチング",
  },
  description:
    "海外ブランドの商品を探す日本の卸・小売・ECと、日本で販売したい海外ブランドをつなぐBtoBマッチング。MOQや卸価格などの条件を確認してから商談できます。",
  ...pairedLanguageAlternates("/", "/en", "ja"),
};

const browseCategories = caseCategories.filter((c) => c !== "すべて");
const jaCategoryLandings = listJaCategories();
const partnerCategoryEntries = [
  {
    label: "食品",
    href: jaCategoryPath("food"),
    note: "食品・飲料",
  },
  {
    label: "コスメ",
    href: jaCategoryPath("cosmetics"),
    note: "美容・コスメ",
  },
  {
    label: "アパレル",
    href: jaCategoryPath("apparel"),
    note: "ファッション",
  },
  {
    label: "ホーム",
    href: jaCategoryPath("home"),
    note: "ホーム・インテリア",
  },
  {
    label: "アウトドア",
    href: `/cases?category=${encodeURIComponent("スポーツ")}`,
    note: "スポーツ",
  },
  {
    label: "ヘルスケア",
    href: jaCategoryPath("health"),
    note: "健康・サプリ",
  },
];

const conditionTags = [
  "卸売",
  "代理店",
  "EC販売",
  "委託販売",
  "越境EC",
  "独占可",
  "日本",
  "ASEAN",
];

const sampleCases = [
  {
    category: "食品・飲料",
    market: "日本 / 小売・EC",
    format: "卸売",
    exclusive: "非独占",
    title: "地域特産のクラフト飲料",
    summary: "百貨店・専門店向け。最低発注数と希望マージンを商品上で明示。",
  },
  {
    category: "美容・コスメ",
    market: "ASEAN / 越境EC",
    format: "代理店",
    exclusive: "独占可（エリア限定）",
    title: "スキンケアブランドの海外展開",
    summary: "対応国・販促支援の有無を先に確認したうえで商談に進めます。",
  },
  {
    category: "雑貨・ライフスタイル",
    market: "日本 / 全国",
    format: "委託販売",
    exclusive: "非独占",
    title: "ライフスタイル雑貨の店舗展開",
    summary: "委託条件と返品ルールを事前に共有し、ミスマッチを減らします。",
  },
] as const;

const betaBenefits = [
  {
    title: "優先募集",
    body: "初期掲載企業・販売パートナーを優先的に受け付けています。",
  },
  {
    title: "優先案内",
    body: "公開商品やマッチング候補を、先行登録者へ優先してご案内します。",
  },
  {
    title: "初期支援",
    body: "掲載の進め方や商材探しの初期マッチングをサポートします。",
  },
  {
    title: "改善参加",
    body: "ベータ参加者として、今後の機能改善へのフィードバックも可能です。",
  },
] as const;

const makerPains = [
  "販路を広げたいが、どこに声をかけるべきか分からない",
  "商談前に条件が合う相手か判断しづらい",
  "毎回ゼロから説明するのが大変",
];

const partnerPains = [
  "取り扱える海外商品を探すのに時間がかかる",
  "問い合わせても卸価格やMOQが曖昧",
  "バイヤー・卸・小売・ECとして条件を先に確認したい",
];

const reasons = [
  {
    title: "日本の販売事業者が探しやすい",
    body: "バイヤー、卸売業者、小売店、EC事業者が、取り扱いたい海外商品を条件つきで比較できます。",
  },
  {
    title: "条件が最初から見える",
    body: "卸価格・MOQ・販売形式・独占可否などを商品に載せられるため、交渉前のミスマッチを減らせます。",
  },
  {
    title: "探すだけで終わらない",
    body: "商品確認から商談、販売パートナー登録まで、一つの流れで進められます。",
  },
];

const steps = [
  {
    n: "01",
    title: "海外商品を探す",
    body: "カテゴリーや商品一覧から、取り扱い候補を探す",
  },
  {
    n: "02",
    title: "条件を確認する",
    body: "MOQ・卸価格・販売形式などの取引条件を見る",
  },
  {
    n: "03",
    title: "商談する",
    body: "合う商品があれば、販売パートナーとして商談へ進む",
  },
];

const trustItems = [
  {
    title: "対応カテゴリ例",
    body: "食品・飲料、美容・コスメ、雑貨・ライフスタイル、健康・サプリなど。順次拡充予定です。",
  },
  {
    title: "対応エリア例",
    body: "日本国内を中心に、ASEAN・アメリカ・ヨーロッパなど越境も想定しています。",
  },
  {
    title: "想定販売形式",
    body: "卸売・代理店・EC販売・委託販売など、商品ごとに条件を明示できます。",
  },
  {
    title: "法人向けの安心設計",
    body: "法人利用を前提とし、掲載には審査があります。本人確認も順次強化予定です。",
  },
];

export default async function HomePage() {
  const [popular, latest] = await Promise.all([
    getPopularCases(3),
    getLatestCases(6),
  ]);
  const hasCases = latest.length > 0;
  const showcaseCases = hasCases ? popular.slice(0, 3) : [];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdString(organizationJsonLd()),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdString(websiteJsonLd("ja")),
        }}
      />

      {/* 1. Hero — value first */}
      <section className="relative min-h-[min(100svh,880px)] overflow-hidden bg-navy-deep text-white">
        <div
          className="absolute inset-0 scale-105 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2000&q=80')",
          }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-navy-deep/75" aria-hidden />
        <div
          className="absolute inset-0 bg-gradient-to-br from-navy-deep via-navy-deep/80 to-teal-dark/45"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-navy-deep/90 via-transparent to-navy-deep/40"
          aria-hidden
        />

        <div className="relative mx-auto flex min-h-[min(100svh,880px)] max-w-6xl flex-col justify-center px-5 py-16 md:py-24">
          <div className="animate-fade-up inline-flex w-fit items-center gap-2 rounded-md border border-teal/40 bg-teal/15 px-3 py-1.5 text-xs font-medium tracking-wide text-teal sm:text-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-teal" aria-hidden />
            ベータ先行登録受付中
          </div>

          <p className="animate-fade-up delay-1 mt-5 font-[family-name:var(--font-shippori)] text-[2.5rem] leading-none tracking-wide text-white drop-shadow-sm sm:text-5xl md:text-6xl lg:text-7xl">
            BrandBridge
          </p>

          <h1 className="animate-fade-up delay-1 mt-6 max-w-3xl font-[family-name:var(--font-shippori)] text-[1.45rem] leading-[1.4] text-white drop-shadow-sm sm:text-3xl md:mt-8 md:text-4xl lg:text-[2.45rem]">
            海外ブランドの商品を探している
            <br />
            日本の事業者へ
          </h1>

          <p className="animate-fade-up delay-2 mt-5 max-w-xl text-[0.95rem] leading-relaxed text-white/90 sm:text-base md:mt-6 md:text-lg">
            卸売・小売・ECで取り扱いたい海外商品を探し、条件を確認し、
            <br />
            販売パートナーとして商談できます。
          </p>

          <p className="animate-fade-up delay-2 mt-4 max-w-xl text-sm leading-relaxed text-white/75">
            バイヤー、卸売業者、小売店、EC事業者向け。
            <br />
            MOQ・卸価格などの取引条件を見てから、商談に進めます。
          </p>

          <div className="animate-fade-up delay-3 mt-9 flex w-full max-w-xl flex-col gap-5">
            <div>
              <Button
                href="/cases"
                className="w-full px-6 py-3.5 text-base shadow-[0_12px_32px_rgba(26,138,138,0.45)] sm:w-auto sm:min-w-[168px]"
              >
                商品一覧を見る
              </Button>
              <p className="mt-2 text-sm leading-relaxed text-white/70">
                海外商品を探している日本の事業者の方
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Link
                href="/register/partner"
                className="rounded-md border border-white/40 bg-white/5 px-4 py-3.5 transition hover:border-white hover:bg-white/10"
              >
                <p className="text-sm font-medium text-white sm:text-base">
                  販売パートナーとして登録
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-white/70 sm:text-sm">
                  卸・小売・ECで、海外ブランドの商品を扱いたい方
                </p>
              </Link>
              <Link
                href="/register/maker"
                className="rounded-md border border-white/25 bg-white/[0.03] px-4 py-3.5 transition hover:border-white/50 hover:bg-white/5"
              >
                <p className="text-sm font-medium text-white/95 sm:text-base">
                  商品提供企業として登録
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-white/70 sm:text-sm">
                  海外ブランドとして、日本の販売先を探している方
                </p>
              </Link>
            </div>
          </div>

          <p className="animate-fade-up delay-3 mt-6">
            <Link
              href="/for-partners"
              className="text-sm text-teal underline-offset-4 transition hover:text-white hover:underline"
            >
              販売パートナーの方へ
            </Link>
          </p>

          <p className="animate-fade-in delay-3 mt-5 text-sm text-white/65">
            登録前に商品イメージだけ見ることもできます ·{" "}
            <Link
              href="#sample-cases"
              className="underline-offset-2 hover:text-white hover:underline"
            >
              具体例を見る
            </Link>
          </p>
        </div>
      </section>

      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-14 md:py-16">
          <div className="max-w-3xl">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              目的から探す
            </h2>
            <p className="mt-3 leading-relaxed text-muted">
              検索意図に合わせて、ガイド・カテゴリー・商品・登録へ進めます。
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                { href: "/cases", label: "海外ブランドを探す" },
                {
                  href: "/ja/categories",
                  label: "カテゴリから商品を探す",
                },
                {
                  href: "/ja/japan-market-guide",
                  label: "日本で販売したい海外ブランドへ",
                },
                {
                  href: "/ja/japan-market-guide",
                  label: "日本市場ガイド",
                },
                {
                  href: "/register/maker",
                  label: "海外ブランドを掲載する",
                },
                {
                  href: "/ja/blog",
                  label: "海外ブランドを仕入れたい日本企業向けガイド",
                },
              ].map((item) => (
                <li key={`${item.href}-${item.label}`}>
                  <Link
                    href={item.href}
                    className="text-sm font-medium text-teal hover:underline"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-10 max-w-2xl rounded-xl border border-border bg-cream/40 p-6 md:p-8">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              はじめて海外商品を仕入れる方へ
            </h2>
            <p className="mt-3 leading-relaxed text-muted">
              バイヤー、卸、小売、EC事業者が海外ブランドを扱うときの進め方を図解しています。
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button href="/how-to-sell-in-japan" className="w-full sm:w-auto">
                日本で販売する方法を見る
              </Button>
              <Button href="/ja/blog" variant="outline" className="w-full sm:w-auto">
                日本語ガイド一覧
              </Button>
            </div>
            <ul className="mt-6 grid gap-2 sm:grid-cols-2">
              {[
                {
                  href: "/ja/japan-market-guide",
                  label: "日本市場ガイド",
                },
                {
                  href: "/ja/blog/how-overseas-brands-enter-japan",
                  label: "日本進出ガイド",
                },
                {
                  href: "/ja/blog/how-to-find-japanese-distributor",
                  label: "日本の販売パートナー",
                },
                {
                  href: "/ja/blog/what-is-moq-for-overseas-products",
                  label: "MOQ・卸価格ガイド",
                },
                {
                  href: "/ja/categories",
                  label: "業界別カテゴリー",
                },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-teal hover:underline"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 2. Beta meaning */}
      <section
        id="early-access"
        className="border-b border-border bg-[linear-gradient(180deg,#eef3f7_0%,#f4f7f9_100%)]"
      >
        <div className="mx-auto max-w-6xl px-5 py-14 md:py-16">
          <div className="max-w-2xl">
            <p className="text-xs font-medium tracking-wider text-teal">
              BETA EARLY ACCESS
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              今入る意味がある、ベータ先行登録
            </h2>
            <p className="mt-3 text-muted">
              まだ準備中ではなく、初期参加者として優先的に始められる段階です。
            </p>
          </div>

          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {betaBenefits.map((item) => (
              <li
                key={item.title}
                className="rounded-lg border border-border bg-surface px-5 py-5"
              >
                <h3 className="font-medium text-navy">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button href="/register/partner" className="w-full sm:w-auto">
              販売パートナーとして登録
            </Button>
            <Button
              href="/register/maker"
              variant="outline"
              className="w-full sm:w-auto"
            >
              商品提供企業として登録
            </Button>
          </div>
        </div>
      </section>

      {/* 3. Concrete cases / categories */}
      <section id="sample-cases" className="bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
                {hasCases ? "公開中の商品" : "こんな商品が載るイメージ"}
              </h2>
              <p className="mt-3 text-muted">
                {hasCases
                  ? "条件が見える商品から、興味のある商材を探せます。"
                  : "カテゴリ・対応国・販売形式・独占可否など、交渉前に確認したい条件を先に見せます。"}
              </p>
            </div>
            <Button href="/cases" variant="outline" className="w-full sm:w-auto">
              商品一覧を見る
            </Button>
          </div>

          {hasCases ? (
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {showcaseCases.map((item, index) => (
                <CaseCard key={item.id} caseItem={item} index={index} />
              ))}
            </div>
          ) : (
            <ul className="mt-8 grid gap-4 md:grid-cols-3">
              {sampleCases.map((item) => (
                <li
                  key={item.title}
                  className="rounded-lg border border-border bg-background p-5"
                >
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="rounded bg-cream px-2 py-0.5 text-navy">
                      {item.category}
                    </span>
                    <span className="rounded bg-cream px-2 py-0.5 text-navy">
                      {item.market}
                    </span>
                    <span className="rounded bg-cream px-2 py-0.5 text-navy">
                      {item.format}
                    </span>
                    <span className="rounded border border-teal/30 bg-teal/10 px-2 py-0.5 text-teal-dark">
                      {item.exclusive}
                    </span>
                  </div>
                  <h3 className="mt-4 font-[family-name:var(--font-shippori)] text-lg text-navy">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {item.summary}
                  </p>
                  <p className="mt-4 text-xs text-muted">公開予定のイメージ例</p>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-10 border-t border-border pt-8">
            <h3 className="font-[family-name:var(--font-shippori)] text-xl text-navy md:text-2xl">
              カテゴリーから探す
            </h3>
            <p className="mt-1 text-sm text-muted">
              既存の商品カテゴリーから、該当する商品一覧へ進めます。
            </p>
            <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
              {partnerCategoryEntries.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="flex h-full flex-col rounded-lg border border-border bg-background px-4 py-4 text-center transition hover:border-teal hover:text-teal"
                  >
                    <span className="font-medium text-navy">{item.label}</span>
                    <span className="mt-1 text-xs text-muted">{item.note}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <ul className="mt-4 flex flex-wrap gap-2">
              {browseCategories.map((category) => {
                const landing = jaCategoryLandings.find(
                  (item) => item.caseCategory === category,
                );
                const href = landing
                  ? jaCategoryPath(landing.slug)
                  : `/cases?category=${encodeURIComponent(category)}`;
                return (
                  <li key={category}>
                    <Link
                      href={href}
                      className="inline-flex rounded-md border border-border bg-background px-3.5 py-2.5 text-sm text-navy transition hover:border-teal hover:text-teal"
                    >
                      {category}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <ul className="mt-3 flex flex-wrap gap-2">
              {conditionTags.map((tag) => (
                <li
                  key={tag}
                  className="inline-flex rounded-md bg-cream px-3 py-1.5 text-xs text-navy/80"
                >
                  {tag}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 4. Pain points */}
      <section className="border-t border-border bg-background">
        <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
          <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
            こんな課題ありませんか
          </h2>
          <p className="mt-3 max-w-xl text-muted">
            海外商品を仕入れたい日本の事業者も、条件が見えないまま探す負担があります。
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-surface p-6 md:p-7">
              <p className="text-xs font-medium tracking-wider text-teal">
                FOR PARTNERS
              </p>
              <h3 className="mt-2 font-[family-name:var(--font-shippori)] text-xl text-navy">
                バイヤー・卸・小売・ECの方
              </h3>
              <ul className="mt-5 space-y-3">
                {partnerPains.map((pain) => (
                  <li
                    key={pain}
                    className="flex gap-3 text-sm leading-relaxed text-muted"
                  >
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
                    {pain}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-border bg-surface p-6 md:p-7">
              <p className="text-xs font-medium tracking-wider text-teal">
                FOR MAKERS
              </p>
              <h3 className="mt-2 font-[family-name:var(--font-shippori)] text-xl text-navy">
                商品提供企業の方
              </h3>
              <ul className="mt-5 space-y-3">
                {makerPains.map((pain) => (
                  <li
                    key={pain}
                    className="flex gap-3 text-sm leading-relaxed text-muted"
                  >
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
                    {pain}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Reasons */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
          <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
            選ばれる理由
          </h2>
          <p className="mt-3 max-w-xl text-muted">
            探す負担を減らし、条件が合う相手との商談を早く始められる設計です。
          </p>
          <ol className="mt-10 grid gap-8 md:grid-cols-3 md:gap-6">
            {reasons.map((item, i) => (
              <li key={item.title} className="relative md:pr-4">
                <span className="font-[family-name:var(--font-shippori)] text-3xl text-teal/35">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 font-medium text-navy">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {item.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 6. Flow */}
      <section className="border-t border-border bg-background">
        <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
          <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
            使い方はシンプル
          </h2>
          <p className="mt-3 max-w-xl text-muted">
            海外商品を探し、条件を確認し、販売パートナーとして商談する流れです。
          </p>
          <ol className="mt-10 grid gap-6 sm:grid-cols-3">
            {steps.map((step) => (
              <li key={step.n} className="border-t-2 border-teal/50 pt-4">
                <p className="text-xs font-medium tracking-wider text-teal">
                  {step.n}
                </p>
                <h3 className="mt-2 font-[family-name:var(--font-shippori)] text-lg text-navy">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 7. Trust */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
          <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
            安心して始められる理由
          </h2>
          <p className="mt-3 max-w-xl text-muted">
            実績数字ではなく、運用方針と対象範囲で信頼できる設計にしています。
          </p>
          <ul className="mt-10 grid gap-5 sm:grid-cols-2">
            {trustItems.map((item) => (
              <li
                key={item.title}
                className="rounded-lg border border-border bg-background px-5 py-5"
              >
                <h3 className="font-medium text-navy">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-muted">
            掲載相談は優先的に確認します。通常1〜2営業日以内にご返信します。
            ベータ参加希望の方は、お問い合わせ時にその旨をご記載ください。
          </p>
        </div>
      </section>

      {/* Audience entry */}
      <section
        id="for-you"
        className="border-t border-border bg-[linear-gradient(180deg,#eef3f7_0%,#f4f7f9_100%)]"
      >
        <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
          <div className="max-w-2xl">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              どちらで始めますか？
            </h2>
            <p className="mt-3 text-muted">
              日本の販売事業者向けの入口を先に、商品提供企業向けの入口も用意しています。
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 md:gap-6">
            <Link
              href="/for-partners"
              className="group flex flex-col rounded-xl border border-border bg-surface p-6 shadow-[0_16px_40px_rgba(20,32,51,0.06)] transition hover:-translate-y-0.5 hover:border-teal/40 hover:shadow-[0_18px_44px_rgba(20,32,51,0.1)] md:p-8"
            >
              <p className="text-xs font-medium tracking-wider text-teal">
                FOR PARTNERS
              </p>
              <h3 className="mt-3 font-[family-name:var(--font-shippori)] text-xl text-navy transition group-hover:text-teal md:text-2xl">
                販売パートナーの方へ
              </h3>
              <p className="mt-3 flex-1 leading-relaxed text-muted">
                バイヤー、卸売業者、小売店、EC事業者が、取り扱い可能な海外商品を探せます。
              </p>
              <span className="mt-8 inline-flex w-full items-center justify-center rounded-md bg-teal px-5 py-3.5 text-base font-medium text-white shadow-[0_8px_24px_rgba(26,138,138,0.28)] transition group-hover:bg-teal-dark sm:w-auto sm:self-start">
                販売パートナー向けページを見る
              </span>
            </Link>

            <Link
              href="/product-showcase"
              className="group flex flex-col rounded-xl border border-border bg-surface p-6 shadow-[0_16px_40px_rgba(20,32,51,0.06)] transition hover:-translate-y-0.5 hover:border-teal/40 hover:shadow-[0_18px_44px_rgba(20,32,51,0.1)] md:p-8"
            >
              <p className="text-xs font-medium tracking-wider text-teal">
                FOR MAKERS
              </p>
              <h3 className="mt-3 font-[family-name:var(--font-shippori)] text-xl text-navy transition group-hover:text-teal md:text-2xl">
                商品提供企業の方へ
              </h3>
              <p className="mt-3 flex-1 leading-relaxed text-muted">
                登録後の商品ページ完成イメージを、サンプルで確認できます。掲載の見え方を先に把握したうえで登録を進められます。
              </p>
              <span className="mt-8 inline-flex w-full items-center justify-center rounded-md bg-teal px-5 py-3.5 text-base font-medium text-white shadow-[0_8px_24px_rgba(26,138,138,0.28)] transition group-hover:bg-teal-dark sm:w-auto sm:self-start">
                商品掲載サンプルを見る
              </span>
            </Link>
          </div>

          <p className="mt-8">
            <Link
              href="/pricing"
              className="text-sm font-medium text-teal transition hover:underline"
            >
              料金プラン
            </Link>
          </p>
        </div>
      </section>

      {/* More real cases when available */}
      {hasCases && latest.length > 3 ? (
        <section className="border-t border-border bg-background">
          <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
                  新着商品
                </h2>
                <p className="mt-2 text-sm text-muted">
                  最近公開された商品です。
                </p>
              </div>
              <Button href="/cases" variant="outline" className="w-full sm:w-auto">
                商品一覧へ
              </Button>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {latest.map((item, index) => (
                <CaseCard key={item.id} caseItem={item} index={index} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* 8. Closing CTA */}
      <section className="relative overflow-hidden bg-navy-deep text-white">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 20% 50%, rgba(26,138,138,0.55), transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(20,111,111,0.35), transparent 50%)",
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-5 py-16 text-center md:py-20">
          <h2 className="font-[family-name:var(--font-shippori)] text-2xl md:text-3xl">
            海外商品を探し、条件を確認してから商談できます
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-white/75 md:text-base">
            まずは商品一覧から。取り扱いを進める場合は、販売パートナーとして登録できます。
          </p>
          <div className="mx-auto mt-8 flex w-full max-w-md flex-col gap-4 sm:max-w-2xl sm:flex-row sm:justify-center">
            <Button
              href="/cases"
              className="w-full py-3.5 text-base sm:w-auto sm:min-w-[168px]"
            >
              商品一覧を見る
            </Button>
            <div className="flex flex-1 flex-col gap-1 sm:max-w-[200px]">
              <Button
                href="/register/partner"
                variant="outline"
                className="w-full border-white/40 py-3.5 text-base text-white hover:border-white hover:bg-white/10 hover:text-white"
              >
                販売パートナーとして登録
              </Button>
              <p className="text-center text-xs text-white/60">
                海外商品を扱いたい方
              </p>
            </div>
            <div className="flex flex-1 flex-col gap-1 sm:max-w-[200px]">
              <Button
                href="/register/maker"
                variant="outline"
                className="w-full border-white/25 py-3.5 text-base text-white/90 hover:border-white/50 hover:bg-white/5 hover:text-white"
              >
                商品提供企業として登録
              </Button>
              <p className="text-center text-xs text-white/60">
                日本の販売先を探している方
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

