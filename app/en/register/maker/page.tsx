import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { EnMakerRegisterForm } from "@/components/forms/EnMakerRegisterForm";
import { getSessionUser } from "@/lib/auth";
import { getProfileById } from "@/lib/profiles";

export const metadata: Metadata = {
  title: "List Your Brand",
  description:
    "List your brand on BrandBridge for qualified Japanese distributors, retailers, wholesalers, and e-commerce partners.",
};

export const dynamic = "force-dynamic";

export default async function EnglishMakerRegisterPage() {
  const user = await getSessionUser();
  if (user) {
    if (user.role === "maker") {
      const profile = await getProfileById(user.id);
      if (profile?.onboarding_completed) {
        redirect("/en/products");
      }
      // English register success path: always continue to English maker setup.
      redirect("/en/maker/setup");
    }
    // Logged-in non-maker: keep form available so they can switch accounts;
    // do not send English registration traffic to /cases.
  }

  return (
    <div className="mx-auto max-w-xl px-5 py-12 md:py-16">
      <header className="mb-8">
        <p className="text-xs font-medium tracking-wider text-teal">
          FOR OVERSEAS MANUFACTURERS
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-shippori)] text-3xl text-navy md:text-4xl">
          List Your Brand
        </h1>
        <p className="mt-3 leading-relaxed text-muted">
          Start selling in Japan—share your company and product details so
          qualified Japanese partners can evaluate fit and inquire.
        </p>
        <p className="mt-2 text-sm text-muted">
          Prefer to learn the flow first?{" "}
          <Link
            href="/en/how-to-sell-in-japan"
            className="text-teal hover:underline"
          >
            Learn How It Works
          </Link>
        </p>
      </header>
      <EnMakerRegisterForm />
      <p className="mt-8 text-sm text-muted">
        Japanese registration:{" "}
        <Link href="/register/maker" className="text-teal hover:underline">
          Japanese supplier registration
        </Link>
      </p>
    </div>
  );
}
