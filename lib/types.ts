export type UserRole = "maker" | "partner" | "admin";

export type CaseStatus = "open" | "closed";

export type ReviewStatus =
  | "pending_review"
  | "approved"
  | "rejected"
  | "withdrawn";

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
  topic: string | null;
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
  /** Thread subject (件名) */
  topic: string;
  initialMessage: string | null;
  createdAt: string;
  updatedAt: string;
  caseId: string;
  caseNumber: string;
  caseTitle: string;
  productName: string;
  /** Maker-managed SKU; null when unset. Separate from any future platform product ID. */
  productSku: string | null;
  caseCategory: string;
  caseRegion: string;
  partnerId: string;
  partnerCompanyName: string;
  makerId: string;
  makerCompanyName: string;
  counterpartName: string;
  hasDeal?: boolean;
  /** Unread messages (and pending attention for makers) */
  unreadCount?: number;
  messageCount?: number;
  lastMessagePreview?: string | null;
  lastMessageAt?: string | null;
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

/**
 * Intermediary fee payment lifecycle (display / future billing).
 * Not yet persisted on deals — dashboard maps existing deals to awaiting_invoice.
 */
export type CommissionPaymentStatus =
  | "awaiting_invoice"
  | "unpaid"
  | "paid";

export const commissionPaymentStatusLabels: Record<
  CommissionPaymentStatus,
  string
> = {
  awaiting_invoice: "請求待ち",
  unpaid: "未払い",
  paid: "支払い済み",
};

export const applicationStatusLabels: Record<ApplicationStatus, string> = {
  pending: "準備中",
  accepted: "交渉中",
  rejected: "終了",
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
  display_name: string | null;
  entity_type: "individual" | "corporate" | null;
  sales_genres: string | null;
  preferred_categories: string | null;
  preferred_deal_types: string | null;
  onboarding_completed?: boolean;
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
  displayName: string | null;
  entityType: "individual" | "corporate" | null;
  salesGenres: string | null;
  preferredCategories: string | null;
  preferredDealTypes: string | null;
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
  displayName?: string;
  entityType?: "individual" | "corporate" | "";
  salesGenres?: string;
  preferredCategories?: string;
  preferredDealTypes?: string;
};

export const employeeRanges = ["1-10", "11-50", "51-200", "201+"] as const;

export type EmployeeRange = (typeof employeeRanges)[number];

export type CaseRow = {
  id: string;
  maker_id: string;
  /** Display id e.g. BB-000001 (UUID remains internal PK) */
  case_number: string;
  title: string;
  category: string;
  region: string;
  summary: string;
  description: string;
  ideal_partner: string;
  offer: string;
  status: CaseStatus;
  product_name: string;
  /** Maker-managed product code (SKU). Nullable for legacy rows. */
  sku?: string | null;
  product_features: string | null;
  price_band: string | null;
  sales_format: SalesFormat;
  sales_terms: string | null;
  min_order: string | null;
  is_exclusive: boolean;
  target_country: TargetCountry;
  partner_channels: string | null;
  partner_requirements: string | null;
  product_image_url: string | null;
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
  /** Display id e.g. BB-000001 */
  caseNumber: string;
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
  /** Maker-managed SKU; null when unset. Not a BrandBridge auto ID. */
  sku: string | null;
  productFeatures: string | null;
  priceBand: string | null;
  salesFormat: SalesFormat;
  salesTerms: string | null;
  minOrder: string | null;
  isExclusive: boolean;
  targetCountry: TargetCountry;
  partnerChannels: string | null;
  partnerRequirements: string | null;
  productImageUrl: string | null;
  /** Gallery images (case_images), ordered by sort_order. Primary = [0]. */
  images?: CaseImage[];
  reviewStatus: ReviewStatus;
  reviewNote: string | null;
  createdAt: string;
  /** Count of partner applications (negotiations) */
  applicationCount?: number;
  /** Count of negotiations in active pipeline (accepted+) */
  negotiationCount?: number;
  /** True when a row exists in public.deals for this case */
  hasDeal?: boolean;
};

