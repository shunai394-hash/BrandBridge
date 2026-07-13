import { CaseCard } from "@/components/cases/CaseCard";
import { EmptyCasesState } from "@/components/cases/EmptyCasesState";
import { Button } from "@/components/ui/Button";
import { getLatestCases, getPopularCases } from "@/lib/cases";
import { caseCategories } from "@/lib/types";
import Link from "next/link";

export const dynamic = "force-dynamic";

const browseCategories = caseCategories.filter((c) => c !== "すべて");

export default async function HomePage() {
  const [popular, latest] = await Promise.all([
    getPopularCases(3),
    getLatestCases(6),
  ]);
  const hasCases = latest.length > 0;

  return (
    <>
      <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-navy-deep text-white">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(115deg, rgba(12,21,36,0.88) 0%, rgba(12,21,36,0.55) 48%, rgba(26,138,138,0.35) 100%), url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2000&q=80')",
          }}
          aria-hidden
        />
        <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col justify-center px-5 py-20">
          <p className="animate-fade-up font-[family-name:var(--font-shippori)] text-4xl tracking-wide text-white md:text-6xl">
            BrandBridge
          </p>
          <h1 className="animate-fade-up delay-1 mt-5 max-w-2xl font-[family-name:var(--font-shippori)] text-2xl leading-snug md:text-4xl">
            メーカーと販売パートナーをつなぐ
          </h1>
          <p className="animate-fade-up delay-2 mt-5 max-w-xl text-base leading-relaxed text-white/80 md:text-lg">
            製品を広げたいメーカーと、良い商材を探す販売パートナーのためのBtoBマッチングサービスです。
          </p>
          <div className="animate-fade-up delay-3 mt-9 flex flex-wrap gap-3">
            <Button href="/cases" className="min-w-[140px]">
              案件を探す
            </Button>
            <Button
              href="/register/maker"
              variant="outline"
              className="min-w-[140px] border-white/35 text-white hover:border-white hover:bg-white/10 hover:text-white"
            >
              メーカー登録
            </Button>
            <Button
              href="/register/partner"
              variant="ghost"
              className="min-w-[140px] text-white hover:bg-white/10"
            >
              パートナー登録
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-surface">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 md:grid-cols-2 md:gap-16">
          <div>
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              メーカーの方へ
            </h2>
            <p className="mt-4 leading-relaxed text-muted">
              販路を広げたい製品・ブランドの案件を掲載し、条件に合う販売パートナーと出会えます。
            </p>
          </div>
          <div>
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              販売パートナーの方へ
            </h2>
            <p className="mt-4 leading-relaxed text-muted">
              取り扱い商材を探している店舗・卸・代理店が、公開案件からマッチするメーカーを見つけられます。
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-background">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
            カテゴリから探す
          </h2>
          <p className="mt-2 text-sm text-muted">
            興味のある分野から、公開案件を絞り込めます。
          </p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {browseCategories.map((category) => (
              <li key={category}>
                <Link
                  href={`/cases?category=${encodeURIComponent(category)}`}
                  className="inline-flex rounded-md border border-border bg-surface px-3.5 py-2 text-sm text-navy transition hover:border-teal hover:text-teal"
                >
                  {category}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {!hasCases ? (
        <section className="border-t border-border bg-background">
          <div className="mx-auto max-w-6xl px-5 py-20">
            <EmptyCasesState variant="home" />
          </div>
        </section>
      ) : (
        <>
          <section className="border-t border-border bg-background">
            <div className="mx-auto max-w-6xl px-5 py-20">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
                    人気の案件
                  </h2>
                  <p className="mt-2 text-sm text-muted">
                    お気に入りが多い案件からピックアップしています。
                  </p>
                </div>
                <Button href="/cases" variant="outline">
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
            <div className="mx-auto max-w-6xl px-5 py-20">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
                    新着案件
                  </h2>
                  <p className="mt-2 text-sm text-muted">
                    最近公開された案件です。
                  </p>
                </div>
                <Button href="/cases" variant="outline">
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
    </>
  );
}
