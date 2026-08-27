import type { Metadata } from "next";
import Link from "next/link";
import { BlogImage } from "@/components/blog/BlogImage";
import { Button } from "@/components/ui/Button";
import {
  listPublishedModelCases,
  MODEL_CASE_TYPE_LABEL,
} from "@/lib/model-cases";
import { getSiteUrl } from "@/lib/site";
import { selfLanguageAlternates } from "@/lib/hreflang";
import { getEnBlogArticle } from "@/lib/blog/en-articles";
import { EN_BLOG_INTENT_GROUPS, enBlogPath } from "@/lib/blog/en-articles/types";

export const metadata: Metadata = {
  title: "Japan Market Entry for Overseas Brands | Distributors & Ecommerce",
  description:
    "Practical Japan market entry guide for overseas brands: how to enter Japan, sell online, work with distributors and retailers, test products, and prepare wholesale terms.",
  ...selfLanguageAlternates("/en/japan-market-entry", "en"),
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Japan Market Entry for Overseas Brands | Distributors & Ecommerce",
    description:
      "Practical Japan market entry guide for overseas brands: how to enter Japan, sell online, work with distributors and retailers, test products, and prepare wholesale terms.",
    url: "/en/japan-market-entry",
    locale: "en_US",
    type: "website",
  },
};

const whyJapan = [
  {
    title: "Quality-focused consumers",
    body: "Many Japanese buyers and retailers evaluate imported brands on product quality, positioning, and reliability—not only price.",
  },
  {
    title: "Established wholesale channels",
    body: "Distributors, importers, wholesalers, specialty retailers, and e-commerce operators form the usual path for overseas brands without a local office.",
  },
  {
    title: "Long-term partnership culture",
    body: "Japanese partners often look for clear commercial terms and a workable first discussion before committing time to a new brand.",
  },
] as const;

const entryWays = [
  {
    title: "Distributor",
    body: "A partner that places products into retail, wholesale, or regional accounts and often manages ongoing sales relationships.",
  },
  {
    title: "Importer",
    body: "A partner focused on bringing goods into Japan, handling import logistics, and connecting products to domestic networks.",
  },
  {
    title: "Wholesaler",
    body: "A volume-oriented partner that supplies retailers or other trade buyers, often with clear MOQ and pricing expectations.",
  },
  {
    title: "Retailer",
    body: "A specialty, department, or multi-brand retailer evaluating products for shelf, concept fit, and sell-through potential.",
  },
  {
    title: "E-commerce partner",
    body: "An online retailer or platform operator that reviews product details, shipping conditions, and wholesale feasibility for digital channels.",
  },
  {
    title: "Direct / D2C",
    body: "Selling directly to Japanese consumers. Often paired later with local partners for scale, retail reach, or logistics support.",
  },
] as const;

const challenges = [
  {
    title: "Finding the right Japanese partner",
    body: "Fit depends on category, channel, and commercial readiness—not only general interest in overseas brands.",
  },
  {
    title: "Understanding channel fit",
    body: "Retail, wholesale, specialty, and e-commerce partners evaluate products differently.",
  },
  {
    title: "Local market knowledge",
    body: "Positioning, packaging expectations, and buyer questions can differ from the home market.",
  },
  {
    title: "MOQ and wholesale expectations",
    body: "Partners usually need practical first-order quantities and wholesale pricing before deeper talks.",
  },
  {
    title: "Shipping and logistics",
    body: "Ship-from location, lead times, and Incoterms affect whether a first order is workable.",
  },
  {
    title: "Japanese labeling / compliance",
    body: "Labeling, documentation, and category-specific rules often need review before retail or import moves forward.",
  },
  {
    title: "Exclusivity discussions",
    body: "Territory or channel exclusivity may be requested early and should be framed clearly.",
  },
  {
    title: "Operating without a local office",
    body: "Many overseas brands enter through Japanese partners rather than opening an entity first.",
  },
] as const;

