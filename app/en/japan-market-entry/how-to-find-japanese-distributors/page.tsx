import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "How to Find Japanese Distributors for Your Brand",
  description:
    "A practical guide for overseas and DTC brands on how to identify, evaluate, and approach Japanese distributors, importers, wholesalers, retailers, and ecommerce partners.",
  alternates: {
    canonical: "/en/japan-market-entry/how-to-find-japanese-distributors",
  },
};

const distributorRoles = [
  "Importing products into Japan",
  "Warehousing and inventory",
  "Sales to retailers and wholesalers",
  "Ecommerce distribution",
  "Local sales activities",
  "Customer and retailer relationships",
  "Product introduction and market development",
] as const;

const partnerTypes = [
  "Distributors",
  "Importers",
  "Wholesalers",
  "Retailers",
  "Ecommerce businesses",
  "Sales agencies",
] as const;

const idealProfile = [
  "Product category",
  "Target customers",
  "Preferred sales channels",
  "Geographic coverage",
  "Existing retailer relationships",
  "Ecommerce capabilities",
  "Minimum order requirements",
  "Import experience",
  "Experience with overseas brands",
  "Marketing capabilities",
] as const;

const researchPoints = [
  "Similar products",
  "Similar price ranges",
  "Similar customer segments",
  "Relevant retailers",
  "Relevant ecommerce channels",
  "Overseas brands",
] as const;

const prepareItems = [
  "Product specifications",
  "Wholesale price",
  "Suggested retail price",
  "MOQ",
  "Shipping conditions",
  "Payment terms",
  "Certifications",
  "Product images",
  "Packaging information",
  "Current sales performance",
  "Existing markets",
  "Distribution conditions",
  "Exclusivity options",
] as const;

const fitJapanItems = [
  "Existing customer demand",
  "Sales performance in other markets",
  "Product differentiation",
  "Customer reviews",
  "Awards or certifications",
  "Social media traction",
  "Repeat purchase rates",
  "Existing retail relationships",
] as const;

const firstConversation = [
  "Is there a potential market?",
  "Is the product suitable for the distributor?",
  "Are the pricing conditions realistic?",
  "Which sales channels could work?",
  "What would a test launch look like?",
] as const;

