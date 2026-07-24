import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Expand Your Functional Food Brand Into Japan | BrandBridge",
  description:
    "Japan market entry for overseas functional food and wellness brands—reach distributors, importers, retailers, and e-commerce partners with clear MOQ, pricing, and deal terms.",
};

const whyJapan = [
  {
    title: "Premium wellness demand",
    body: "Japanese consumers invest heavily in supplements, functional foods, and evidence-led wellness products with clear quality stories.",
  },
  {
    title: "Import appetite for differentiation",
    body: "Buyers look for overseas brands that fill gaps in local assortments—clean labels, unique formats, and clinically positioned claims.",
  },
  {
    title: "Long-term retail relationships",
    body: "Once a product earns trust with Japanese partners, reorder cycles and channel expansion can support durable wholesale growth.",
  },
  {
    title: "Partner-led market entry",
    body: "Qualified local partners can handle distribution, retail introductions, and often import logistics—without requiring a Japan entity first.",
  },
] as const;

const buyerTypes = [
  {
    title: "Importers & specialty distributors",
    body: "Companies that bring overseas functional foods and supplements into Japan and supply retail or wholesale networks.",
  },
  {
    title: "Health & beauty retailers",
    body: "Drugstore, specialty wellness, and premium retail buyers seeking differentiated SKUs with clear sell-through potential.",
  },
  {
    title: "Wholesalers",
    body: "Volume-oriented partners supplying regional chains, independent stores, and foodservice-adjacent channels.",
  },
  {
    title: "E-commerce operators",
    body: "Online retailers and marketplace sellers focused on supplements, functional beverages, and wellness categories.",
  },
] as const;

const channels = [
  "Drugstores & pharmacies",
  "Specialty wellness / natural retail",
  "Department store lifestyle floors",
  "Gourmet & premium grocery",
  "Direct-to-consumer e-commerce",
  "Marketplace storefronts",
  "Corporate / gift assortments (where fit)",
] as const;

const howSteps = [
  {
    step: "01",
    title: "List your functional food products",
    body: "Share brand positioning, product details, and the commercial terms Japanese buyers need before they inquire.",
  },
  {
    step: "02",
    title: "Qualified Japanese partners discover your listing",
    body: "Importers, distributors, retailers, and e-commerce operators review products that match their category and channel focus.",
  },
  {
    step: "03",
    title: "Negotiate directly on BrandBridge",
    body: "Continue wholesale discussions in one place and decide whether each opportunity is right for your brand.",
  },
] as const;

const requiredInfo = [
  {
    label: "MOQ",
    body: "Minimum order quantity so partners can judge first-order feasibility.",
  },
  {
    label: "Pricing",
    body: "Wholesale price range or quote process for Japan-bound orders.",
  },
  {
    label: "Exclusivity",
    body: "Whether territory or channel exclusivity is available—and under what conditions.",
  },
  {
    label: "Shipping",
    body: "Ship-from location, lead times, Incoterms preferences, and logistics notes.",
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
            FUNCTIONAL FOOD &amp; WELLNESS
          </p>
          <p className="mt-5 font-[family-name:var(--font-shippori)] text-[2.5rem] leading-none tracking-wide text-white sm:text-5xl md:text-6xl">
            BrandBridge
          </p>
          <h1 className="mt-6 max-w-3xl font-[family-name:var(--font-shippori)] text-[1.45rem] leading-[1.35] text-white sm:text-3xl md:mt-8 md:text-4xl">
            Expand Your Functional Food Brand Into Japan
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/85 md:text-lg">
            Reach qualified Japanese importers, distributors, retailers, and
            e-commerce partners with transparent wholesale terms—built for
            overseas functional food and wellness brands.
          </p>
          <div className="mt-9 flex w-full max-w-md flex-col gap-3 sm:mt-10 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center">
            <Button
              href="/en/register/maker"
              className="w-full px-6 py-3.5 text-base shadow-[0_12px_32px_rgba(26,138,138,0.45)] sm:w-auto"
            >
              List Your Brand
            </Button>
            <Button
              href="/en/contact"
              variant="outline"
              className="w-full border-white/40 px-6 py-3.5 text-base text-white hover:border-white hover:bg-white/10 hover:text-white sm:w-auto"
            >
              Contact BrandBridge
            </Button>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-14 md:py-16">
          <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
            Why Japan for functional food brands
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
            Japan rewards wellness brands that arrive prepared—with clear
            product stories, reliable supply, and commercial terms partners can
            act on.
          </p>
          <ul className="mt-10 grid gap-6 md:grid-cols-2">
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
            Japanese buyer types
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
            BrandBridge connects you with B2B partners—not end consumers.
          </p>
          <ul className="mt-10 grid gap-5 sm:grid-cols-2">
            {buyerTypes.map((item) => (
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
            Potential sales channels
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
            Depending on your category and partner fit, functional food brands
            often enter Japan through these channels.
          </p>
          <ul className="mt-8 flex flex-wrap gap-2">
            {channels.map((item) => (
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
            How BrandBridge works
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

      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-14 md:py-16">
          <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
            Product information required
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
            Japanese partners evaluate commercial readiness before they reach
            out. Include these details in your listing.
          </p>
          <ul className="mt-10 grid gap-5 sm:grid-cols-2">
            {requiredInfo.map((item) => (
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
            Why BrandBridge?
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
            Not just a directory
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
            Unlike a simple company directory, BrandBridge lets Japanese partners
            review MOQ, wholesale pricing, exclusivity, and shipping conditions
            before they contact you—so inquiries start with commercial context,
            not a cold introduction.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button href="/en/register/maker" className="w-full sm:w-auto">
              List Your Brand
            </Button>
            <Button
              href="/en/contact"
              variant="outline"
              className="w-full sm:w-auto"
            >
              Contact BrandBridge
            </Button>
          </div>
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
            Ready to enter Japan&apos;s wellness market?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/75 md:text-base">
            List your functional food brand for qualified Japanese partners, or
            contact BrandBridge with your category and goals.
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
              Contact BrandBridge
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
