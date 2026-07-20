import { CaseCard } from "@/components/cases/CaseCard";
import { Button } from "@/components/ui/Button";
import { getLatestCases, getPopularCases } from "@/lib/cases";
import { caseCategories } from "@/lib/types";
import Link from "next/link";

export const dynamic = "force-dynamic";

const browseCategories = caseCategories.filter((c) => c !== "すべて");

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
  "売れる商材を探すのに時間がかかる",
  "問い合わせても条件が曖昧",
  "交渉前に対応国や販売形式を知りたい",
];

const reasons = [
  {
    title: "両方の目的がはっきりしている",
    body: "商品提供企業は販路開拓、販売パートナーは商材探し。誰向けかが明確なので、迷わず始められます。",
  },
  {
    title: "条件が最初から見える",
    body: "販売形式・対応国・独占可否などを商品に載せられるため、交渉前のミスマッチを減らせます。",
  },
  {
    title: "交渉から成約までつながる",
    body: "探すだけで終わらず、申し込み・メッセージ・成約まで一つの流れで商談を前に進められます。",
  },
];

const steps = [
  {
    n: "01",
    title: "掲載",
    body: "商品情報・MOQ・卸価格・販売条件を登録",
  },
  {
    n: "02",
    title: "マッチング",
    body: "条件に合う販売パートナーと出会う",
  },
  {
    n: "03",
    title: "商談・契約",
    body: "交渉から取引開始へ進む",
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
            日本進出したい海外ブランドと、
            <br />
            売れる販売パートナーをつなぐ。
          </h1>

          <p className="animate-fade-up delay-2 mt-5 max-w-xl text-[0.95rem] leading-relaxed text-white/90 sm:text-base md:mt-6 md:text-lg">
            BrandBridgeは、MOQ・卸価格・独占可否・輸送条件まで整理された、
            <br />
            交渉可能なBtoB商談プラットフォームです。
          </p>

          <p className="animate-fade-up delay-2 mt-4 max-w-xl text-sm leading-relaxed text-white/75">
            紹介だけで終わるマッチングではなく、
            <br />
            条件が合えば、そのまま商談・交渉へ進めます。
          </p>

          <div className="animate-fade-up delay-3 mt-9 flex w-full max-w-md flex-col gap-3 sm:mt-10 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center">
            <Button
              href="#early-access"
              className="w-full px-6 py-3.5 text-base shadow-[0_12px_32px_rgba(26,138,138,0.45)] sm:w-auto sm:min-w-[168px]"
            >
              先行登録する
            </Button>
            <Button
              href="/cases"
              variant="outline"
              className="w-full border-white/40 px-6 py-3.5 text-base text-white hover:border-white hover:bg-white/10 hover:text-white sm:w-auto"
            >
              公開予定の商品を見る
            </Button>
            <Button
              href="/contact?topic=listing"
              variant="outline"
              className="w-full border-white/25 px-6 py-3.5 text-base text-white/90 hover:border-white/50 hover:bg-white/5 hover:text-white sm:w-auto"
            >
              掲載相談をする
            </Button>
          </div>

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
            <Button href="/register/maker" className="w-full sm:w-auto">
              商品提供企業として登録
            </Button>
            <Button
              href="/register/partner"
              variant="outline"
              className="w-full sm:w-auto"
            >
              販売パートナーとして登録
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
              公開予定の商品を見る
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
            <h3 className="font-medium text-navy">カテゴリ・条件の例</h3>
            <p className="mt-1 text-sm text-muted">
              興味のある分野や販売形式から商品一覧へ進めます。
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {browseCategories.map((category) => (
                <li key={category}>
                  <Link
                    href={`/cases?category=${encodeURIComponent(category)}`}
                    className="inline-flex rounded-md border border-border bg-background px-3.5 py-2.5 text-sm text-navy transition hover:border-teal hover:text-teal"
                  >
                    {category}
                  </Link>
                </li>
              ))}
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
            商品提供企業にも販売パートナーにも、条件が見えないまま探す負担があります。
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
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

            <div className="rounded-lg border border-border bg-surface p-6 md:p-7">
              <p className="text-xs font-medium tracking-wider text-teal">
                FOR PARTNERS
              </p>
              <h3 className="mt-2 font-[family-name:var(--font-shippori)] text-xl text-navy">
                販売パートナーの方
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
            掲載から商談・契約まで、3ステップで進められます。
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
              役割に合わせた入口から、詳しい説明ページへ進めます。
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 md:gap-6">
            <Link
              href="/for-makers"
              className="group flex flex-col rounded-xl border border-border bg-surface p-6 shadow-[0_16px_40px_rgba(20,32,51,0.06)] transition hover:-translate-y-0.5 hover:border-teal/40 hover:shadow-[0_18px_44px_rgba(20,32,51,0.1)] md:p-8"
            >
              <p className="text-xs font-medium tracking-wider text-teal">
                FOR MAKERS
              </p>
              <h3 className="mt-3 font-[family-name:var(--font-shippori)] text-xl text-navy transition group-hover:text-teal md:text-2xl">
                商品提供企業の方へ
              </h3>
              <p className="mt-3 flex-1 leading-relaxed text-muted">
                商品を広げたい製品・ブランドを掲載し、新しい販売パートナーとの出会いを作ります。
              </p>
              <span className="mt-8 inline-flex w-full items-center justify-center rounded-md bg-teal px-5 py-3.5 text-base font-medium text-white shadow-[0_8px_24px_rgba(26,138,138,0.28)] transition group-hover:bg-teal-dark sm:w-auto sm:self-start">
                商品提供企業向けページを見る
              </span>
            </Link>

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
                新しい商材を探している店舗・EC事業者・代理店が、取り扱い商品を見つけられます。
              </p>
              <span className="mt-8 inline-flex w-full items-center justify-center rounded-md bg-teal px-5 py-3.5 text-base font-medium text-white shadow-[0_8px_24px_rgba(26,138,138,0.28)] transition group-hover:bg-teal-dark sm:w-auto sm:self-start">
                販売パートナー向けページを見る
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
            まずは、商品を見るか先行登録から始めましょう
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-white/75 md:text-base">
            温度感に合わせて進め方を選べます。商品確認だけでも、掲載相談だけでも構いません。
          </p>
          <div className="mx-auto mt-8 flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
            <Button
              href="#early-access"
              className="w-full py-3.5 text-base sm:w-auto sm:min-w-[168px]"
            >
              先行登録する
            </Button>
            <Button
              href="/cases"
              variant="outline"
              className="w-full border-white/40 py-3.5 text-base text-white hover:border-white hover:bg-white/10 hover:text-white sm:w-auto"
            >
              公開予定の商品を見る
            </Button>
            <Button
              href="/contact?topic=listing"
              variant="outline"
              className="w-full border-white/25 py-3.5 text-base text-white/90 hover:border-white/50 hover:bg-white/5 hover:text-white sm:w-auto"
            >
              掲載相談をする
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
