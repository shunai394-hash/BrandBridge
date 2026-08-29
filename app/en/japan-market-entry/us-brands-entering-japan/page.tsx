import type { Metadata } from "next";
import Link from "next/link";
import { blogJapanSrc } from "@/lib/blog/japan-images";

export const metadata: Metadata = {
  title: "How US Brands Can Enter the Japanese Market",
  description:
    "A practical guide for US brands entering Japan: pricing, localization, import requirements, Japanese distributors, retailers, and small market tests.",
  alternates: {
    canonical:
      "https://www.brandbridge.jp/en/japan-market-entry/us-brands-entering-japan",
  },
};

const sections = [
  {
    title: "Why US Brands Are Looking at Japan",
    paragraphs: [
      "Japan offers US brands a sophisticated consumer market with strong demand for distinctive products, quality, design, wellness, food, beauty, lifestyle, and specialty goods.",
      "For many US brands, the opportunity is not simply to export products. The larger opportunity is to find the right Japanese business partners who understand the local customer, retail structure, and sales channels.",
    ],
  },
  {
    title: "Use Your US Market Track Record",
    paragraphs: [
      "Japanese distributors and retailers need to understand why a US brand is commercially credible.",
      "Show evidence that is easy to evaluate: current sales performance, customer reviews, repeat purchases, retail presence, awards, media coverage, social traction, and performance in relevant US channels.",
      "Do not assume that a successful US product will automatically succeed in Japan. Explain which parts of the US success story can translate to Japanese customers.",
    ],
  },
  {
    title: "Understand Japanese Buyer Expectations",
    paragraphs: [
      "Japanese business buyers often need clear product information before discussing distribution.",
      "Prepare concise information about the product, target customer, retail price, wholesale price, minimum order quantity, packaging, certifications, shipping conditions, and existing sales markets.",
      "US marketing language may also need to be adapted. Claims, product descriptions, packaging, and promotional messages should be reviewed for the Japanese market rather than translated word-for-word.",
    ],
  },
  {
    title: "Choose the Right Japanese Business Partner",
    paragraphs: [
      "A US brand may need an importer, distributor, wholesaler, retailer, ecommerce partner, or sales agency depending on its market-entry strategy.",
      "The largest company is not necessarily the best partner. A smaller company with strong relationships in your category may create more value than a large company with little interest in your product.",
    ],
  },
  {
    title: "Prepare Your Product for Japan",
    paragraphs: [
      "Before approaching Japanese companies, review product information, packaging, labeling, instructions, certifications, and other market-specific requirements.",
      "The Japanese partner may help with some local requirements, but the US brand should understand what needs to be confirmed before commercial discussions begin.",
      "For the broader process, see our guide to how to sell in Japan.",
    ],
  },
  {
    title: "Build a Realistic Japan Price",
    paragraphs: [
      "A product that sells successfully in the United States may need a different price structure in Japan.",
      "Work backward from the expected Japanese retail price and account for import costs, logistics, distributor margins, wholesaler margins, retailer margins, taxes, marketing costs, and other market-entry expenses.",
      "Do not quote a US wholesale price without checking whether the resulting Japanese retail price is commercially realistic.",
    ],
  },
  {
    title: "Find Japanese Distributors and Retailers",
    paragraphs: [
      "Avoid sending the same generic message to hundreds of companies.",
      "First define the ideal partner: product category, target customer, preferred channels, geographic coverage, retailer relationships, ecommerce capabilities, import experience, and experience with overseas brands.",
      "Then research companies whose existing portfolio and sales channels make commercial sense for your product.",
    ],
  },
  {
    title: "Start With a Small Market Test",
    paragraphs: [
      "A US brand does not necessarily need a nationwide launch on day one.",
      "A controlled initial order can help both sides evaluate demand, customer response, sell-through, repeat purchases, and operational requirements before committing to a larger rollout.",
      "A practical sequence can be: US brand → Japanese partner → initial order → market test → sales data → expansion.",
    ],
  },
  {
    title: "Build the Relationship Before Expanding",
    paragraphs: [
      "Once a Japanese partner shows interest, discuss wholesale pricing, minimum order quantities, territory, sales channels, marketing responsibilities, shipping, payment terms, exclusivity, contract period, and sales targets.",
      "Be especially careful with broad exclusivity. Understand the partner's expected investment and sales responsibilities before granting exclusive rights.",
    ],
  },
];

function BlogImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="mt-8 overflow-hidden rounded-xl border border-border">
      <img
        src={src}
        alt={alt}
        className="h-auto w-full object-cover"
        loading="lazy"
      />
    </div>
  );
}

