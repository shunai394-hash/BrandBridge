export type UserRole = "maker" | "partner" | "admin";

export type CaseStatus = "open" | "closed";

export type ReviewStatus = "pending_review" | "approved" | "rejected";

export type ApplicationStatus = "pending" | "accepted" | "rejected";

/** @deprecated use ApplicationStatus — kept as alias during migration */
export type NegotiationStatus = ApplicationStatus;

export type PipelineStatus =
  | "in_negotiation"
  | "terms_review"
  | "contract_prep"
  | "won"
  | "closed";

export type Negotiation = {
  id: string;
  case_id: string;
  partner_id: string;
  message: string | null;
  application_status: ApplicationStatus;
  pipeline_status: PipelineStatus | null;
  created_at: string;
  updated_at: string;
};

/** UI-facing negotiation list/detail row */
export type NegotiationListItem = {
  id: string;
  applicationStatus: ApplicationStatus;
  pipelineStatus: PipelineStatus | null;
  /** @deprecated alias of applicationStatus */
  status: ApplicationStatus;
  initialMessage: string | null;
  createdAt: string;
  updatedAt: string;
  caseId: string;
  caseTitle: string;
  caseCategory: string;
  caseRegion: string;
  partnerId: string;
  partnerCompanyName: string;
  makerId: string;
  makerCompanyName: string;
  counterpartName: string;
  hasDeal?: boolean;
};

export type Deal = {
  id: string;
  negotiationId: string;
  caseId: string;
  caseTitle: string;
  makerId: string;
  makerName: string;
  partnerId: string;
  partnerName: string;
  dealClosedAt: string;
  dealAmount: number;
  dealCurrency: string;
  commissionRate: number;
  commissionAmount: number;
  commissionNote: string | null;
  createdAt: string;
};

export type CreateDealInput = {
  negotiationId: string;
  dealAmount: number;
  dealClosedAt?: string;
  commissionRate?: number;
  commissionNote?: string;
};

export const applicationStatusLabels: Record<ApplicationStatus, string> = {
  pending: "申込審査中",
  accepted: "申込承認",
  rejected: "申込却下",
};

export const pipelineStatusLabels: Record<PipelineStatus, string> = {
  in_negotiation: "交渉中",
  terms_review: "条件確認",
  contract_prep: "契約準備",
  won: "成約",
  closed: "終了",
};

export const pipelineStatusOptions: PipelineStatus[] = [
  "in_negotiation",
  "terms_review",
  "contract_prep",
  "won",
  "closed",
];

export type Profile = {
  id: string;
  role: UserRole;
  company_name: string;
  contact_name: string;
  email: string;
  industry: string | null;
  product_overview: string | null;
  sales_channel: string | null;
  area: string | null;
  strength: string | null;
  description: string | null;
  website_url: string | null;
  headquarters: string | null;
  founded_year: number | null;
  employee_range: string | null;
  corporate_number: string | null;
  achievements: string | null;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
};

/** Public-facing profile (no email) */
export type PublicProfile = {
  id: string;
  role: UserRole;
  companyName: string;
  contactName: string;
  industry: string | null;
  productOverview: string | null;
  salesChannel: string | null;
  area: string | null;
  strength: string | null;
  description: string | null;
  websiteUrl: string | null;
  headquarters: string | null;
  foundedYear: number | null;
  employeeRange: string | null;
  corporateNumber: string | null;
  achievements: string | null;
  createdAt: string;
};

export type ProfileUpdateInput = {
  companyName: string;
  contactName: string;
  industry?: string;
  productOverview?: string;
  salesChannel?: string;
  area?: string;
  strength?: string;
  description: string;
  websiteUrl: string;
  headquarters: string;
  foundedYear: string;
  employeeRange: string;
  corporateNumber: string;
  achievements: string;
};

export const employeeRanges = ["1-10", "11-50", "51-200", "201+"] as const;

export type EmployeeRange = (typeof employeeRanges)[number];

export type CaseRow = {
  id: string;
  maker_id: string;
  title: string;
  category: string;
  region: string;
  summary: string;
  description: string;
  ideal_partner: string;
  offer: string;
  status: CaseStatus;
  product_name: string;
  product_features: string | null;
  price_band: string | null;
  sales_format: SalesFormat;
  sales_terms: string | null;
  min_order: string | null;
  is_exclusive: boolean;
  target_country: TargetCountry;
  partner_channels: string | null;
  partner_requirements: string | null;
  review_status: ReviewStatus;
  reviewed_at: string | null;
  reviewed_by: string | null;
  review_note: string | null;
  created_at: string;
  updated_at: string;
};

