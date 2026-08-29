import type { Metadata } from "next";
import Link from "next/link";
import { jaBlogPath } from "@/components/blog/JaBlogArticle";
import {
  listJaBlogArticlesByCluster,
} from "@/lib/blog/ja-articles";
import {
  JA_BLOG_CLUSTER_LABEL,
  JA_BLOG_HUB,
  listDedicatedJaBlogsByCluster,
  type JaBlogCluster,
} from "@/lib/blog/ja-articles/types";
import { listJaCategories, jaCategoryPath } from "@/lib/ja-categories";
import { EN_BLOG_HUB } from "@/lib/blog/en-articles/types";
import { jsonLdString } from "@/lib/seo-jsonld";
import { getSiteUrl } from "@/lib/site";
import { pairedLanguageAlternates } from "@/lib/hreflang";

export const dynamic = "force-static";

const PATH = JA_BLOG_HUB.path;
const TITLE = "海外ブランドを仕入れたい日本企業向けガイド";
const DESCRIPTION =
  "海外ブランド・海外商品を仕入れたい日本の卸・小売・EC向けガイド。仕入れ先の探し方、卸取引、代理店の進め方と、海外メーカー向けの日本進出記事をまとめます。";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  ...pairedLanguageAlternates(PATH, EN_BLOG_HUB.path, "ja"),
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
    lead: "海外商品の仕入れ先、卸、代理店の権限、取引前の確認項目など、日本の卸・小売・EC・バイヤー向けのガイドです。",
  },
  {
    id: "maker",
    lead: "日本の販売代理店・卸先の探し方、卸価格、独占、問い合わせ文面など、海外ブランド向けのガイドです。",
  },
  {
    id: "category",
    lead: "コスメ、食品、サプリ、アパレル、ホームなど、カテゴリーごとの確認ポイントです。仕入れ候補はカテゴリーページから探せます。",
  },
];

export default function JapaneseBlogHubPage() {
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
            name: JA_BLOG_HUB.label,
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
        dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
      />

      <section className="relative overflow-hidden bg-navy-deep text-white">
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_30%,rgba(26,138,138,0.35),transparent_55%),radial-gradient(ellipse_at_80%_70%,rgba(20,111,111,0.25),transparent_50%)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl px-5 py-14 md:py-20">
          <p className="text-xs font-medium tracking-wider text-teal">
            {JA_BLOG_HUB.label}
          </p>
          <h1 className="font-display-jp mt-5 text-[1.55rem] leading-[1.3] text-white sm:text-3xl md:text-4xl">
            海外ブランドを仕入れたい日本企業向けガイド
          </h1>
          <p className="mt-5 text-sm leading-relaxed text-white/80 md:text-base">
            海外ブランドの仕入れルート、卸条件、カテゴリー別の確認ポイントをまとめました。海外ブランド側の日本進出記事は日本市場ガイドからも探せます。
          </p>
          <nav
            aria-label="記事の分類"
            className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-sm"
          >
            {CLUSTERS.map((cluster) => (
              <a
                key={cluster.id}
                href={`#${cluster.id}`}
                className="text-teal hover:underline"
              >
                {JA_BLOG_CLUSTER_LABEL[cluster.id]}
              </a>
            ))}
          </nav>
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
                <h2 className="font-display-jp text-2xl text-navy md:text-3xl">
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
                {cluster.id === "category" ? (
                  <div className="mt-8">
                    <h3 className="font-display-jp text-lg text-navy">
                      カテゴリーから商品を探す
                    </h3>
                    <ul className="mt-4 space-y-2.5">
                      <li>
                        <Link
                          href="/ja/categories"
                          className="text-teal hover:underline"
                        >
                          カテゴリー一覧
                        </Link>
                      </li>
                      {categories.map((item) => (
                        <li key={item.slug}>
                          <Link
                            href={jaCategoryPath(item.slug)}
                            className="text-teal hover:underline"
                          >
                            {item.title.split("｜")[0]}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </section>
            );
          })}

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-display-jp text-2xl text-navy md:text-3xl">
              関連ページ
            </h2>
            <ul className="mt-6 space-y-2.5">
              <li>
                <Link
                  href="/ja/japan-market-guide"
                  className="text-teal hover:underline"
                >
                  日本市場ガイド（海外ブランド向け）
                </Link>
              </li>
              <li>
                <Link href="/cases" className="text-teal hover:underline">
                  商品一覧
                </Link>
              </li>
              <li>
                <Link href="/ja/categories" className="text-teal hover:underline">
                  カテゴリーから探す
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
