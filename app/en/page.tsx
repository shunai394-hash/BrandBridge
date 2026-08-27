import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { pairedLanguageAlternates } from "@/lib/hreflang";
import {
  jsonLdString,
  organizationJsonLd,
  websiteJsonLd,
} from "@/lib/seo-jsonld";

export const metadata: Metadata = {
  title: {
    absolute: "BrandBridge | Find Japanese Distributors for Your Brand",
  },
  description:
    "BrandBridge helps overseas manufacturers find qualified Japanese distributors, retailers, wholesalers, and e-commerce partners with transparent commercial terms before contact.",
  ...pairedLanguageAlternates("/", "/en", "en"),
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "BrandBridge | Find Japanese Distributors for Your Brand",
    description:
      "BrandBridge helps overseas manufacturers find qualified Japanese distributors, retailers, wholesalers, and e-commerce partners with transparent commercial terms before contact.",
    url: "/en",
    locale: "en_US",
    type: "website",
  },
};

const heroBenefits = [
  {
    title: "No Japanese entity required",
    description:
      "Enter Japan without opening a local office. Connect with Japanese business partners through BrandBridge.",
  },
  {
    title: "Commercial terms visible upfront",
    description:
      "Partners can review MOQ, wholesale pricing, exclusivity, and shipping conditions before contacting brands.",
  },
  {
    title: "Qualified Japanese partners",
    description:
      "Connect with distributors, retailers, wholesalers, and e-commerce partners looking for international brands.",
  },
] as const;

const trustStrip = [
  "Business-use marketplace",
  "Terms visible upfront",
  "No Japanese office required",
  "Early-access onboarding support",
] as const;

const foundingBenefits = [
  "Priority visibility to Japanese partners",
  "Hands-on onboarding support",
  "Early marketplace positioning",
  "Feedback from Japanese buyers",
] as const;

const partnerTypes = [
  { title: "Retailers", hint: "Specialty & department retail" },
  { title: "Distributors", hint: "Nationwide channel coverage" },
  { title: "Wholesalers", hint: "Volume & regional supply" },
  { title: "Importers", hint: "Import-ready partners" },
  { title: "E-commerce", hint: "Online retail operators" },
] as const;

const whyJapan = [
  "High purchasing power",
  "Large premium consumer market",
  "Strong demand for imported brands",
  "Reliable long-term business environment",
] as const;

const howSteps = [
  {
    step: "01",
    title: "List your products",
    body: "Publish the commercial details Japanese partners need to evaluate fit.",
    details: ["MOQ", "Wholesale price", "Exclusivity", "Shipping conditions"],
  },
  {
    step: "02",
    title:
      "Qualified Japanese partners browse listings relevant to their channel and category",
    body: "Distributors, retailers, wholesalers, and e-commerce partners browse listings that match their channels.",
    details: null,
  },
  {
    step: "03",
    title: "Negotiate directly",
    body: "Discuss fit directly on BrandBridge and decide whether to move forward with each opportunity.",
    details: null,
  },
] as const;

const whyJoin = [
  "Qualified Japanese partners",
  "No Japanese office required",
  "Direct wholesale opportunities",
  "Transparent deal terms",
] as const;

const termPillars = [
  "MOQ",
  "Wholesale pricing",
  "Exclusivity",
  "Logistics",
] as const;

const faqs = [
  {
    q: "Is listing free?",
    a: "Yes. BrandBridge currently charges no upfront listing fees.",
  },
  {
    q: "Do I need a Japanese company?",
    a: "No.",
  },
  {
    q: "Can I choose my own distributor?",
    a: "Yes. You decide whether to proceed with every opportunity.",
  },
  {
    q: "What information is required?",
    a: "Company, products, MOQ, wholesale pricing, and shipping.",
  },
] as const;

