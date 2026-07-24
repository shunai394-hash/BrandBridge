import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Expand Your Functional Food Brand Into Japan | BrandBridge",
  description:
    "BrandBridge helps overseas functional food and wellness brands explore Japan through qualified distributors, retailers, and e-commerce partners.",
};

const whyJapan = [
  {
    title: "Growing health and wellness demand",
    body: "Japanese consumers continue to invest in daily wellness—creating sustained interest in functional foods, supplements, and nutrition products with a clear value story.",
  },
  {
    title: "Functional nutrition market opportunity",
    body: "Partners look for overseas brands that complement local assortments with differentiated formats, ingredients, and positioning.",
  },
  {
    title: "Premium consumer segments",
    body: "Quality-conscious shoppers and specialty channels reward brands that arrive with credible claims, reliable supply, and professional commercial terms.",
  },
] as const;

const channels = [
  {
    title: "Importers",
    body: "Partners who bring overseas functional foods into Japan and connect them to domestic networks.",
  },
  {
    title: "Distributors",
    body: "Channel specialists who place products with retail, wholesale, and regional accounts.",
  },
  {
    title: "Specialty retailers",
    body: "Health, beauty, and wellness retailers seeking differentiated SKUs with clear sell-through potential.",
  },
  {
    title: "Fitness and wellness businesses",
    body: "Gyms, studios, and wellness operators that recommend or retail functional nutrition products.",
  },
  {
    title: "E-commerce operators",
    body: "Online retailers ready to evaluate products with transparent wholesale and shipping conditions.",
  },
] as const;

const prepareItems = [
  {
    label: "MOQ",
    body: "Minimum order quantity so partners can judge first-order feasibility.",
  },
  {
    label: "Wholesale pricing",
    body: "Price range or quote process for Japan-bound wholesale discussions.",
  },
  {
    label: "Exclusivity preference",
    body: "Whether territory or channel exclusivity is available—and under what conditions.",
  },
  {
    label: "Shipping conditions",
    body: "Ship-from location, lead times, and logistics preferences partners need to plan.",
  },
  {
    label: "Certifications",
    body: "Relevant quality, safety, or compliance credentials that support buyer evaluation.",
  },
] as const;

const howSteps = [
  {
    step: "1",
    title: "List your brand and products",
    body: "Share the commercial details Japanese partners need to evaluate fit.",
  },
  {
    step: "2",
    title: "Japanese partners review your information",
    body: "Qualified buyers assess category, terms, and channel alignment before reaching out.",
  },
  {
    step: "3",
    title: "Discuss distribution opportunities directly",
    body: "Continue conversations on BrandBridge and decide which opportunities to pursue.",
  },
] as const;

export default function FunctionalFoodJapanMarketPage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-navy-deep text-white">
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_30%,rgba(26,138,138,0.35),transparent_55%),radial-gradient(ellipse_at_80%_70%,rgba(20,111,111,0.25),transparent_50%)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-5 py-16 md:py-24">
          <p className="text-xs font-medium tracking-wider text-teal">
            FOR OVERSEAS FUNCTIONAL FOOD BRANDS
          </p>
          <p className="mt-5 font-[family-name:var(--font-shippori)] text-[2.5rem] leading-none tracking-wide text-white sm:text-5xl md:text-6xl">
            BrandBridge
          </p>
          <h1 className="mt-6 max-w-3xl font-[family-name:var(--font-shippori)] text-[1.45rem] leading-[1.35] text-white sm:text-3xl md:mt-8 md:text-4xl">
            Expand Your Functional Food Brand Into Japan
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/85 md:text-lg">
            BrandBridge helps overseas functional food and wellness brands
            explore Japan through qualified distributors, retailers, and
            e-commerce partners.
          </p>
          <div className="mt-9">
            <Button
              href="/en/register/maker"
              className="w-full px-6 py-3.5 text-base shadow-[0_12px_32px_rgba(26,138,138,0.45)] sm:w-auto"
            >
              List Your Brand
            </Button>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-14 md:py-16">
          <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
            Why Japan for Functional Food Brands
          </h2>
          <ul className="mt-10 grid gap-6 md:grid-cols-3">
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

      <section className="border-b border-border bg-cream">
        <div className="mx-auto max-w-6xl px-5 py-14 md:py-16">
          <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
            Find The Right Japanese Sales Channels
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
            Explore Japan with partners who already operate in the channels that
            move functional food and wellness products.
          </p>
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {channels.map((item) => (
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

      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-14 md:py-16">
          <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
            Prepare Your Product For Japanese Partners
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
            Serious conversations start when manufacturers provide the business
            conditions partners need to evaluate opportunity.
          </p>
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {prepareItems.map((item) => (
              <li
                key={item.label}
                className="rounded-lg border border-border bg-white px-5 py-6"
              >
                <h3 className="font-medium text-navy">{item.label}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-b border-border bg-cream">
        <div className="mx-auto max-w-6xl px-5 py-14 md:py-16">
          <p className="text-xs font-medium tracking-wider text-teal">
            Why BrandBridge Is Different
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
            More Than A Product Listing
          </h2>
          <p className="mt-2 text-sm font-medium text-navy">
            Not just a directory.
          </p>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
            Japanese partners need clear business conditions before discussions.
            BrandBridge organizes the information needed to start serious
            conversations—so outreach begins with commercial context, not a cold
            introduction.
          </p>
        </div>
      </section>

      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-14 md:py-16">
          <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
            How It Works
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
              </li>
            ))}
          </ol>
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
        <div className="relative mx-auto max-w-6xl px-5 py-16 md:py-20">
          <p className="text-xs font-medium tracking-wider text-teal">
            Early Access
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-shippori)] text-2xl md:text-3xl">
            Early Access Manufacturer Program
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/80 md:text-base">
            Selected overseas brands are being onboarded for Japan market
            exploration with BrandBridge.
          </p>
          <div className="mt-8">
            <Button
              href="/en/register/maker"
              className="w-full px-6 py-3.5 text-base sm:w-auto"
            >
              List Your Brand
            </Button>
          </div>
          <p className="mt-8 text-sm text-white/65">
            <Link href="/en" className="underline-offset-2 hover:underline">
              Back to English home
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
