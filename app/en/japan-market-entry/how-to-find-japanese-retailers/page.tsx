import type { Metadata } from "next";
import Link from "next/link";
import { BlogImage } from "@/components/blog/BlogImage";
import { Button } from "@/components/ui/Button";
import { getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "How to Find Japanese Retailers for Your Brand",
  description:
    "A practical guide for overseas brands on how to identify, evaluate, and approach Japanese retailers, including specialty stores, department stores, and ecommerce channels.",
  alternates: {
    canonical: "/en/japan-market-entry/how-to-find-japanese-retailers",
  },
};

const retailChannels = [
  "Department stores",
  "Specialty retailers",
  "Supermarkets",
  "Convenience stores",
  "Lifestyle stores",
  "Drugstores",
  "Fashion retailers",
  "Home and consumer goods retailers",
  "Online retailers",
  "Marketplace sellers",
] as const;

const targetCustomer = [
  "Age",
  "Gender",
  "Income level",
  "Lifestyle",
  "Location",
  "Product preferences",
  "Price sensitivity",
  "Online versus offline shopping behavior",
] as const;

const similarProducts = [
  "Similar product categories",
  "Similar price ranges",
  "Similar customer segments",
  "International brands",
  "Products with similar positioning",
] as const;

const businessFit = [
  "Customer demographics",
  "Number of stores",
  "Geographic coverage",
  "Ecommerce presence",
  "Product categories",
  "Existing international brands",
  "Price positioning",
  "Sales channels",
  "New product introduction policies",
] as const;

const retailRoutes = [
  "Brand \u2192 Importer \u2192 Distributor \u2192 Retailer",
  "Brand \u2192 Japanese Distributor \u2192 Retailer",
  "Brand \u2192 Retailer",
] as const;

const proposalItems = [
  "Product description",
  "Product benefits",
  "Wholesale price",
  "Suggested retail price",
  "MOQ",
  "Product margins",
  "Packaging information",
  "Certifications",
  "Product images",
  "Shipping information",
  "Existing sales performance",
  "Current markets",
  "Marketing support",
  "Retail display requirements",
] as const;

const fitRetailerPoints = [
  "Your product complements their existing assortment",
  "Your target customers overlap",
  "Your price range fits their positioning",
  "Your brand has proven demand overseas",
  "Your product fills a gap in their current assortment",
  "Your brand provides a differentiated product category",
] as const;

