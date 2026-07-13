import type {
  CaseCreateInput,
  MakerCaseDraftMeta,
  MakerDealType,
  MakerRegistrationInput,
  MakerSalesArea,
  SalesFormat,
} from "@/lib/types";

function mapDealType(dealType: MakerDealType): {
  salesFormat: SalesFormat;
  isExclusive: boolean;
  label: string;
} {
  switch (dealType) {
    case "卸販売":
      return { salesFormat: "wholesale", isExclusive: false, label: "卸販売" };
    case "代理店":
      return { salesFormat: "agency", isExclusive: false, label: "代理店" };
    case "総代理店":
      return { salesFormat: "agency", isExclusive: true, label: "総代理店" };
    case "業務提携":
      return { salesFormat: "other", isExclusive: false, label: "業務提携" };
    default:
      return { salesFormat: "other", isExclusive: false, label: "その他" };
  }
}

function mapSalesArea(area: MakerSalesArea): {
  region: string;
  targetNote: string;
} {
  switch (area) {
    case "全国":
      return { region: "全国", targetNote: "希望販売エリア: 日本全国" };
    case "特定地域":
      return { region: "その他", targetNote: "希望販売エリア: 特定地域" };
    case "オンライン中心":
      return {
        region: "全国・海外",
        targetNote: "希望販売エリア: オンライン中心",
      };
  }
}

export function toCaseDraftMeta(
  input: MakerRegistrationInput,
): MakerCaseDraftMeta {
  return {
    productName: input.productName,
    productCategory: input.productCategory,
    productSummary: input.productSummary,
    salesArea: input.salesArea,
    salesChannels: input.salesChannels,
    dealType: input.dealType,
    dealTerms: input.dealTerms,
    companyOverview: input.companyOverview,
    industry: input.industry,
  };
}

export function caseInputFromMakerDraft(
  draft: MakerCaseDraftMeta,
  productImageUrl?: string | null,
): CaseCreateInput {
  const deal = mapDealType(draft.dealType);
  const area = mapSalesArea(draft.salesArea);
  const channels = draft.salesChannels.join(" / ");
  const summary =
    draft.productSummary.trim() ||
    `${draft.productName}の販売パートナー募集`;

  return {
    title: `${draft.productName}の販売パートナー募集`,
    category: draft.productCategory,
    region: area.region,
    summary,
    description: [
      draft.productSummary.trim(),
      area.targetNote,
      draft.companyOverview.trim()
        ? `【会社概要】\n${draft.companyOverview.trim()}`
        : "",
    ]
      .filter(Boolean)
      .join("\n\n"),
    idealPartner: `希望販売チャネル: ${channels || "応相談"}`,
    offer: [
      `取引形式: ${deal.label}`,
      draft.dealTerms.trim() ? `希望条件:\n${draft.dealTerms.trim()}` : "",
    ]
      .filter(Boolean)
      .join("\n\n"),
    productName: draft.productName,
    productFeatures: draft.productSummary,
    priceBand: "",
    salesFormat: deal.salesFormat,
    salesTerms: draft.dealTerms,
    minOrder: "",
    isExclusive: deal.isExclusive,
    targetCountry: "JP",
    partnerChannels: channels,
    partnerRequirements: draft.dealTerms,
    productImageUrl: productImageUrl ?? null,
  };
}

export function caseInputFromRegistration(
  input: MakerRegistrationInput,
): CaseCreateInput {
  return caseInputFromMakerDraft(
    toCaseDraftMeta(input),
    input.productImageUrl,
  );
}

export const MAKER_DRAFT_STORAGE_KEY = "bb_maker_reg_draft_v1";
