import Link from "next/link";
import { CaseCard } from "@/components/cases/CaseCard";
import { EnCaseCard } from "@/components/cases/EnCaseCard";
import { listDummyCatalogCases } from "@/lib/dummy-catalog-products";

type DummyCatalogShowcaseProps = {
  locale: "ja" | "en";
};

/**
 * Secondary sample list under ProductShowcase — uses existing CaseCard / EnCaseCard.
 */
export async function DummyCatalogShowcase({
  locale,
}: DummyCatalogShowcaseProps) {
  const cases = await listDummyCatalogCases();
  if (cases.length === 0) return null;

  const en = locale === "en";

  return (
    <section className="mt-16 border-t border-border pt-12">
      <div className="mb-6">
        <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy">
          {en ? "Sample catalog products" : "サンプル商品カタログ"}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {en
            ? "Fictional demo listings for layout and detail-page previews. Open any product for the full listing page."
            : "レイアウト・詳細ページ確認用の架空デモ商品です。各商品から詳細ページを開けます。"}
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {cases.map((caseItem, index) =>
          en ? (
            <EnCaseCard key={caseItem.id} caseItem={caseItem} index={index} />
          ) : (
            <CaseCard key={caseItem.id} caseItem={caseItem} index={index} />
          ),
        )}
      </div>

      <p className="mt-6 text-sm text-muted">
        {en ? (
          <>
            Browse all open listings on{" "}
            <Link href="/en/cases" className="font-medium text-teal hover:underline">
              Product Listings
            </Link>
            .
          </>
        ) : (
          <>
            すべての公開商品は{" "}
            <Link href="/cases" className="font-medium text-teal hover:underline">
              商品一覧
            </Link>
            から確認できます。
          </>
        )}
      </p>
    </section>
  );
}