const contactDepartments = [
  "Purchasing",
  "Merchandising",
  "Category management",
  "International business",
  "New product development",
  "Ecommerce",
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

export default function HowToFindJapaneseRetailersArticlePage() {
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/en/japan-market-entry/how-to-find-japanese-retailers`;

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
        name: "How to Find Japanese Retailers",
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
            How to Find Japanese Retailers for Your Brand
          </h1>
          <p className="mt-5 text-sm leading-relaxed text-white/80 md:text-base">
            How overseas brands can identify, evaluate, and approach Japanese
            retailers.
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
            id="souvenirShop"
            alt="Japanese souvenir plates in a shop display — products on retail shelves in Japan"
            variant="hero"
            look="onDark"
            priority
          />
        </div>
      </section>

      <article className="border-b border-border bg-surface">
        <div className="mx-auto max-w-3xl px-5 py-12 md:py-16">
          <div className="space-y-5 text-sm leading-relaxed text-muted md:text-base">
            <p>
              Finding the right Japanese retailers can be an important step for
              overseas brands entering Japan.
            </p>
            <p>
              However, approaching retailers is not simply a matter of sending a
              product catalog to as many companies as possible.
            </p>
            <p>
              Japanese retailers have different customer bases, product
              categories, pricing strategies, store formats, and purchasing
              requirements.
            </p>
            <p>The goal is not to find the largest retailer.</p>
            <p>
              The goal is to find retailers where your product has a realistic
              commercial opportunity.
            </p>
            <p>
              This guide explains how overseas brands can identify, evaluate, and
              approach Japanese retailers.
            </p>
          </div>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              1. Understand the Japanese Retail Landscape
            </h2>
            <BlogImage
              id="shoppingStreet"
              alt="A busy Japanese shopping street — specialty shops, markets, and neighborhood retail"
            />
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              Japan has a diverse retail market.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              Depending on the product category, relevant channels may include:
            </p>
            <BulletList items={retailChannels} />
            <p className="mt-5 text-sm leading-relaxed text-muted md:text-base">
              The appropriate channel depends on the product and target customer.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              A premium beauty product, for example, may require a very different
              retail strategy from a food product or consumer electronics brand.
            </p>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              2. Define Your Target Customer
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              Before searching for retailers, clearly define who you want to
              reach.
            </p>
            <p className="mt-4 text-sm font-medium text-navy md:text-base">
              Consider:
            </p>
            <BulletList items={targetCustomer} />
            <p className="mt-5 text-sm leading-relaxed text-muted md:text-base">
              A retailer is more likely to be interested when your product
              clearly matches its existing customer base.
            </p>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              3. Identify Retailers That Already Sell Similar Products
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              One of the most practical ways to find potential retailers is to
              research companies that already sell products similar to yours.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              Look for retailers that carry:
            </p>
            <BulletList items={similarProducts} />
            <p className="mt-5 text-sm leading-relaxed text-muted md:text-base">
              This helps identify retailers where your product is more likely to
              fit.
            </p>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              4. Evaluate the Retailer&apos;s Business Fit
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              Do not evaluate retailers only by size or brand recognition.
            </p>
            <p className="mt-4 text-sm font-medium text-navy md:text-base">
              Consider:
            </p>
            <BulletList items={businessFit} />
            <p className="mt-5 text-sm leading-relaxed text-muted md:text-base">
              A smaller specialty retailer may provide a better opportunity than
              a major chain if its customers closely match your target audience.
            </p>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              5. Understand How Products Reach Japanese Retailers
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              Overseas brands do not always sell directly to Japanese retailers.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              Depending on the product and business model, the route may involve:
            </p>
            <ul className="mt-4 list-none space-y-3">
              {retailRoutes.map((item) => (
                <li
                  key={item}
                  className="rounded-lg border border-border bg-cream/60 px-5 py-4 text-sm font-medium leading-relaxed text-navy md:text-base"
                >
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm leading-relaxed text-muted md:text-base">
              For some products, an importer or distributor may be necessary
              because of logistics, regulations, or established purchasing
              structures.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              Understanding the appropriate route can prevent brands from
              approaching the wrong type of company.
            </p>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              6. Prepare a Retailer-Ready Product Proposal
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              Before contacting retailers, prepare clear commercial information.
            </p>
            <p className="mt-4 text-sm font-medium text-navy md:text-base">
              Include:
            </p>
            <BulletList items={proposalItems} />
            <p className="mt-5 text-sm leading-relaxed text-muted md:text-base">
              Retail buyers need to understand the commercial opportunity
              quickly.
            </p>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              7. Explain Why Your Product Fits the Retailer
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              Avoid generic messages such as:
            </p>
            <p className="mt-4 rounded-lg border border-border bg-cream/60 px-5 py-4 text-sm font-medium leading-relaxed text-navy md:text-base">
              &ldquo;We would like to sell our product in Japan.&rdquo;
            </p>
            <p className="mt-5 text-sm leading-relaxed text-muted md:text-base">
              Instead, explain why your product fits that retailer.
            </p>
            <p className="mt-4 text-sm font-medium text-navy md:text-base">
              For example:
            </p>
            <BulletList items={fitRetailerPoints} />
            <p className="mt-5 text-sm leading-relaxed text-muted md:text-base">
              A retailer is more likely to consider a proposal when the business
              case is clear.
            </p>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              8. Start With the Right Contact
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              Large retailers may have different departments for:
            </p>
            <BulletList items={contactDepartments} />
            <p className="mt-5 text-sm leading-relaxed text-muted md:text-base">
              Sending your proposal to a generic customer-service address may not
              reach the correct decision maker.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              Whenever possible, identify the appropriate purchasing or
              business-development contact.
            </p>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              9. Consider Starting With Ecommerce
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              For some overseas brands, ecommerce can be an easier starting point
              than nationwide physical retail.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              A brand may begin with:
            </p>
            <p className="mt-4 rounded-lg border border-border bg-cream/60 px-5 py-4 text-sm font-medium leading-relaxed text-navy md:text-base">
              Online test {"\u2192"} Sales data {"\u2192"} Customer feedback{" "}
              {"\u2192"} Retail proposal {"\u2192"} Store expansion
            </p>
            <p className="mt-5 text-sm leading-relaxed text-muted md:text-base">
              Real sales data can make a retail proposal more compelling because
              the retailer can see evidence of customer demand.
            </p>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              10. Start Small and Expand
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              A nationwide retail launch is not always necessary.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              A practical approach may be:
            </p>
            <p className="mt-4 rounded-lg border border-border bg-cream/60 px-5 py-4 text-sm font-medium leading-relaxed text-navy md:text-base">
              Brand {"\u2192"} Japanese partner {"\u2192"} Small retail test{" "}
              {"\u2192"} Sales data {"\u2192"} Customer feedback {"\u2192"}{" "}
              Expansion
            </p>
            <p className="mt-5 text-sm leading-relaxed text-muted md:text-base">
              Starting with a limited number of stores or a focused ecommerce
              channel can reduce risk for both the brand and the Japanese retail
              partner.
            </p>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              11. Use a Structured Way to Find Japanese Retail Partners
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              Finding suitable Japanese retailers can take significant time for
              overseas brands without an existing network in Japan.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              BrandBridge is a B2B platform designed to help overseas brands
              explore potential business partnerships with Japanese distributors,
              wholesalers, retailers, and ecommerce businesses.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              Brands can review business opportunities and discuss potential
              trading conditions with relevant business parties.
            </p>
          </section>

          <div className="mt-12 space-y-4 border-t border-border pt-10 text-sm leading-relaxed text-muted md:text-base">
            <p>
              For a broader overview, see our{" "}
              <Link
                href="/en/japan-market-entry"
                className="text-teal hover:underline"
              >
                Japan Market Entry Guide
              </Link>
              .
            </p>
            <p>
              If you are looking for distributors, see our{" "}
              <Link
                href="/en/japan-market-entry/how-to-find-japanese-distributors"
                className="text-teal hover:underline"
              >
                guide to finding Japanese distributors
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
