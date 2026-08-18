import type { Metadata } from "next";
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import {
  EnCaseList,
  type EnCaseListItem,
} from "@/components/cases/EnCaseList";
import { ModelCaseCard } from "@/components/cases/ModelCaseCard";
import { listMyCases, listOpenCases } from "@/lib/cases";
import { resolveEnCatalogDisplay } from "@/lib/en-case-catalog";
import { brandDisplayName } from "@/lib/en-japan-opportunity";
import { pairedLanguageAlternates } from "@/lib/hreflang";
import { listPublishedModelCases } from "@/lib/model-cases";
import type { Case } from "@/lib/types";

function toListItem(item: Case): EnCaseListItem {
  return {
    id: item.id,
    title: item.title,
    productName: item.productName,
    sku: item.sku,
    summary: item.summary,
    makerName: item.makerName,
    brandName: item.brandName,
    shipFrom: item.shipFrom,
    partnerChannels: item.partnerChannels,
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
  title: "Japan Expansion Opportunities",
  description:
    "Browse overseas brands seeking Japanese distributors, retailers, and e-commerce partners—Japan expansion opportunities on BrandBridge.",
  ...pairedLanguageAlternates("/cases", "/en/cases", "en"),
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
    ? brandDisplayName({
        brandName: createdCase.brandName,
        productName: resolveEnCatalogDisplay({
          id: createdCase.id,
          sku: createdCase.sku,
          productName: createdCase.productName,
          category: createdCase.category,
          summary: createdCase.summary,
        }).productName,
        makerName: createdCase.makerName,
      })
    : null;

  const modelCases = listPublishedModelCases();

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 md:py-16">
      <header className="mb-8">
        <h1 className="font-[family-name:var(--font-shippori)] text-3xl text-navy md:text-4xl">
          Japan Expansion Opportunities
        </h1>
        <p className="mt-3 max-w-3xl text-muted">
          Overseas brands looking for Japanese sales partners—distributors,
          retailers, and e-commerce partners. Review brand, partnership type,
          category, MOQ, and target channels, then open a discussion.
        </p>
      </header>

      {modelCases.length > 0 ? (
        <section className="mb-12 rounded-xl border border-teal/20 bg-cream/50 px-5 py-8 md:px-7">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-[0.14em] text-teal">
                MODEL CASES
              </p>
              <h2 className="mt-2 font-[family-name:var(--font-shippori)] text-2xl text-navy">
                How BrandBridge discussions can work
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
                Illustrative sample deal flows—not published records of completed
                transactions. Use these to understand the information Japanese
                partners typically review before outreach.
              </p>
            </div>
          </div>
          <ul className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {modelCases.map((item) => (
              <li key={item.slug}>
                <ModelCaseCard modelCase={item} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

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
              <p className="font-medium text-navy">
                Brand opportunity saved
              </p>
              <p className="mt-1 text-sm text-muted">
                <Link
                  href={`/en/cases/${createdId}`}
                  className="text-teal hover:underline"
                >
                  {createdLabel || "View opportunity"}
                </Link>
                {" · "}
                Your brand is listed among Japan expansion opportunities
                {createdCase.reviewStatus === "pending_review"
                  ? " (pending review — visible to you)."
                  : "."}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted">
              Opportunity ID {createdId} was not found yet. It may still be
              processing or awaiting approval.
            </p>
          )}
        </div>
      ) : null}

      <section>
        <h2 className="mb-6 font-[family-name:var(--font-shippori)] text-2xl text-navy">
          Live Japan Expansion Opportunities
        </h2>
        <EnCaseList items={listItems} />
      </section>

      <p className="mt-12 max-w-full text-sm leading-relaxed text-muted break-words">
        Looking for Japanese brand opportunities?{" "}
        <Link
          href="/cases"
          className="inline text-teal underline-offset-2 hover:underline"
        >
          Browse Japanese listings
        </Link>
      </p>
    </div>
  );
}