/** UI-facing case with maker display name and trust summary */
export type Case = {
  id: string;
  makerId: string;
  title: string;
  makerName: string;
  makerIndustry: string | null;
  makerHeadquarters: string | null;
  makerFoundedYear: number | null;
  category: string;
  region: string;
  summary: string;
  description: string;
  idealPartner: string;
  offer: string;
  status: CaseStatus;
  productName: string;
  productFeatures: string | null;
  priceBand: string | null;
  salesFormat: SalesFormat;
  salesTerms: string | null;
  minOrder: string | null;
  isExclusive: boolean;
  targetCountry: TargetCountry;
  partnerChannels: string | null;
  partnerRequirements: string | null;
  reviewStatus: ReviewStatus;
  reviewNote: string | null;
  createdAt: string;
};

export type Message = {
  id: string;
  negotiation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

export type MessageView = {
  id: string;
  negotiationId: string;
  senderId: string;
  senderName: string;
  body: string;
  createdAt: string;
  isMine: boolean;
};

export type MakerProfileInput = {
  companyName: string;
  contactName: string;
  email: string;
  password: string;
  industry: string;
  productOverview: string;
};

export type PartnerProfileInput = {
  companyName: string;
  contactName: string;
  email: string;
  password: string;
  salesChannel: string;
  area: string;
  strength: string;
};

export type CaseCreateInput = {
  title: string;
  category: string;
  region: string;
  summary: string;
  description: string;
  idealPartner: string;
  offer: string;
  productName: string;
  productFeatures: string;
  priceBand: string;
  salesFormat: SalesFormat;
  salesTerms: string;
  minOrder: string;
  isExclusive: boolean;
  targetCountry: TargetCountry;
  partnerChannels: string;
  partnerRequirements: string;
};

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  companyName: string;
  isActive: boolean;
};

export const reviewStatusLabels: Record<ReviewStatus, string> = {
  pending_review: "審査待ち",
  approved: "承認済",
  rejected: "却下",
};

export type SalesFormat =
  | "wholesale"
  | "consignment"
  | "agency"
  | "oem"
  | "ec"
  | "other";

export type TargetCountry =
  | "JP"
  | "US"
  | "CN"
  | "ASEAN"
  | "EU"
  | "GLOBAL"
  | "OTHER";

export type ExclusiveFilter = "すべて" | "独占可" | "非独占";

/** フィルタ用（先頭に「すべて」） */
export const caseCategories = [
  "すべて",
  "美容・コスメ",
  "食品・飲料",
  "健康・サプリ",
  "ファッション",
  "家電・ガジェット",
  "雑貨・ライフスタイル",
  "製造・産業",
  "その他",
] as const;

export type CaseCategory = Exclude<(typeof caseCategories)[number], "すべて">;

export const caseRegions = [
  "すべて",
  "全国",
  "関東",
  "関西",
  "中部",
  "九州・沖縄",
  "北海道・東北",
  "全国・海外",
  "その他",
] as const;

export const salesFormatOptions: { value: SalesFormat; label: string }[] = [
  { value: "wholesale", label: "卸売" },
  { value: "consignment", label: "委託販売" },
  { value: "agency", label: "代理店" },
  { value: "oem", label: "OEM / ODM" },
  { value: "ec", label: "EC販売" },
  { value: "other", label: "その他" },
];

export const targetCountryOptions: { value: TargetCountry; label: string }[] = [
  { value: "JP", label: "日本" },
  { value: "US", label: "アメリカ" },
  { value: "CN", label: "中国" },
  { value: "ASEAN", label: "ASEAN" },
  { value: "EU", label: "ヨーロッパ" },
  { value: "GLOBAL", label: "全世界" },
  { value: "OTHER", label: "その他" },
];

export const exclusiveFilterOptions: ExclusiveFilter[] = [
  "すべて",
  "独占可",
  "非独占",
];

export function salesFormatLabel(value: SalesFormat): string {
  return salesFormatOptions.find((o) => o.value === value)?.label ?? value;
}

export function targetCountryLabel(value: TargetCountry): string {
  return targetCountryOptions.find((o) => o.value === value)?.label ?? value;
}
