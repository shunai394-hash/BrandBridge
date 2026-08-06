"use server";

import { createClient } from "@/lib/supabase/server";
import { generateContractPdf as buildContractPdf } from "@/lib/contract-pdf";

type ContractFields = {
  maker_confirmed: boolean;
  partner_confirmed: boolean;
  contract_date: string | null;
  contract_note: string | null;
  agreed_product_name: string | null;
  agreed_wholesale_price: number | null;
  agreed_moq: number | null;
  agreed_exclusivity: string | null;
  agreed_shipping_terms: string | null;
  agreed_payment_terms: string | null;
  agreed_contract_period: string | null;
  agreed_currency: string | null;
  agreed_notes: string | null;
};

export async function updateContractFields(
  dealId: string,
  fields: ContractFields
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("deals")
    .update({
      maker_confirmed: fields.maker_confirmed,
      partner_confirmed: fields.partner_confirmed,
      contract_date: fields.contract_date,
      contract_note: fields.contract_note,
      agreed_product_name: fields.agreed_product_name,
      agreed_wholesale_price: fields.agreed_wholesale_price,
      agreed_moq: fields.agreed_moq,
      agreed_exclusivity: fields.agreed_exclusivity,
      agreed_shipping_terms: fields.agreed_shipping_terms,
      agreed_payment_terms: fields.agreed_payment_terms,
      agreed_contract_period: fields.agreed_contract_period,
      agreed_currency: fields.agreed_currency,
      agreed_notes: fields.agreed_notes,
    })
    .eq("id", dealId)
    .select()
    .single();

  if (error) {
    console.error("[updateContractFields ERROR]", error);
    throw new Error(error.message);
  }

  return data;
}

export async function updateNegotiationPipelineStatus(
  negotiationId: string,
  status: string
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("negotiations")
    .update({
      pipeline_status: status,
    })
    .eq("id", negotiationId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function generateContractPdf(dealId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("deals")
    .select(`
      *,
      maker:profiles!maker_id (
        company_name
      ),
      partner:profiles!partner_id (
        company_name
      )
    `)
    .eq("id", dealId)
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "契約データがありません");
  }

  console.log("[PDF BUILD START]");

  const pdf = await buildContractPdf({
    maker: data.maker?.company_name ?? "",
    partner:
      (Array.isArray(data.partner)
        ? data.partner[0]?.company_name
        : (data.partner as { company_name?: string } | null)?.company_name) ?? "",

    agreed_product_name: data.agreed_product_name,
    agreed_wholesale_price: data.agreed_wholesale_price,
    agreed_currency: data.agreed_currency,

    agreed_moq: data.agreed_moq,

    agreed_exclusivity: data.agreed_exclusivity,
    agreed_shipping_terms: data.agreed_shipping_terms,
    agreed_payment_terms: data.agreed_payment_terms,
    agreed_contract_period: data.agreed_contract_period,

    agreed_notes: data.agreed_notes,

    maker_confirmed: data.maker_confirmed ?? false,
    partner_confirmed: data.partner_confirmed ?? false,
  });

  return pdf;
}

export async function generateNegotiationTermsPdf(
  negotiationId: string
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("negotiations")
    .select(`
      id,
      partner_id,
      case_id,
      cases!case_id (
        maker_id,
        title,
        product_name
      ),
      partner:profiles!partner_id (
        company_name
      ),
      negotiation_terms (
        wholesale_price,
        moq,
        payment_terms,
        lead_time,
        exclusive_sales,
        notes,
        maker_confirmed_at,
        partner_confirmed_at
      )
    `)
    .eq("id", negotiationId)
    .single();

  if (error || !data) {
    throw new Error(
      error?.message ?? "交渉条件データがありません"
    );
  }

  const caseRow = Array.isArray(data.cases)
    ? data.cases[0]
    : data.cases;

  const terms = Array.isArray(data.negotiation_terms)
    ? data.negotiation_terms[0]
    : data.negotiation_terms;

  if (!terms) {
    throw new Error("取引条件がありません");
  }

  console.log("[CONTRACT INSERT ID]", negotiationId);

  const { data: contract, error: contractError } = await supabase
    .from("contracts")
    .insert({
      negotiation_id: negotiationId,
      version: 1,
      status: "draft",
    })
    .select()
    .single();

  if (contractError) {
    throw new Error(contractError.message);
  }

  const { data: maker } = caseRow?.maker_id
    ? await supabase
        .from("profiles")
        .select("company_name")
        .eq("id", caseRow.maker_id)
        .single()
    : { data: null };

  console.log("[PDF BUILD START]");

  const pdf = await buildContractPdf({
    maker: maker?.company_name ?? "",
    partner:
      (Array.isArray(data.partner)
        ? data.partner[0]?.company_name
        : (data.partner as { company_name?: string } | null)?.company_name) ?? "",

    agreed_product_name:
      caseRow?.product_name ?? caseRow?.title ?? "",

    agreed_wholesale_price:
      terms.wholesale_price,

    agreed_currency:
      "JPY",

    agreed_moq:
      terms.moq,

    agreed_exclusivity:
      terms.exclusive_sales
        ? "Exclusive"
        : "Non-exclusive",

    agreed_shipping_terms:
      terms.lead_time,

    agreed_payment_terms:
      terms.payment_terms,

    agreed_contract_period:
      null,

    agreed_notes:
      terms.notes,

    maker_confirmed:
      !!terms.maker_confirmed_at,

    partner_confirmed:
      !!terms.partner_confirmed_at,
  });

  return pdf;
}












