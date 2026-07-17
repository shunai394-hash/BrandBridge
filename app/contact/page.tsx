import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/contact/ContactForm";
import { siteConfig } from "@/lib/site";
import type { ContactCategory } from "@/lib/contact-types";

export const metadata: Metadata = {
  title: "お問い合わせ",
  description: `${siteConfig.name}へのお問い合わせフォームです。通常1〜2営業日以内にご返信します。`,
};

type ContactPageProps = {
  searchParams: Promise<{ topic?: string }>;
};

function resolveInitialCategory(topic?: string): ContactCategory {
  if (topic === "listing") return "maker";
  return "general";
}

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const params = await searchParams;
  const initialCategory = resolveInitialCategory(params.topic);
  const isListingConsult = params.topic === "listing";

  return (
    <div className="mx-auto max-w-2xl px-5 py-12 md:py-16">
      <header className="mb-8">
        <h1 className="font-[family-name:var(--font-shippori)] text-3xl text-navy md:text-4xl">
          {isListingConsult ? "掲載相談" : "お問い合わせ"}
        </h1>
        <p className="mt-3 leading-relaxed text-muted">
          {isListingConsult
            ? "案件掲載に関するご相談を受け付けています。掲載相談は優先的に確認し、通常1〜2営業日以内にご返信します。ベータ参加希望の方はその旨をご記載ください。"
            : "サービスに関するご質問、不具合報告、掲載や手数料についてのご相談を受け付けています。通常1〜2営業日以内にご返信します。掲載相談は優先的に確認します。ベータ参加希望の方はその旨をご記載ください。"}
        </p>
      </header>

      <div className="rounded-lg border border-border bg-surface p-5 md:p-6">
        <ContactForm initialCategory={initialCategory} />
      </div>

      <p className="mt-6 text-sm text-muted">
        個人情報の取扱いについては{" "}
        <Link href="/privacy" className="text-teal hover:underline">
          プライバシーポリシー
        </Link>
        をご確認ください。
      </p>
    </div>
  );
}
