import Link from "next/link";
import { BlogImage } from "@/components/blog/BlogImage";
import { Button } from "@/components/ui/Button";
import {
  EXISTING_JA_BLOG,
  JA_BLOG_CLUSTER_LABEL,
  JA_BLOG_HUB,
  getDedicatedJaBlog,
  type JaBlogArticle as JaBlogArticleData,
  type JaBlogCluster,
} from "@/lib/blog/ja-articles/types";
import { getJaBlogArticle } from "@/lib/blog/ja-articles";
import { jsonLdString } from "@/lib/seo-jsonld";
import { getSiteUrl } from "@/lib/site";

type JaBlogArticleProps = {
  article: JaBlogArticleData;
};

type ServiceLink = { href: string; label: string };

function BulletList({ items }: { items: readonly string[] }) {
  return (
    <ul className="mt-4 list-none space-y-2.5">
      {items.map((item) => (
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
  );
}

function clusterServiceLinks(cluster: JaBlogCluster): ServiceLink[] {
  const hub = { href: JA_BLOG_HUB.path, label: JA_BLOG_HUB.label };

  if (cluster === "maker") {
    return [
      hub,
      { href: "/for-makers", label: "商品提供企業の方へ" },
      { href: "/how-to-sell-in-japan", label: "日本で販売する方法" },
    ];
  }

  return [
    hub,
    { href: "/cases", label: "商品一覧" },
    { href: "/ja/categories", label: "カテゴリーから探す" },
    { href: "/for-partners", label: "販売パートナーの方へ" },
  ];
}

function mergeServiceLinks(
  existing: readonly ServiceLink[],
  extras: readonly ServiceLink[],
): ServiceLink[] {
  const seen = new Set(existing.map((link) => link.href));
  const merged = [...existing];

  for (const link of extras) {
    if (!seen.has(link.href)) {
      seen.add(link.href);
      merged.push(link);
    }
  }

  return merged;
}

export function jaBlogPath(slug: string): string {
  return `/ja/blog/${slug}`;
}

export function JaBlogArticle({ article }: JaBlogArticleProps) {
  const siteUrl = getSiteUrl();
  const path = jaBlogPath(article.slug);
  const pageUrl = `${siteUrl}${path}`;
  const related = article.relatedSlugs
    .map((slug) => {
      const dedicated = getDedicatedJaBlog(slug);
      if (dedicated) {
        return { href: dedicated.path, title: dedicated.title };
      }
      if (slug === EXISTING_JA_BLOG.slug) {
        return {
          href: EXISTING_JA_BLOG.path,
          title: EXISTING_JA_BLOG.title,
        };
      }
      const item = getJaBlogArticle(slug);
      return item
        ? { href: jaBlogPath(item.slug), title: item.title }
        : null;
    })
    .filter((item): item is { href: string; title: string } => item !== null);

  const serviceLinks = mergeServiceLinks(
    article.existingLinks,
    clusterServiceLinks(article.cluster),
  );
  const serviceHrefs = new Set(serviceLinks.map((link) => link.href));
  const relatedArticles = related.filter((link) => !serviceHrefs.has(link.href));

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
            item: `${siteUrl}${JA_BLOG_HUB.path}`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: article.title,
            item: pageUrl,
          },
        ],
      },
      {
        "@type": "Article",
        headline: article.title,
        description: article.description,
        inLanguage: "ja",
        mainEntityOfPage: pageUrl,
        url: pageUrl,
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
            {article.eyebrow}
          </p>
          <h1 className="font-display-jp mt-5 text-[1.55rem] leading-[1.3] text-white sm:text-3xl md:text-4xl">
            {article.title}
          </h1>
          <p className="mt-5 text-sm leading-relaxed text-white/80 md:text-base">
            {article.lede}
          </p>
          {article.hero ? (
            <BlogImage
              id={article.hero.id}
              alt={article.hero.alt}
              variant="hero"
              look="onDark"
              priority
            />
          ) : null}
        </div>
      </section>

      <article className="border-b border-border bg-surface">
        <div className="mx-auto max-w-3xl px-5 py-12 md:py-16">
          <p className="text-xs text-muted">
            <Link href={JA_BLOG_HUB.path} className="text-teal hover:underline">
              {JA_BLOG_HUB.label}
            </Link>
            <span aria-hidden> / </span>
            {JA_BLOG_CLUSTER_LABEL[article.cluster]}
          </p>

          <div className="mt-6 space-y-5 text-sm leading-relaxed text-muted md:text-base">
            {article.intro.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          {article.sections.map((section) => (
            <section
              key={section.heading}
              className="mt-12 border-t border-border pt-10"
            >
              <h2 className="font-display-jp text-2xl text-navy md:text-3xl">
                {section.heading}
              </h2>
              {section.image ? (
                <BlogImage id={section.image.id} alt={section.image.alt} />
              ) : null}
              {section.paragraphs.map((paragraph) => (
                <p
                  key={paragraph}
                  className="mt-4 text-sm leading-relaxed text-muted md:text-base"
                >
                  {paragraph}
                </p>
              ))}
              {section.cards ? (
                <ul className="mt-8 grid gap-4">
                  {section.cards.map((card) => (
                    <li
                      key={card.title}
                      className="rounded-xl border border-border bg-background px-5 py-5"
                    >
                      <h3 className="font-display-jp text-lg text-navy">
                        {card.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted md:text-base">
                        {card.body}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : null}
              {section.bullets ? <BulletList items={section.bullets} /> : null}
              {section.callout ? (
                <p className="mt-5 rounded-lg border border-border bg-cream/60 px-5 py-4 text-sm font-medium leading-relaxed text-navy md:text-base">
                  {section.callout}
                </p>
              ) : null}
            </section>
          ))}

          {relatedArticles.length > 0 ? (
            <section className="mt-12 border-t border-border pt-10">
              <h2 className="font-display-jp text-2xl text-navy md:text-3xl">
                関連記事
              </h2>
              <ul className="mt-6 space-y-2.5">
                {relatedArticles.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-teal hover:underline">
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {serviceLinks.length > 0 ? (
            <section className="mt-12 border-t border-border pt-10">
              <h2 className="font-display-jp text-2xl text-navy md:text-3xl">
                関連ページ
              </h2>
              <ul className="mt-6 space-y-2.5">
                {serviceLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-teal hover:underline">
                      {link.label}
                    </Link>
                  </li>
                ))}
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
          <h2 className="font-display-jp text-2xl leading-snug md:text-3xl">
            {article.cta.heading}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/75 md:text-base">
            {article.cta.body}
          </p>
          <div className="mx-auto mt-8 flex w-full max-w-lg flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
            <Button
              href={article.cta.primary.href}
              className="w-full py-3.5 text-base sm:w-auto sm:min-w-[200px]"
            >
              {article.cta.primary.label}
            </Button>
            {article.cta.secondary ? (
              <Button
                href={article.cta.secondary.href}
                variant="outline"
                className="w-full border-white/40 py-3.5 text-base text-white hover:border-white hover:bg-white/10 hover:text-white sm:w-auto sm:min-w-[180px]"
              >
                {article.cta.secondary.label}
              </Button>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
