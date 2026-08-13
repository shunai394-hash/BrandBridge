"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import {
  DEFAULT_PLATFORM_LIMITS,
  type AccountPlatform,
  type CalendarStatus,
  type ContentStatus,
  type OpportunityStatus,
  type PostStatus,
  type SocialPlatform,
} from "./types";
import {
  jobBrandAuthority,
  jobCompetitorAnalysis,
  jobDiscoverOpportunities,
  jobGenerateArticle,
  jobMarketResearch,
  jobPerformanceAnalysis,
  jobPlatformDiscovery,
  jobRepurpose,
  jobScaling,
  jobSearchConsole,
  jobSiteAnalysis,
  runWeeklyMarketingPipeline,
} from "./jobs";
import { officialApiConnected } from "./secrets";
import { publishViaOfficialApi } from "./social";
import {
  countRecentPosts,
  getContent,
  getSocialPost,
  insertPerformance,
  insertSocialAccount,
  listSocialAccounts,
  setRecommendationStatus,
  updateContent,
  updateOpportunityStatus,
  updateSocialAccount,
  updateSocialPost,
  updateCalendarForPost,
} from "./store";

function revalidateMarketing() {
  revalidatePath("/admin/marketing-agent");
}

function formStr(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

export async function runSiteAnalysisAction(): Promise<{ message: string; ok: boolean }> {
  const admin = await requireAdmin();
  const result = await jobSiteAnalysis(admin.id);
  revalidateMarketing();
  return { message: result.message, ok: result.ok };
}

export async function runSearchConsoleAction(): Promise<{ message: string; ok: boolean }> {
  const admin = await requireAdmin();
  const result = await jobSearchConsole(admin.id);
  revalidateMarketing();
  return { message: result.message, ok: result.ok };
}

export async function runMarketResearchAction(): Promise<{ message: string; ok: boolean }> {
  const admin = await requireAdmin();
  const result = await jobMarketResearch(admin.id);
  revalidateMarketing();
  return { message: result.message, ok: result.ok };
}

export async function runCompetitorAnalysisAction(): Promise<{
  message: string;
  ok: boolean;
}> {
  const admin = await requireAdmin();
  const result = await jobCompetitorAnalysis(admin.id);
  revalidateMarketing();
  return { message: result.message, ok: result.ok };
}

export async function discoverOpportunitiesAction(): Promise<{
  message: string;
  ok: boolean;
}> {
  const admin = await requireAdmin();
  const result = await jobDiscoverOpportunities(admin.id);
  revalidateMarketing();
  return { message: result.message, ok: result.ok };
}

export async function generateArticleAction(
  formData: FormData,
): Promise<{ message: string; ok: boolean }> {
  const admin = await requireAdmin();
  const id = formStr(formData, "opportunityId");
  if (!id) return { ok: false, message: "opportunityId が必要です" };
  const result = await jobGenerateArticle(admin.id, id);
  revalidateMarketing();
  if (result.contentId) {
    revalidatePath(`/admin/marketing-agent/contents/${result.contentId}`);
  }
  return { message: result.message, ok: result.ok };
}

export async function repurposeContentAction(
  formData: FormData,
): Promise<{ message: string; ok: boolean }> {
  const admin = await requireAdmin();
  const id = formStr(formData, "contentId");
  if (!id) return { ok: false, message: "contentId が必要です" };
  const result = await jobRepurpose(admin.id, id);
  revalidateMarketing();
  return { message: result.message, ok: result.ok };
}

export async function runPlatformDiscoveryAction(): Promise<{
  message: string;
  ok: boolean;
}> {
  const admin = await requireAdmin();
  const result = await jobPlatformDiscovery(admin.id);
  revalidateMarketing();
  return { message: result.message, ok: result.ok };
}

export async function runBrandAuthorityAction(): Promise<{
  message: string;
  ok: boolean;
}> {
  const admin = await requireAdmin();
  const result = await jobBrandAuthority(admin.id);
  revalidateMarketing();
  return { message: result.message, ok: result.ok };
}

export async function runPerformanceAction(): Promise<{ message: string; ok: boolean }> {
  const admin = await requireAdmin();
  const result = await jobPerformanceAnalysis(admin.id);
  revalidateMarketing();
  return { message: result.message, ok: result.ok };
}

export async function runScalingAction(): Promise<{ message: string; ok: boolean }> {
  const admin = await requireAdmin();
  const result = await jobScaling(admin.id);
  revalidateMarketing();
  return { message: result.message, ok: result.ok };
}

export async function runWeeklyPipelineAction(): Promise<{
  message: string;
  ok: boolean;
}> {
  const admin = await requireAdmin();
  const result = await runWeeklyMarketingPipeline(admin.id);
  revalidateMarketing();
  return { message: result.message, ok: result.ok };
}

export async function setOpportunityStatusAction(
  formData: FormData,
): Promise<{ message: string; ok: boolean }> {
  await requireAdmin();
  const id = formStr(formData, "opportunityId");
  const status = formStr(formData, "status") as OpportunityStatus;
  if (!id || !status) return { ok: false, message: "入力が不足しています" };
  await updateOpportunityStatus(id, status);
  revalidateMarketing();
  return { ok: true, message: `機会を ${status} に更新しました` };
}

export async function setContentStatusAction(
  formData: FormData,
): Promise<{ message: string; ok: boolean }> {
  await requireAdmin();
  const id = formStr(formData, "contentId");
  const status = formStr(formData, "status") as ContentStatus;
  if (!id || !status) return { ok: false, message: "入力が不足しています" };
  await updateContent(id, { status });
  revalidateMarketing();
  revalidatePath(`/admin/marketing-agent/contents/${id}`);
  return { ok: true, message: `記事を ${status} に更新しました` };
}

export async function saveContentAction(
  formData: FormData,
): Promise<{ message: string; ok: boolean }> {
  await requireAdmin();
  const id = formStr(formData, "contentId");
  if (!id) return { ok: false, message: "contentId が必要です" };
  await updateContent(id, {
    title: formStr(formData, "title"),
    metaTitle: formStr(formData, "metaTitle") || null,
    metaDescription: formStr(formData, "metaDescription") || null,
    slug: formStr(formData, "slug") || null,
    h1: formStr(formData, "h1") || null,
    body: String(formData.get("body") ?? ""),
    targetKeyword: formStr(formData, "targetKeyword") || null,
    searchIntent: formStr(formData, "searchIntent") || null,
    targetCountry: formStr(formData, "targetCountry") || null,
    targetAudience: formStr(formData, "targetAudience") || null,
    cta: formStr(formData, "cta") || null,
    language: formStr(formData, "language") || "en",
    definition: formStr(formData, "definition") || null,
    authorOrgInfo: formStr(formData, "authorOrgInfo") || null,
  });
  revalidateMarketing();
  revalidatePath(`/admin/marketing-agent/contents/${id}`);
  return { ok: true, message: "記事を保存しました（公開ページは未変更）" };
}

export async function setRecommendationStatusAction(
  formData: FormData,
): Promise<{ message: string; ok: boolean }> {
  await requireAdmin();
  const id = formStr(formData, "recommendationId");
  const status = formStr(formData, "status") as "open" | "accepted" | "dismissed";
  if (!id || !status) return { ok: false, message: "入力が不足しています" };
  await setRecommendationStatus(id, status);
  revalidateMarketing();
  return { ok: true, message: "提案を更新しました" };
}

export async function createSocialAccountAction(
  formData: FormData,
): Promise<{ message: string; ok: boolean }> {
  await requireAdmin();
  const platform = formStr(formData, "platform") as AccountPlatform;
  const accountName = formStr(formData, "accountName");
  if (!platform || !accountName) {
    return { ok: false, message: "platform と accountName が必要です" };
  }
  const defaults = DEFAULT_PLATFORM_LIMITS[platform];
  if (!defaults) return { ok: false, message: "未対応の platform です" };
  const daily = Number(formStr(formData, "dailyLimit") || defaults.daily);
  const weekly = Number(formStr(formData, "weeklyLimit") || defaults.weekly);
  const autoRaw = formStr(formData, "autoPublishEnabled") === "on";
  const secretRef = formStr(formData, "oauthSecretRef") || null;
  const autoPublishEnabled =
    autoRaw && officialApiConnected(platform, secretRef);
  const result = await insertSocialAccount({
    platform,
    accountName,
    country:
      formStr(formData, "targetCountry") || formStr(formData, "country") || null,
    language: formStr(formData, "language") || "en",
    targetAudience: formStr(formData, "targetAudience") || null,
    profileUrl: formStr(formData, "profileUrl") || null,
    postingEnabled: formStr(formData, "postingEnabled") === "on",
    autoPublishEnabled,
    dailyLimit: Number.isFinite(daily) ? daily : defaults.daily,
    weeklyLimit: Number.isFinite(weekly) ? weekly : defaults.weekly,
    oauthSecretRef: secretRef,
  });
  revalidateMarketing();
  if ("error" in result) return { ok: false, message: result.error };
  if (autoRaw && !autoPublishEnabled) {
    return {
      ok: true,
      message:
        "アカウントを追加しました。公式API未接続のため autoPublish はオフのままです。",
    };
  }
  return { ok: true, message: "人間が作成したアカウントを接続しました" };
}

export async function updateSocialAccountAction(
  formData: FormData,
): Promise<{ message: string; ok: boolean }> {
  await requireAdmin();
  const id = formStr(formData, "accountId");
  if (!id) return { ok: false, message: "accountId が必要です" };
  const platform = formStr(formData, "platform") as SocialPlatform;
  const secretRef = formStr(formData, "oauthSecretRef") || null;
  const wantAuto = formStr(formData, "autoPublishEnabled") === "on";
  const autoPublishEnabled =
    wantAuto && platform ? officialApiConnected(platform, secretRef) : false;
  const daily = Number(formStr(formData, "dailyLimit"));
  const weekly = Number(formStr(formData, "weeklyLimit"));
  const result = await updateSocialAccount(id, {
    accountName: formStr(formData, "accountName") || undefined,
    country:
      formStr(formData, "targetCountry") || formStr(formData, "country") || null,
    language: formStr(formData, "language") || undefined,
    targetAudience: formStr(formData, "targetAudience") || null,
    profileUrl: formStr(formData, "profileUrl") || null,
    status: (formStr(formData, "status") as "active" | "paused" | "disconnected") ||
      undefined,
    postingEnabled: formStr(formData, "postingEnabled") === "on",
    autoPublishEnabled,
    dailyLimit: Number.isFinite(daily) ? daily : undefined,
    weeklyLimit: Number.isFinite(weekly) ? weekly : undefined,
    oauthSecretRef: secretRef,
  });
  revalidateMarketing();
  if (result.error) return { ok: false, message: result.error };
  if (wantAuto && !autoPublishEnabled) {
    return {
      ok: true,
      message: "保存しました。公式API未接続のため autoPublish は有効化できません。",
    };
  }
  return { ok: true, message: "アカウント設定を更新しました" };
}

export async function setPostStatusAction(
  formData: FormData,
): Promise<{ message: string; ok: boolean }> {
  await requireAdmin();
  const id = formStr(formData, "postId");
  const status = formStr(formData, "status") as PostStatus;
  if (!id || !status) return { ok: false, message: "入力が不足しています" };
  const post = await getSocialPost(id);
  if (!post) return { ok: false, message: "投稿が見つかりません" };

  if (status === "approved" && post.status === "draft") {
    await updateSocialPost(id, { status: "approved" });
    await updateCalendarForPost(id, "approved");
    revalidateMarketing();
    return { ok: true, message: "承認しました。次は Schedule → Publish です。" };
  }

  if (status === "pending_review") {
    await updateSocialPost(id, { status: "pending_review" });
    await updateCalendarForPost(id, "pending_review");
    revalidateMarketing();
    return { ok: true, message: "レビュー待ちにしました" };
  }

  await updateSocialPost(id, { status });
  const calStatus: CalendarStatus =
    status === "manual_publish_required" ? "approved" : (status as CalendarStatus);
  if (
    ["draft", "pending_review", "approved", "scheduled", "published", "failed"].includes(
      calStatus,
    )
  ) {
    await updateCalendarForPost(id, calStatus);
  }
  revalidateMarketing();
  return { ok: true, message: `投稿を ${status} に更新しました` };
}

export async function savePostScriptAction(
  formData: FormData,
): Promise<{ message: string; ok: boolean }> {
  await requireAdmin();
  const id = formStr(formData, "postId");
  if (!id) return { ok: false, message: "postId が必要です" };
  const hashtags = formStr(formData, "hashtags")
    .split(/[\s,]+/)
    .map((tag) => tag.replace(/^#/, "").trim())
    .filter((tag) => tag.length > 0);
  await updateSocialPost(id, {
    title: formStr(formData, "title") || null,
    body: String(formData.get("body") ?? ""),
    hook: formStr(formData, "hook") || null,
    narration: formStr(formData, "narration") || null,
    caption: formStr(formData, "caption") || null,
    hashtags,
    cta: formStr(formData, "cta") || null,
  });
  revalidateMarketing();
  revalidatePath(`/admin/marketing-agent/posts/${id}`);
  return { ok: true, message: "台本・キャプションを保存しました（公開はしていません）" };
}

async function assertWithinLimits(accountId: string | null): Promise<string | null> {
  if (!accountId) return null;
  const accounts = await listSocialAccounts();
  const account = accounts.find((a) => a.id === accountId);
  if (!account) return null;
  if (!account.postingEnabled) return "このアカウントは投稿オフです";
  const now = Date.now();
  const dayAgo = new Date(now - 86400000).toISOString();
  const weekAgo = new Date(now - 7 * 86400000).toISOString();
  const daily = await countRecentPosts(account.id, dayAgo);
  const weekly = await countRecentPosts(account.id, weekAgo);
  if (daily >= account.dailyLimit) {
    return `1日上限 ${account.dailyLimit} に達しています`;
  }
  if (weekly >= account.weeklyLimit) {
    return `週次上限 ${account.weeklyLimit} に達しています`;
  }
  return null;
}

export async function schedulePostAction(
  formData: FormData,
): Promise<{ message: string; ok: boolean }> {
  await requireAdmin();
  const id = formStr(formData, "postId");
  const whenRaw = formStr(formData, "scheduledAt");
  const when = whenRaw ? new Date(whenRaw).toISOString() : "";
  if (!id || !when || Number.isNaN(Date.parse(when))) {
    return { ok: false, message: "投稿と日時が必要です" };
  }
  const post = await getSocialPost(id);
  if (!post) return { ok: false, message: "投稿が見つかりません" };
  if (post.status !== "approved" && post.status !== "manual_publish_required") {
    return { ok: false, message: "先に Approve してください" };
  }
  const limitError = await assertWithinLimits(post.socialAccountId);
  if (limitError) return { ok: false, message: limitError };
  await updateSocialPost(id, { status: "scheduled", scheduledAt: when });
  await updateCalendarForPost(id, "scheduled", when);
  revalidateMarketing();
  return { ok: true, message: "カレンダーに予定を入れました" };
}

export async function publishPostAction(
  formData: FormData,
): Promise<{ message: string; ok: boolean }> {
  await requireAdmin();
  const id = formStr(formData, "postId");
  if (!id) return { ok: false, message: "postId が必要です" };
  const post = await getSocialPost(id);
  if (!post) return { ok: false, message: "投稿が見つかりません" };
  if (!["approved", "scheduled", "manual_publish_required"].includes(post.status)) {
    return { ok: false, message: "Approve 済みの投稿のみ公開できます" };
  }
  const limitError = await assertWithinLimits(post.socialAccountId);
  if (limitError) return { ok: false, message: limitError };

  const accounts = await listSocialAccounts();
  const account = accounts.find((a) => a.id === post.socialAccountId);
  const connected = officialApiConnected(
    post.platform,
    account?.oauthSecretRef ?? null,
  );

  if (connected) {
    const published = await publishViaOfficialApi({
      platform: post.platform,
      body: post.body,
      secretRef: account?.oauthSecretRef ?? null,
    });
    if (published.ok) {
      await updateSocialPost(id, {
        status: "published",
        publishedAt: new Date().toISOString(),
        publishMode: "official_api",
        errorMessage: null,
      });
      await updateCalendarForPost(id, "published");
      revalidateMarketing();
      return { ok: true, message: "公式APIで公開しました" };
    }
    await updateSocialPost(id, {
      status: "manual_publish_required",
      publishMode: "manual",
      errorMessage: published.error || "Manual Publish Required",
    });
    revalidateMarketing();
    return {
      ok: true,
      message: "Manual Publish Required — 原稿を保存しました。公式API投稿は失敗または未接続です。",
    };
  }

  await updateSocialPost(id, {
    status: "manual_publish_required",
    publishMode: "manual",
    errorMessage: "Manual Publish Required",
  });
  revalidateMarketing();
  return {
    ok: true,
    message: "Manual Publish Required — 公式API未接続のため原稿のみ保存しました。",
  };
}

export async function recordPerformanceAction(
  formData: FormData,
): Promise<{ message: string; ok: boolean }> {
  await requireAdmin();
  const postId = formStr(formData, "postId") || null;
  const contentId = formStr(formData, "contentId") || null;
  const num = (key: string) => Number(formStr(formData, key) || 0) || 0;
  let platform = formStr(formData, "platform") || null;
  let country: string | null = formStr(formData, "country") || null;
  let topic: string | null = formStr(formData, "topic") || null;
  let keyword: string | null = formStr(formData, "keyword") || null;
  let format: string | null = formStr(formData, "format") || null;
  let cta: string | null = formStr(formData, "cta") || null;
  if (postId) {
    const post = await getSocialPost(postId);
    if (post) {
      platform = platform || post.platform;
      country = country || post.targetCountry;
      cta = cta || post.cta;
      format = format || post.format;
    }
  }
  if (contentId) {
    const content = await getContent(contentId);
    if (content) {
      topic = topic || content.targetKeyword;
      keyword = keyword || content.targetKeyword;
    }
  }
  const likes = num("likes");
  const comments = num("comments");
  const shares = num("shares");
  const impressions = num("impressions");
  const engagement =
    impressions > 0 ? Number((((likes + comments + shares) / impressions) * 100).toFixed(2)) : 0;
  await insertPerformance({
    contentId,
    postId,
    platform,
    country,
    topic,
    keyword,
    format,
    cta,
    impressions,
    clicks: num("clicks"),
    likes,
    comments,
    shares,
    followers: num("followers"),
    engagement,
    referralTraffic: num("referralTraffic"),
    leads: num("leads"),
    registrations: num("registrations"),
    recordedAt: new Date().toISOString(),
  });
  revalidateMarketing();
  return { ok: true, message: "パフォーマンスを記録しました" };
}
