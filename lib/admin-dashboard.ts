import { createClient } from "@/lib/supabase/server";
import { getDealStats } from "@/lib/deals";


/** Stable keys for metrics — safe to wire to APIs / billing later. */
export type AdminDashboardMetricKey =
  | "products.pendingReview"
  | "products.published"
  | "products.unpublished"
  | "negotiations.inNegotiation"
  | "negotiations.contractPrep"
  | "negotiations.contracted"
  | "fees.awaitingInvoice"
  | "fees.unpaid"
  | "fees.paid"
  | "revenue.contractAmountTotal"
  | "revenue.commissionTotal";

export type AdminDashboardSectionId =
  | "products"
  | "negotiations"
  | "fees"
  | "revenue";

export type AdminDashboardMetricValue =
  | { kind: "count"; value: number }
  | { kind: "currency"; value: number; currency: "JPY" };

export type AdminDashboardStats = {
  products: {
    pendingReview: number;
    published: number;
    unpublished: number;
  };
  negotiations: {
    inNegotiation: number;
    contractPrep: number;
    contracted: number;
  };
  fees: {
    awaitingInvoice: number;
    unpaid: number;
    paid: number;
  };
  revenue: {
    contractAmountTotal: number;
    commissionTotal: number;
  };
};

export type AdminDashboardMetricDef = {
  key: AdminDashboardMetricKey;
  section: AdminDashboardSectionId;
  label: string;
  href: string;
  /** How to read the value from stats */
  getValue: (stats: AdminDashboardStats) => AdminDashboardMetricValue;
};

export type AdminDashboardSectionDef = {
  id: AdminDashboardSectionId;
  title: string;
  description: string;
  metrics: AdminDashboardMetricDef[];
};

export const adminDashboardSections: AdminDashboardSectionDef[] = [
  {
    id: "products",
    title: "商品",
    description: "掲載審査から公開・非公開までの商品状況です。",
    metrics: [
      {
        key: "products.pendingReview",
        section: "products",
        label: "審査待ち商品",
        href: "/admin/cases?status=pending_review",
        getValue: (s) => ({ kind: "count", value: s.products.pendingReview }),
      },
      {
        key: "products.published",
        section: "products",
        label: "公開中商品",
        href: "/admin/cases?status=approved",
        getValue: (s) => ({ kind: "count", value: s.products.published }),
      },
      {
        key: "products.unpublished",
        section: "products",
        label: "非公開商品",
        href: "/admin/cases?status=all",
        getValue: (s) => ({ kind: "count", value: s.products.unpublished }),
      },
    ],
  },
  {
    id: "negotiations",
    title: "交渉",
    description: "メッセージ交渉から契約までのパイプラインです。",
    metrics: [
      {
        key: "negotiations.inNegotiation",
        section: "negotiations",
        label: "交渉中",
        href: "/admin/negotiations",
        getValue: (s) => ({
          kind: "count",
          value: s.negotiations.inNegotiation,
        }),
      },
      {
        key: "negotiations.contractPrep",
        section: "negotiations",
        label: "契約準備",
        href: "/admin/negotiations",
        getValue: (s) => ({
          kind: "count",
          value: s.negotiations.contractPrep,
        }),
      },
      {
        key: "negotiations.contracted",
        section: "negotiations",
        label: "契約済み",
        href: "/admin/negotiations",
        getValue: (s) => ({
          kind: "count",
          value: s.negotiations.contracted,
        }),
      },
    ],
  },
  {
    id: "fees",
    title: "手数料",
    description:
      "仲介手数料の請求・入金状況です（決済連携後に自動更新予定）。",
    metrics: [
      {
        key: "fees.awaitingInvoice",
        section: "fees",
        label: "請求待ち",
        href: "/deals",
        getValue: (s) => ({ kind: "count", value: s.fees.awaitingInvoice }),
      },
      {
        key: "fees.unpaid",
        section: "fees",
        label: "未払い",
        href: "/deals",
        getValue: (s) => ({ kind: "count", value: s.fees.unpaid }),
      },
      {
        key: "fees.paid",
        section: "fees",
        label: "支払い済み",
        href: "/deals",
        getValue: (s) => ({ kind: "count", value: s.fees.paid }),
      },
    ],
  },
  {
    id: "revenue",
    title: "売上",
    description:
      "契約金額は商品提供企業⇔パートナー間の取引額。BrandBridgeの扱いは仲介手数料のみです。",
    metrics: [
      {
        key: "revenue.contractAmountTotal",
        section: "revenue",
        label: "契約金額合計",
        href: "/deals",
        getValue: (s) => ({
          kind: "currency",
          value: s.revenue.contractAmountTotal,
          currency: "JPY",
        }),
      },
      {
        key: "revenue.commissionTotal",
        section: "revenue",
        label: "仲介手数料合計",
        href: "/deals",
        getValue: (s) => ({
          kind: "currency",
          value: s.revenue.commissionTotal,
          currency: "JPY",
        }),
      },
    ],
  },
];

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const supabase = await createClient();

  const [
    pendingReview,
    published,
    unpublished,
    inNegotiation,
    termsReview,
    contractPrep,
    contracted,
    dealStats,
  ] = await Promise.all([
    supabase
      .from("cases")
      .select("id", { count: "exact", head: true })
      .eq("review_status", "pending_review"),
    supabase
      .from("cases")
      .select("id", { count: "exact", head: true })
      .eq("review_status", "approved")
      .eq("status", "open"),
    supabase
      .from("cases")
      .select("id", { count: "exact", head: true })
      .or(
        "status.eq.closed,review_status.eq.rejected,review_status.eq.withdrawn",
      ),
    supabase
      .from("negotiations")
      .select("id", { count: "exact", head: true })
      .eq("pipeline_status", "in_negotiation"),
    supabase
      .from("negotiations")
      .select("id", { count: "exact", head: true })
      .eq("pipeline_status", "terms_review"),
    supabase
      .from("negotiations")
      .select("id", { count: "exact", head: true })
      .eq("pipeline_status", "contract_prep"),
    supabase
      .from("negotiations")
      .select("id", { count: "exact", head: true })
      .eq("pipeline_status", "won"),
    getDealStats(),
  ]);

  // Interim fee mapping until commission_payment_status exists:
  // every registered deal is "請求待ち"; unpaid/paid stay 0.
  const awaitingInvoice = dealStats.dealCount;

  return {
    products: {
      pendingReview: pendingReview.count ?? 0,
      published: published.count ?? 0,
      unpublished: unpublished.count ?? 0,
    },
    negotiations: {
      inNegotiation:
        (inNegotiation.count ?? 0) + (termsReview.count ?? 0),
      contractPrep: contractPrep.count ?? 0,
      contracted: contracted.count ?? 0,
    },
    fees: {
      awaitingInvoice,
      unpaid: 0,
      paid: 0,
    },
    revenue: {
      contractAmountTotal: dealStats.totalDealAmount,
      commissionTotal: dealStats.totalCommission,
    },
  };
}
