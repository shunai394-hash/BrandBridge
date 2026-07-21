import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ProductCaseImage } from "@/components/cases/ProductCaseImage";
import { getSessionUser } from "@/lib/auth";
import {
  enFavoritesCopy,
  enSalesFormatLabel,
  enTargetCountryLabel,
  enDisplayMoq,
  enDisplayPriceBand,
} from "@/lib/en-account-ui";
import { resolveEnCatalogDisplay } from "@/lib/en-case-catalog";
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
            return (
              <article
                key={item.id}
                className="rounded-lg border border-border bg-surface p-5 transition hover:border-teal/50"
              >
                <Link href={`/en/cases/${item.id}`} className="group block">
                  <div className="mb-3">
                    <ProductCaseImage
                      src={item.productImageUrl}
                      alt={en.productName}
                      size="card"
                      locale="en"
                    />
                  </div>
                  <p className="font-mono text-xs font-medium tracking-wide text-teal">
                    SKU: {item.sku?.trim() || "—"}
                  </p>
                  <h3 className="mt-2 font-[family-name:var(--font-shippori)] text-lg text-navy group-hover:text-teal">
                    {en.productName}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-muted">
                    {en.summary || item.summary}
                  </p>
                  <p className="mt-2 text-xs text-muted">
                    {enTargetCountryLabel(item.targetCountry)} ·{" "}
                    {enSalesFormatLabel(item.salesFormat)} · Wholesale:{" "}
                    {enDisplayPriceBand(item.priceBand)} · MOQ:{" "}
                    {enDisplayMoq(item.minOrder)}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="font-medium text-teal group-hover:underline">
                      {t.viewDetails} →
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