/** Row from public.case_images */
export type CaseImage = {
  id: string;
  caseId: string;
  imageUrl: string;
  storagePath: string | null;
  sortOrder: number;
  createdAt: string;
};

export type Message = {
  id: string;
  negotiation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

export type MessageAttachmentView = {
  path: string;
  name: string;
  mime: string | null;
  size: number | null;
  /** Short-lived signed URL for download (private bucket) */
  url: string | null;
};

export type MessageView = {
  id: string;
  negotiationId: string;
  senderId: string;
  senderName: string;
  body: string;
  topic?: string | null;
  createdAt: string;
  isMine: boolean;
  attachment?: MessageAttachmentView | null;
};

export type MakerProfileInput = {
  companyName: string;
  contactName: string;
  email: string;
  password: string;
  industry: string;
  productOverview: string;
};

/** Multi-step maker registration (account + matching case draft) */
export type MakerSalesArea = "全国" | "特定地域" | "オンライン中心";

export type MakerDealType =
  | "卸販売"
  | "代理店"
  | "総代理店"
  | "業務提携"
  | "その他";

export const makerSalesChannelOptions = [
  "Amazon",
  "TikTok Shop",
  "自社EC",
  "実店舗",
  "卸販売",
  "その他",
] as const;

export type MakerSalesChannel = (typeof makerSalesChannelOptions)[number];

export const makerSalesAreaOptions: MakerSalesArea[] = [
  "全国",
  "特定地域",
  "オンライン中心",
];

export const makerDealTypeOptions: MakerDealType[] = [
  "卸販売",
  "代理店",
  "総代理店",
  "業務提携",
  "その他",
];

export type MakerRegistrationInput = {
  companyName: string;
  contactName: string;
  email: string;
  password: string;
  industry: string;
  companyOverview: string;
  productName: string;
  productCategory: string;
  productSummary: string;
  salesArea: MakerSalesArea;
  salesChannels: MakerSalesChannel[];
  dealType: MakerDealType;
  dealTerms: string;
  productImageUrl?: string | null;
};

/** Stored in auth user_metadata when email confirmation is required */
export type MakerCaseDraftMeta = {
  productName: string;
  productCategory: string;
  productSummary: string;
  salesArea: MakerSalesArea;
  salesChannels: MakerSalesChannel[];
  dealType: MakerDealType;
  dealTerms: string;
  companyOverview: string;
  industry: string;
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

export type PartnerEntityType = "individual" | "corporate";

export const partnerSalesGenreOptions = [
  "美容",
  "食品",
  "健康",
  "ファッション",
  "家電",
  "雑貨",
  "その他",
] as const;

export type PartnerSalesGenre = (typeof partnerSalesGenreOptions)[number];

export const partnerDealPreferenceOptions = [
  "卸販売",
  "代理店",
  "総代理店",
  "独占販売",
  "その他",
] as const;

export type PartnerDealPreference =
  (typeof partnerDealPreferenceOptions)[number];

/** Reuse maker channel options for partners */
export const partnerChannelOptions = makerSalesChannelOptions;

export type PartnerRegistrationInput = {
  displayName: string;
  entityType: PartnerEntityType;
  companyName: string;
  contactName: string;
  email: string;
  password: string;
  salesGenres: PartnerSalesGenre[];
  salesChannels: MakerSalesChannel[];
  area: string;
  preferredCategories: PartnerSalesGenre[];
  preferredDealTypes: PartnerDealPreference[];
  achievements: string;
  selfPr: string;
};

export type PartnerProfileDraftMeta = Omit<
  PartnerRegistrationInput,
  "password" | "email"
> & {
  email?: string;
};

export type CaseCreateInput = {
  title: string;
  category: string;
  region: string;
  summary: string;
  description: string;
  idealPartner: string;
  offer: string;
  /** Maker-managed product code (SKU). Optional; empty string when unset. */
  sku: string;
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
  productImageUrl?: string | null;
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
  rejected: "不承認",
  withdrawn: "取り下げ",
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
