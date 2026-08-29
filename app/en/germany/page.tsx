import type { Metadata } from "next";
import Link from "next/link";
import { blogJapanSrc } from "@/lib/blog/japan-images";

export const metadata: Metadata = {
  title: "How German Brands Can Enter the Japanese Market",
  description:
    "A practical guide for German brands entering Japan: quality positioning, pricing, localisation, distributors, retailers, import requirements, and market testing.",
  alternates: {
    canonical:
      "https://www.brandbridge.jp/en/germany",
  },
};

const sections = [
  {
    title: "Why German Brands Are Looking at Japan",
    paragraphs: [
      "Japan can be an attractive market for German brands in categories where engineering, craftsmanship, reliability, precision, design, and product quality are important to customers.",
      "For many German companies, the challenge is not simply shipping products to Japan. The important step is finding Japanese business partners who understand the category, customer expectations, retail structure, and route to market.",
    ],
  },
  {
    title: "Use Your German Brand Strengths",
    paragraphs: [
      "German brands often have a strong story around engineering, manufacturing standards, technical expertise, craftsmanship, or long-term product quality.",
      "Japanese distributors and retailers need evidence that these strengths create value for their customers.",
      "Present concrete proof such as sales performance, customer reviews, product certifications, awards, specialist expertise, existing retail relationships, and successful sales in European markets.",
      "Do not assume that a reputation for quality in Germany will automatically create demand in Japan. Explain why Japanese customers would value the same product benefits.",
    ],
  },
  {
    title: "Understand Japanese Customer Expectations",
    paragraphs: [
      "Japanese buyers can place significant importance on detailed product information, reliability, presentation, service, and consistency.",
      "Prepare concise information covering the product, target customer, recommended retail price, wholesale price, minimum order quantity, packaging, certifications, shipping conditions, warranty or support arrangements, and existing sales markets.",
      "German technical terminology and marketing claims may also need to be adapted for Japanese customers. Localisation should communicate the product benefit clearly rather than simply translating German or English copy.",
    ],
  },
  {
    title: "Choose the Right Japanese Business Partner",
    paragraphs: [
      "A German brand may need an importer, distributor, specialist wholesaler, retailer, ecommerce partner, or sales agency depending on the category and market-entry strategy.",
      "For technical or specialist products, category expertise can be more important than company size.",
      "Look for partners that already understand your product category and have relationships with the customers and channels you want to reach.",
    ],
  },
  {
    title: "Prepare Technical and Commercial Information",
    paragraphs: [
      "Before approaching Japanese companies, organise product specifications, certifications, manuals, packaging information, warranty details, pricing, minimum order quantities, shipping conditions, and other commercial information.",
      "For technical products, make important specifications easy for a Japanese business buyer to understand and compare.",
      "The Japanese partner may support some local procedures, but the German brand should identify the requirements that need to be confirmed before commercial discussions begin.",
    ],
  },
  {
    title: "Build a Realistic Japan Price",
    paragraphs: [
      "A German wholesale price cannot simply be converted into Japanese yen and used as the final market price.",
      "Work backward from a realistic Japanese retail price and consider freight, import costs, distributor margins, wholesaler margins, retailer margins, taxes, marketing expenses, service requirements, and other market-entry costs.",
      "For premium German products, the price should support the brand's positioning while remaining realistic for the Japanese channel.",
    ],
  },
  {
    title: "Find Japanese Distributors and Specialist Retailers",
    paragraphs: [
      "Avoid approaching Japanese companies with the same generic message.",
      "First define the ideal partner by product category, target customer, sales channel, geographic coverage, specialist expertise, existing retail relationships, ecommerce capabilities, import experience, and experience with European brands.",
      "Then research companies whose current portfolio and customer base make commercial sense for your product.",
    ],
  },
  {
    title: "Start With a Controlled Market Test",
    paragraphs: [
      "A German brand does not necessarily need a nationwide Japanese launch immediately.",
      "A controlled initial order can help both sides evaluate demand, customer response, sell-through, repeat purchases, service requirements, and the economics of the market.",
      "A practical sequence can be: German brand → Japanese partner → initial order → market test → sales data → expansion.",
    ],
  },
  {
    title: "Build the Relationship Before Expanding",
    paragraphs: [
      "Once a Japanese partner shows genuine interest, discuss wholesale pricing, minimum order quantities, territory, sales channels, marketing responsibilities, logistics, payment terms, warranty or after-sales responsibilities, exclusivity, contract period, and sales targets.",
      "Be particularly careful with broad exclusivity. Understand the partner's investment and sales responsibilities before granting exclusive rights for Japan.",
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

export default function GermanBrandsEnteringJapanPage() {
  const siteUrl = "https://www.brandbridge.jp";
  const pageUrl =
    `${siteUrl}/en/germany`;

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
        name: "How German Brands Can Enter the Japanese Market",
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
            GERMAN BRANDS → JAPAN
          </p>

          <h1 className="mt-5 font-[family-name:var(--font-shippori)] text-3xl leading-tight md:text-5xl">
            How German Brands Can Enter the Japanese Market
          </h1>

          <p className="mt-6 text-sm leading-relaxed text-white/80 md:text-base">
            A practical guide for German brands looking for Japanese
            distributors, specialist retailers, wholesalers, importers, and
            ecommerce partners.
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
                    alt="Product presentation and Japanese market adaptation"
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


