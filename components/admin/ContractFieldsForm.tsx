"use client";

import { useState } from "react";
import { updateContractFields } from "@/lib/contract-actions";
import { updatePipelineStatusAction } from "@/lib/actions";

type Props = {
  dealId: string;
  negotiationId: string;
  makerConfirmed: boolean;
  partnerConfirmed: boolean;
  contractDate: string | null;
  contractNote: string | null;
  agreedProductName?: string | null;
  agreedWholesalePrice?: number | null;
  agreedMoq?: number | null;
  agreedExclusivity?: string | null;
  agreedShippingTerms?: string | null;
  agreedPaymentTerms?: string | null;
  agreedContractPeriod?: string | null;
  agreedCurrency?: string | null;
  agreedNotes?: string | null;
};

export default function ContractFieldsForm({
  dealId,
  negotiationId,
  makerConfirmed,
  partnerConfirmed,
  contractDate,
  contractNote,
  agreedProductName,
  agreedWholesalePrice,
  agreedMoq,
  agreedExclusivity,
  agreedShippingTerms,
  agreedPaymentTerms,
  agreedContractPeriod,
  agreedCurrency,
  agreedNotes,
}: Props) {
  const [maker, setMaker] = useState(makerConfirmed);
  const [partner, setPartner] = useState(partnerConfirmed);
  const [date, setDate] = useState(contractDate ?? "");
  const [note, setNote] = useState(contractNote ?? "");

  const [product, setProduct] = useState(agreedProductName ?? "");
  const [price, setPrice] = useState(agreedWholesalePrice?.toString() ?? "");
  const [moq, setMoq] = useState(agreedMoq?.toString() ?? "");
  const [exclusivity, setExclusivity] = useState(agreedExclusivity ?? "");
  const [shipping, setShipping] = useState(agreedShippingTerms ?? "");
  const [payment, setPayment] = useState(agreedPaymentTerms ?? "");
  const [period, setPeriod] = useState(agreedContractPeriod ?? "");
  const [currency, setCurrency] = useState(agreedCurrency ?? "JPY");
  const [agreedNote, setAgreedNote] = useState(agreedNotes ?? "");

  const [message, setMessage] = useState("");

  async function save() {
    setMessage("保存中...");

    try {
      await updateContractFields(dealId, {
        maker_confirmed: maker,
        partner_confirmed: partner,
        contract_date: date || null,
        contract_note: note || null,

        agreed_product_name: product || null,
        agreed_wholesale_price: price ? Number(price) : null,
        agreed_moq: moq ? Number(moq) : null,
        agreed_exclusivity: exclusivity || null,
        agreed_shipping_terms: shipping || null,
        agreed_payment_terms: payment || null,
        agreed_contract_period: period || null,
        agreed_currency: currency || null,
        agreed_notes: agreedNote || null,
      });

      setMessage("保存しました");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "保存失敗");
    }
  }

  async function completeContract() {
    setMessage("契約確定中...");

    const result = await updatePipelineStatusAction({
      negotiationId,
      pipelineStatus: "won",
    });

    if (result?.error) {
      setMessage(result.error);
      return;
    }

    setMessage("契約済みに更新しました");
  }

  return (
    <div className="mt-8 rounded-lg border p-6">
      <h2 className="text-xl font-semibold">契約情報</h2>

      <label className="mt-4 flex gap-2">
        <input type="checkbox" checked={maker} onChange={(e)=>setMaker(e.target.checked)} />
        メーカー確認済み
      </label>

      <label className="mt-4 flex gap-2">
        <input type="checkbox" checked={partner} onChange={(e)=>setPartner(e.target.checked)} />
        パートナー確認済み
      </label>

      <div className="mt-4">
        <label>契約日</label>
        <input type="date" value={date} onChange={(e)=>setDate(e.target.value)} />
      </div>

      <h3 className="mt-8 text-lg font-semibold">合意条件</h3>

      <input className="mt-3 w-full border p-2" placeholder="商品名" value={product} onChange={(e)=>setProduct(e.target.value)} />
      <input className="mt-3 w-full border p-2" placeholder="卸価格" value={price} onChange={(e)=>setPrice(e.target.value)} />
      <input className="mt-3 w-full border p-2" placeholder="MOQ" value={moq} onChange={(e)=>setMoq(e.target.value)} />
      <input className="mt-3 w-full border p-2" placeholder="独占条件" value={exclusivity} onChange={(e)=>setExclusivity(e.target.value)} />
      <input className="mt-3 w-full border p-2" placeholder="配送条件" value={shipping} onChange={(e)=>setShipping(e.target.value)} />
      <input className="mt-3 w-full border p-2" placeholder="支払条件" value={payment} onChange={(e)=>setPayment(e.target.value)} />
      <input className="mt-3 w-full border p-2" placeholder="契約期間" value={period} onChange={(e)=>setPeriod(e.target.value)} />
      <input className="mt-3 w-full border p-2" placeholder="通貨" value={currency} onChange={(e)=>setCurrency(e.target.value)} />

      <textarea
        className="mt-3 w-full border p-2"
        placeholder="合意メモ"
        value={agreedNote}
        onChange={(e)=>setAgreedNote(e.target.value)}
      />

      <textarea
        className="mt-4 w-full border p-3"
        placeholder="契約メモ"
        value={note}
        onChange={(e)=>setNote(e.target.value)}
      />

      <button
        type="button"
        onClick={save}
        className="mt-4 rounded bg-black px-4 py-2 text-white"
      >
        保存
      </button>

      <button
        type="button"
        onClick={completeContract}
        className="mt-4 ml-3 rounded bg-green-600 px-4 py-2 text-white"
      >
        契約合意を確定
      </button>

      {message && <p className="mt-3">{message}</p>}
    </div>
  );
}








