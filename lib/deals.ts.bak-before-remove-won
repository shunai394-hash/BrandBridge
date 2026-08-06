import { createClient } from "@/lib/supabase/server";
import type { CreateDealInput, Deal } from "@/lib/types";

type DealRow = {
  id: string;
  negotiation_id: string;
  case_id: string;
  maker_id: string;
  partner_id: string;
  deal_closed_at: string;
  deal_amount: number | string;
  deal_currency: string;
  commission_rate: number | string;
  commission_amount: number | string;
  commission_note: string | null;
  created_at: string;
  cases: { title: string } | { title: string }[] | null;
  maker: { company_name: string } | { company_name: string }[] | null;
  partner: { company_name: string } | { company_name: string }[] | null;
};

function one<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function mapDeal(row: DealRow): Deal {
  return {
    id: row.id,
    negotiationId: row.negotiation_id,
    caseId: row.case_id,
    caseTitle: one(row.cases)?.title ?? "案件",
    makerId: row.maker_id,
    makerName: one(row.maker)?.company_name ?? "商品提供企業",
    partnerId: row.partner_id,
    partnerName: one(row.partner)?.company_name ?? "パートナー",
    dealClosedAt: row.deal_closed_at,
    dealAmount: Number(row.deal_amount),
    dealCurrency: row.deal_currency,
    commissionRate: Number(row.commission_rate),
    commissionAmount: Number(row.commission_amount),
    commissionNote: row.commission_note,
    createdAt: row.created_at,
  };
}

const dealSelect = `
  id,
  negotiation_id,
  case_id,
  maker_id,
  partner_id,
  deal_closed_at,
  deal_amount,
  deal_currency,
  commission_rate,
  commission_amount,
  commission_note,
  created_at,
  cases!case_id ( title ),
  maker:profiles!maker_id ( company_name ),
  partner:profiles!partner_id ( company_name )
`;

export async function getDefaultCommissionRate(): Promise<number> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("commission_settings")
    .select("default_rate")
    .eq("id", 1)
    .maybeSingle();

  if (error || !data) {
    console.error("[getDefaultCommissionRate]", error?.message);
    return 5;
  }

  return Number(data.default_rate);
}

export async function updateDefaultCommissionRate(
  rate: number,
  adminId: string,
): Promise<{ error?: string }> {
  if (rate < 0 || rate > 100) {
    return { error: "手数料率は 0〜100 の範囲で指定してください" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("commission_settings")
    .update({
      default_rate: rate,
      updated_at: new Date().toISOString(),
      updated_by: adminId,
    })
    .eq("id", 1);

  if (error) return { error: error.message };
  return {};
}

export async function listDeals(): Promise<Deal[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("deals")
    .select(dealSelect)
    .order("deal_closed_at", { ascending: false });

  if (error) {
    console.error("[listDeals]", error.message);
    return [];
  }

  return ((data ?? []) as unknown as DealRow[]).map(mapDeal);
}

export async function getDealStats(): Promise<{
  dealCount: number;
  totalDealAmount: number;
  totalCommission: number;
}> {
  const deals = await listDeals();
  return {
    dealCount: deals.length,
    totalDealAmount: deals.reduce((sum, d) => sum + d.dealAmount, 0),
    totalCommission: deals.reduce((sum, d) => sum + d.commissionAmount, 0),
  };
}

export async function createDealFromNegotiation(
  input: CreateDealInput,
  adminId: string,
): Promise<{ id: string } | { error: string }> {
  if (input.dealAmount < 0 || Number.isNaN(input.dealAmount)) {
    return { error: "成約金額が不正です" };
  }

  const supabase = await createClient();

  const { data: negotiation, error: negError } = await supabase
    .from("negotiations")
    .select(
      `
      id,
      application_status,
      partner_id,
      case_id,
      cases!case_id ( maker_id )
    `,
    )
    .eq("id", input.negotiationId)
    .maybeSingle();

  if (negError || !negotiation) {
    return { error: negError?.message ?? "交渉が見つかりません" };
  }

  if (negotiation.application_status !== "accepted") {
    return { error: "申込承認済みの交渉のみ成約化できます" };
  }

  const caseRow = Array.isArray(negotiation.cases)
    ? negotiation.cases[0]
    : negotiation.cases;
  const makerId = (caseRow as { maker_id?: string } | null)?.maker_id;
  if (!makerId) {
    return { error: "商品提供企業情報が取得できません" };
  }

  const rate =
    input.commissionRate !== undefined
      ? input.commissionRate
      : await getDefaultCommissionRate();

  if (rate < 0 || rate > 100) {
    return { error: "手数料率が不正です" };
  }

  const commissionAmount = Math.round(input.dealAmount * (rate / 100) * 100) / 100;
  const closedAt = input.dealClosedAt || new Date().toISOString();

  const { data, error } = await supabase
    .from("deals")
    .insert({
      negotiation_id: input.negotiationId,
      case_id: negotiation.case_id,
      maker_id: makerId,
      partner_id: negotiation.partner_id,
      deal_closed_at: closedAt,
      deal_amount: input.dealAmount,
      deal_currency: "JPY",
      commission_rate: rate,
      commission_amount: commissionAmount,
      commission_note: input.commissionNote?.trim() || null,
      created_by: adminId,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: error?.message ?? "成約の登録に失敗しました" };
  }

  await supabase
    .from("negotiations")
    .update({ pipeline_status: "won" })
    .eq("id", input.negotiationId);

  return { id: data.id as string };
}
