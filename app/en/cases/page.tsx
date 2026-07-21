import type { Metadata } from "next";
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import {
  EnCaseList,
  type EnCaseListItem,
} from "@/components/cases/EnCaseList";
import { listMyCases, listOpenCases } from "@/lib/cases";
import { resolveEnCatalogDisplay } from "@/lib/en-case-catalog";
import type { Case } from "@/lib/types";

function toListItem(item: Case): EnCaseListItem {
  return {
    id: item.id,
    title: item.title,
    productName: item.productName,
    sku: item.sku,
    summary: item.summary,
    makerName: item.makerName,
    category: item.category,
    targetCountry: item.targetCountry,
    salesFormat: item.salesFormat,
    isExclusive: item.isExclusive,
    priceBand: item.priceBand,
    minOrder: item.minOrder,
    status: item.status,
    reviewStatus: item.reviewStatus,
  };
}

export const metadata: Metadata = {
  title: "Product Listings",
  description:
    "Browse open product cases on BrandBridge—SKU, sales format, wholesale range, and MOQ—to understand partner opportunities in Japan.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

type EnglishCasesPageProps = {
  searchParams: Promise<{ created?: string }>;
};

export default async function EnglishCasesPage({
  searchParams,
}: EnglishCasesPageProps) {
  noStore();
  const params = await searchParams;
  const [cases, myCases] = await Promise.all([
    listOpenCases(),
    listMyCases(),
  ]);

  const byId = new Map(cases.map((c) => [c.id, c]));
  // Logged-in maker: also show own open listings (incl. pending review).
  for (const mine of myCases) {
    if (mine.status === "open" && !byId.has(mine.id)) {
      byId.set(mine.id, mine);
    }
  }

  const merged = Array.from(byId.values());
  const listItems = merged.map(toListItem);

  const createdId = params.created?.trim() || "";
  const createdCase = createdId
    ? merged.find((c) => c.id === createdId) ||
      myCases.find((c) => c.id === createdId)
    : undefined;
  const createdLabel = createdCase
    ? resolveEnCatalogDisplay({
        id: createdCase.id,
        sku: createdCase.sku,
        productName: createdCase.productName,
        category: createdCase.category,
        summary: createdCase.summary,
      }).productName
    : null;

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 md:py-16">
      <header className="mb-8">
        <h1 className="font-[family-name:var(--font-shippori)] text-3xl text-navy md:text-4xl">
          Product Listings
        </h1>
        <p className="mt-3 max-w-3xl text-muted">
          Open product cases on BrandBridge. Review SKU, category, sales format,
          wholesale range, and MOQ—then open details or start a negotiation with
          Japanese sales partners.
        </p>
      </header>

      {createdId ? (
        <div
          className={[
            "mb-8 rounded-xl border px-5 py-4",
            createdCase
              ? "border-teal/40 bg-cream"
              : "border-amber-200 bg-amber-50",
          ].join(" ")}
        >
          {createdCase ? (
            <>
              <p className="font-medium text-navy">Product listing saved</p>
              <p className="mt-1 text-sm text-muted">
                <Link
                  href={`/en/cases/${createdId}`}
                  className="text-teal hover:underline"
                >
                  {createdLabel || "View product"}
                </Link>
                {" · "}
                Your listing is on the English product list
                {createdCase.reviewStatus === "pending_review"
                  ? " (pending review — visible to you)."
                  : "."}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted">
              Listing ID {createdId} was not found yet. It may still be
              processing or awaiting approval.
            </p>
          )}
        </div>
      ) : null}

      <EnCaseList items={listItems} />

      <p className="mt-12 text-sm text-muted">
        Looking for the Japanese list?{" "}
        <Link href="/cases" className="text-teal hover:underline">
          Japanese product listings
        </Link>
      </p>
    </div>
  );
}
