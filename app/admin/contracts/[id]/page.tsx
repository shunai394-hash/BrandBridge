import { notFound } from "next/navigation";
import { getAdminContract } from "@/lib/contracts";
import { ContractStatusSelect } from "@/components/admin/ContractStatusSelect";
import ContractFieldsForm from "@/components/admin/ContractFieldsForm";

export const dynamic = "force-dynamic";

export default async function ContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const contract = await getAdminContract(id);

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

        <p className="mt-4">
          金額: {contract.deal_amount} {contract.deal_currency}
        </p>

        <div className="mt-6">
          <ContractStatusSelect
            negotiationId={contract.negotiation_id}
            status={contract.negotiations?.pipeline_status ?? "contract_prep"}
          />
        </div>

        <div className="mt-6">
          <a
            href={`/api/contracts/${contract.id}/pdf`}
            target="_blank"
            className="inline-flex rounded-lg bg-navy px-5 py-3 text-white hover:bg-teal"
          >
            取引条件合意書を生成
          </a>
        </div>

        <ContractFieldsForm
          dealId={contract.id}
          negotiationId={contract.negotiation_id}
          makerConfirmed={contract.maker_confirmed ?? false}
          partnerConfirmed={contract.partner_confirmed ?? false}
          contractDate={contract.contract_date}
          contractNote={contract.contract_note}
          agreedProductName={contract.agreed_product_name}
          agreedWholesalePrice={contract.agreed_wholesale_price}
          agreedMoq={contract.agreed_moq}
          agreedExclusivity={contract.agreed_exclusivity}
          agreedShippingTerms={contract.agreed_shipping_terms}
          agreedPaymentTerms={contract.agreed_payment_terms}
          agreedContractPeriod={contract.agreed_contract_period}
          agreedCurrency={contract.agreed_currency}
          agreedNotes={contract.agreed_notes}
        />
      </div>
    </main>
  );
}


