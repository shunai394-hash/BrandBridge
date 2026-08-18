import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { getJaBlogArticle } from "@/lib/blog/ja-articles";
import { selfLanguageAlternates } from "@/lib/hreflang";
import {
  jaCategoryCasesHref,
  jaCategoryPath,
  type JaCategoryLanding,
} from "@/lib/ja-categories";
import { getSiteUrl } from "@/lib/site";

type JaCategoryLandingPageProps = {
  category: JaCategoryLanding;
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

export function JaCategoryLandingPage({ category }: JaCategoryLandingPageProps) {
  const siteUrl = getSiteUrl();
  const path = jaCategoryPath(category.slug);
  const casesHref = jaCategoryCasesHref(category.caseCategory);
  const blog = getJaBlogArticle(category.relatedBlogSlug);
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
            item: `${siteUrl}/ja/categories`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: category.label,
            item: `${siteUrl}${path}`,
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
          <p className="text-xs text-muted">
            <Link href="/" className="text-teal hover:underline">
              ホーム
            </Link>
            <span aria-hidden> / </span>
            <Link href="/ja/categories" className="text-teal hover:underline">
              カテゴリー
            </Link>
            <span aria-hidden> / </span>
            {category.label}
          </p>

          <p className="mt-6 text-sm leading-relaxed text-muted md:text-base">
            {category.intro}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href={casesHref} className="w-full sm:w-auto">
              {category.label}の商品を探す
            </Button>
            <Button
              href="/register/partner"
              variant="outline"
              className="w-full sm:w-auto"
            >
              販売パートナーとして登録
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
              BrandBridgeで商品を探す
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              掲載商品では、卸価格、MOQ、販売形式、独占の可否などの取引条件を確認できます。BrandBridgeは商品提供企業と日本の販売パートナーをつなぐ場であり、輸入代行や在庫の買い取りは行いません。最終条件はブランド側との商談で確認します。
            </p>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              {category.label}の掲載商品を見る
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              カテゴリー「{category.caseCategory}」の商品一覧へ進めます。気になる商品があれば、詳細で条件を確認できます。
            </p>
            <div className="mt-6">
              <Button href={casesHref} className="w-full sm:w-auto">
                {category.caseCategory}の商品一覧を見る
              </Button>
            </div>
          </section>

          {blog ? (
            <section className="mt-12 border-t border-border pt-10">
              <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
                関連する日本語ブログ
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
                日本で販売するときの実務解説は、ブログ側で扱っています。仕入れ候補を探す場合はこのページの商品一覧を優先してください。
              </p>
              <p className="mt-4">
                <Link
                  href={`/ja/blog/${blog.slug}`}
                  className="text-teal hover:underline"
                >
                  {blog.title}
                </Link>
              </p>
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
            商品条件を確認したうえで、販売パートナーとして登録できます。登録は無料です。
          </p>
          <div className="mx-auto mt-8 flex w-full max-w-lg flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
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
          </div>
        </div>
      </section>
    </div>
  );
}
