import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "契約管理",
};

export const dynamic = "force-dynamic";

export default function ContractsPage() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="text-3xl text-navy">
        契約管理
      </h1>

      <p className="mt-4 text-muted">
        契約準備中の案件を管理します。
      </p>
    </main>
  );
}