import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { PageBreadcrumbs } from "@/components/seo/PageBreadcrumbs";
import { JA_BLOG_HUB } from "@/lib/blog/ja-articles/types";
import { selfLanguageAlternates } from "@/lib/hreflang";
import { jaCategoryPath, listJaCategories } from "@/lib/ja-categories";
import {
  collectionPageJsonLd,
  jsonLdString,
} from "@/lib/seo-jsonld";

export const dynamic = "force-static";

const PATH = "/ja/japan-market-guide";
const TITLE = "海外ブランド仕入れガイド｜海外商品を探す日本の事業者へ";
const DESCRIPTION =
  "海外ブランドの商品を仕入れたい日本の卸・小売・EC事業者向けガイド。海外ブランドの探し方、仕入れ先、卸取引、MOQ、取引条件、カテゴリー別の商品探しまで解説します。";

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
    type: "website",
  },
};

const buyerGuides = [
  {
    href: "/ja/blog/how-to-find-overseas-wholesale-suppliers",
    label: "海外商品の仕入れ先を探す方法",
    note: "海外ブランド・商品の仕入れ先を探す基本的な方法",
  },
  {
    href: "/ja/blog/how-to-start-overseas-brand-wholesale",
    label: "海外ブランドの仕入れ・卸取引を始める方法",
    note: "海外ブランドとの卸取引を始める際の基本と進め方",
  },
  {
    href: JA_BLOG_HUB.path,
    label: "海外ブランドを仕入れる日本語ガイド",
    note: "海外商品の仕入れに関する関連記事をまとめて確認",
  },
] as const;

const buyingPoints = [
  {
    title: "ブランドを探す",
    body: "日本ではまだ流通していない海外ブランドや、取り扱いたいカテゴリーの商品を探します。",
  },
  {
    title: "取引条件を確認する",
    body: "MOQ、卸価格、納期、配送条件、サンプル対応など、商談前に確認したい条件を整理します。",
  },
  {
    title: "ブランドへ問い合わせる",
    body: "気になる商品を見つけたら、販売エリアや希望数量などを伝えて具体的な商談につなげます。",
  },
] as const;

export default function JapanMarketGuideHubPage() {
  const categories = listJaCategories();

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdString(
            collectionPageJsonLd({
              name: TITLE,
              description: DESCRIPTION,
              path: PATH,
              inLanguage: "ja",
            }),
          ),
        }}
      />

      <div className="border-b border-border bg-surface">
        <div className="mx-auto max-w-3xl px-5 pt-8">
          <PageBreadcrumbs
            items={[
              { name: "ホーム", path: "/" },
              { name: "海外ブランド仕入れガイド", path: PATH },
            ]}
          />
        </div>
      </div>

      <section className="relative overflow-hidden bg-navy-deep text-white">
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_30%,rgba(26,138,138,0.35),transparent_55%),radial-gradient(ellipse_at_80%_70%,rgba(20,111,111,0.25),transparent_50%)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl px-5 py-14 md:py-20">
          <p className="text-xs font-medium tracking-wider text-teal">
            海外ブランド仕入れガイド
          </p>
          <h1 className="mt-5 font-[family-name:var(--font-shippori)] text-[1.55rem] leading-[1.3] text-white sm:text-3xl md:text-4xl">
            海外ブランドを仕入れたい日本の事業者へ
          </h1>
          <p className="mt-5 text-sm leading-relaxed text-white/80 md:text-base">
            海外ブランドの商品を探している卸・小売・EC事業者向けの総合ガイドです。仕入れ先の探し方、卸取引の進め方、取引条件の確認、カテゴリー別の商品探しまでまとめています。
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button href="/cases" className="w-full sm:w-auto">
              海外ブランドの商品を探す
            </Button>
            <Button
              href="/ja/blog"
              variant="outline"
              className="w-full border-white/30 bg-transparent text-white hover:bg-white/10 sm:w-auto"
            >
              仕入れガイドを読む
            </Button>
          </div>
        </div>
      </section>

      <div className="border-b border-border bg-surface">
        <div className="mx-auto max-w-3xl px-5 py-12 md:py-16">
          <section>
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              海外ブランドの仕入れはここから
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted md:text-base">
              海外の商品を仕入れたいときは、まずブランドを探し、取引条件を確認して、具体的な商談へ進みます。
            </p>

            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {buyingPoints.map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-border bg-background p-5"
                >
                  <h3 className="font-medium text-navy">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              海外ブランド・商品の探し方
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted md:text-base">
              取り扱いたいカテゴリーから商品を探したり、海外ブランドの仕入れに関する記事から候補を見つけたりできます。
            </p>
            <ul className="mt-6 space-y-4">
              <li>
                <Link href="/cases" className="font-medium text-teal hover:underline">
                  海外ブランドの商品一覧を見る
                </Link>
                <p className="mt-1 text-sm text-muted">
                  日本で取り扱える海外ブランドの商品を探します。
                </p>
              </li>
              <li>
                <Link
                  href="/ja/categories"
                  className="font-medium text-teal hover:underline"
                >
                  商品カテゴリーから探す
                </Link>
                <p className="mt-1 text-sm text-muted">
                  食品、コスメ、アパレル、ホーム、ヘルスケアなどから商品を探せます。
                </p>
              </li>
            </ul>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              海外ブランド仕入れの実務ガイド
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted md:text-base">
              仕入れ先探しから卸取引まで、海外ブランドを取り扱う前に確認したいポイントを整理しています。
            </p>
            <ul className="mt-6 space-y-4">
              {buyerGuides.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="font-medium text-teal hover:underline"
                  >
                    {item.label}
                  </Link>
                  <p className="mt-1 text-sm text-muted">{item.note}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              カテゴリーから海外商品を探す
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted md:text-base">
              取り扱いたいカテゴリーから、日本で販売できる海外ブランドの商品を探せます。
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              <li>
                <Link
                  href="/ja/categories"
                  className="text-teal hover:underline"
                >
                  海外ブランドの商品カテゴリ一覧
                </Link>
              </li>
              {categories.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={jaCategoryPath(item.slug)}
                    className="text-teal hover:underline"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              BrandBridgeで海外ブランドを探す
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted md:text-base">
              BrandBridgeでは、海外ブランドの商品や取引条件を確認し、気になる商品について問い合わせることができます。
            </p>
            <div className="mt-6">
              <Link
                href="/cases"
                className="font-medium text-teal hover:underline"
              >
                海外ブランドの商品一覧を見る →
              </Link>
            </div>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              次のアクション
            </h2>
            <ul className="mt-6 space-y-2.5">
              <li>
                <Link href="/cases" className="text-teal hover:underline">
                  海外ブランドの商品を探す
                </Link>
              </li>
              <li>
                <Link href="/ja/blog" className="text-teal hover:underline">
                  海外ブランド仕入れの記事を読む
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-teal hover:underline">
                  お問い合わせ
                </Link>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
