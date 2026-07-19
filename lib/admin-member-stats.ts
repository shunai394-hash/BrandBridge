import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export type MemberRoleKpi = {
  /** 総登録数 */
  total: number;
  /** 今月新規登録数 */
  newThisMonth: number;
  /** 先月新規登録数（先月比計算用） */
  newLastMonth: number;
  /**
   * 先月比増減（％）。先月新規が 0 で今月も 0 なら 0、
   * 先月 0・今月 > 0 なら null（表示は「—」）。
   */
  monthOverMonthPercent: number | null;
};

export type AdminMemberStats = {
  makers: MemberRoleKpi;
  partners: MemberRoleKpi;
};

type Role = "maker" | "partner";

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** Asia/Tokyo の年月境界を Date で返す */
function jstMonthRange(reference = new Date()): {
  thisMonthStart: Date;
  lastMonthStart: Date;
  nextMonthStart: Date;
} {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(reference);
  const year = Number(parts.find((p) => p.type === "year")?.value);
  const month = Number(parts.find((p) => p.type === "month")?.value);

  const last =
    month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 };
  const next =
    month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };

  return {
    thisMonthStart: new Date(`${year}-${pad2(month)}-01T00:00:00+09:00`),
    lastMonthStart: new Date(
      `${last.year}-${pad2(last.month)}-01T00:00:00+09:00`,
    ),
    nextMonthStart: new Date(
      `${next.year}-${pad2(next.month)}-01T00:00:00+09:00`,
    ),
  };
}

function computeMomPercent(
  newThisMonth: number,
  newLastMonth: number,
): number | null {
  if (newLastMonth === 0) {
    return newThisMonth === 0 ? 0 : null;
  }
  return Math.round(((newThisMonth - newLastMonth) / newLastMonth) * 100);
}

async function countProfilesByRole(
  supabase: SupabaseClient,
  role: Role,
  fromIso?: string,
  toIsoExclusive?: string,
): Promise<number> {
  let query = supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", role);

  if (fromIso) {
    query = query.gte("created_at", fromIso);
  }
  if (toIsoExclusive) {
    query = query.lt("created_at", toIsoExclusive);
  }

  const { count, error } = await query;
  if (error) {
    console.error(`[getAdminMemberStats] ${role}`, error.message);
    return 0;
  }
  return count ?? 0;
}

async function getRoleKpi(
  supabase: SupabaseClient,
  role: Role,
): Promise<MemberRoleKpi> {
  const { thisMonthStart, lastMonthStart, nextMonthStart } = jstMonthRange();
  const thisStart = thisMonthStart.toISOString();
  const lastStart = lastMonthStart.toISOString();
  const nextStart = nextMonthStart.toISOString();

  const [total, newThisMonth, newLastMonth] = await Promise.all([
    countProfilesByRole(supabase, role),
    countProfilesByRole(supabase, role, thisStart, nextStart),
    countProfilesByRole(supabase, role, lastStart, thisStart),
  ]);

  return {
    total,
    newThisMonth,
    newLastMonth,
    monthOverMonthPercent: computeMomPercent(newThisMonth, newLastMonth),
  };
}

/**
 * 運営ダッシュボード「会員状況」KPI。
 * profiles.role = maker / partner を Asia/Tokyo の月次で集計。
 */
export async function getAdminMemberStats(): Promise<AdminMemberStats> {
  const supabase = await createClient();
  const [makers, partners] = await Promise.all([
    getRoleKpi(supabase, "maker"),
    getRoleKpi(supabase, "partner"),
  ]);
  return { makers, partners };
}
