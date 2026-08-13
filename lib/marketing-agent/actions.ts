"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { MarketingAgentError } from "@/lib/marketing-agent/ai";
import {
  jobCompetitorAnalysis,
  jobDiscoverOpportunities,
  jobFetchSearchConsole,
  jobGenerateArticle,
  jobGenerateSocial,
  jobMarketResearch,
  jobProposeGeo,
  jobProposeInternalLinks,
  jobRunSiteAnalysis,
} from "@/lib/marketing-agent/jobs";
import {
  updateCompetitorGapStatus,
  updateCompetitorStatus,
  updateDraftStatus,
  updateIdeaStatus,
  updateRecommendationStatus,
} from "@/lib/marketing-agent/store";
import type {
  CompetitorStatus,
  MarketingDraftStatus,
  MarketingIdeaStatus,
  MarketingRecommendationStatus,
} from "@/lib/marketing-agent/types";

function fail(error: unknown): { error: string } {
  if (error instanceof MarketingAgentError) return { error: error.message };
  if (error instanceof Error) {
    if (error.message === "UNAUTHORIZED") {
      return { error: "ログインが必要です。" };
    }
    if (
      error.message === "FORBIDDEN_ADMIN_ONLY" ||
      error.message === "NO_PROFILE"
    ) {
      return { error: "管理者のみ実行できます。" };
    }
    if (error.message === "ACCOUNT_INACTIVE") {
      return { error: "アカウントが停止されています。" };
    }
    return { error: error.message };
  }
  return { error: "処理に失敗しました。" };
}

async function gateAdmin() {
  await requireAdmin();
}

function refresh() {
  revalidatePath("/admin/marketing-agent");
}

export async function fetchSearchConsoleAction(
  formData: FormData,
): Promise<{ error?: string }> {
  try {
    await gateAdmin();
    const startDate = String(formData.get("startDate") ?? "").trim() || undefined;
    const endDate = String(formData.get("endDate") ?? "").trim() || undefined;
    await jobFetchSearchConsole({ startDate, endDate });
    refresh();
    return {};
  } catch (error) {
    return fail(error);
  }
}

export async function runSiteAnalysisAction(): Promise<{ error?: string }> {
  try {
    await gateAdmin();
    await jobRunSiteAnalysis({ includeGsc: true });
    refresh();
    return {};
  } catch (error) {
    return fail(error);
  }
}

export async function discoverOpportunitiesAction(): Promise<{ error?: string }> {
  try {
    await gateAdmin();
    await jobDiscoverOpportunities();
    refresh();
    return {};
  } catch (error) {
    return fail(error);
  }
}

export async function generateArticleAction(
  formData: FormData,
): Promise<{ error?: string }> {
  try {
    await gateAdmin();
    const ideaId = String(formData.get("ideaId") ?? "").trim();
    if (!ideaId) return { error: "記事案を選択してください。" };
    await jobGenerateArticle(ideaId);
    refresh();
    return {};
  } catch (error) {
    return fail(error);
  }
}

export async function proposeGeoAction(
  formData: FormData,
): Promise<{ error?: string }> {
  try {
    await gateAdmin();
    const draftId = String(formData.get("draftId") ?? "").trim() || undefined;
    await jobProposeGeo(draftId);
    refresh();
    return {};
  } catch (error) {
    return fail(error);
  }
}

export async function proposeInternalLinksAction(): Promise<{ error?: string }> {
  try {
    await gateAdmin();
    await jobProposeInternalLinks();
    refresh();
    return {};
  } catch (error) {
    return fail(error);
  }
}

export async function generateSocialAction(
  formData: FormData,
): Promise<{ error?: string }> {
  try {
    await gateAdmin();
    const draftId = String(formData.get("draftId") ?? "").trim();
    if (!draftId) return { error: "ドラフトを選択してください。" };
    await jobGenerateSocial(draftId);
    refresh();
    return {};
  } catch (error) {
    return fail(error);
  }
}

export async function runMarketResearchAction(): Promise<{ error?: string }> {
  try {
    await gateAdmin();
    await jobMarketResearch();
    refresh();
    return {};
  } catch (error) {
    return fail(error);
  }
}

export async function runCompetitorAnalysisAction(): Promise<{ error?: string }> {
  try {
    await gateAdmin();
    await jobCompetitorAnalysis();
    refresh();
    return {};
  } catch (error) {
    return fail(error);
  }
}

export async function setCompetitorStatusAction(
  formData: FormData,
): Promise<{ error?: string }> {
  try {
    await gateAdmin();
    const id = String(formData.get("id") ?? "").trim();
    const status = String(formData.get("status") ?? "").trim() as CompetitorStatus;
    if (!id) return { error: "対象がありません。" };
    if (!["candidate", "reviewed", "watch", "dismissed"].includes(status)) {
      return { error: "不正なステータスです。" };
    }
    await updateCompetitorStatus(id, status);
    revalidatePath("/admin/marketing-agent");
    revalidatePath(`/admin/marketing-agent/competitors/${id}`);
    return {};
  } catch (error) {
    return fail(error);
  }
}

export async function setCompetitorGapStatusAction(
  formData: FormData,
): Promise<{ error?: string }> {
  try {
    await gateAdmin();
    const id = String(formData.get("id") ?? "").trim();
    const status = String(
      formData.get("status") ?? "",
    ).trim() as MarketingRecommendationStatus;
    if (!id) return { error: "対象がありません。" };
    if (!["open", "accepted", "dismissed"].includes(status)) {
      return { error: "不正なステータスです。" };
    }
    await updateCompetitorGapStatus(id, status);
    refresh();
    return {};
  } catch (error) {
    return fail(error);
  }
}

export async function setIdeaStatusAction(
  formData: FormData,
): Promise<{ error?: string }> {
  try {
    await gateAdmin();
    const id = String(formData.get("id") ?? "").trim();
    const status = String(formData.get("status") ?? "").trim() as MarketingIdeaStatus;
    if (!id) return { error: "対象がありません。" };
    if (!["proposed", "accepted", "rejected", "archived"].includes(status)) {
      return { error: "不正なステータスです。" };
    }
    await updateIdeaStatus(id, status);
    refresh();
    return {};
  } catch (error) {
    return fail(error);
  }
}

export async function setDraftStatusAction(
  formData: FormData,
): Promise<{ error?: string }> {
  try {
    await gateAdmin();
    const id = String(formData.get("id") ?? "").trim();
    const status = String(
      formData.get("status") ?? "",
    ).trim() as MarketingDraftStatus;
    if (!id) return { error: "対象がありません。" };
    if (!["draft", "accepted", "rejected"].includes(status)) {
      return { error: "不正なステータスです。" };
    }
    await updateDraftStatus(id, status);
    revalidatePath("/admin/marketing-agent");
    revalidatePath(`/admin/marketing-agent/drafts/${id}`);
    return {};
  } catch (error) {
    return fail(error);
  }
}

export async function setRecommendationStatusAction(
  formData: FormData,
): Promise<{ error?: string }> {
  try {
    await gateAdmin();
    const id = String(formData.get("id") ?? "").trim();
    const status = String(
      formData.get("status") ?? "",
    ).trim() as MarketingRecommendationStatus;
    if (!id) return { error: "対象がありません。" };
    if (!["open", "accepted", "dismissed"].includes(status)) {
      return { error: "不正なステータスです。" };
    }
    await updateRecommendationStatus(id, status);
    refresh();
    return {};
  } catch (error) {
    return fail(error);
  }
}