export default function USBrandsEnteringJapanPage() {
  const siteUrl = "https://www.brandbridge.jp";
  const pageUrl =
    `${siteUrl}/en/japan-market-entry/us-brands-entering-japan`;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
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
        name: "Japan Market Entry",
        item: `${siteUrl}/en/japan-market-entry`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "How US Brands Can Enter the Japanese Market",
        item: pageUrl,
      },
    ],
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd),
        }}
      />

      <section className="bg-navy-deep text-white">
        <div className="mx-auto max-w-3xl px-5 py-16 md:py-20">
          <p className="text-xs font-medium tracking-wider text-teal">
            US BRANDS → JAPAN
          </p>

          <h1 className="mt-5 font-[family-name:var(--font-shippori)] text-3xl leading-tight md:text-5xl">
            How US Brands Can Enter the Japanese Market
          </h1>

          <p className="mt-6 text-sm leading-relaxed text-white/80 md:text-base">
            A practical guide for US brands looking for Japanese distributors,
            retailers, wholesalers, importers, and ecommerce partners.
          </p>

          <p className="mt-6">
            <Link
              href="/en/japan-market-entry"
              className="text-sm text-teal hover:underline"
            >
              ← Back to Japan Market Entry
            </Link>
          </p>
        </div>
      </section>

      <article className="border-b border-border bg-surface">
        <div className="mx-auto max-w-3xl px-5 py-12 md:py-16">
          <div className="space-y-12">
            {sections.map((section, index) => (
              <section
                key={section.title}
                className="border-t border-border pt-10"
              >
                <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
                  {index + 1}. {section.title}
                </h2>

                <div className="mt-5 space-y-4 text-sm leading-relaxed text-muted md:text-base">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>

                {index === 0 && (
                  <BlogImage
                    src={blogJapanSrc("citySkyline")}
                    alt="Tokyo skyline and the Japanese market"
                  />
                )}

                {index === 1 && (
                  <BlogImage
                    src={blogJapanSrc("consultant")}
                    alt="Business consultation for entering the Japanese market"
                  />
                )}

                {index === 2 && (
                  <BlogImage
                    src={blogJapanSrc("shoppingStreet")}
                    alt="Japanese shopping street and local consumer market"
                  />
                )}

                {index === 3 && (
                  <BlogImage
                    src={blogJapanSrc("handshake")}
                    alt="Business partnership with a Japanese company"
                  />
                )}

                {index === 4 && (
                  <BlogImage
                    src={blogJapanSrc("kimono")}
                    alt="Japanese culture and local market adaptation"
                  />
                )}

                {index === 5 && (
                  <BlogImage
                    src={blogJapanSrc("analytics")}
                    alt="Market analysis and pricing research"
                  />
                )}

                {index === 6 && (
                  <BlogImage
                    src={blogJapanSrc("akihabara")}
                    alt="Japanese retail and ecommerce channels"
                  />
                )}

                {index === 7 && (
                  <BlogImage
                    src={blogJapanSrc("souvenirShop")}
                    alt="Testing products through Japanese retail channels"
                  />
                )}

                {index === 8 && (
                  <BlogImage
                    src={blogJapanSrc("templeLantern")}
                    alt="Building long-term business relationships in Japan"
                  />
                )}
              </section>
            ))}

            <section className="border-t border-border pt-10">
              <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
                Useful BrandBridge Guides
              </h2>

              <div className="mt-5 space-y-3 text-sm leading-relaxed md:text-base">
                <p>
                  <Link
                    href="/en/japan-market-entry/how-to-find-japanese-distributors"
                    className="text-teal hover:underline"
                  >
                    How to Find Japanese Distributors
                  </Link>
                </p>

                <p>
                  <Link
                    href="/en/japan-market-entry/how-to-find-japanese-retailers"
                    className="text-teal hover:underline"
                  >
                    How to Find Japanese Retailers
                  </Link>
                </p>

                <p>
                  <Link
                    href="/en/japan-market-entry/how-to-find-a-japanese-distributor"
                    className="text-teal hover:underline"
                  >
                    How to Evaluate a Japanese Distributor
                  </Link>
                </p>

                <p>
                  <Link
                    href="/en/how-to-sell-in-japan"
                    className="text-teal hover:underline"
                  >
                    How to Sell in Japan
                  </Link>
                </p>
              </div>
            </section>
          </div>
        </div>
      </article>

      <section className="bg-navy-deep text-white">
        <div className="mx-auto max-w-3xl px-5 py-14 text-center md:py-16">
          <h2 className="font-[family-name:var(--font-shippori)] text-2xl md:text-3xl">
            Find Japanese Business Partners
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/75 md:text-base">
            Explore potential Japanese distributors, wholesalers, retailers,
            and ecommerce partners through BrandBridge.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/en/japan-market-entry"
              className="rounded-lg border border-white/40 px-6 py-3 text-sm hover:bg-white/10"
            >
              Explore Japan Market Entry
            </Link>

            <Link
              href="/en/register/maker"
              className="rounded-lg bg-teal px-6 py-3 text-sm text-white hover:opacity-90"
            >
              List Your Brand
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

