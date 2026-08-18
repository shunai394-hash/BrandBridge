import type { Metadata } from "next";
import Link from "next/link";
import { BlogImage } from "@/components/blog/BlogImage";
import { Button } from "@/components/ui/Button";
import { getSiteUrl } from "@/lib/site";
import { selfLanguageAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "How to Evaluate a Japanese Distributor for Your Brand",
  description:
    "Learn how to evaluate a Japanese distributor for fit, wholesale price, MOQ, exclusivity, territory, responsibilities, and performance after you have candidates.",
  ...selfLanguageAlternates(
    "/en/japan-market-entry/how-to-find-a-japanese-distributor",
    "en",
  ),
};

const distributorDoes = [
  "Import products into Japan when needed",
  "Hold inventory and manage local logistics",
  "Sell into retailers, wholesalers, or ecommerce channels",
  "Introduce the brand to buyers and decision makers",
  "Support local sales development over time",
  "Handle day-to-day customer and channel relationships in Japan",
] as const;

const partnerTypes = [
  "National distributors with broad channel coverage",
  "Regional distributors focused on specific prefectures or cities",
  "Importers that bring overseas brands into Japan",
  "Wholesalers that supply retail networks",
  "Retailers that buy directly for their own stores",
  "Ecommerce operators and marketplace specialists",
  "Sales agencies that introduce brands without holding inventory",
] as const;

const marketResearch = [
  "Which Japanese customer segments fit your product",
  "Which retail or ecommerce channels already sell similar products",
  "How competitors are priced in Japan",
  "Whether Japanese packaging, claims, or certifications matter",
  "Whether demand is stronger online, offline, or both",
  "Which cities or regions make sense for an initial test",
] as const;

const competingProducts = [
  "Search for similar products already sold in Japan",
  "Note the retailers and marketplaces listing those products",
  "Identify brands with a comparable price range and positioning",
  "Look for importer or distributor names on packaging or brand sites",
  "Review trade show exhibitors and category directories",
  "Map which partner types appear repeatedly in your category",
] as const;

const productPrep = [
  "Clear product description and differentiation",
  "Product specifications and packaging details",
  "Product images suitable for B2B review",
  "Wholesale price",
  "Suggested retail price",
  "MOQ",
  "Shipping conditions and lead time",
  "Payment terms",
  "Certifications and compliance notes",
  "Current markets and sales traction",
  "Exclusivity options, if any",
] as const;

const commercialTerms = [
  "Wholesale price that leaves room for Japanese channel margins",
  "MOQ that fits a controlled first order or test launch",
  "Shipping terms that clarify who handles freight and import costs",
  "Lead time from order to delivery",
  "Payment terms that both sides can operate with",
  "Sample availability for buyer evaluation",
] as const;

const exclusivityPoints = [
  "Nationwide exclusivity is not always necessary for a first partnership",
  "Channel exclusivity can be limited to retail, ecommerce, or a region",
  "Performance targets should be clear if exclusivity is granted",
  "Review periods help both sides exit or renegotiate if results are weak",
  "Non-exclusive arrangements can reduce risk while the brand tests Japan",
] as const;

const marketTesting = [
  "Start with a limited assortment rather than the full catalog",
  "Use a small first order to validate demand",
  "Test one or two channels before expanding",
  "Collect sell-through, reorder, and customer feedback data",
  "Expand only after the first test shows commercial fit",
] as const;

const evaluatePartner = [
  "Category experience with products like yours",
  "Existing relationships with relevant retailers or platforms",
  "Import and logistics capability",
  "Geographic coverage that matches your plan",
  "Willingness to start with a controlled test",
  "Transparency on expected margins, MOQ, and sales process",
  "Communication quality in English or with reliable bilingual support",
  "Realistic expectations about timelines and investment",
] as const;

const brandResponsibilities = [
  "Provide accurate product, pricing, and supply information",
  "Support training materials and brand positioning",
  "Maintain stable production and shipping schedules",
  "Clarify exclusivity, territory, and channel rules in writing",
  "Share marketing assets and product education for local teams",
] as const;

const distributorResponsibilities = [
  "Develop sales into agreed channels",
  "Manage local inventory and order flow",
  "Report sell-through and market feedback",
  "Protect brand positioning in local negotiations",
  "Coordinate returns, claims, and buyer questions as agreed",
] as const;

const performanceMetrics = [
  "Orders placed and reorder rate",
  "Sell-through by channel or retailer",
  "Number of active retail or ecommerce accounts",
  "Average order value and margin structure",
  "Time from first discussion to first order",
  "Marketing activities completed versus planned",
  "Customer or buyer feedback quality",
] as const;

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

