import type { Metadata } from "next";
import Link from "next/link";
import { getEnBlogArticle } from "@/lib/blog/en-articles";
import {
  EN_BLOG_HUB,
  EN_BLOG_INTENT_GROUPS,
  enBlogPath,
} from "@/lib/blog/en-articles/types";
import { JA_BLOG_HUB } from "@/lib/blog/ja-articles/types";
import { jsonLdString } from "@/lib/seo-jsonld";
import { getSiteUrl } from "@/lib/site";
import { pairedLanguageAlternates } from "@/lib/hreflang";

export const dynamic = "force-static";

const PATH = EN_BLOG_HUB.path;
const TITLE = "Japan Market Entry Blog for Overseas Brands";
const DESCRIPTION =
  "English guides for overseas brands: Japan market entry, Japanese distributors, retail partners, import requirements, costs, and MOQ.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  ...pairedLanguageAlternates(JA_BLOG_HUB.path, PATH, "en"),
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PATH,
    locale: "en_US",
    type: "website",
  },
};

export default function EnglishBlogHubPage() {
  const siteUrl = getSiteUrl();
  const groups = EN_BLOG_INTENT_GROUPS.map((group) => ({
    heading: group.heading,
    articles: group.slugs
      .map((slug) => getEnBlogArticle(slug))
      .filter((article): article is NonNullable<typeof article> =>
        Boolean(article),
      ),
  }));
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: `${siteUrl}/en`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: EN_BLOG_HUB.label,
            item: `${siteUrl}${PATH}`,
          },
        ],
      },
      {
        "@type": "CollectionPage",
        name: TITLE,
        description: DESCRIPTION,
        inLanguage: "en",
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
            {EN_BLOG_HUB.label}
          </p>
          <h1 className="mt-5 font-[family-name:var(--font-shippori)] text-[1.55rem] leading-[1.3] text-white sm:text-3xl md:text-4xl">
            Japan market entry guides for overseas brands
          </h1>
          <p className="mt-5 text-sm leading-relaxed text-white/80 md:text-base">
            Practical English articles on Japan market entry, Japanese
            distributors, retail partners, import requirements, costs, and MOQ.
          </p>
        </div>
      </section>

      <div className="border-b border-border bg-surface">
        <div className="mx-auto max-w-3xl px-5 py-12 md:py-16">
          {groups.map((group) => (
            <section key={group.heading} className="mb-10 last:mb-0">
              <h2 className="font-[family-name:var(--font-shippori)] text-xl text-navy md:text-2xl">
                {group.heading}
              </h2>
              <ul className="mt-4 space-y-3">
                {group.articles.map((article) => (
                  <li key={article.slug}>
                    <Link
                      href={enBlogPath(article.slug)}
                      className="group flex flex-col rounded-lg border border-border bg-white px-5 py-6 transition hover:border-teal/40"
                    >
                      <span className="font-[family-name:var(--font-shippori)] text-lg text-navy group-hover:text-teal">
                        {article.title}
                      </span>
                      <span className="mt-2 text-sm leading-relaxed text-muted">
                        {article.description}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              Related pages
            </h2>
            <ul className="mt-6 space-y-2.5">
              <li>
                <Link
                  href="/en/japan-market-entry"
                  className="text-teal hover:underline"
                >
                  Japan Market Entry hub
                </Link>
              </li>
              <li>
                <Link
                  href="/en/how-to-sell-in-japan"
                  className="text-teal hover:underline"
                >
                  How to Sell in Japan
                </Link>
              </li>
              <li>
                <Link href="/en/cases" className="text-teal hover:underline">
                  Japan expansion opportunities
                </Link>
              </li>
              <li>
                <Link
                  href="/en/register/maker"
                  className="text-teal hover:underline"
                >
                  List your brand
                </Link>
              </li>
              <li>
                <Link href="/en/contact" className="text-teal hover:underline">
                  Contact
                </Link>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
