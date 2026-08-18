import type { Metadata } from "next";
import Link from "next/link";
import { jaBlogPath } from "@/components/blog/JaBlogArticle";
import {
  listJaBlogArticlesByCluster,
} from "@/lib/blog/ja-articles";
import {
  JA_BLOG_CLUSTER_LABEL,
  listDedicatedJaBlogsByCluster,
  type JaBlogCluster,
} from "@/lib/blog/ja-articles/types";
import { getSiteUrl } from "@/lib/site";
import { selfLanguageAlternates } from "@/lib/hreflang";

export const dynamic = "force-static";

const PATH = "/ja/blog";
const TITLE = "日本語ブログ｜販売パートナー・海外ブランド・カテゴリー別";
const DESCRIPTION =
  "日本の販売パートナー向け、海外ブランド向け、カテゴリー別の日本語ガイド。仕入れ条件、MOQ、日本市場への進め方など、BrandBridgeの実務と合わせて読めます。";

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

const CLUSTERS: {
  id: JaBlogCluster;
  lead: string;
}[] = [
  {
    id: "partner",
    lead: "卸・小売・EC・バイヤーが、海外ブランドの商品を仕入れるときに、条件を確認するためのガイドです。",
  },
  {
    id: "maker",
    lead: "海外ブランドが、日本の販売パートナーを探し、商品提供条件を整えるためのガイドです。",
  },
  {
    id: "category",
    lead: "コスメ、食品、サプリ、アパレル、ホームなど、カテゴリーごとの確認ポイントを整理したガイドです。",
  },
];

export default function JapaneseBlogHubPage() {
  const siteUrl = getSiteUrl();
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
            name: "日本語ブログ",
            item: `${siteUrl}${PATH}`,
          },
        ],
      },
      {
        "@type": "CollectionPage",
        name: TITLE,
        description: DESCRIPTION,
        inLanguage: "ja",
        url: `${siteUrl}${PATH}`,
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
            日本語ブログ
          </p>
          <h1 className="mt-5 font-[family-name:var(--font-shippori)] text-[1.55rem] leading-[1.3] text-white sm:text-3xl md:text-4xl">
            販売パートナーと海外ブランドのための実務ガイド
          </h1>
          <p className="mt-5 text-sm leading-relaxed text-white/80 md:text-base">
            仕入れ条件、価格、MOQ、日本市場への進め方など、海外商品を日本で取り扱うための実務情報をまとめています。商品一覧と登録ページへ進む前の確認にも使えます。
          </p>
        </div>
      </section>

      <div className="border-b border-border bg-surface">
        <div className="mx-auto max-w-3xl px-5 py-12 md:py-16">
          {CLUSTERS.map((cluster) => {
            const articles = listJaBlogArticlesByCluster(cluster.id);
            const extra = listDedicatedJaBlogsByCluster(cluster.id).map(
              (item) => ({
                href: item.path,
                title: item.title,
              }),
            );

            return (
              <section
                key={cluster.id}
                id={cluster.id}
                className="mt-12 first:mt-0 border-t border-border pt-10 first:border-t-0 first:pt-0"
              >
                <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
                  {JA_BLOG_CLUSTER_LABEL[cluster.id]}
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
                  {cluster.lead}
                </p>
                <ul className="mt-6 space-y-3">
                  {extra.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className="text-teal hover:underline">
                        {item.title}
                      </Link>
                    </li>
                  ))}
                  {articles.map((article) => (
                    <li key={article.slug}>
                      <Link
                        href={jaBlogPath(article.slug)}
                        className="text-teal hover:underline"
                      >
                        {article.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              関連ページ
            </h2>
            <ul className="mt-6 space-y-2.5">
              <li>
                <Link href="/cases" className="text-teal hover:underline">
                  商品一覧
                </Link>
              </li>
              <li>
                <Link href="/for-partners" className="text-teal hover:underline">
                  販売パートナーの方へ
                </Link>
              </li>
              <li>
                <Link href="/for-makers" className="text-teal hover:underline">
                  商品提供企業の方へ
                </Link>
              </li>
              <li>
                <Link
                  href="/how-to-sell-in-japan"
                  className="text-teal hover:underline"
                >
                  日本で販売する方法
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
              <li>
                <Link href="/register/maker" className="text-teal hover:underline">
                  メーカー登録
                </Link>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
