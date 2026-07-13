import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/contact/ContactForm";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "お問い合わせ",
  description: `${siteConfig.name}へのお問い合わせフォームです。`,
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-12 md:py-16">
      <header className="mb-8">
        <h1 className="font-[family-name:var(--font-shippori)] text-3xl text-navy md:text-4xl">
          お問い合わせ
        </h1>
        <p className="mt-3 leading-relaxed text-muted">
          サービスに関するご質問、不具合報告、掲載や手数料についてのご相談を受け付けています。通常数営業日以内に確認します。
        </p>
      </header>

      <div className="rounded-lg border border-border bg-surface p-5 md:p-6">
        <ContactForm />
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