export default function EnglishHomePage() {
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdString(organizationJsonLd()),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdString(websiteJsonLd("en")),
        }}
      />
      <section className="relative overflow-hidden bg-navy-deep text-white">
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_30%,rgba(26,138,138,0.35),transparent_55%),radial-gradient(ellipse_at_80%_70%,rgba(20,111,111,0.25),transparent_50%)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-5 py-16 md:py-24">
          <p className="text-xs font-medium tracking-wider text-teal">
            FOR OVERSEAS MANUFACTURERS
          </p>
          <p className="mt-5 font-[family-name:var(--font-shippori)] text-[2.5rem] leading-none tracking-wide text-white sm:text-5xl md:text-6xl">
            BrandBridge
          </p>
          <h1 className="mt-6 max-w-3xl font-[family-name:var(--font-shippori)] text-[1.45rem] leading-[1.35] text-white sm:text-3xl md:mt-8 md:text-4xl">
            Find Qualified Japanese Distributors for Your Brand
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/85 md:text-lg">
            Find qualified Japanese distributors for your brand — with MOQ,
            wholesale pricing, exclusivity, and shipping terms visible upfront.
          </p>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/70">
            Qualified partners are reviewed based on business profile, sales
            channels, category relevance, and partnership intent.
          </p>
          <div className="mt-9 flex w-full max-w-md flex-col gap-3 sm:mt-10 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center">
            <Button
              href="/en/register/maker"
              className="w-full px-6 py-3.5 text-base shadow-[0_12px_32px_rgba(26,138,138,0.45)] sm:w-auto"
            >
              Apply for Early Access
            </Button>
            <Button
              href="/en/how-to-sell-in-japan"
              variant="outline"
              className="w-full border-white/40 px-6 py-3.5 text-base text-white hover:border-white hover:bg-white/10 hover:text-white sm:w-auto"
            >
              See How BrandBridge Works
            </Button>
          </div>
          <p className="mt-5 max-w-2xl text-sm text-white/75">
            Researching Japan first?{" "}
            <Link
              href="/en/japan-market-entry"
              className="text-teal hover:underline"
            >
              Open the Japan Market Entry hub
            </Link>
            {" · "}
            <Link href="/en/blog" className="text-teal hover:underline">
              English guides
            </Link>
          </p>
          <ul className="mt-10 grid gap-3 sm:grid-cols-3 sm:gap-4">
            {heroBenefits.map((item) => (
              <li
                key={item.title}
                className="rounded-lg border border-white/15 bg-white/5 px-4 py-5 backdrop-blur-[2px]"
              >
                <h2 className="text-sm font-semibold text-white md:text-base">
                  {item.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-white/75">
                  {item.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-b border-border bg-white">
        <div className="mx-auto max-w-6xl px-5 py-5 md:py-6">
          <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 md:gap-x-8">
            {trustStrip.map((item) => (
              <li
                key={item}
                className="text-xs font-medium tracking-wide text-navy/80 md:text-sm"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-b border-border bg-cream">
        <div className="mx-auto max-w-6xl px-5 py-12 md:py-14">
          <h2 className="text-center font-[family-name:var(--font-shippori)] text-xl text-navy md:text-2xl">
            Trusted Japanese Business Partners
          </h2>
          <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 md:gap-4">
            {partnerTypes.map((item) => (
              <li
                key={item.title}
                className="rounded-lg border border-border bg-white px-3 py-5 text-center"
              >
                <p className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-teal/10 text-sm font-semibold text-teal-dark">
                  {item.title.charAt(0)}
                </p>
                <p className="mt-3 text-sm font-medium text-navy">{item.title}</p>
                <p className="mt-1 text-xs leading-snug text-muted">{item.hint}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-14 md:py-16">
          <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
            Why Japan?
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
            Japan remains one of the strongest markets for overseas brands that
            arrive with clear terms and the right local partners.
          </p>
          <ul className="mt-8 grid list-none gap-3 sm:grid-cols-2">
            {whyJapan.map((item) => (
              <li
                key={item}
                className="rounded-lg border border-border bg-white px-4 py-4 text-sm text-navy"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-b border-border bg-cream">
        <div className="mx-auto max-w-6xl px-5 py-14 md:py-16">
          <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
            How BrandBridge Works
          </h2>
          <ol className="mt-10 space-y-6">
            {howSteps.map((item) => (
              <li
                key={item.step}
                className="rounded-lg border border-border bg-white px-5 py-6 md:px-6"
              >
                <p className="text-xs font-medium tracking-wider text-teal">
                  Step {item.step}
                </p>
                <h3 className="mt-2 font-medium text-navy md:text-lg">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {item.body}
                </p>
                {item.details ? (
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {item.details.map((d) => (
                      <li
                        key={d}
                        className="rounded-md border border-teal/20 bg-teal/[0.06] px-2.5 py-1 text-xs font-medium text-teal-dark"
                      >
                        {d}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-14 md:py-16">
          <p className="text-xs font-medium tracking-wider text-teal">
            Why BrandBridge?
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
            Not Just an Introduction
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
            Unlike a generic directory, BrandBridge helps Japanese partners
            review your trade terms before they reach out.
          </p>
          <ul className="mt-8 flex flex-wrap gap-2">
            {termPillars.map((item) => (
              <li
                key={item}
                className="rounded-md border border-border bg-white px-3.5 py-2 text-sm font-medium text-navy"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-b border-border bg-cream">
        <div className="mx-auto max-w-6xl px-5 py-14 md:py-16">
          <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
            Why Manufacturers Join
          </h2>
          <ul className="mt-8 grid list-none gap-3 sm:grid-cols-2">
            {whyJoin.map((item) => (
              <li
                key={item}
                className="rounded-lg border border-border bg-white px-4 py-4 text-sm text-navy"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-b border-border bg-navy-deep text-white">
        <div className="mx-auto max-w-6xl px-5 py-14 md:py-16">
          <p className="text-xs font-medium tracking-wider text-teal">
            Early Access
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-shippori)] text-2xl md:text-3xl">
            Founding Manufacturer Program
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/80 md:text-base">
            Early brands receive:
          </p>
          <ul className="mt-6 max-w-xl space-y-3">
            {foundingBenefits.map((item) => (
              <li
                key={item}
                className="flex gap-3 text-sm leading-relaxed text-white/85 md:text-base"
              >
                <span className="mt-0.5 text-teal" aria-hidden>
                  {"\u2713"}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center">
            <Button
              href="/en/register/maker"
              className="w-full px-6 py-3.5 text-base sm:w-auto"
            >
              Apply for Early Access
            </Button>
            <Button
              href="/en/how-to-sell-in-japan"
              variant="outline"
              className="w-full border-white/40 px-6 py-3.5 text-base text-white hover:border-white hover:bg-white/10 hover:text-white sm:w-auto"
            >
              See How BrandBridge Works
            </Button>
          </div>
        </div>
      </section>

      <section id="pricing" className="border-b border-border bg-cream">
        <div className="mx-auto max-w-6xl px-5 py-14 md:py-16">
          <p className="text-xs font-medium tracking-wider text-teal">
            Pricing
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
            Start listing your products with no upfront cost during the current
            beta period.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-teal/30 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium tracking-wide text-teal">
                Beta Period
              </p>
              <p className="mt-3 font-[family-name:var(--font-shippori)] text-3xl text-navy">
                Free
              </p>
              <ul className="mt-6 space-y-3 text-sm text-navy">
                <li>{"\u2713"} Free product listings</li>
                <li>{"\u2713"} Unlimited product listings</li>
                <li>{"\u2713"} No monthly subscription fee</li>
                <li>{"\u2713"} No listing fee</li>
                <li>{"\u2713"} 0% transaction fee during the beta period</li>
              </ul>
            </div>

            <div className="rounded-lg border border-border bg-white p-6">
              <p className="text-sm font-medium tracking-wide text-teal">
                After Official Launch
              </p>
              <p className="mt-3 font-[family-name:var(--font-shippori)] text-3xl text-navy">
                8%
              </p>
              <p className="mt-1 text-sm text-muted">
                of the initial transaction value
              </p>
              <ul className="mt-6 space-y-3 text-sm text-navy">
                <li>{"\u2713"} Paid by the product provider</li>
                <li>{"\u2713"} No transaction fee for Japanese sales partners</li>
              </ul>
              <p className="mt-6 text-xs leading-relaxed text-muted">
                The official launch date will be announced separately in
                advance.
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Button href="/en/register/maker" className="px-6 py-3.5 text-base">
              Apply for Early Access
            </Button>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-14 md:py-16">
          <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
            FAQ
          </h2>
          <dl className="mt-8 space-y-5">
            {faqs.map((item) => (
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
          <p className="mt-8 text-sm text-muted">
            Prefer to ask something else?{" "}
            <Link href="/en/contact" className="text-teal hover:underline">
              Contact BrandBridge
            </Link>
          </p>
        </div>
      </section>

      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-14 md:py-16">
          <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
            Learn More About Entering the Japanese Market
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
            Start with the Japan market entry hub, then open the English guide
            that matches your question—distributors, selling, or retail partners.
          </p>
          <ul className="mt-8 list-none space-y-3">
            <li>
              <Link
                href="/en/japan-market-entry"
                className="group flex flex-col rounded-lg border border-border bg-white px-5 py-6 transition hover:border-teal/40 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-navy group-hover:text-teal">
                    Japan Market Entry hub
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    Overview for overseas brands: Japanese distributors,
                    retailers, import requirements, costs, and MOQ.
                  </p>
                </div>
                <span className="mt-4 text-sm font-medium text-teal sm:mt-0 sm:ml-6">
                  View hub →
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/en/blog"
                className="group flex flex-col rounded-lg border border-border bg-white px-5 py-6 transition hover:border-teal/40 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-navy group-hover:text-teal">
                    English Japan market entry blog
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    Nine practical guides covering entry steps, partners,
                    import checks, cost, and first-order quantity.
                  </p>
                </div>
                <span className="mt-4 text-sm font-medium text-teal sm:mt-0 sm:ml-6">
                  Read articles →
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/en/blog/how-to-find-a-distributor-in-japan"
                className="group flex flex-col rounded-lg border border-border bg-white px-5 py-6 transition hover:border-teal/40 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-navy group-hover:text-teal">
                    How to Find a Distributor in Japan
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    Search and qualification for a Japanese distributor—not
                    the full market-entry sequence.
                  </p>
                </div>
                <span className="mt-4 text-sm font-medium text-teal sm:mt-0 sm:ml-6">
                  Read article →
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/en/blog/how-to-sell-products-in-japan"
                className="group flex flex-col rounded-lg border border-border bg-white px-5 py-6 transition hover:border-teal/40 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-navy group-hover:text-teal">
                    How to Sell Products in Japan
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    Selling models, first SKU, and a test with a Japanese
                    retail or e-commerce partner.
                  </p>
                </div>
                <span className="mt-4 text-sm font-medium text-teal sm:mt-0 sm:ml-6">
                  Read article →
                </span>
              </Link>
            </li>
          </ul>
        </div>
      </section>

      <section className="border-b border-border bg-cream">
        <div className="mx-auto max-w-6xl px-5 py-14 md:py-16">
          <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
            Industry Resources
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
            Explore Japan market entry by category. BrandBridge remains open to
            manufacturers across industries.
          </p>
          <ul className="mt-8 list-none space-y-3">
            <li>
              <Link
                href="/en/japan-market-entry"
                className="group flex flex-col rounded-lg border border-border bg-white px-5 py-6 transition hover:border-teal/40 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-navy group-hover:text-teal">
                    Japan Market Entry hub
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    A practical hub for overseas brands exploring Japanese
                    distributors, importers, retailers, and e-commerce partners.
                  </p>
                </div>
                <span className="mt-4 text-sm font-medium text-teal sm:mt-0 sm:ml-6">
                  View guide {"\u2192"}
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/en/japan-partner-demand-snapshot"
                className="group flex flex-col rounded-lg border border-border bg-white px-5 py-6 transition hover:border-teal/40 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-navy group-hover:text-teal">
                    Japan Partner Demand Snapshot
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    What Japanese partners look for when evaluating overseas
                    brands—across categories.
                  </p>
                </div>
                <span className="mt-4 text-sm font-medium text-teal sm:mt-0 sm:ml-6">
                  View guide {"\u2192"}
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/en/japan-market-for-functional-food-brands"
                className="group flex flex-col rounded-lg border border-border bg-white px-5 py-6 transition hover:border-teal/40 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-navy group-hover:text-teal">
                    Functional Food &amp; Wellness
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    Japan market entry notes for overseas functional food and
                    wellness brands.
                  </p>
                </div>
                <span className="mt-4 text-sm font-medium text-teal sm:mt-0 sm:ml-6">
                  View guide {"\u2192"}
                </span>
              </Link>
            </li>
          </ul>
        </div>
      </section>

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
            Start selling in Japan
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/75 md:text-base">
            Apply for early access to list your brand for qualified Japanese
            partners—or see how BrandBridge works first.
          </p>
          <div className="mx-auto mt-8 flex w-full max-w-lg flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
            <Button
              href="/en/register/maker"
              className="w-full py-3.5 text-base sm:w-auto sm:min-w-[180px]"
            >
              Apply for Early Access
            </Button>
            <Button
              href="/en/how-to-sell-in-japan"
              variant="outline"
              className="w-full border-white/40 py-3.5 text-base text-white hover:border-white hover:bg-white/10 hover:text-white sm:w-auto sm:min-w-[180px]"
            >
              See How BrandBridge Works
            </Button>
          </div>
          <p className="mt-6 text-sm text-white/65">
            <Link href="/" className="underline-offset-2 hover:underline">
              Back to Japanese home
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
