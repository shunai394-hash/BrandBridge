import type { Metadata } from "next";
import Link from "next/link";
import { selfLanguageAlternates } from "@/lib/hreflang";
import {
  jaCategoryPath,
  listJaCategories,
} from "@/lib/ja-categories";
import { getSiteUrl } from "@/lib/site";

const PATH = "/ja/categories";
const TITLE = "海外商品のカテゴリー｜日本の販売パートナー向け";
const DESCRIPTION =
  "食品、コスメ、アパレル、ホーム、ヘルスケアなど、海外商品をカテゴリー別に探す入口です。取引条件を確認しながら掲載商品へ進めます。";
const H1 = "海外商品を探している日本の事業者へ";

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
  const siteUrl = getSiteUrl();
  const categories = listJaCategories();
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
            name: "カテゴリー",
            item: `${siteUrl}${PATH}`,
          },
        ],
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
            カテゴリー
          </p>
          <h1 className="mt-5 font-[family-name:var(--font-shippori)] text-[1.55rem] leading-[1.3] text-white sm:text-3xl md:text-4xl">
            {H1}
          </h1>
          <p className="mt-5 text-sm leading-relaxed text-white/80 md:text-base">
            バイヤー、卸売業者、小売店、EC事業者が、海外商品をカテゴリーから探せます。各ページから該当の商品一覧へ進めます。
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
                  <span className="mt-1 text-xs text-muted">{item.caseCategory}</span>
                  <span className="mt-3 text-sm leading-relaxed text-muted">
                    {item.lede}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
