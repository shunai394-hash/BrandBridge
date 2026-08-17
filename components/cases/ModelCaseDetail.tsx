import type { ReactNode } from "react";
import Link from "next/link";
import { BlogImage } from "@/components/blog/BlogImage";
import { Button } from "@/components/ui/Button";
import {
  MODEL_CASE_DISCLAIMER,
  MODEL_CASE_TYPE_LABEL,
  type ModelCase,
} from "@/lib/model-cases";
import type { BlogJapanImageId } from "@/lib/blog/japan-images";

type CaseVisual = {
  id: BlogJapanImageId;
  alt: string;
};

/** Optional atmosphere images only. Omit handshake/docs/analytics — those read as real deals. */
const MODEL_CASE_VISUALS: Record<
  string,
  { hero: CaseVisual; whyJapan: CaseVisual }
> = {
  "australian-clean-beauty": {
    hero: {
      id: "gardenTsukubai",
      alt: "A stone water basin in a Japanese garden — atmospheric setting for this illustrative Japan market-entry model case, not a photo of the brand",
    },
    whyJapan: {
      id: "shoppingStreet",
      alt: "A Japanese shopping street — illustrative specialty-retail context for this model case, not a completed listing or store placement",
    },
  },
};

type ModelCaseDetailProps = {
  modelCase: ModelCase;
};

function Section({
  title,
  children,
  id,
}: {
  title: string;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="mt-12 border-t border-border pt-10">
      <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function GlanceCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-white px-4 py-4">
      <p className="text-xs font-medium tracking-wide text-muted">{label}</p>
      <p className="mt-2 text-sm font-medium leading-snug text-navy">{value}</p>
    </div>
  );
}