const partnerNeeds = [
  {
    label: "Product positioning",
    body: "Who the product is for and how it differs from alternatives already in Japan.",
  },
  {
    label: "MOQ",
    body: "Minimum order quantity so partners can judge first-order feasibility.",
  },
  {
    label: "Wholesale pricing",
    body: "A clear price range or quote process for Japan-bound wholesale discussions.",
  },
  {
    label: "Exclusivity",
    body: "Whether territory or channel exclusivity is available—and under what conditions.",
  },
  {
    label: "Shipping terms",
    body: "Ship-from location, lead times, and logistics preferences partners need to plan.",
  },
  {
    label: "Product specifications",
    body: "Core specs that help buyers compare fit across category and channel.",
  },
  {
    label: "Shelf life",
    body: "Especially important for food, beauty, and other time-sensitive products.",
  },
  {
    label: "Packaging",
    body: "Retail readiness, unit size, and whether localization may be needed.",
  },
  {
    label: "Channel restrictions",
    body: "Any limits on retail, online, or territory distribution.",
  },
  {
    label: "Regulatory / labeling readiness",
    body: "How prepared the brand is for Japanese labeling and compliance review.",
  },
] as const;

const brandBridgeHelp = [
  {
    title: "Product and trade terms visible earlier",
    body: "Partners can review MOQ, wholesale pricing, exclusivity, and shipping conditions before outreach.",
  },
  {
    title: "Partner type clarity",
    body: "Listings help surface whether a brand is seeking distributors, retailers, wholesalers, importers, or e-commerce partners.",
  },
  {
    title: "Structured initial discussions",
    body: "Commercial details are organized so first conversations start from shared information.",
  },
  {
    title: "Direct commercial discussions",
    body: "When interest is mutual, brands and Japanese partners can move into direct negotiation on BrandBridge.",
  },
  {
    title: "Clearer qualification",
    body: "Visible terms help both sides judge fit earlier and reduce low-context back-and-forth.",
  },
] as const;

const resources = [
  {
    href: "/en/how-to-sell-in-japan",
    title: "How to Sell in Japan",
    body: "See how BrandBridge listing, partner review, and commercial discussion can work in practice.",
  },
  {
    href: "/en/japan-partner-demand-snapshot",
    title: "Japan Partner Demand Snapshot",
    body: "What Japanese distributors, retailers, and e-commerce partners typically look for before starting a conversation.",
  },
  {
    href: "/en/japan-market-for-functional-food-brands",
    title: "Functional Food & Wellness",
    body: "Japan market entry notes for overseas functional food and wellness brands.",
  },
  {
    href: "/en/cases",
    title: "Japan Expansion Opportunities",
    body: "Browse live overseas brand opportunities seeking Japanese sales partners.",
  },
] as const;

const entrySteps = [
  {
    title: "1. Clarify Japan fit",
    body: "Confirm category demand, competitive shelf, and whether your product needs localization before you spend on outreach.",
  },
  {
    title: "2. Choose an entry path",
    body: "Decide whether a distributor, wholesaler, retailer, ecommerce partner, or a staged mix is the first step—not every brand needs nationwide distribution on day one.",
  },
  {
    title: "3. Prepare commercial terms",
    body: "Wholesale price, MOQ, Incoterms, exclusivity options, and shipping readiness are what Japanese partners review before a serious conversation.",
  },
  {
    title: "4. Run a controlled test",
    body: "Start with a limited SKU set, a first order MOQ, and a clear channel (often ecommerce or specialty retail) before scaling.",
  },
  {
    title: "5. Select and qualify partners",
    body: "Shortlist partners by category coverage and channel strength, then compare terms—not only company size.",
  },
  {
    title: "6. Move into commercial discussion",
    body: "Once fit is clear, discuss first order, exclusivity scope, and go-to-market responsibilities with shared product information.",
  },
] as const;

const ecommerceEntry = [
  {
    title: "Start with a Japan ecommerce partner",
    body: "An online retailer or operator can help you sell products in Japan with clearer first-order economics than a nationwide retail rollout.",
  },
  {
    title: "Use ecommerce as a market test",
    body: "Online sell-through, reviews, and replenishment data help you judge demand before committing to broader distributor or retail coverage.",
  },
  {
    title: "Keep retail options open",
    body: "Many brands enter Japan ecommerce first, then add a distributor or retailer once pricing, MOQ, and packaging are proven.",
  },
] as const;

const productReadiness = [
  {
    title: "Product and assortment",
    body: "Lead with SKUs that travel well: clear differentiation, stable specs, and a first assortment Japanese partners can explain quickly.",
  },
  {
    title: "Pricing for Japan channels",
    body: "Wholesale pricing should leave room for import, domestic logistics, and partner margin—not only a home-market conversion.",
  },
  {
    title: "Labeling and documentation",
    body: "Partners ask early about ingredients, certifications, shelf life, and Japanese labeling readiness. Exact rules vary by category—confirm case by case.",
  },
] as const;

