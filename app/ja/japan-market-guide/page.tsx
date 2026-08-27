import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { PageBreadcrumbs } from "@/components/seo/PageBreadcrumbs";
import {
  EXISTING_JA_BLOG,
  JA_JAPAN_ENTRY,
  JA_SALES_CAUTIONS,
  JA_BLOG_HUB,
} from "@/lib/blog/ja-articles/types";
import { selfLanguageAlternates } from "@/lib/hreflang";
import { jaCategoryPath, listJaCategories } from "@/lib/ja-categories";
import {
  collectionPageJsonLd,
  jsonLdString,
} from "@/lib/seo-jsonld";

export const dynamic = "force-static";

const PATH = "/ja/japan-market-guide";
const TITLE = "日本市場ガイド｜海外ブランドの日本進出";
const DESCRIPTION =
  "海外ブランドが日本市場へ参入するための総合ガイド。販売パートナーの探し方、進出の進め方、カテゴリー別の入口、登録までの流れをまとめます。";

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

const guideArticles = [
  {
    href: JA_JAPAN_ENTRY.path,
    label: "海外ブランドの日本進出｜販売パートナーを探す方法",
    note: "進出の全体像とパートナー探しの順",
  },
  {
    href: EXISTING_JA_BLOG.path,
    label: EXISTING_JA_BLOG.title,
    note: "チャネル・契約・輸入の基本",
  },
  {
    href: JA_SALES_CAUTIONS.path,
    label: JA_SALES_CAUTIONS.title,
    note: "食品・化粧品・雑貨で先に確認したい実務",
  },
  {
    href: "/how-to-sell-in-japan",
    label: "日本で販売する方法（BrandBridgeの使い方）",
    note: "掲載から商談までの流れ",
  },
  {
    href: "/ja/blog/how-to-find-japanese-distributor",
    label: "日本の販売パートナー・代理店の探し方",
    note: "卸・小売・ECとの出会い方",
  },
] as const;

const forJapaneseBuyers = [
  {
    href: JA_BLOG_HUB.path,
    label: "海外ブランドを仕入れる日本語ガイド",
  },
  {
    href: "/ja/blog/how-to-find-overseas-wholesale-suppliers",
    label: "海外商品の仕入れ先を探す方法",
  },
  {
    href: "/ja/blog/how-to-start-overseas-brand-wholesale",
    label: "海外ブランドの仕入れ・卸取引を始める方法",
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
              { name: "日本市場ガイド", path: PATH },
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
            日本市場ガイド
          </p>
          <h1 className="mt-5 font-[family-name:var(--font-shippori)] text-[1.55rem] leading-[1.3] text-white sm:text-3xl md:text-4xl">
            海外ブランドの日本市場進出ガイド
          </h1>
          <p className="mt-5 text-sm leading-relaxed text-white/80 md:text-base">
            日本で販売パートナーを探している海外ブランド向けの総合ハブです。進出の進め方、関連記事、カテゴリー、掲載・登録への導線をまとめています。
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button href="/register/maker" className="w-full sm:w-auto">
              海外ブランドを掲載する
            </Button>
            <Button
              href="/for-makers"
              variant="outline"
              className="w-full border-white/30 bg-transparent text-white hover:bg-white/10 sm:w-auto"
            >
              商品提供企業の方へ
            </Button>
          </div>
        </div>
      </section>

      <div className="border-b border-border bg-surface">
        <div className="mx-auto max-w-3xl px-5 py-12 md:py-16">
          <section>
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              日本進出の実務ガイド
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted md:text-base">
              法人設立の前に、販売パートナー候補と取引条件を揃える流れを記事で整理しています。
            </p>
            <ul className="mt-6 space-y-4">
              {guideArticles.map((item) => (
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
              カテゴリーから日本市場を見る
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted md:text-base">
              食品、コスメ、ヘルスケアなど、カテゴリー別の入口です。掲載商品の確認にも進めます。
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
              日本の事業者向けガイド
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted md:text-base">
              海外ブランドを仕入れたい卸・小売・EC事業者向けのハブです。
            </p>
            <ul className="mt-6 space-y-2.5">
              {forJapaneseBuyers.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-teal hover:underline">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/cases" className="text-teal hover:underline">
                  海外ブランドを探す（商品一覧）
                </Link>
              </li>
            </ul>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              次のアクション
            </h2>
            <ul className="mt-6 space-y-2.5">
              <li>
                <Link
                  href="/register/maker"
                  className="text-teal hover:underline"
                >
                  海外ブランドを掲載する
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-teal hover:underline">
                  お問い合わせ
                </Link>
              </li>
              <li>
                <Link href="/for-makers" className="text-teal hover:underline">
                  商品提供企業の方へ
                </Link>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
