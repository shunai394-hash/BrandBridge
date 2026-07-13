import type { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

type AudiencePrPageProps = {
  eyebrow: string;
  title: string;
  lead: string;
  primaryCta: { href: string; label: string };
  secondaryCta: { href: string; label: string };
  benefits: { title: string; body: string }[];
  steps: { title: string; body: string }[];
  faqs: { q: string; a: string }[];
  children?: ReactNode;
};

export function AudiencePrPage({
  eyebrow,
  title,
  lead,
  primaryCta,
  secondaryCta,
  benefits,
  steps,
  faqs,
}: AudiencePrPageProps) {
  return (
    <div>
      <section className="relative overflow-hidden bg-navy-deep text-white">
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_30%,rgba(26,138,138,0.35),transparent_55%),radial-gradient(ellipse_at_80%_70%,rgba(20,111,111,0.25),transparent_50%)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-5 py-16 md:py-24">
          <Link
            href="/#for-you"
            className="text-sm text-white/65 transition hover:text-white"
          >
            ← トップに戻る
          </Link>
          <p className="mt-6 text-xs font-medium tracking-wider text-teal">
            {eyebrow}
          </p>
          <h1 className="mt-3 max-w-3xl font-[family-name:var(--font-shippori)] text-3xl leading-snug md:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/80 md:text-lg">
            {lead}
          </p>
          <div className="mt-9 flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row">
            <Button
              href={primaryCta.href}
              className="w-full py-3.5 text-base sm:w-auto sm:min-w-[180px]"
            >
              {primaryCta.label}
            </Button>
            <Button
              href={secondaryCta.href}
              variant="outline"
              className="w-full border-white/40 py-3.5 text-base text-white hover:border-white hover:bg-white/10 hover:text-white sm:w-auto"
            >
              {secondaryCta.label}
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
          <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
            BrandBridgeでできること
          </h2>
          <ul className="mt-10 grid gap-8 md:grid-cols-3">
            {benefits.map((item) => (
              <li key={item.title} className="border-t-2 border-teal/40 pt-4">
                <h3 className="font-medium text-navy">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-border bg-background">
        <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
          <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
            はじめ方
          </h2>
          <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <li key={step.title}>
                <p className="text-xs font-medium tracking-wider text-teal">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-2 font-[family-name:var(--font-shippori)] text-lg text-navy">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-3xl px-5 py-16 md:py-20">
          <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
            よくある質問
          </h2>
          <dl className="mt-8 space-y-6">
            {faqs.map((item) => (
              <div key={item.q} className="border-b border-border pb-6">
                <dt className="font-medium text-navy">{item.q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-muted">
                  {item.a}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="bg-navy-deep text-white">
        <div className="mx-auto max-w-6xl px-5 py-14 text-center md:py-16">
          <h2 className="font-[family-name:var(--font-shippori)] text-2xl md:text-3xl">
            準備ができたら、次のステップへ
          </h2>
          <div className="mx-auto mt-8 flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
            <Button
              href={primaryCta.href}
              className="w-full py-3.5 text-base sm:w-auto sm:min-w-[180px]"
            >
              {primaryCta.label}
            </Button>
            <Button
              href="/contact"
              variant="outline"
              className="w-full border-white/40 py-3.5 text-base text-white hover:border-white hover:bg-white/10 hover:text-white sm:w-auto"
            >
              相談する
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
