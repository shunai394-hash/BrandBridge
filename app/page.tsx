import { CaseCard } from "@/components/cases/CaseCard";
import { EmptyCasesState } from "@/components/cases/EmptyCasesState";
import { Button } from "@/components/ui/Button";
import { getLatestCases, getPopularCases } from "@/lib/cases";
import { caseCategories } from "@/lib/types";
import Link from "next/link";

export const dynamic = "force-dynamic";

const browseCategories = caseCategories.filter((c) => c !== "すべて");

const reasons = [
  {
    title: "両方の目的がはっきりしている",
    body: "メーカーは販路開拓、パートナーは商材探し。役割ごとに導線が分かれているので迷いません。",
  },
  {
    title: "条件が最初から見える",
    body: "販売形式・国・独占可否など、交渉前に確認したい情報を案件に載せられます。",
  },
  {
    title: "交渉から成約までつながる",
    body: "申込・メッセージ・成約プロセスまで、ひとつの流れで進められます。",
  },
];

const steps = [
  {
    n: "01",
    title: "登録する",
    body: "メーカーまたは販売パートナーとして無料登録。",
  },
  {
    n: "02",
    title: "掲載 / 探す",
    body: "案件を出すか、公開案件から条件で絞り込みます。",
  },
  {
    n: "03",
    title: "交渉する",
    body: "申し込み後、メッセージで条件をすり合わせます。",
  },
  {
    n: "04",
    title: "成約する",
    body: "合意できたら成約へ。手数料管理にも対応しています。",
  },
];

