import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ProductCaseImage } from "@/components/cases/ProductCaseImage";
import { getSessionUser } from "@/lib/auth";
import { enFavoritesCopy } from "@/lib/en-account-ui";
import { resolveEnCatalogDisplay } from "@/lib/en-case-catalog";
import {
  brandDisplayName,
  brandOriginBadge,
  lookingForLabel,
  opportunityMoqLabel,
  partnershipLabel,
  targetChannelsLabel,
} from "@/lib/en-japan-opportunity";
import { listFavoriteCases } from "@/lib/favorites";

export const metadata: Metadata = {
  title: "Favorites",
  description: enFavoritesCopy.subtitle,
};

export const dynamic = "force-dynamic";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export default async function EnglishFavoritesPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect(`/en/login?next=${encodeURIComponent("/en/favorites")}`);
  }

  const t = enFavoritesCopy;
  const cases = await listFavoriteCases(user.id);

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 md:py-16" lang="en">
      <header className="mb-8">
        <h1 className="font-[family-name:var(--font-shippori)] text-3xl text-navy md:text-4xl">
          {t.title}
        </h1>
        <p className="mt-3 text-muted">{t.subtitle}</p>
      </header>
      {cases.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-surface px-5 py-10 text-center text-muted">
          {t.empty}
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {cases.map((item) => {
            const en = resolveEnCatalogDisplay({
              id: item.id,
              sku: item.sku,
              productName: item.productName,
              category: item.category,
              summary: item.summary,
              description: item.description,
            });
            const origin = brandOriginBadge({
              shipFrom: item.shipFrom,
              targetCountry: item.targetCountry,
            });
            const brand = brandDisplayName({
              brandName: item.brandName,
              productName: en.productName,
              makerName: item.makerName,
            });
            return (
              <article
                key={item.id}
                className="rounded-lg border border-border bg-surface p-5 transition hover:border-teal/50"
              >
                <Link href={`/en/cases/${item.id}`} className="group block">
                  <div className="mb-3">
                    <ProductCaseImage
                      src={item.productImageUrl}
                      alt={brand}
                      size="card"
                      locale="en"
                    />
                  </div>
                  <p className="text-sm font-medium text-navy">
                    <span aria-hidden="true">{origin.flag} </span>
                    {origin.label}
                  </p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-teal">
                    Japan Expansion Opportunity
                  </p>
                  <h3 className="mt-2 font-[family-name:var(--font-shippori)] text-lg text-navy group-hover:text-teal">
                    {brand}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-muted">
                    {en.summary || item.summary}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-muted">
                    Looking for: {lookingForLabel(item.salesFormat)} ·{" "}
                    Partnership:{" "}
                    {partnershipLabel({
                      salesFormat: item.salesFormat,
                      isExclusive: item.isExclusive,
                    })}{" "}
                    · MOQ: {opportunityMoqLabel(item.minOrder)} · Target:{" "}
                    {targetChannelsLabel({
                      partnerChannels: item.partnerChannels,
                      salesFormat: item.salesFormat,
                    })}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="font-medium text-teal group-hover:underline">
                      View Opportunity →
                    </span>
                    <span className="text-xs text-muted">
                      {t.listed} {formatDate(item.createdAt)}
                    </span>
                  </div>
                </Link>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
