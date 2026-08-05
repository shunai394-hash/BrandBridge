import type { Metadata } from "next";
import Link from "next/link";
import { getAdminContracts } from "@/lib/contracts";

export const metadata: Metadata = {
  title: "契約管理",
};

export const dynamic = "force-dynamic";

export default async function ContractsPage() {
  const contracts = await getAdminContracts();

  return (
    <main className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="text-3xl text-navy">
        契約管理
      </h1>

      <p className="mt-4 text-muted">
        契約準備中の案件を管理します。
      </p>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full border-collapse border">
          <thead>
            <tr className="border bg-gray-50">
              <th className="p-3 text-left">契約ID</th>
              <th className="p-3 text-left">金額</th>
              <th className="p-3 text-left">通貨</th>
              <th className="p-3 text-left">状態</th>
            </tr>
          </thead>

          <tbody>
            {contracts.map((contract) => (
              <tr key={contract.id} className="border">
                <td className="p-3">
                  <Link
                    href={`/admin/contracts/${contract.id}`}
                    className="text-blue-600 underline"
                  >
                    {contract.id}
                  </Link>
                </td>

                <td className="p-3">
                  {contract.deal_amount}
                </td>

                <td className="p-3">
                  {contract.deal_currency}
                </td>

                <td className="p-3">
                  {contract.negotiations?.pipeline_status ?? "未設定"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