const faq = [
  {
    q: "How can an overseas brand find a distributor in Japan?",
    a: "Common paths include trade introductions, industry events, importers with existing networks, and B2B platforms where product details and commercial terms are visible before contact. BrandBridge is designed for the last of these: structured listings that Japanese partners can review.",
  },
  {
    q: "Does an overseas brand need a Japanese office?",
    a: "Not always. Many brands explore Japan through importers, distributors, retailers, wholesalers, or e-commerce partners without opening a local entity first. The right structure depends on channel, compliance needs, and commercial goals.",
  },
  {
    q: "What is the best way to enter the Japan ecommerce market?",
    a: "Many overseas brands start with a Japanese ecommerce partner or online retailer for a controlled test: clear MOQ, wholesale terms, and sell-through data before wider distribution. Ecommerce can sit alongside a distributor or retailer later.",
  },
  {
    q: "What information do Japanese distributors need?",
    a: "Partners usually want product positioning, MOQ, wholesale pricing, exclusivity preferences, shipping terms, specifications, shelf life where relevant, packaging details, channel restrictions, and regulatory or labeling readiness.",
  },
  {
    q: "What is the difference between an importer and a distributor?",
    a: "An importer primarily brings products into Japan and connects them to domestic networks. A distributor typically focuses on placing products with retail, wholesale, or regional accounts and managing ongoing sales relationships. Some companies do both.",
  },
  {
    q: "Can brands discuss wholesale terms before contacting Japanese partners?",
    a: "Yes. On BrandBridge, brands can publish MOQ, wholesale pricing, exclusivity, and shipping conditions so Japanese partners can review commercial fit before starting a discussion.",
  },
] as const;

function EnglishGuideCard({
  href,
  title,
  summary,
}: {
  href: string;
  title: string;
  summary: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="group flex flex-col rounded-lg border border-border bg-white px-5 py-6 transition hover:border-teal/40 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <p className="text-xs font-semibold tracking-[0.12em] text-teal">
            BLOG
          </p>
          <p className="mt-2 font-medium text-navy group-hover:text-teal">
            {title}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted">{summary}</p>
        </div>
        <span className="mt-4 text-sm font-medium text-teal sm:mt-0 sm:ml-6">
          Read article →
        </span>
      </Link>
    </li>
  );
}