export default function HowToFindAJapaneseDistributorArticlePage() {
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/en/japan-market-entry/how-to-find-a-japanese-distributor`;

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
        name: "How to Evaluate a Japanese Distributor",
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
            How to Evaluate a Japanese Distributor for Your Brand
          </h1>
          <p className="mt-5 text-sm leading-relaxed text-white/80 md:text-base">
            After you have candidates, learn how to evaluate distributor fit,
            pricing, MOQ, territory, exclusivity, responsibilities, and
            performance before you commit.
          </p>
          <p className="mt-6">
            <Link
              href="/en/japan-market-entry"
              className="text-sm text-teal hover:underline"
            >
              {"\u2190"} Back to Japan Market Entry
            </Link>
          </p>
          <BlogImage
            id="gardenTsukubai"
            alt="A stone water basin in a Japanese garden — careful evaluation before choosing a partner"
            variant="hero"
            look="onDark"
            priority
          />
        </div>
      </section>

      <article className="border-b border-border bg-white">
        <div className="mx-auto max-w-3xl px-5 py-12 md:py-16">
          <section>
            <p className="text-sm leading-relaxed text-muted md:text-base">
              Once you have potential partners, the next step is not more search
              volume. It is deciding whether a Japanese distributor fits your
              category, pricing, territory, and stage of market entry. This page
              focuses on evaluation, commercial terms, exclusivity, market
              testing, responsibilities, and performance.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              If you still need to identify candidates, start with{" "}
              <Link
                href="/en/japan-market-entry/how-to-find-japanese-distributors"
                className="text-teal hover:underline"
              >
                How to Find Japanese Distributors
              </Link>
              . For the wider selling flow before partnership terms, see{" "}
              <Link
                href="/en/how-to-sell-in-japan"
                className="text-teal hover:underline"
              >
                How to Sell in Japan
              </Link>
              .
            </p>
            <BlogImage
              id="handshake"
              alt="A handshake after commercial terms are agreed — committing to a Japanese distributor"
            />
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              1. What a Japanese Distributor Does
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              A Japanese distributor is a local business partner that helps an
              overseas brand sell through Japanese channels. Depending on the
              agreement, a distributor may handle some or all of the following:
            </p>
            <BulletList items={distributorDoes} />
            <p className="mt-5 text-sm leading-relaxed text-muted md:text-base">
              Not every partner called a &quot;distributor&quot; works the same
              way. Some hold stock and invoice retailers. Others introduce the
              brand and leave logistics to another party. Clarify the operating
              model early.
            </p>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              2. Types of Japanese Distribution Partners
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              When you evaluate a Japanese distributor, clarify which partner
              type you are actually assessing:
            </p>
            <BulletList items={partnerTypes} />
            <p className="mt-5 text-sm leading-relaxed text-muted md:text-base">
              Your ideal partner depends on whether you need import support,
              retail introductions, ecommerce coverage, or a combination. A
              national exclusive partner is not always the right first step.
            </p>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              3. Confirm Market Fit Before You Negotiate Terms
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              Before you lock wholesale price, MOQ, or exclusivity with a Japanese
              distributor, confirm that Japan is a realistic next market for your
              brand.
            </p>
            <BulletList items={marketResearch} />
            <p className="mt-5 text-sm leading-relaxed text-muted md:text-base">
              Clear market research helps you speak with distributors about
              channel fit instead of asking only for general interest. For a
              wider overview of Japan market entry, see the{" "}
              <Link
                href="/en/japan-market-entry"
                className="text-teal hover:underline"
              >
                BrandBridge Japan Market Entry Hub
              </Link>
              .
            </p>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              4. Use Competing Products to Judge Channel Fit
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              Competing products already sold in Japan help you judge whether a
              candidate distributor has the right channel access. For the full
              search process, see{" "}
              <Link
                href="/en/japan-market-entry/how-to-find-japanese-distributors"
                className="text-teal hover:underline"
              >
                How to Find Japanese Distributors
              </Link>
              . Here, use competing products as an evaluation signal:
            </p>
            <BulletList items={competingProducts} />
            <p className="mt-5 text-sm leading-relaxed text-muted md:text-base">
              Competing products show which partner types and channels already
              work in your category. Use that evidence when you evaluate
              territory, retail coverage, and whether a candidate is a realistic
              fit.
            </p>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              5. What Product Information to Prepare
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              Japanese partners usually want commercial details before they can
              judge fit. Prepare a concise package with:
            </p>
            <BulletList items={productPrep} />
            <p className="mt-5 text-sm leading-relaxed text-muted md:text-base">
              Incomplete information slows conversations. A clear product pack
              signals that your brand is ready for a serious Japan discussion.
            </p>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              6. Wholesale Price, MOQ, and Shipping Conditions
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              Pricing and supply terms are often the first filter for a Japanese
              distributor.
            </p>
            <BulletList items={commercialTerms} />
            <p className="mt-5 text-sm leading-relaxed text-muted md:text-base">
              If wholesale price and MOQ only work for very large first orders,
              partners may hesitate. Many Japan market entry discussions start
              more smoothly when the brand can support a controlled test order.
            </p>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              7. Exclusivity
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              Exclusivity is common in Japan distributor conversations, but it
              should be earned and scoped carefully.
            </p>
            <BulletList items={exclusivityPoints} />
            <p className="mt-5 text-sm leading-relaxed text-muted md:text-base">
              If a partner requests exclusivity, ask what channels, territories,
              and sales targets come with that request. Vague exclusivity can
              block other opportunities without delivering results.
            </p>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              8. Controlled Market Testing
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              A full Japan launch is not required on day one. Controlled market
              testing reduces risk for both the brand and the distributor.
            </p>
            <BulletList items={marketTesting} />
            <p className="mt-5 text-sm leading-relaxed text-muted md:text-base">
              A useful sequence is: small introduction, first orders, sell-through
              data, then expansion. That approach is often easier to approve than
              a nationwide exclusive commitment.
            </p>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              9. How to Evaluate Potential Distributors
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              Finding names is only the first step. This section focuses on how
              to evaluate a Japanese distributor once you have candidates who can
              actually move your brand.
            </p>
            <BulletList items={evaluatePartner} />
            <p className="mt-5 text-sm leading-relaxed text-muted md:text-base">
              Ask for examples of similar brands or categories they have handled.
              A partner who understands your channel is usually more valuable
              than a partner who only promises broad coverage.
            </p>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              10. Responsibilities Between Brand and Distributor
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              Clear roles prevent misunderstandings after the first order.
            </p>
            <h3 className="mt-6 text-lg font-medium text-navy">
              Brand responsibilities
            </h3>
            <BulletList items={brandResponsibilities} />
            <h3 className="mt-6 text-lg font-medium text-navy">
              Distributor responsibilities
            </h3>
            <BulletList items={distributorResponsibilities} />
            <p className="mt-5 text-sm leading-relaxed text-muted md:text-base">
              Write these expectations into the commercial discussion early. It
              is easier to align before inventory moves than after a weak launch.
            </p>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              11. Measuring Distributor Performance
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              Once a Japanese distributor starts selling your brand, track a
              small set of practical metrics:
            </p>
            <BulletList items={performanceMetrics} />
            <p className="mt-5 text-sm leading-relaxed text-muted md:text-base">
              Review performance on a regular schedule. If results are weak,
              discuss channel changes, assortment changes, or whether the
              partnership scope should be adjusted.
            </p>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              12. A Structured Way to Explore Japanese Partners
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              Searching for a Japanese distributor can take time when an overseas
              brand has no local network. BrandBridge is a B2B platform that
              helps overseas brands explore Japanese distributors, wholesalers,
              retailers, and ecommerce partners with commercial terms visible
              upfront.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              If you are still mapping the wider process, start with{" "}
              <Link
                href="/en/how-to-sell-in-japan"
                className="text-teal hover:underline"
              >
                How to Sell in Japan
              </Link>
              , then use the{" "}
              <Link
                href="/en/japan-market-entry"
                className="text-teal hover:underline"
              >
                Japan Market Entry Guide
              </Link>{" "}
              to decide whether a distributor, retailer, or mixed channel
              approach fits your brand.
            </p>
          </section>

          <div className="mt-12 space-y-4 border-t border-border pt-10 text-sm leading-relaxed text-muted md:text-base">
            <p>
              Still identifying candidates? See{" "}
              <Link
                href="/en/japan-market-entry/how-to-find-japanese-distributors"
                className="text-teal hover:underline"
              >
                How to Find Japanese Distributors
              </Link>
              .
            </p>
            <p>
              Looking for retail partners instead? See{" "}
              <Link
                href="/en/japan-market-entry/how-to-find-japanese-retailers"
                className="text-teal hover:underline"
              >
                How to Find Japanese Retailers for Your Brand
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
            Explore Japanese Business Opportunities
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/75 md:text-base">
            If you are looking for a Japanese distributor or related sales
            partner, you can explore business opportunities on BrandBridge.
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
