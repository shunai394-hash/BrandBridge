import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { getSessionUser } from "@/lib/auth";
import { listMyCases } from "@/lib/cases";
import { resolveEnCatalogDisplay } from "@/lib/en-case-catalog";
import { caseLanguageLabel } from "@/lib/inquiry-language";
import { getProfileById } from "@/lib/profiles";
import { casePublicStatusLabel } from "@/lib/case-display";

export const metadata: Metadata = {
  title: "My Products | BrandBridge",
  description:
    "Track your BrandBridge product listings and open English product pages.",
};

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ created?: string }>;
};

export default async function EnglishProductsPage({ searchParams }: PageProps) {
  const user = await getSessionUser();
  if (!user) {
    redirect(`/en/login?next=${encodeURIComponent("/en/products")}`);
  }
  if (user.role !== "maker") {
    redirect("/en/cases");
  }

  const profile = await getProfileById(user.id);
  if (!profile?.onboarding_completed) {
    redirect("/en/maker/setup");
  }

  const params = await searchParams;
  const myCases = await listMyCases();
  const createdId = params.created?.trim() || "";
  const created = createdId
    ? myCases.find((c) => c.id === createdId)
    : undefined;

  return (
    <div className="mx-auto max-w-4xl px-5 py-12 md:py-16" lang="en">
      <header className="mb-8">
        <p className="text-xs font-medium tracking-wider text-teal">
          FOR OVERSEAS BRANDS
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-shippori)] text-3xl text-navy md:text-4xl">
          My Products
        </h1>
        <p className="mt-3 text-muted">
          Track your BrandBridge listings and open English product pages after
          registration.
        </p>
      </header>

      {created ? (
        <div className="mb-8 rounded-xl border border-teal/40 bg-cream px-5 py-4">
          <p className="font-medium text-navy">Product listing submitted</p>
          <p className="mt-1 text-sm text-muted">
            {
              resolveEnCatalogDisplay({
                id: created.id,
                sku: created.sku,
                productName: created.productName,
                category: created.category,
                summary: created.summary,
              }).productName
            }
            {created.reviewStatus === "pending_review"
              ? " — pending review. You can still open the English detail page."
              : " — listed for Japanese partners."}
          </p>
        </div>
      ) : null}

      <div className="mb-8 flex flex-wrap gap-3">
        <Button href="/en/cases">Browse English listings</Button>
        <Button href="/en/maker/setup" variant="outline">
          Register Product
        </Button>
        <Button href="/en/contact" variant="outline">
          Contact BrandBridge
        </Button>
      </div>

      {myCases.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-surface px-5 py-10 text-center">
          <p className="text-sm text-muted">No products yet.</p>
          <div className="mt-4">
            <Button href="/en/maker/setup">Complete product setup</Button>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-surface">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border bg-cream/50 text-xs text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Product Name</th>
                <th className="px-4 py-3 font-medium">SKU</th>
                <th className="px-4 py-3 font-medium">Language</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {myCases.map((item) => {
                const en = resolveEnCatalogDisplay({
                  id: item.id,
                  sku: item.sku,
                  productName: item.productName,
                  category: item.category,
                  summary: item.summary,
                  description: item.description,
                });
                const lang = caseLanguageLabel(
                  `${item.description}\n${item.offer ?? ""}\n${item.summary}`,
                );
                const status = casePublicStatusLabel({
                  status: item.status,
                  reviewStatus: item.reviewStatus,
                  hasDeal: item.hasDeal,
                });
                const statusEn =
                  status === "公開中"
                    ? "Open"
                    : status === "審査待ち"
                      ? "Pending review"
                      : status === "成約済み"
                        ? "Deal closed"
                        : status === "取り下げ"
                          ? "Withdrawn"
                          : status === "不承認"
                            ? "Rejected"
                            : status === "公開終了"
                              ? "Closed"
                              : status;

                return (
                  <tr
                    key={item.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-4 py-3 font-medium text-navy">
                      {en.productName}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-teal">
                      {item.sku?.trim() || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          lang === "English"
                            ? "rounded-md bg-navy/10 px-2 py-0.5 text-xs font-medium text-navy"
                            : "rounded-md bg-cream px-2 py-0.5 text-xs font-medium text-muted"
                        }
                      >
                        {lang}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted">{statusEn}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/en/cases/${item.id}`}
                        className="font-medium text-teal hover:underline"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
