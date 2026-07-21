import type { Metadata } from "next";
import Link from "next/link";
import { EnContactForm } from "@/components/contact/EnContactForm";
import { resolveEnCatalogDisplay } from "@/lib/en-case-catalog";
import { getCaseById } from "@/lib/cases";

export const metadata: Metadata = {
  title: "Contact BrandBridge",
  description:
    "Contact BrandBridge to discuss distributors, retailers, and sales partners in Japan. For overseas brands entering the Japanese market.",
};

type EnglishContactPageProps = {
  searchParams: Promise<{ product?: string }>;
};

export default async function EnglishContactPage({
  searchParams,
}: EnglishContactPageProps) {
  const params = await searchParams;
  const productId = params.product?.trim() || undefined;

  let productName: string | undefined;
  let companyName: string | undefined;
  if (productId) {
    const caseItem = await getCaseById(productId);
    if (caseItem) {
      productName = resolveEnCatalogDisplay({
        id: caseItem.id,
        sku: caseItem.sku,
        productName: caseItem.productName,
        category: caseItem.category,
        summary: caseItem.summary,
        description: caseItem.description,
      }).productName;
      companyName = caseItem.makerName?.trim() || undefined;
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-12 md:py-16">
      <header className="mb-8">
        <Link
          href={productId ? `/en/cases/${productId}` : "/en"}
          className="text-sm text-muted transition hover:text-navy"
        >
          {productId ? "← Back to product" : "← Back to English home"}
        </Link>
        <h1 className="mt-4 font-[family-name:var(--font-shippori)] text-3xl text-navy md:text-4xl">
          Contact BrandBridge
        </h1>
        <div className="mt-4 space-y-3 leading-relaxed text-muted">
          <p>
            {productId
              ? "Ask BrandBridge about this product and Japanese distribution opportunities."
              : "Interested in entering the Japanese market?"}
          </p>
          <p>
            Contact BrandBridge to discuss distributors, retailers, and sales
            partners in Japan.
          </p>
        </div>
      </header>

      {productId ? (
        <div className="mb-6 rounded-lg border border-teal/30 bg-cream px-5 py-4">
          <p className="text-xs font-medium tracking-wider text-teal">
            PRODUCT INQUIRY
          </p>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="grid gap-1 sm:grid-cols-[8.5rem_1fr] sm:gap-3">
              <dt className="font-medium text-navy">Product Name</dt>
              <dd className="text-navy">{productName || "—"}</dd>
            </div>
            <div className="grid gap-1 sm:grid-cols-[8.5rem_1fr] sm:gap-3">
              <dt className="font-medium text-navy">Company Name</dt>
              <dd className="text-navy">{companyName || "—"}</dd>
            </div>
            <div className="grid gap-1 sm:grid-cols-[8.5rem_1fr] sm:gap-3">
              <dt className="font-medium text-navy">Product ID</dt>
              <dd className="font-mono text-xs text-teal">{productId}</dd>
            </div>
          </dl>
        </div>
      ) : null}

      <div className="rounded-lg border border-border bg-surface p-5 md:p-6">
        <EnContactForm
          productId={productId}
          productName={productName}
          listingCompanyName={companyName}
        />
      </div>

      <p className="mt-6 text-sm text-muted">
        Looking for the Japanese contact form?{" "}
        <Link href="/contact" className="text-teal hover:underline">
          Japanese contact form
        </Link>
      </p>
    </div>
  );
}
