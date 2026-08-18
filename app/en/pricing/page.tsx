import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { pairedLanguageAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "BrandBridge pricing. Sales partners can use BrandBridge for free, while manufacturers can join and use the platform for free during the beta period.",
  ...pairedLanguageAlternates("/pricing", "/en/pricing", "en"),
};

const partnerFreeFeatures = [
  "Browse product opportunities",
  "View detailed product information",
  "Contact manufacturers",
  "Submit partnership applications",
  "Communicate via chat",
] as const;

const starterFeatures = [
  "Create a company profile",
  "Unlimited product listings",
  "Publish product information",
  "Receive inquiries from Japanese sales partners",
  "Basic negotiation management",
] as const;

const enterpriseFeatures = [
  "Large-scale product registration",
  "Multiple team member management",
  "Custom solutions",
] as const;

const betaBenefits = [
  "Priority listing",
  "Favorable early access terms",
  "Special conditions after the official pricing launch",
] as const;

function FeatureList({ items }: { items: readonly string[] }) {
  return (
    <ul className="mt-5 space-y-2.5 text-sm leading-relaxed text-muted">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span
            className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal"
            aria-hidden
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function PricingPage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-navy-deep text-white">
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_30%,rgba(26,138,138,0.35),transparent_55%),radial-gradient(ellipse_at_80%_70%,rgba(20,111,111,0.25),transparent_50%)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-5 py-16 md:py-24">
          <Link
            href="/en"
            className="text-sm text-white/65 transition hover:text-white"
          >
            ← Back to Home
          </Link>
          <p className="mt-6 text-xs font-medium tracking-wider text-teal">
            PRICING
          </p>
          <h1 className="mt-3 max-w-3xl font-[family-name:var(--font-shippori)] text-[1.75rem] leading-snug sm:text-3xl md:text-4xl lg:text-5xl">
            Pricing
          </h1>
        </div>
      </section>

      {/* Sales Partners */}
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-14 md:py-16">
          <p className="text-xs font-medium tracking-wider text-teal">
            SALES PARTNERS
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
            Free
          </h2>

          <div className="mt-8 max-w-lg rounded-lg border border-border bg-white px-6 py-7">
            <p className="font-[family-name:var(--font-shippori)] text-3xl text-navy">
              ¥0
              <span className="ml-1 text-base font-normal text-muted">
                / month
              </span>
            </p>

            <p className="mt-3 text-sm leading-relaxed text-muted">
              For companies looking for new products and brands to sell in
              Japan.
            </p>

            <FeatureList items={partnerFreeFeatures} />

            <div className="mt-7">
              <Button href="/en/register/partner" className="w-full sm:w-auto">
                Register as a Sales Partner
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Manufacturers */}
      <section className="bg-cream">
        <div className="mx-auto max-w-6xl px-5 py-14 md:py-16">
          <p className="text-xs font-medium tracking-wider text-teal">
            MANUFACTURERS & BRANDS
          </p>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {/* Starter */}
            <article className="flex flex-col rounded-lg border-2 border-teal bg-white px-6 py-7 shadow-[0_12px_32px_rgba(26,138,138,0.12)]">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-[family-name:var(--font-shippori)] text-xl text-navy">
                  Starter
                </h3>

                <span className="rounded-md border border-teal/40 bg-teal/10 px-2 py-0.5 text-xs font-medium text-teal">
                  Beta Period
                </span>
              </div>

              <p className="mt-4 font-[family-name:var(--font-shippori)] text-3xl text-navy">
                ¥0
                <span className="ml-1 text-base font-normal text-muted">
                  / month
                </span>
              </p>

              <p className="mt-3 text-sm leading-relaxed text-muted">
                For companies that want to list their products and test
                demand in the Japanese market.
              </p>

              <FeatureList items={starterFeatures} />

              <div className="mt-auto pt-7">
                <Button href="/en/register/maker" className="w-full">
                  Register as a Manufacturer
                </Button>
              </div>
            </article>

            {/* Enterprise */}
            <article className="flex flex-col rounded-lg border border-border bg-white px-6 py-7">
              <h3 className="font-[family-name:var(--font-shippori)] text-xl text-navy">
                Enterprise
              </h3>

              <p className="mt-4 font-[family-name:var(--font-shippori)] text-3xl text-navy">
                Custom
              </p>

              <p className="mt-3 text-sm leading-relaxed text-muted">
                For companies with larger-scale requirements.
              </p>

              <FeatureList items={enterpriseFeatures} />

              <p className="mt-4 text-xs leading-relaxed text-muted">
                Custom services and features may be expanded in the future.
              </p>

              <div className="mt-auto pt-7">
                <Button href="/en/contact" variant="outline" className="w-full">
                  Contact Us
                </Button>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Transaction Fees */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-14 md:py-16">
          <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
            Transaction Fees
          </h2>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-white px-6 py-6">
              <p className="text-xs font-medium tracking-wider text-teal">
                During the Beta Period
              </p>

              <p className="mt-2 font-[family-name:var(--font-shippori)] text-2xl text-navy">
                0%
              </p>

              <p className="mt-2 text-sm leading-relaxed text-muted">
                No transaction fees are charged during the beta period.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-white px-6 py-6">
              <p className="text-xs font-medium tracking-wider text-muted">
                After Official Launch
              </p>

              <p className="mt-2 font-[family-name:var(--font-shippori)] text-2xl text-navy">
                8% of the first transaction value
              </p>

              <p className="mt-2 text-sm leading-relaxed text-muted">
                After the official launch, manufacturers will pay an 8%
                transaction fee on the value of the first successful
                transaction. Sales partners will not be charged transaction
                fees.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Beta Benefits */}
      <section className="bg-cream">
        <div className="mx-auto max-w-6xl px-5 py-14 md:py-16">
          <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
            Beta Benefits
          </h2>

          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
            During the beta period, BrandBridge is completely free to use,
            including both monthly fees and transaction fees. Details of the
            official pricing structure will be announced based on the
            platform&apos;s usage and development.
          </p>

          <ul className="mt-6 grid gap-3 sm:grid-cols-3">
            {betaBenefits.map((item) => (
              <li
                key={item}
                className="rounded-lg border border-border bg-white px-5 py-5 text-sm font-medium text-navy"
              >
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button href="/en/register/maker" className="w-full sm:w-auto">
              Register as a Manufacturer
            </Button>

            <Button
              href="/en/register/partner"
              variant="outline"
              className="w-full sm:w-auto"
            >
              Register as a Sales Partner
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

