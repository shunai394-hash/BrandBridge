import type { Metadata } from "next";
import Link from "next/link";
import { blogJapanSrc } from "@/lib/blog/japan-images";

export const metadata: Metadata = {
  title: "How UK Brands Can Enter the Japanese Market",
  description:
    "A practical guide for UK brands entering Japan: pricing, localisation, import requirements, Japanese distributors, retailers, and market testing.",
  alternates: {
    canonical:
      "https://www.brandbridge.jp/en/uk",
  },
};

const sections = [
  {
    title: "Why UK Brands Are Looking at Japan",
    paragraphs: [
      "Japan offers UK brands a sophisticated consumer market with strong interest in quality, design, heritage, food, beauty, wellness, fashion, lifestyle, and specialist products.",
      "For many UK brands, entering Japan is not simply an export exercise. The key is finding Japanese business partners who understand the local customer, retail environment, pricing structure, and sales channels.",
    ],
  },
  {
    title: "Use Your UK Market Track Record",
    paragraphs: [
      "Japanese distributors and retailers need clear evidence that a UK brand has commercial potential.",
      "Present information that is easy to evaluate, such as sales performance, customer reviews, repeat purchases, retail presence, awards, press coverage, social media traction, and performance across relevant UK channels.",
      "A successful UK product will not automatically succeed in Japan. Explain which parts of your UK brand story, customer appeal, and product positioning can translate to Japanese consumers.",
    ],
  },
  {
    title: "Understand Japanese Buyer Expectations",
    paragraphs: [
      "Japanese business buyers generally need concise and reliable product information before considering a new overseas brand.",
      "Prepare information covering the product, target customer, recommended retail price, wholesale price, minimum order quantity, packaging, certifications, shipping conditions, and existing markets.",
      "UK terminology, claims, packaging, and promotional messages may also need adjustment for Japan. Localisation should go beyond translating English copy word-for-word.",
    ],
  },
  {
    title: "Choose the Right Japanese Business Partner",
    paragraphs: [
      "A UK brand may need an importer, distributor, wholesaler, retailer, ecommerce partner, or sales agency depending on its product and market-entry strategy.",
      "A large Japanese company is not automatically the best choice. A smaller partner with strong relationships in your product category may provide better access to the customers and channels that matter.",
    ],
  },
  {
    title: "Prepare Your Product for Japan",
    paragraphs: [
      "Before approaching Japanese companies, review product information, packaging, labelling, instructions, certifications, and other requirements that may apply to your category.",
      "The Japanese partner may support some local procedures, but the UK brand should understand the key requirements before commercial discussions begin.",
      "For the broader process, see our guide to how to sell in Japan.",
    ],
  },
  {
    title: "Build a Realistic Japan Price",
    paragraphs: [
      "A product that performs well in the UK may require a different price structure in Japan.",
      "Work backward from a realistic Japanese retail price and consider import costs, logistics, distributor margins, wholesaler margins, retailer margins, taxes, marketing expenses, and other market-entry costs.",
      "Do not simply use your UK wholesale price. Check whether the resulting Japanese retail price is competitive and commercially realistic.",
    ],
  },
  {
    title: "Find Japanese Distributors and Retailers",
    paragraphs: [
      "Avoid sending the same generic introduction to large numbers of Japanese companies.",
      "First define the ideal partner by product category, target customer, preferred channels, geographic coverage, retailer relationships, ecommerce capabilities, import experience, and experience working with UK or other overseas brands.",
      "Then research companies whose existing portfolio and sales channels make commercial sense for your product.",
    ],
  },
  {
    title: "Start With a Small Market Test",
    paragraphs: [
      "A UK brand does not necessarily need a nationwide Japanese launch immediately.",
      "A controlled initial order can help both sides evaluate customer response, sell-through, repeat purchases, operational requirements, and the economics of the market before expanding.",
      "A practical sequence can be: UK brand → Japanese partner → initial order → market test → sales data → expansion.",
    ],
  },
  {
    title: "Build the Relationship Before Expanding",
    paragraphs: [
      "Once a Japanese partner shows genuine interest, discuss wholesale pricing, minimum order quantities, territory, sales channels, marketing responsibilities, shipping, payment terms, exclusivity, contract period, and sales targets.",
      "Be particularly careful with broad exclusivity. Understand the partner's expected investment and sales responsibilities before granting exclusive rights for Japan.",
    ],
  },
];

function BlogImage({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  return (
    <div className="mt-6 overflow-hidden rounded-xl">
      <img
        src={src}
        alt={alt}
        className="h-auto w-full object-cover"
        loading="lazy"
      />
    </div>
  );
}

export default function UKBrandsEnteringJapanPage() {
  const siteUrl = "https://www.brandbridge.jp";
  const pageUrl =
    `${siteUrl}/en/uk`;

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
        name: "How UK Brands Can Enter the Japanese Market",
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
            UK BRANDS → JAPAN
          </p>

          <h1 className="mt-5 font-[family-name:var(--font-shippori)] text-3xl leading-tight md:text-5xl">
            How UK Brands Can Enter the Japanese Market
          </h1>

          <p className="mt-6 text-sm leading-relaxed text-white/80 md:text-base">
            A practical guide for UK brands looking for Japanese distributors,
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





