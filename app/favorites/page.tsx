import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CaseCard } from "@/components/cases/CaseCard";
import { getSessionUser } from "@/lib/auth";
import { listFavoriteCases } from "@/lib/favorites";

export const metadata: Metadata = {
  title: "お気に入り",
};

export const dynamic = "force-dynamic";

export default async function FavoritesPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?next=/favorites");
  }

  const cases = await listFavoriteCases(user.id);

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 md:py-16">
      <header className="mb-8">
        <h1 className="font-[family-name:var(--font-shippori)] text-3xl text-navy md:text-4xl">
          お気に入り
        </h1>
        <p className="mt-3 text-muted">
          保存した公開案件を確認できます。
        </p>
      </header>
      {cases.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-surface px-5 py-10 text-center text-muted">
          お気に入りの案件はまだありません。案件詳細から追加できます。
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {cases.map((item, index) => (
            <CaseCard key={item.id} caseItem={item} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
