import type { Metadata } from "next";
import Link from "next/link";
import { selfLanguageAlternates } from "@/lib/hreflang";
import {
  jaCategoryPath,
  listJaCategories,
} from "@/lib/ja-categories";
import {
  collectionPageJsonLd,
  itemListJsonLd,
  jsonLdString,
} from "@/lib/seo-jsonld";
import { PageBreadcrumbs } from "@/components/seo/PageBreadcrumbs";

const PATH = "/ja/categories";
const TITLE = "海外ブランドの商品カテゴリ一覧";
const DESCRIPTION =
  "食品、コスメ、ヘルスケア、ホーム、アパレルなど、海外ブランドの商品をカテゴリー別に探す入口です。取引条件を確認しながら掲載商品へ進めます。";
const H1 = "海外ブランドの商品カテゴリ一覧";

export const dynamic = "force-static";

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
    type: "website",
  },
};

export default function JapaneseCategoriesHubPage() {
  const categories = listJaCategories();
  const extraCategoryLinks = [
    {
      label: "アウトドア",
      note: "スポーツ",
      path: `/cases?category=${encodeURIComponent("スポーツ")}`,
      lede: "スポーツ・アウトドア関連の海外ブランドを商品一覧から探せます。",
    },
    {
      label: "家電・ガジェット",
      note: "家電・ガジェット",
      path: `/cases?category=${encodeURIComponent("家電・ガジェット")}`,
      lede: "家電・ガジェットの掲載商品をカテゴリーフィルタで確認できます。",
    },
    {
      label: "雑貨・ライフスタイル",
      note: "雑貨・ライフスタイル",
      path: `/cases?category=${encodeURIComponent("雑貨・ライフスタイル")}`,
      lede: "雑貨・ライフスタイルの海外ブランド候補を商品一覧から探せます。",
    },
  ] as const;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      collectionPageJsonLd({
        name: TITLE,
        description: DESCRIPTION,
        path: PATH,
        inLanguage: "ja",
      }),
      itemListJsonLd({
        name: TITLE,
        description: DESCRIPTION,
        path: PATH,
        items: [
          ...categories.map((item) => ({
            name: item.label,
            path: jaCategoryPath(item.slug),
          })),
          ...extraCategoryLinks.map((item) => ({
            name: item.label,
            path: item.path,
          })),
        ],
      }),
    ],
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
      />

      <div className="border-b border-border bg-surface">
        <div className="mx-auto max-w-3xl px-5 pt-8">
          <PageBreadcrumbs
            items={[
              { name: "ホーム", path: "/" },
              { name: "カテゴリー", path: PATH },
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
            カテゴリー
          </p>
          <h1 className="mt-5 font-[family-name:var(--font-shippori)] text-[1.55rem] leading-[1.3] text-white sm:text-3xl md:text-4xl">
            {H1}
          </h1>
          <p className="mt-5 text-sm leading-relaxed text-white/80 md:text-base">
            バイヤー、卸売業者、小売店、EC事業者が、海外ブランドの商品をカテゴリーから探せます。各ページから該当の商品一覧へ進めます。
          </p>
        </div>
      </section>

      <div className="border-b border-border bg-surface">
        <div className="mx-auto max-w-3xl px-5 py-12 md:py-16">
          <ul className="grid gap-4 sm:grid-cols-2">
            {categories.map((item) => (
              <li key={item.slug}>
                <Link
                  href={jaCategoryPath(item.slug)}
                  className="flex h-full flex-col rounded-xl border border-border bg-background px-5 py-5 transition hover:border-teal"
                >
                  <span className="font-[family-name:var(--font-shippori)] text-lg text-navy">
                    {item.label}
                  </span>
                  <span className="mt-1 text-xs text-muted">
                    {item.caseCategory}
                  </span>
                  <span className="mt-3 text-sm leading-relaxed text-muted">
                    {item.lede}
                  </span>
                </Link>
              </li>
            ))}
            {extraCategoryLinks.map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className="flex h-full flex-col rounded-xl border border-border bg-background px-5 py-5 transition hover:border-teal"
                >
                  <span className="font-[family-name:var(--font-shippori)] text-lg text-navy">
                    {item.label}
                  </span>
                  <span className="mt-1 text-xs text-muted">{item.note}</span>
                  <span className="mt-3 text-sm leading-relaxed text-muted">
                    {item.lede}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy">
              関連ハブ
            </h2>
            <ul className="mt-6 space-y-2.5">
              <li>
                <Link href="/cases" className="text-teal hover:underline">
                  海外ブランドを探す（商品一覧）
                </Link>
              </li>
              <li>
                <Link href="/ja/blog" className="text-teal hover:underline">
                  海外ブランドを仕入れたい日本企業向けガイド
                </Link>
              </li>
              <li>
                <Link
                  href="/ja/japan-market-guide"
                  className="text-teal hover:underline"
                >
                  日本市場ガイド
                </Link>
              </li>
              <li>
                <Link
                  href="/register/partner"
                  className="text-teal hover:underline"
                >
                  販売パートナー登録
                </Link>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
