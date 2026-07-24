import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Find Qualified Japanese Distributors for Your Brand",
  description:
    "BrandBridge helps overseas manufacturers find qualified Japanese distributors, retailers, wholesalers, and e-commerce partners—with transparent commercial terms before contact.",
};

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
    title: "Qualified Japanese partners discover your products",
    body: "Distributors, retailers, wholesalers, and e-commerce partners browse listings that match their channels.",
    details: null,
  },
  {
    step: "03",
    title: "Negotiate directly",
    body: "Continue discussions on BrandBridge and decide whether each opportunity is right for your brand.",
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
            Expand your brand into Japan with vetted distributors, retailers,
            wholesalers and e-commerce partners.
          </p>
          <div className="mt-9 flex w-full max-w-md flex-col gap-3 sm:mt-10 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center">
            <Button
              href="/en/register/maker"
              className="w-full px-6 py-3.5 text-base shadow-[0_12px_32px_rgba(26,138,138,0.45)] sm:w-auto"
            >
              List Your Brand
            </Button>
            <Button
              href="/en/how-to-sell-in-japan"
              variant="outline"
              className="w-full border-white/40 px-6 py-3.5 text-base text-white hover:border-white hover:bg-white/10 hover:text-white sm:w-auto"
            >
              Learn How It Works
            </Button>
          </div>
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
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {whyJapan.map((item) => (
              <li
                key={item}
                className="flex gap-3 rounded-lg border border-border bg-white px-4 py-4 text-sm text-navy"
              >
                <span className="mt-0.5 text-teal" aria-hidden>
                  •
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
            Unlike traditional directories, BrandBridge lets Japanese partners
            review the commercial terms they need before contacting you.
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
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {whyJoin.map((item) => (
              <li
                key={item}
                className="flex gap-3 rounded-lg border border-border bg-white px-4 py-4 text-sm text-navy"
              >
                <span className="mt-0.5 text-teal" aria-hidden>
                  •
                </span>
                <span>{item}</span>
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
            We are currently onboarding our first international brands for
            Japan.
          </p>
          <div className="mt-8">
            <Button
              href="/en/register/maker"
              className="w-full px-6 py-3.5 text-base sm:w-auto"
            >
              List Your Brand
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
            List your brand for qualified Japanese partners—or learn the full
            market-entry flow first.
          </p>
          <div className="mx-auto mt-8 flex w-full max-w-lg flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
            <Button
              href="/en/register/maker"
              className="w-full py-3.5 text-base sm:w-auto sm:min-w-[180px]"
            >
              List Your Brand
            </Button>
            <Button
              href="/en/how-to-sell-in-japan"
              variant="outline"
              className="w-full border-white/40 py-3.5 text-base text-white hover:border-white hover:bg-white/10 hover:text-white sm:w-auto sm:min-w-[180px]"
            >
              Learn How It Works
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
