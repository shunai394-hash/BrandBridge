import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "How to Enter the Japanese Market: A Practical Guide for Overseas Brands",
  description:
    "A practical guide for overseas brands entering Japan—market research, sales channels, commercial preparation, partner fit, and business conditions.",
  alternates: {
    canonical: "/en/japan-market-entry/how-to-enter-the-japanese-market",
  },
};

const marketConsiderations = [
  "Who are your potential customers in Japan?",
  "Which companies already sell similar products?",
  "What price range is appropriate for the Japanese market?",
  "Which sales channels are suitable for your product?",
  "Are there any product-specific regulations or import requirements?",
] as const;

const channels = [
  {
    title: "Distributors",
    body: "Distributors can help introduce products to multiple retailers, wholesalers, or other sales channels.",
  },
  {
    title: "Wholesalers",
    body: "Wholesalers can be useful when your goal is to reach Japanese retailers or other businesses through established distribution networks.",
  },
  {
    title: "Retailers",
    body: "For products with a clear consumer target, working directly with retailers may be appropriate.",
  },
  {
    title: "E-commerce Businesses",
    body: "Online sales partners can provide an opportunity to test demand and reach Japanese consumers without immediately building a large physical retail network.",
  },
  {
    title: "Importers",
    body: "For overseas companies unfamiliar with Japanese import procedures, an experienced importer can provide valuable support.",
  },
] as const;

const commercialItems = [
  "Product specifications",
  "Wholesale pricing",
  "Minimum order quantity (MOQ)",
  "Shipping conditions",
  "Payment terms",
  "Available certifications",
  "Packaging information",
  "Product images and marketing materials",
  "Distribution or territory conditions",
  "Exclusivity options, if available",
] as const;

const partnerFit = [
  "Does the company already sell products in your category?",
  "Does it have access to your target customers?",
  "Does it operate through the sales channels you need?",
  "Does its existing product portfolio complement your brand?",
  "Can it handle your expected order volume?",
  "Does it have experience working with overseas companies?",
] as const;

const businessConditions = [
  "Wholesale price",
  "MOQ",
  "Shipping and delivery",
  "Payment terms",
  "Territory",
  "Sales channels",
  "Marketing responsibilities",
  "Exclusivity",
  "Contract period",
  "Product registration or regulatory responsibilities",
] as const;