export default function JapanMarketEntryPage() {
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/en/japan-market-entry`;
  const modelCases = listPublishedModelCases();

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
        item: pageUrl,
      },
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd),
        }}
      />

      {/* 1. Hero */}
      <section className="relative overflow-hidden bg-navy-deep text-white">
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_30%,rgba(26,138,138,0.35),transparent_55%),radial-gradient(ellipse_at_80%_70%,rgba(20,111,111,0.25),transparent_50%)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-5 py-16 md:py-24">
          <p className="text-xs font-medium tracking-wider text-teal">
            JAPAN MARKET ENTRY
          </p>
          <p className="mt-5 font-[family-name:var(--font-shippori)] text-[2.5rem] leading-none tracking-wide text-white sm:text-5xl md:text-6xl">
            BrandBridge
          </p>
          <h1 className="mt-6 max-w-3xl font-[family-name:var(--font-shippori)] text-[1.45rem] leading-[1.35] text-white sm:text-3xl md:mt-8 md:text-4xl">
            Japan Market Entry for Overseas Brands
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/85 md:text-lg">
            A practical hub for entering the Japanese market: distributors,
            retailers, ecommerce partners, product testing, and the commercial
            terms Japanese buyers expect before a first conversation.
          </p>
          <div className="mt-9 flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center">
            <Button
              href="/en/cases"
              className="w-full px-6 py-3.5 text-base shadow-[0_12px_32px_rgba(26,138,138,0.45)] sm:w-auto"
            >
              Find Japanese Partners
            </Button>
            <Button
              href="/en/register/maker"
              variant="outline"
              className="w-full border-white/40 px-6 py-3.5 text-base text-white hover:border-white hover:bg-white/10 hover:text-white sm:w-auto"
            >
              List Your Brand
            </Button>
          </div>
          <p className="mt-5 text-sm text-white/75">
            Prefer to read first?{" "}
            <Link href="/en/blog" className="text-teal hover:underline">
              Browse English Japan market entry guides
            </Link>
          </p>
          <BlogImage
            id="citySkyline"
            alt="Tokyo business district skyline — Japan as a structured wholesale market"
            variant="hero"
            look="onDark"
            priority
          />
        </div>
      </section>

      {/* 2. Why Japan? */}
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-14 md:py-16">
          <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
            Why Japan?
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
            Japan is often considered by overseas brands looking for quality-conscious
            channels and structured wholesale relationships. The points below are
            general market-entry considerations—not performance promises.
          </p>
          <BlogImage
            id="waterTorii"
            alt="A torii gate standing in water — a gateway image for entering the Japanese market"
            className="max-w-3xl"
          />
          <ul className="mt-10 grid list-none gap-6 md:grid-cols-3">
            {whyJapan.map((item) => (
              <li
                key={item.title}
                className="rounded-lg border border-border bg-white px-5 py-6"
              >
                <h3 className="font-medium text-navy">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 3. Common Ways to Enter Japan */}
      <section className="border-b border-border bg-cream">
        <div className="mx-auto max-w-6xl px-5 py-14 md:py-16">
          <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
            Common Ways Overseas Brands Enter Japan
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
            Most brands use one or more Japanese partner types. Choosing the right
            path depends on category, channel goals, and commercial readiness.
          </p>
          <ul className="mt-10 grid list-none gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {entryWays.map((item) => (
              <li
                key={item.title}
                className="rounded-lg border border-border bg-white px-5 py-6"
              >
                <h3 className="font-medium text-navy">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Practical entry steps */}
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-14 md:py-16">
          <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
            Practical Steps for Japan Market Entry
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
            Entering the Japanese market is less about a single “best” channel and
            more about sequencing: fit, partner type, commercial readiness, a
            controlled test, then scale. For the BrandBridge workflow after you
            choose a path, see{" "}
            <Link
              href="/en/how-to-sell-in-japan"
              className="text-teal hover:underline"
            >
              How to Sell in Japan
            </Link>
            .
          </p>
          <ol className="mt-10 grid list-none gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {entrySteps.map((item) => (
              <li
                key={item.title}
                className="rounded-lg border border-border bg-white px-5 py-6"
              >
                <h3 className="font-medium text-navy">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {item.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Ecommerce entry */}
      <section className="border-b border-border bg-cream">
        <div className="mx-auto max-w-6xl px-5 py-14 md:py-16">
          <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
            Entering the Japan Ecommerce Market
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
            If your search intent is the best way to enter Japan ecommerce,
            treat online as a first sales channel—not always as the final
            structure. Ecommerce partners help you sell online in Japan while you
            learn pricing, MOQ, and demand before wider retail distribution.
          </p>
          <ul className="mt-10 grid list-none gap-5 md:grid-cols-3">
            {ecommerceEntry.map((item) => (
              <li
                key={item.title}
                className="rounded-lg border border-border bg-white px-5 py-6"
              >
                <h3 className="font-medium text-navy">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-sm leading-relaxed text-muted">
            Looking for distributors or retail partners instead? Start with{" "}
            <Link
              href="/en/japan-market-entry/how-to-find-japanese-distributors"
              className="text-teal hover:underline"
            >
              How to Find Japanese Distributors
            </Link>{" "}
            or{" "}
            <Link
              href="/en/japan-market-entry/how-to-find-japanese-retailers"
              className="text-teal hover:underline"
            >
              How to Find Japanese Retailers
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Product readiness */}
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-14 md:py-16">
          <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
            Product, Pricing, and Labeling Readiness
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
            Japanese partners evaluate whether they can sell your product—not only
            whether they like the brand story. Prepare these points before
            outreach.
          </p>
          <ul className="mt-10 grid list-none gap-5 md:grid-cols-3">
            {productReadiness.map((item) => (
              <li
                key={item.title}
                className="rounded-lg border border-border bg-white px-5 py-6"
              >
                <h3 className="font-medium text-navy">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 4. Common Challenges */}
      <section className="border-b border-border bg-cream">
        <div className="mx-auto max-w-6xl px-5 py-14 md:py-16">
          <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
            Common Challenges
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
            Overseas brands often face the same practical hurdles when exploring
            Japan—especially without a local office.
          </p>
          <ul className="mt-10 grid list-none gap-5 sm:grid-cols-2">
            {challenges.map((item) => (
              <li
                key={item.title}
                className="rounded-lg border border-border bg-white px-5 py-6"
              >
                <h3 className="font-medium text-navy">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 5. What Japanese Partners Need to Know */}
      <section className="border-b border-border bg-cream">
        <div className="mx-auto max-w-6xl px-5 py-14 md:py-16">
          <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
            What Japanese Partners Need to Know
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
            Clear commercial and product information helps Japanese partners decide
            whether a first discussion is worth starting. BrandBridge listings are
            designed around these points.
          </p>
          <ul className="mt-10 grid list-none gap-4 sm:grid-cols-2">
            {partnerNeeds.map((item) => (
              <li
                key={item.label}
                className="rounded-lg border border-border bg-white px-5 py-5"
              >
                <h3 className="text-sm font-semibold text-navy">{item.label}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 6. How BrandBridge Can Help */}
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-14 md:py-16">
          <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
            How BrandBridge Can Help
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
            BrandBridge is a B2B marketplace where overseas brands can present
            products and trade terms for Japanese business partners to review.
          </p>
          <ul className="mt-10 grid list-none gap-5 md:grid-cols-2">
            {brandBridgeHelp.map((item) => (
              <li
                key={item.title}
                className="rounded-lg border border-border bg-white px-5 py-6"
              >
                <h3 className="font-medium text-navy">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 7. Model Cases */}
      <section className="border-b border-border bg-cream">
        <div className="mx-auto max-w-6xl px-5 py-14 md:py-16">
          <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
            Model Cases
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
            Illustrative sample deal flows—not published records of completed
            transactions. Use them to understand the information Japanese partners
            typically review.
          </p>
          <ul className="mt-8 list-none space-y-4">
            {modelCases.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/en/model-cases/${item.slug}`}
                  className="group flex flex-col rounded-lg border border-teal/25 bg-cream/40 px-5 py-6 transition hover:border-teal/50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded border border-teal/30 bg-teal/10 px-2 py-0.5 text-[11px] font-semibold tracking-[0.12em] text-teal-dark">
                        {MODEL_CASE_TYPE_LABEL[item.type]}
                      </span>
                      <span className="text-xs text-muted">
                        Illustrative example
                      </span>
                    </div>
                    <p className="mt-3 font-medium text-navy group-hover:text-teal">
                      {item.shortTitle} Entering Japan
                    </p>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
                      An illustrative example showing how an overseas brand could
                      move from product listing to commercial discussion with
                      Japanese partners.
                    </p>
                  </div>
                  <span className="mt-4 text-sm font-medium text-teal sm:mt-0 sm:ml-6">
                    View Model Case →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 8. English blog guides */}
      <section className="border-b border-border bg-cream">
        <div className="mx-auto max-w-6xl px-5 py-14 md:py-16">
          <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
            Complete English Guides
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
            Longer walkthroughs grouped by search intent: Market Entry,
            Distributors, Retailers, Import Requirements, Costs, and MOQ.
          </p>

          <div className="mt-10 space-y-10">
            {EN_BLOG_INTENT_GROUPS.map((group) => (
              <div key={group.heading}>
                <h3 className="font-[family-name:var(--font-shippori)] text-lg text-navy">
                  {group.heading}
                </h3>
                <ul className="mt-4 list-none space-y-3">
                  {group.slugs.map((slug) => {
                    const article = getEnBlogArticle(slug);
                    if (!article) return null;
                    return (
                      <EnglishGuideCard
                        key={article.slug}
                        href={enBlogPath(article.slug)}
                        title={article.title}
                        summary={article.description}
                      />
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Japan Market Entry Resources */}
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-14 md:py-16">
          <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
            Japan Market Entry Resources
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
            Practical guides for overseas brands researching how to enter the
            Japanese market.
          </p>
          <ul className="mt-8 list-none space-y-3">
            <li>
              <Link
                href="/en/japan-market-entry/how-to-enter-the-japanese-market"
                className="group flex flex-col rounded-lg border border-border bg-white px-5 py-6 transition hover:border-teal/40 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-xs font-semibold tracking-[0.12em] text-teal">
                    GUIDE
                  </p>
                  <p className="mt-2 font-medium text-navy group-hover:text-teal">
                    How to Enter the Japanese Market: A Practical Guide for
                    Overseas Brands
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    Main steps to consider before entering Japan—market fit,
                    sales channels, commercial preparation, and partner
                    selection.
                  </p>
                </div>
                <span className="mt-4 text-sm font-medium text-teal sm:mt-0 sm:ml-6">
                  Read guide →
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/en/japan-market-entry/how-to-find-japanese-distributors"
                className="group flex flex-col rounded-lg border border-border bg-white px-5 py-6 transition hover:border-teal/40 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-xs font-semibold tracking-[0.12em] text-teal">
                    GUIDE
                  </p>
                  <p className="mt-2 font-medium text-navy group-hover:text-teal">
                    How to Find Japanese Distributors for Your Brand
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    How overseas and DTC brands can identify, evaluate, and
                    approach Japanese distributors and related sales partners.
                  </p>
                </div>
                <span className="mt-4 text-sm font-medium text-teal sm:mt-0 sm:ml-6">
                  Read guide →
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/en/japan-market-entry/how-to-find-a-japanese-distributor"
                className="group flex flex-col rounded-lg border border-border bg-white px-5 py-6 transition hover:border-teal/40 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-xs font-semibold tracking-[0.12em] text-teal">
                    GUIDE
                  </p>
                  <p className="mt-2 font-medium text-navy group-hover:text-teal">
                    How to Find a Japanese Distributor for Your Brand
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    Practical steps for researching, evaluating, and managing a
                    Japanese distributor relationship during Japan market entry.
                  </p>
                </div>
                <span className="mt-4 text-sm font-medium text-teal sm:mt-0 sm:ml-6">
                  Read guide {"\u2192"}
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/en/japan-market-entry/how-to-find-japanese-retailers"
                className="group flex flex-col rounded-lg border border-border bg-white px-5 py-6 transition hover:border-teal/40 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-xs font-semibold tracking-[0.12em] text-teal">
                    GUIDE
                  </p>
                  <p className="mt-2 font-medium text-navy group-hover:text-teal">
                    How to Find Japanese Retailers for Your Brand
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    A practical guide for overseas brands looking for Japanese
                    retail partners.
                  </p>
                </div>
                <span className="mt-4 text-sm font-medium text-teal sm:mt-0 sm:ml-6">
                  Read guide →
                </span>
              </Link>
            </li>
          </ul>
        </div>
      </section>

      {/* 10. Existing Resources */}
      <section className="border-b border-border bg-cream">
        <div className="mx-auto max-w-6xl px-5 py-14 md:py-16">
          <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
            Existing Resources
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
            Continue with BrandBridge guides and live Japan expansion
            opportunities already on the platform.
          </p>
          <ul className="mt-8 list-none space-y-3">
            {resources.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="group flex flex-col rounded-lg border border-border bg-white px-5 py-6 transition hover:border-teal/40 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-navy group-hover:text-teal">
                      {item.title}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      {item.body}
                    </p>
                  </div>
                  <span className="mt-4 text-sm font-medium text-teal sm:mt-0 sm:ml-6">
                    View →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 10. FAQ */}
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-14 md:py-16">
          <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
            FAQ
          </h2>
          <dl className="mt-10 space-y-4">
            {faq.map((item) => (
              <div
                key={item.q}
                className="rounded-lg border border-border bg-white px-5 py-5"
              >
                <dt className="font-medium text-navy">{item.q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-muted">
                  {item.a}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* 11. Final CTA */}
      <section className="relative overflow-hidden bg-navy-deep text-white">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 20% 50%, rgba(26,138,138,0.55), transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(20,111,111,0.35), transparent 50%)",
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-5 py-16 text-center md:py-20">
          <h2 className="font-[family-name:var(--font-shippori)] text-2xl leading-snug md:text-3xl">
            Ready to explore the Japanese market?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/75 md:text-base">
            List your brand and let Japanese business partners review your product
            and commercial terms.
          </p>
          <div className="mx-auto mt-8 flex w-full max-w-lg flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
            <Button
              href="/en/register/maker"
              className="w-full py-3.5 text-base sm:w-auto sm:min-w-[180px]"
            >
              List Your Brand
            </Button>
            <Button
              href="/en/contact"
              variant="outline"
              className="w-full border-white/40 py-3.5 text-base text-white hover:border-white hover:bg-white/10 hover:text-white sm:w-auto sm:min-w-[180px]"
            >
              Talk to BrandBridge
            </Button>
          </div>
          <p className="mt-6 text-sm text-white/65">
            <Link href="/en" className="underline-offset-2 hover:underline">
              Back to English home
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
