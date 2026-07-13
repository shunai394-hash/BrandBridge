import type { Metadata } from "next";
import { AdminCaseList } from "@/components/admin/AdminCaseList";
import { listAdminCases } from "@/lib/admin";
import type { ReviewStatus } from "@/lib/types";

export const metadata: Metadata = {
  title: "案件審査",
};

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ status?: string }>;
};

export default async function AdminCasesPage({ searchParams }: PageProps) {
  const { status } = await searchParams;
  const filter =
    status === "pending_review" ||
    status === "approved" ||
    status === "rejected"
      ? (status as ReviewStatus)
      : "all";

  const items = await listAdminCases(filter);

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="font-[family-name:var(--font-shippori)] text-3xl text-navy">
        案件審査
      </h1>
      <p className="mt-2 mb-8 text-muted">
        メーカーから提出された案件を審査し、公開可否を決定します。
      </p>
      <AdminCaseList items={items} currentFilter={filter} />
    </div>
  );
}