function BulletList({ items }: { items: readonly string[] }) {
  return (
    <ul className="mt-4 list-none space-y-2.5">
      {items.map((item) => (
        <li
          key={item}
          className="flex gap-2.5 text-sm leading-relaxed text-muted md:text-base"
        >
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" aria-hidden />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function HowToEnterTheJapaneseMarketArticlePage() {
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/en/japan-market-entry/how-to-enter-the-japanese-market`;

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
        name: "Practical Guide for Overseas Brands",
        item: pageUrl,
      },
    ],
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd),
        }}
      />

      <section className="relative overflow-hidden bg-navy-deep text-white">
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_30%,rgba(26,138,138,0.35),transparent_55%),radial-gradient(ellipse_at_80%_70%,rgba(20,111,111,0.25),transparent_50%)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl px-5 py-14 md:py-20">
          <p className="text-xs font-medium tracking-wider text-teal">
            JAPAN MARKET ENTRY GUIDE
          </p>
          <h1 className="mt-5 font-[family-name:var(--font-shippori)] text-[1.55rem] leading-[1.3] text-white sm:text-3xl md:text-4xl">
            How to Enter the Japanese Market: A Practical Guide for Overseas
            Brands
          </h1>
          <p className="mt-5 text-sm leading-relaxed text-white/80 md:text-base">
            Main steps overseas brands should consider before entering Japan.
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
          <div className="space-y-5 text-sm leading-relaxed text-muted md:text-base">
            <p>
              Japan is one of the world&apos;s largest consumer markets, but
              entering it successfully requires more than simply finding a
              company to sell your products.
            </p>
            <p>
              Overseas brands need to understand how the Japanese market works,
              choose the right sales channel, and find business partners that fit
              their products and target customers.
            </p>
            <p>
              This guide explains the main steps to consider before entering
              Japan.
            </p>
          </div>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              1. Understand the Japanese Market
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              Before approaching Japanese companies, start by understanding
              whether there is a real opportunity for your product.
            </p>
            <p className="mt-4 text-sm font-medium text-navy md:text-base">
              Consider:
            </p>
            <BulletList items={marketConsiderations} />
            <p className="mt-5 text-sm leading-relaxed text-muted md:text-base">
              Market research can help you avoid approaching the wrong companies
              and wasting time on partnerships that are unlikely to work.
            </p>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              2. Choose the Right Sales Channel
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              There is no single way to sell a product in Japan.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              Depending on your business, you may work with:
            </p>
            <ul className="mt-8 list-none space-y-5">
              {channels.map((item) => (
                <li
                  key={item.title}
                  className="rounded-lg border border-border bg-white px-5 py-5"
                >
                  <h3 className="font-medium text-navy">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {item.body}
                  </p>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm leading-relaxed text-muted md:text-base">
              The best option depends on your product, target market, pricing,
              and business objectives.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              For a closer look at partner types, see our guides on{" "}
              <Link
                href="/en/japan-market-entry/how-to-find-japanese-distributors"
                className="text-teal hover:underline"
              >
                finding Japanese distributors
              </Link>{" "}
              and{" "}
              <Link
                href="/en/japan-market-entry/how-to-find-japanese-retailers"
                className="text-teal hover:underline"
              >
                finding Japanese retailers
              </Link>
              .
            </p>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              3. Prepare Your Commercial Information
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              Japanese business partners will usually need enough information to
              evaluate whether your product is suitable for their business.
            </p>
            <p className="mt-4 text-sm font-medium text-navy md:text-base">
              Before starting discussions, prepare:
            </p>
            <BulletList items={commercialItems} />
            <p className="mt-5 text-sm leading-relaxed text-muted md:text-base">
              Clear information makes it easier for potential partners to
              evaluate your product quickly.
            </p>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              4. Find the Right Japanese Business Partner
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              Finding a Japanese company is not enough.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              The important question is whether that company is the right fit for
              your brand.
            </p>
            <p className="mt-4 text-sm font-medium text-navy md:text-base">
              Consider:
            </p>
            <BulletList items={partnerFit} />
            <p className="mt-5 text-sm leading-relaxed text-muted md:text-base">
              A smaller company with the right customer base may sometimes be a
              better partner than a much larger company with no clear connection
              to your product.
            </p>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              5. Discuss the Business Conditions
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              Once you identify a potential partner, discuss the commercial
              conditions clearly.
            </p>
            <p className="mt-4 text-sm font-medium text-navy md:text-base">
              Important points may include:
            </p>
            <BulletList items={businessConditions} />
            <p className="mt-5 text-sm leading-relaxed text-muted md:text-base">
              Do not assume that every condition needs to be finalized
              immediately.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              In many cases, the first step is simply to determine whether both
              sides see a realistic business opportunity.
            </p>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              6. Start With a Practical Market Entry Strategy
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              Entering Japan does not necessarily require a large investment from
              day one.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              Some brands may begin with:
            </p>
            <p className="mt-4 rounded-lg border border-border bg-cream/60 px-5 py-4 text-sm font-medium leading-relaxed text-navy md:text-base">
              Product → Business partner → Small initial order → Market test →
              Expansion
            </p>
            <p className="mt-5 text-sm leading-relaxed text-muted md:text-base">
              Others may choose a broader distribution strategy from the
              beginning.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              The right approach depends on your product and business objectives.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              The key is to find a practical way to test the Japanese market while
              building relationships with the right local partners.
            </p>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              7. Explore Japanese Business Opportunities
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              For overseas brands looking for Japanese distributors, wholesalers,
              retailers, or e-commerce partners, finding the right business
              connection can be one of the most important steps in entering Japan.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              BrandBridge is a B2B platform designed to help overseas brands
              explore potential business partnerships in Japan.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              You can review available products and business opportunities, and
              discuss potential trading conditions directly with the relevant
              business parties through the platform.
            </p>
            <p className="mt-5 text-sm font-semibold text-navy md:text-base">
              BrandBridge is free to join.
            </p>
          </section>

          <div className="mt-12 space-y-4 border-t border-border pt-10 text-sm leading-relaxed text-muted md:text-base">
            <p>
              For more Japan market entry resources, return to the{" "}
              <Link
                href="/en/japan-market-entry"
                className="text-teal hover:underline"
              >
                Japan Market Entry hub
              </Link>
              .
            </p>
            <p>
              Looking for a specific partner type? See{" "}
              <Link
                href="/en/japan-market-entry/how-to-find-japanese-distributors"
                className="text-teal hover:underline"
              >
                how to find Japanese distributors
              </Link>{" "}
              or{" "}
              <Link
                href="/en/japan-market-entry/how-to-find-japanese-retailers"
                className="text-teal hover:underline"
              >
                how to find Japanese retailers
              </Link>
              .
            </p>
          </div>
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
            Ready to explore Japan?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/75 md:text-base">
            Return to the Japan Market Entry hub, or list your brand for Japanese
            business partners to review.
          </p>
          <div className="mx-auto mt-8 flex w-full max-w-lg flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
            <Button
              href="/en/japan-market-entry"
              variant="outline"
              className="w-full border-white/40 py-3.5 text-base text-white hover:border-white hover:bg-white/10 hover:text-white sm:w-auto sm:min-w-[180px]"
            >
              Japan Market Entry
            </Button>
            <Button
              href="/en/register/maker"
              className="w-full py-3.5 text-base sm:w-auto sm:min-w-[180px]"
            >
              List Your Brand
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