export function ModelCaseDetail({ modelCase }: ModelCaseDetailProps) {
  const visuals = MODEL_CASE_VISUALS[modelCase.slug];
  const glance = [
    { label: "Brand Origin", value: modelCase.country },
    { label: "Category", value: modelCase.category },
    { label: "Product Type", value: modelCase.productType },
    { label: "Target Partner", value: modelCase.targetPartner },
    { label: "MOQ", value: modelCase.conditions.moq },
    { label: "Wholesale Price", value: modelCase.conditions.wholesalePrice },
    { label: "Exclusivity", value: modelCase.conditions.exclusivity },
    { label: "Shipping", value: modelCase.conditions.shipping },
    { label: "Regulatory", value: modelCase.conditions.regulatory },
    { label: "Stage", value: modelCase.stage },
  ];

  return (
    <article className="animate-fade-up" lang="en">
      <div className="mb-6">
        <Link href="/en/cases" className="text-sm text-teal hover:underline">
          ← Back to opportunities
        </Link>
      </div>

      {/* A. Hero */}
      <header className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded border border-teal/30 bg-teal/10 px-2.5 py-1 text-[11px] font-semibold tracking-[0.14em] text-teal-dark">
            {MODEL_CASE_TYPE_LABEL[modelCase.type]}
          </span>
          <span className="text-xs text-muted">Sample deal flow</span>
        </div>

        <h1 className="font-[family-name:var(--font-shippori)] text-3xl leading-snug text-navy md:text-4xl">
          {modelCase.title}
        </h1>

        <p className="max-w-3xl text-base leading-relaxed text-muted md:text-lg">
          {modelCase.subtitle}
        </p>

        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-relaxed text-amber-950">
          <p className="font-medium">MODEL CASE</p>
          <p className="mt-1">{MODEL_CASE_DISCLAIMER}</p>
          <p className="mt-2 text-amber-900/90">
            The commercial conditions below are illustrative examples for
            explaining the BrandBridge discussion flow—not published deal
            results.
          </p>
        </div>

        {visuals ? (
          <BlogImage
            id={visuals.hero.id}
            alt={visuals.hero.alt}
            variant="hero"
            priority
          />
        ) : null}
      </header>

      {/* B. At a Glance */}
      <Section title="At a Glance">
        <p className="mb-5 text-sm text-muted">
          Example / illustrative conditions for this model case.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {glance.map((item) => (
            <GlanceCard
              key={item.label}
              label={item.label}
              value={item.value}
            />
          ))}
        </div>
      </Section>

      {/* C. The Challenge */}
      <Section title="The Challenge">
        <ul className="space-y-3">
          {modelCase.challenge.map((item) => (
            <li
              key={item}
              className="rounded-lg border border-border bg-white px-4 py-3 text-sm text-navy"
            >
              {item}
            </li>
          ))}
        </ul>
      </Section>

      {/* D. How BrandBridge Changes the Process */}
      <Section title="How BrandBridge Changes the Process">
        <p className="mb-5 text-sm leading-relaxed text-muted">
          Designed to help discussions start with clearer commercial context.
          Outcomes depend on each brand and partner.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-cream/50 px-5 py-5">
            <h3 className="text-sm font-semibold tracking-wide text-muted">
              Before
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-navy">
              {modelCase.before.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-muted" aria-hidden>
                    -
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-teal/30 bg-teal/[0.06] px-5 py-5">
            <h3 className="text-sm font-semibold tracking-wide text-teal-dark">
              With BrandBridge
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-navy">
              {modelCase.withBrandBridge.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-teal" aria-hidden>
                    {"\u2713"}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* E. Deal Flow Timeline */}
      <Section title="Deal Flow Timeline">
        <p className="mb-6 text-sm text-muted">
          An illustrative sequence of how a discussion could progress on
          BrandBridge—not a record of a completed deal.
        </p>
        <ol className="space-y-4">
          {modelCase.timeline.map((item) => (
            <li
              key={item.step}
              className="rounded-lg border border-border bg-white px-5 py-5 md:px-6"
            >
              <p className="text-xs font-medium tracking-wider text-teal">
                Step {String(item.step).padStart(2, "0")}
              </p>
              <h3 className="mt-2 font-medium text-navy md:text-lg">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {item.description}
              </p>
            </li>
          ))}
        </ol>
      </Section>

      {/* F. Partner information */}
      <Section title="Information Japanese Partners Would Want to See">
        <ul className="grid gap-2 sm:grid-cols-2">
          {modelCase.partnerInformation.map((item) => (
            <li
              key={item}
              className="rounded-md border border-border bg-white px-3.5 py-2.5 text-sm text-navy"
            >
              {item}
            </li>
          ))}
        </ul>
      </Section>

      {/* G. Why this could work */}
      <Section title="Why This Could Work in Japan">
        <p className="mb-5 text-sm leading-relaxed text-muted">
          General considerations for category and channel fit—not forecasts or
          performance claims.
        </p>
        {visuals ? (
          <BlogImage id={visuals.whyJapan.id} alt={visuals.whyJapan.alt} />
        ) : null}
        <ul className="space-y-3">
          {modelCase.whyJapan.map((item) => (
            <li
              key={item}
              className="rounded-lg border border-border bg-white px-4 py-3 text-sm text-navy"
            >
              {item}
            </li>
          ))}
        </ul>
      </Section>

      {/* H. What BrandBridge contributes */}
      <Section title="What BrandBridge Contributes">
        <ul className="space-y-3">
          {modelCase.brandBridgeContribution.map((item) => (
            <li
              key={item}
              className="flex gap-3 rounded-lg border border-border bg-white px-4 py-3 text-sm text-navy"
            >
              <span className="text-teal" aria-hidden>
                {"\u2713"}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* I. FAQ */}
      <Section title="FAQ" id="faq">
        <dl className="space-y-4">
          {modelCase.faq.map((item) => (
            <div
              key={item.question}
              className="rounded-lg border border-border bg-white px-5 py-5"
            >
              <dt className="font-medium text-navy">{item.question}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted">
                {item.answer}
              </dd>
            </div>
          ))}
        </dl>
      </Section>

      {/* CTA */}
      <section className="mt-12 rounded-lg border border-border bg-navy-deep px-5 py-10 text-white md:px-8">
        <h2 className="font-[family-name:var(--font-shippori)] text-2xl md:text-3xl">
          Ready to explore Japan with clearer commercial context?
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/75 md:text-base">
          List your brand so Japanese partners can review product and trade
          terms before outreach—or talk with BrandBridge about fit.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button
            href="/en/register/maker"
            className="w-full sm:w-auto"
          >
            List Your Brand
          </Button>
          <Button
            href="/en/contact"
            variant="outline"
            className="w-full border-white/40 text-white hover:border-white hover:bg-white/10 hover:text-white sm:w-auto"
          >
            Talk to BrandBridge
          </Button>
          <Button
            href="/en/register/partner"
            variant="ghost"
            className="w-full text-white/85 hover:bg-white/10 hover:text-white sm:w-auto"
          >
            Become a Japanese Partner
          </Button>
        </div>
      </section>
    </article>
  );
}
