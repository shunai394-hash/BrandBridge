import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminCaseList } from "@/components/admin/AdminCaseList";
import { listAdminCases } from "@/lib/admin";
import type { ReviewStatus } from "@/lib/types";

export const metadata: Metadata = {
  title: "商品審査",
};

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ status?: string }>;
};

export default async function AdminCasesPage({ searchParams }: PageProps) {
  const { status } = await searchParams;

  const filter: ReviewStatus | "all" =
    status === "all"
      ? "all"
      : status === "approved" ||
          status === "rejected" ||
          status === "withdrawn"
        ? status
        : "pending_review";

  if (!status) {
    redirect("/admin/cases?status=pending_review");
  }

  const { items, error, totalUnfiltered } = await listAdminCases(filter);

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="font-[family-name:var(--font-shippori)] text-3xl text-navy">
        商品審査
      </h1>
      <p className="mt-2 mb-4 text-muted">
        審査待ち商品を承認（approved + open）または不承認（rejected + closed）します。
      </p>
      <p className="mb-8 text-xs text-muted">
        フィルタ: {filter} / 表示 {items.length} 件 / DB全件 {totalUnfiltered ?? "?"} 件
        （BETA_AUTO_APPROVE_CASES=true だと新規は approved になり審査待ちに出ません）
      </p>
      {error ? (
        <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}
      {items.length === 0 && !error && (totalUnfiltered ?? 0) === 0 ? (
        <div className="mb-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          cases テーブルにデータがありません（0件）。画面上の「保存成功」でも insert
          が失敗している可能性があります。商品提供企業で商品を再登録し、サーバーログの
          [createCase] insert ok / failed を確認してください。
        </div>
      ) : null}
      {items.length === 0 &&
      !error &&
      (totalUnfiltered ?? 0) > 0 &&
      filter === "pending_review" ? (
        <div className="mb-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          pending_review は 0 件ですが、DB には {totalUnfiltered}{" "}
          件あります。「すべて」または「承認済」タブを確認してください。
        </div>
      ) : null}
      <AdminCaseList items={items} currentFilter={filter} />
    </div>
  );
}
