import { createClient } from "@/lib/supabase/server";

export type PlatformStats = {
  listedProducts: number;
  activeNegotiations: number;
  closedDeals: number;
  registeredCompanies: number;
};

export async function getPlatformStats(): Promise<PlatformStats> {
  const supabase = await createClient();

  const [
    products,
    negotiations,
    deals,
    companies,
  ] = await Promise.all([
    supabase
      .from("cases")
      .select("id", { count: "exact", head: true })
      .eq("review_status", "approved")
      .eq("status", "open"),

    supabase
      .from("negotiations")
      .select("id", { count: "exact", head: true })
      .in("pipeline_status", [
        "in_negotiation",
        "terms_review",
        "contract_prep",
      ]),

    supabase
      .from("deals")
      .select("id", { count: "exact", head: true }),

    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true }),
  ]);

  return {
    listedProducts: products.count ?? 0,
    activeNegotiations: negotiations.count ?? 0,
    closedDeals: deals.count ?? 0,
    registeredCompanies: companies.count ?? 0,
  };
}