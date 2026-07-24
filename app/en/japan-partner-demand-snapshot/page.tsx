import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Japan Partner Demand Snapshot | BrandBridge",
  description:
    "What Japanese distributors, retailers, and e-commerce partners look for when evaluating overseas brands—and how clear business information starts better conversations.",
};

const lookForByCategory = [
  {
    title: "Beauty & Cosmetics",
    items: [
      "Regulatory compliance",
      "Ingredient labeling",
      "Product samples",
      "Packaging localization",
    ],
  },
  {
    title: "Functional Food & Wellness",
    items: [
      "Ingredients information",
      "Certifications",
      "Shelf life",
      "Import requirements",
      "Storage conditions",
    ],
  },
  {
    title: "Food & Beverage",
    items: [
      "Wholesale pricing",
      "MOQ",
      "Import documentation",
      "Distribution conditions",
    ],
  },
  {
    title: "Fashion & Lifestyle",
    items: [
      "Margin structure",
      "Exclusivity options",
      "Lead time",
      "Seasonal timing",
    ],
  },
] as const;

const expansionCategories = [
  "Beauty & Skincare",
  "Functional Food & Wellness",
  "Specialty Food & Beverage",
  "Lifestyle Products",
  "Fashion Accessories",
] as const;

const whyPartnersLook = [
  "Premium imported positioning",
  "Differentiated product story",
  "Small but scalable wholesale pilots",
  "E-commerce friendly products",
  "Repeat purchase potential",
] as const;

const fasterResponses = [
  "Clear wholesale pricing",
  "MOQ visibility",
  "Import / compliance information",
  "Shipping conditions",
  "Sample availability",
  "Exclusivity options",
] as const;

const beforeItems = [
  "Long email exchanges",
  "Unclear wholesale terms",
  "Difficult partner discovery",
  "Slow market entry",
] as const;

const withItems = [
  "Structured brand listing",
  "Clear business conditions",
  "Better partner matching",
  "Faster first commercial conversations",
] as const;

const whyBb = [
  "Present products clearly",
  "Share commercial conditions",
  "Connect with Japanese sales channels",
  "Start better business conversations",
] as const;

export default function JapanPartnerDemandSnapshotPage() {
  return (
    <div>
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
            Japan Partner Demand Snapshot
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/85 md:text-lg">
            What Japanese distributors, retailers, and e-commerce partners look
            for when evaluating overseas brands.
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
            What Japanese Partners Look For Before Starting a Conversation
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
            Japan&apos;s market size matters—but partners evaluate overseas
            brands using clear business information before they start a
            conversation.
          </p>
          <ul className="mt-10 grid gap-5 sm:grid-cols-2">
            {lookForByCategory.map((cat) => (
              <li
                key={cat.title}
                className="rounded-lg border border-border bg-white px-5 py-6"
              >
                <h3 className="font-medium text-navy">{cat.title}</h3>
                <ul className="mt-4 space-y-2">
                  {cat.items.map((item) => (
                    <li
                      key={item}
                      className="flex gap-2 text-sm leading-relaxed text-muted"
                    >
                      <span className="text-teal" aria-hidden>
                        •
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-b border-border bg-cream">
        <div className="mx-auto max-w-6xl px-5 py-14 md:py-16">
          <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
            Categories With Japan Expansion Potential
          </h2>
          <ul className="mt-8 flex flex-wrap gap-2">
            {expansionCategories.map((item) => (
              <li
                key={item}
                className="rounded-md border border-border bg-white px-3.5 py-2 text-sm font-medium text-navy"
              >
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-10 rounded-lg border border-border bg-white px-5 py-6 md:px-6">
            <h3 className="font-medium text-navy">
              Why Japanese partners look for these
            </h3>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {whyPartnersLook.map((item) => (
                <li
                  key={item}
                  className="flex gap-2 text-sm leading-relaxed text-muted"
                >
                  <span className="text-teal" aria-hidden>
                    •
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-14 md:py-16">
          <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
            What Information Gets Faster Responses From Japanese Partners
          </h2>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {fasterResponses.map((item) => (
              <li
                key={item}
                className="flex gap-3 rounded-lg border border-border bg-white px-4 py-4 text-sm text-navy"
              >
                <span className="font-medium text-teal" aria-hidden>
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-b border-border bg-cream">
        <div className="mx-auto max-w-6xl px-5 py-14 md:py-16">
          <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
            Before BrandBridge / With BrandBridge
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-white px-5 py-6">
              <h3 className="font-medium text-navy">Before</h3>
              <ul className="mt-4 space-y-2">
                {beforeItems.map((item) => (
                  <li
                    key={item}
                    className="flex gap-2 text-sm leading-relaxed text-muted"
                  >
                    <span aria-hidden>•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-teal/25 bg-teal/[0.06] px-5 py-6">
              <h3 className="font-medium text-navy">With BrandBridge</h3>
              <ul className="mt-4 space-y-2">
                {withItems.map((item) => (
                  <li
                    key={item}
                    className="flex gap-2 text-sm leading-relaxed text-muted"
                  >
                    <span className="text-teal" aria-hidden>
                      •
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-14 md:py-16">
          <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
            Why BrandBridge
          </h2>
          <p className="mt-4 max-w-2xl text-sm font-medium text-navy md:text-base">
            Not just an introduction.
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
            BrandBridge helps overseas manufacturers:
          </p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {whyBb.map((item) => (
              <li
                key={item}
                className="flex gap-3 rounded-lg border border-border bg-white px-4 py-4 text-sm text-navy"
              >
                <span className="text-teal" aria-hidden>
                  •
                </span>
                <span>{item}</span>
              </li>
            ))}
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
            Ready to explore Japan?
          </h2>
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