const distributionConditions = [
  "Wholesale price",
  "MOQ",
  "Territory",
  "Sales channels",
  "Marketing responsibilities",
  "Shipping",
  "Payment terms",
  "Exclusivity",
  "Contract period",
  "Sales targets",
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

export default function HowToFindJapaneseDistributorsArticlePage() {
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/en/japan-market-entry/how-to-find-japanese-distributors`;

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
        name: "How to Find Japanese Distributors",
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
            How to Find Japanese Distributors for Your Brand
          </h1>
          <p className="mt-5 text-sm leading-relaxed text-white/80 md:text-base">
            How overseas brands can identify, evaluate, and approach potential
            Japanese distributors.
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
              Finding a Japanese distributor is often one of the first challenges
              overseas brands face when entering Japan.
            </p>
            <p>
              Japan has a large and sophisticated consumer market, but business
              relationships, distribution structures, pricing expectations, and
              sales channels can differ significantly from other markets.
            </p>
            <p>
              The right distributor can help an overseas brand reach retailers,
              wholesalers, ecommerce channels, and Japanese consumers.
            </p>
            <p>
              However, finding a company is not the same as finding the right
              partner.
            </p>
            <p>
              This guide explains how overseas brands can identify, evaluate, and
              approach potential Japanese distributors.
            </p>
          </div>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              1. Understand What a Japanese Distributor Does
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              A distributor may help an overseas brand with:
            </p>
            <BulletList items={distributorRoles} />
            <p className="mt-5 text-sm leading-relaxed text-muted md:text-base">
              The exact role depends on the agreement.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              Some companies focus mainly on importing and distribution, while
              others actively develop new brands and sales channels.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              Before contacting potential partners, understand what type of
              support your brand actually needs.
            </p>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              2. Decide What Type of Partner You Need
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              Not every Japanese business partner is a traditional distributor.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              Depending on your product and strategy, you may want to work with:
            </p>
            <BulletList items={partnerTypes} />
            <p className="mt-5 text-sm leading-relaxed text-muted md:text-base">
              For example, a consumer product brand may need an importer and
              distributor, while a DTC brand may initially benefit from an
              ecommerce partner that can test demand online.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              The right partner depends on your product, target customer,
              pricing, sales channel, and market-entry strategy.
            </p>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              3. Define Your Ideal Distributor Profile
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              Before searching for companies, create a clear partner profile.
            </p>
            <p className="mt-4 text-sm font-medium text-navy md:text-base">
              Consider:
            </p>
            <BulletList items={idealProfile} />
            <p className="mt-5 text-sm leading-relaxed text-muted md:text-base">
              A smaller distributor with strong relationships in your category
              may be more valuable than a large company with little connection to
              your target customers.
            </p>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              4. Research Potential Japanese Distributors
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              Do not contact companies randomly.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              Research whether a potential partner already works with:
            </p>
            <BulletList items={researchPoints} />
            <p className="mt-5 text-sm leading-relaxed text-muted md:text-base">
              Look at the company&apos;s existing product portfolio and sales
              channels.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              The goal is to identify companies where your product makes
              commercial sense.
            </p>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              5. Prepare Information Before Contacting a Distributor
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              Japanese business partners will usually need enough information to
              understand your product quickly.
            </p>
            <p className="mt-4 text-sm font-medium text-navy md:text-base">
              Prepare:
            </p>
            <BulletList items={prepareItems} />
            <p className="mt-5 text-sm leading-relaxed text-muted md:text-base">
              Clear information reduces unnecessary back-and-forth and makes it
              easier for a distributor to evaluate the opportunity.
            </p>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              6. Explain Why Your Brand Fits Japan
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              Do not simply say:
            </p>
            <p className="mt-4 rounded-lg border border-border bg-cream/60 px-5 py-4 text-sm font-medium leading-relaxed text-navy md:text-base">
              &ldquo;We are looking for a Japanese distributor.&rdquo;
            </p>
            <p className="mt-5 text-sm leading-relaxed text-muted md:text-base">
              Explain why your product may have an opportunity in Japan.
            </p>
            <p className="mt-4 text-sm font-medium text-navy md:text-base">
              Useful information can include:
            </p>
            <BulletList items={fitJapanItems} />
            <p className="mt-5 text-sm leading-relaxed text-muted md:text-base">
              The more clearly you explain the business opportunity, the easier
              it is for a potential partner to evaluate your brand.
            </p>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              7. Start With a Conversation
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              The first conversation does not need to finalize a distribution
              agreement.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              The initial objective should be to determine:
            </p>
            <BulletList items={firstConversation} />
            <p className="mt-5 text-sm leading-relaxed text-muted md:text-base">
              Starting with a practical discussion can make the process easier
              for both sides.
            </p>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              8. Discuss Distribution Conditions
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              Once there is genuine interest, discuss commercial conditions such
              as:
            </p>
            <BulletList items={distributionConditions} />
            <p className="mt-5 text-sm leading-relaxed text-muted md:text-base">
              Do not agree to broad exclusivity before understanding the expected
              sales volume and market-development responsibilities.
            </p>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              9. Consider a Small Market Test
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              A full national launch is not always necessary.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              A brand may start with:
            </p>
            <p className="mt-4 rounded-lg border border-border bg-cream/60 px-5 py-4 text-sm font-medium leading-relaxed text-navy md:text-base">
              Product → Japanese partner → Small initial order → Market test →
              Sales data → Expansion
            </p>
            <p className="mt-5 text-sm leading-relaxed text-muted md:text-base">
              This approach can help both sides understand demand before
              committing significant resources.
            </p>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              10. Use a Structured Way to Find Business Partners
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              Finding potential Japanese distributors can take significant time,
              especially for overseas brands without an existing network in Japan.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              A structured marketplace can make it easier to discover potential
              business partners and compare opportunities.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              BrandBridge is a B2B platform designed to help overseas brands
              explore potential partnerships with Japanese distributors,
              wholesalers, retailers, and ecommerce businesses.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              Brands can review available business opportunities and discuss
              potential trading conditions with relevant business parties.
            </p>
          </section>
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
            Explore Japanese Business Opportunities
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/75 md:text-base">
            If you are looking for Japanese distributors, wholesalers, retailers,
            or ecommerce partners, you can explore business opportunities on
            BrandBridge.
          </p>
          <div className="mx-auto mt-8 flex w-full max-w-lg flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
            <Button
              href="/en/japan-market-entry"
              variant="outline"
              className="w-full border-white/40 py-3.5 text-base text-white hover:border-white hover:bg-white/10 hover:text-white sm:w-auto sm:min-w-[180px]"
            >
              Explore Japan Market Entry
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
