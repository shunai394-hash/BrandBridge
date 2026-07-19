import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "運営会社情報",
  description: `${siteConfig.name}の運営会社情報です。`,
  robots: { index: true, follow: true },
};

export default function CompanyPage() {
  const { company } = siteConfig;

  return (
    <article className="mx-auto max-w-3xl px-5 py-12 md:py-16">
      <header className="mb-10 border-b border-border pb-6">
        <h1 className="font-[family-name:var(--font-shippori)] text-3xl text-navy md:text-4xl">
          運営会社情報
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          {siteConfig.name}
          は、企業間マッチングサービスとして、運営会社情報を公開しています。
        </p>
      </header>

      <dl className="space-y-6 text-sm md:text-base">
        <div className="grid gap-1 sm:grid-cols-[8rem_1fr] sm:gap-4">
          <dt className="font-medium text-navy">会社名</dt>
          <dd className="text-muted">{company.name}</dd>
        </div>
        <div className="grid gap-1 sm:grid-cols-[8rem_1fr] sm:gap-4">
          <dt className="font-medium text-navy">所在地</dt>
          <dd className="text-muted">
            <p>{company.postalCode}</p>
            <p>{company.address}</p>
          </dd>
        </div>
        <div className="grid gap-1 sm:grid-cols-[8rem_1fr] sm:gap-4">
          <dt className="font-medium text-navy">サービス名</dt>
          <dd className="text-muted">{siteConfig.name}</dd>
        </div>
      </dl>

      <p className="mt-10 text-sm text-muted">
        ご質問・ご相談は{" "}
        <Link href="/contact" className="text-teal hover:underline">
          お問い合わせ
        </Link>
        よりご連絡ください。
      </p>
    </article>
  );
}
