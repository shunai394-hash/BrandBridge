import Link from "next/link";
import { WholesalePriceRange } from "@/components/cases/WholesalePriceRange";
import { PageBreadcrumbs } from "@/components/seo/PageBreadcrumbs";
import { Button } from "@/components/ui/Button";
import { getJaBlogArticle } from "@/lib/blog/ja-articles";
import { getDedicatedJaBlog } from "@/lib/blog/ja-articles/types";
import { selfLanguageAlternates } from "@/lib/hreflang";
import {
  jaCategoryCasesHref,
  jaCategoryPath,
  listJaCategories,
  type JaCategoryLanding,
  type JaCategoryProductCard,
} from "@/lib/ja-categories";
import { displayMoqJa } from "@/lib/price-display";
import { jsonLdString } from "@/lib/seo-jsonld";
import { getSiteUrl } from "@/lib/site";

function relatedCategoryLinks(slugs: readonly string[]) {
  return slugs
    .map((slug) => {
      const dedicated = getDedicatedJaBlog(slug);
      if (dedicated) {
        return { href: dedicated.path, title: dedicated.title };
      }
      const item = getJaBlogArticle(slug);
      return item
        ? { href: `/ja/blog/${item.slug}`, title: item.title }
        : null;
    })
    .filter((item): item is { href: string; title: string } => item !== null);
}

type JaCategoryLandingPageProps = {
  category: JaCategoryLanding;
  products?: readonly JaCategoryProductCard[];
};

export function jaCategoryMetadata(category: JaCategoryLanding) {
  const path = jaCategoryPath(category.slug);
  return {
    title: category.title,
    description: category.description,
    ...selfLanguageAlternates(path, "ja"),
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: category.title,
      description: category.description,
      url: path,
      locale: "ja_JP",
      type: "website" as const,
    },
  };
}

