import { notFound } from "next/navigation";
import { getAdminContract } from "@/lib/contracts";
import { ContractStatusSelect } from "@/components/admin/ContractStatusSelect";

export const dynamic = "force-dynamic";

export default async function ContractDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const contract = await getAdminContract(params.id);

  if (!contract) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="text-3xl text-navy">
        契約詳細
      </h1>

      <div className="mt-8 rounded-lg border p-6">
        <p className="text-muted">
          契約ID: {contract.id}
        </p>

        <div className="mt-6">
          <ContractStatusSelect

            status={contract.status}
          />
        </div>
      </div>
    </main>
  );
}