export default async function HomePage() {
  const [popular, latest] = await Promise.all([
    getPopularCases(3),
    getLatestCases(6),
  ]);
  const hasCases = latest.length > 0;

  return (
    <>
      {/* 1. Hero — one composition, brand first */}
      <section className="relative min-h-[min(100svh,920px)] overflow-hidden bg-navy-deep text-white">
        <div
          className="absolute inset-0 scale-105 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2000&q=80')",
          }}
          aria-hidden
        />
        {/* Dark overlays for readability */}
        <div
          className="absolute inset-0 bg-navy-deep/75"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-br from-navy-deep via-navy-deep/80 to-teal-dark/45"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-navy-deep/90 via-transparent to-navy-deep/40"
          aria-hidden
        />

        <div className="relative mx-auto flex min-h-[min(100svh,920px)] max-w-6xl flex-col justify-center px-5 py-16 md:py-24">
          <p className="animate-fade-up font-[family-name:var(--font-shippori)] text-[2.75rem] leading-none tracking-wide text-white drop-shadow-sm sm:text-5xl md:text-6xl lg:text-7xl">
            BrandBridge
          </p>

          <h1 className="animate-fade-up delay-1 mt-6 max-w-3xl font-[family-name:var(--font-shippori)] text-[1.55rem] leading-[1.35] text-white drop-shadow-sm sm:text-3xl md:mt-8 md:text-4xl lg:text-[2.6rem]">
            販路を広げたいメーカーと、売れる商材を探すパートナーをつなぐ。
          </h1>

          <p className="animate-fade-up delay-2 mt-5 max-w-xl text-[0.95rem] leading-relaxed text-white/90 sm:text-base md:mt-6 md:text-lg">
            条件が見えるBtoBマッチング。
            <br />
            掲載、商材探し、交渉、成約までを一つの流れで。
          </p>

          <p className="animate-fade-up delay-2 mt-4 max-w-xl text-sm leading-relaxed text-teal sm:text-[0.95rem]">
            ベータ先行登録受付中。
            <br className="sm:hidden" />
            初期掲載メーカー・販売パートナーを優先募集しています。
          </p>

          {/* Priority CTAs: browse first, then role-based registration */}
          <div className="animate-fade-up delay-3 mt-9 flex w-full max-w-md flex-col gap-3 sm:mt-10 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
            <Button
              href="/cases"
              className="w-full px-6 py-3.5 text-base shadow-[0_12px_32px_rgba(26,138,138,0.45)] sm:w-auto sm:min-w-[160px]"
            >
              案件を見る
            </Button>
            <Button
              href="/register/maker"
              variant="outline"
              className="w-full border-white/40 px-6 py-3.5 text-base text-white hover:border-white hover:bg-white/10 hover:text-white sm:w-auto"
            >
              メーカーとして先行登録
            </Button>
            <Button
              href="/register/partner"
              variant="outline"
              className="w-full border-white/40 px-6 py-3.5 text-base text-white hover:border-white hover:bg-white/10 hover:text-white sm:w-auto"
            >
              販売パートナー登録
            </Button>
          </div>

          <p className="animate-fade-in delay-3 mt-5 text-sm text-white/70">
            まずは案件を確認してから登録できます ·{" "}
            <Link href="#for-you" className="underline-offset-2 hover:text-white hover:underline">
              自分に合う始め方
            </Link>
          </p>
        </div>
      </section>

      {/* 2. Audience cards — TOPは入口のみ、詳細は専用PRへ */}
      <section
        id="for-you"
        className="relative border-b border-border bg-[linear-gradient(180deg,#eef3f7_0%,#f4f7f9_100%)]"
      >
        <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
          <div className="max-w-2xl">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              どちらで始めますか？
            </h2>
            <p className="mt-3 text-muted">
              自分に合う入口を選んでください。詳しい説明は各ページにまとめています。
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
                メーカーの方へ
              </h3>
              <p className="mt-3 flex-1 leading-relaxed text-muted">
                販路を広げたい製品・ブランドを掲載し、新しい販売パートナーとの出会いを作ります。
              </p>
              <span className="mt-8 inline-flex w-full items-center justify-center rounded-md bg-teal px-5 py-3.5 text-base font-medium text-white shadow-[0_8px_24px_rgba(26,138,138,0.28)] transition group-hover:bg-teal-dark sm:w-auto sm:self-start">
                メーカー向けページを見る
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
                バイヤー向けページを見る
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Why */}
      <section className="bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
          <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
            選ばれる理由
          </h2>
          <p className="mt-3 max-w-xl text-muted">
            ただの掲示板ではなく、マッチングから成約までを見据えた設計です。
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

      {/* 4. Flow */}
      <section className="border-t border-border bg-background">
        <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
          <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
            使い方はシンプル
          </h2>
          <p className="mt-3 max-w-xl text-muted">
            登録から成約まで、4ステップで進められます。
          </p>
          <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <li
                key={step.n}
                className="border-t-2 border-teal/50 pt-4"
              >
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

      {/* 5. Categories */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-14 md:py-16">
          <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
            カテゴリから探す
          </h2>
          <p className="mt-2 text-sm text-muted">
            興味のある分野を選ぶと、案件一覧へ進みます。
          </p>
          <ul className="mt-6 flex flex-wrap gap-2">
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
        </div>
      </section>

      {/* 6. Cases or early-access empty */}
      {!hasCases ? (
        <section className="border-t border-border bg-background">
          <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
            <EmptyCasesState variant="home" />
          </div>
        </section>
      ) : (
        <>
          <section className="border-t border-border bg-background">
            <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
                    人気の案件
                  </h2>
                  <p className="mt-2 text-sm text-muted">
                    お気に入りが多い案件からピックアップしています。
                  </p>
                </div>
                <Button href="/cases" variant="outline" className="w-full sm:w-auto">
                  すべての案件を見る
                </Button>
              </div>
              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {popular.map((item, index) => (
                  <CaseCard key={item.id} caseItem={item} index={index} />
                ))}
              </div>
            </div>
          </section>

          <section className="border-t border-border bg-surface">
            <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
                    新着案件
                  </h2>
                  <p className="mt-2 text-sm text-muted">
                    最近公開された案件です。
                  </p>
                </div>
                <Button href="/cases" variant="outline" className="w-full sm:w-auto">
                  案件一覧へ
                </Button>
              </div>
              <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {latest.map((item, index) => (
                  <CaseCard key={item.id} caseItem={item} index={index} />
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* 7. Closing CTA */}
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
            まずは、案件を見るか登録から
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-white/75 md:text-base">
            迷ったら案件一覧へ。掲載したい場合はメーカー登録、商材を探す場合はパートナー登録へ進んでください。
          </p>
          <div className="mx-auto mt-8 flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
            <Button
              href="/cases"
              className="w-full py-3.5 text-base sm:w-auto sm:min-w-[180px]"
            >
              案件を探す
            </Button>
            <Button
              href="/register/maker"
              variant="outline"
              className="w-full border-white/40 py-3.5 text-base text-white hover:border-white hover:bg-white/10 hover:text-white sm:w-auto"
            >
              メーカー登録
            </Button>
            <Button
              href="/register/partner"
              variant="outline"
              className="w-full border-white/40 py-3.5 text-base text-white hover:border-white hover:bg-white/10 hover:text-white sm:w-auto"
            >
              パートナー登録
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