export function JaCategoryLandingPage({
  category,
  products = [],
}: JaCategoryLandingPageProps) {
  const siteUrl = getSiteUrl();
  const path = jaCategoryPath(category.slug);
  const casesHref = jaCategoryCasesHref(category.caseCategory);
  const relatedBlogs = relatedCategoryLinks(category.relatedBlogSlugs);
  const siblingCategories = listJaCategories().filter(
    (item) => item.slug !== category.slug,
  );
  const footerCasesFirst = category.cta.footerPrimary === "cases";
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: category.title,
        description: category.description,
        inLanguage: "ja",
        url: `${siteUrl}${path}`,
        isPartOf: {
          "@type": "CollectionPage",
          name: "カテゴリー",
          url: `${siteUrl}/ja/categories`,
        },
        mainEntity:
          products.length > 0
            ? {
                "@type": "ItemList",
                numberOfItems: products.length,
                itemListElement: products.map((item, index) => ({
                  "@type": "ListItem",
                  position: index + 1,
                  url: `${siteUrl}/cases/${item.id}`,
                  name: item.productName,
                })),
              }
            : undefined,
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
            {category.label}｜販売パートナー向け
          </p>
          <h1 className="mt-5 font-[family-name:var(--font-shippori)] text-[1.55rem] leading-[1.3] text-white sm:text-3xl md:text-4xl">
            {category.h1}
          </h1>
          <p className="mt-5 text-sm leading-relaxed text-white/80 md:text-base">
            {category.lede}
          </p>
        </div>
      </section>

      <article className="border-b border-border bg-surface">
        <div className="mx-auto max-w-3xl px-5 py-12 md:py-16">
          <PageBreadcrumbs
            items={[
              { name: "ホーム", path: "/" },
              { name: "カテゴリー", path: "/ja/categories" },
              { name: category.label },
            ]}
            className="mb-0"
          />

          <div className="mt-6 space-y-5 text-sm leading-relaxed text-muted md:text-base">
            {category.intro.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href={casesHref} className="w-full sm:w-auto">
              {category.cta.introPrimaryLabel}
            </Button>
            <Button
              href={category.cta.introSecondary.href}
              variant="outline"
              className="w-full sm:w-auto"
            >
              {category.cta.introSecondary.label}
            </Button>
          </div>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              {category.checkHeading}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              価格の安さだけで決めず、自社の販路で売り切れる数量かを先に見ます。制度や表示の要否は商品ごとに異なるため、該当しそうな場合は専門家や公的情報で確認してください。
            </p>
            <ul className="mt-6 space-y-2.5">
              {category.checks.map((item) => (
                <li
                  key={item}
                  className="flex gap-2.5 text-sm leading-relaxed text-muted md:text-base"
                >
                  <span
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal"
                    aria-hidden
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              {category.compareHeading}
            </h2>
            <ul className="mt-6 space-y-2.5">
              {category.compare.map((item) => (
                <li
                  key={item}
                  className="flex gap-2.5 text-sm leading-relaxed text-muted md:text-base"
                >
                  <span
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal"
                    aria-hidden
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              {category.listingHeading}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              {category.listingLead}{" "}
              全件は
              <Link href={casesHref} className="text-teal hover:underline">
                商品一覧
              </Link>
              からも探せます。
            </p>
            {products.length > 0 ? (
              <ul className="mt-6 divide-y divide-border rounded-xl border border-border bg-background">
                {products.map((item) => (
                  <li key={item.id} className="px-5 py-4">
                    <Link
                      href={`/cases/${item.id}`}
                      className="font-[family-name:var(--font-shippori)] text-lg text-navy hover:text-teal"
                    >
                      {item.productName}
                    </Link>
                    {item.brandName ? (
                      <p className="mt-1 text-xs text-teal">{item.brandName}</p>
                    ) : null}
                    <div className="mt-2 text-sm text-muted">
                      <span className="block sm:inline">
                        参考卸価格帯:{" "}
                        <WholesalePriceRange
                          priceBand={item.priceBand}
                          locale="ja"
                        />
                      </span>
                      <span className="mt-1 block sm:mt-0 sm:inline">
                        <span className="mx-2 hidden text-border sm:inline" aria-hidden>
                          /
                        </span>
                        MOQ: {displayMoqJa(item.minOrder)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-6 text-sm leading-relaxed text-muted md:text-base">
                このカテゴリーの公開商品は、現在商品一覧から確認できます。条件を見て問い合わせへ進めます。
              </p>
            )}
            <div className="mt-6">
              <Button href={casesHref} className="w-full sm:w-auto">
                {category.cta.productListLabel}
              </Button>
            </div>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              BrandBridgeで商品を探す
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              掲載商品では、卸価格、MOQ、販売形式、独占の可否などの取引条件を確認できます。BrandBridgeは商品提供企業と日本の販売パートナーをつなぐ場であり、輸入代行や在庫の買い取りは行いません。最終条件はブランド側との商談で確認します。
            </p>
          </section>

          {relatedBlogs.length > 0 ? (
            <section className="mt-12 border-t border-border pt-10">
              <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
                関連する日本語ガイド
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
                仕入れの進め方や注意点は、次のガイドでも確認できます。候補を探す場合はこのページの掲載商品を優先してください。
              </p>
              <ul className="mt-4 space-y-2">
                {relatedBlogs.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-teal hover:underline">
                      {item.title}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/ja/blog" className="text-teal hover:underline">
                    日本語ブログ
                  </Link>
                </li>
              </ul>
            </section>
          ) : null}

          {siblingCategories.length > 0 ? (
            <section className="mt-12 border-t border-border pt-10">
              <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
                他のカテゴリー
              </h2>
              <ul className="mt-4 space-y-2">
                {siblingCategories.map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={jaCategoryPath(item.slug)}
                      className="text-teal hover:underline"
                    >
                      {item.label}（{item.caseCategory}）
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/ja/categories"
                    className="text-teal hover:underline"
                  >
                    カテゴリー一覧
                  </Link>
                </li>
              </ul>
            </section>
          ) : null}
        </div>
      </article>

      <section className="relative overflow-hidden bg-navy-deep text-white">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 20% 50%, rgba(26,138,138,0.55), transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(20,111,111,0.35), transparent 50%)",
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl px-5 py-14 text-center md:py-16">
          <h2 className="font-[family-name:var(--font-shippori)] text-2xl leading-snug md:text-3xl">
            取り扱いを進めるなら
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/75 md:text-base">
            {footerCasesFirst
              ? "商品条件を確認したうえで、商品一覧から問い合わせできます。販売パートナー登録は補助として利用できます。"
              : "商品条件を確認したうえで、販売パートナーとして登録できます。登録は無料です。"}
          </p>
          <div className="mx-auto mt-8 flex w-full max-w-lg flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
            {footerCasesFirst ? (
              <>
                <Button
                  href={casesHref}
                  className="w-full py-3.5 text-base sm:w-auto sm:min-w-[200px]"
                >
                  商品一覧を見る
                </Button>
                <Button
                  href="/register/partner"
                  variant="outline"
                  className="w-full border-white/40 py-3.5 text-base text-white hover:border-white hover:bg-white/10 hover:text-white sm:w-auto"
                >
                  販売パートナーとして登録する
                </Button>
              </>
            ) : (
              <>
                <Button
                  href="/register/partner"
                  className="w-full py-3.5 text-base sm:w-auto sm:min-w-[200px]"
                >
                  販売パートナーとして登録する
                </Button>
                <Button
                  href={casesHref}
                  variant="outline"
                  className="w-full border-white/40 py-3.5 text-base text-white hover:border-white hover:bg-white/10 hover:text-white sm:w-auto"
                >
                  商品一覧を見る
                </Button>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
