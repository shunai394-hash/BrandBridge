"use server";

import { randomBytes } from "node:crypto";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { MarketingAgentError } from "@/lib/marketing-agent/ai";
import {
  getLinkedInAuthorizeUrl,
  getLinkedInConnection,
  LINKEDIN_OAUTH_STATE_COOKIE,
  postToLinkedInMember,
} from "@/lib/social/linkedin";
import {
  getLinkedInStoredToken,
  getSocialPostById,
  markSocialPostFailed,
  markSocialPostPosted,
} from "@/lib/social/store";
import { getXConnection, postToX, verifyXAuth } from "@/lib/social/x";

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

function refresh() {
  revalidatePath("/admin/marketing-agent");
}

export async function verifyXAuthAction(): Promise<{
  error?: string;
  message?: string;
}> {
  try {
    await requireAdmin();
    if (!getXConnection().configured) {
      return { error: getXConnection().note };
    }
    const me = await verifyXAuth();
    refresh();
    return {
      message: `X認証OK: ${me.name} (@${me.username})`,
    };
  } catch (error) {
    return fail(error);
  }
}

export async function publishXPostAction(
  formData: FormData,
): Promise<{ error?: string; message?: string }> {
  try {
    await requireAdmin();
    const postId = String(formData.get("postId") ?? "").trim();
    if (!postId) return { error: "投稿対象がありません。" };
    const post = await getSocialPostById(postId);
    if (!post) return { error: "投稿が見つかりません。migration 054 を実行したか確認してください。" };
    if (post.platform !== "x") {
      return { error: "この投稿は X 向けではありません。" };
    }
    if (post.status === "posted") {
      return {
        error: "すでに X へ投稿済みです。",
      };
    }
    if (!getXConnection().configured) {
      return { error: getXConnection().note };
    }
    try {
      const result = await postToX(post.content);
      await markSocialPostPosted(post.id, result);
      refresh();
      return { message: `Xに投稿しました: ${result.externalPostUrl}` };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await markSocialPostFailed(post.id, message).catch(() => undefined);
      refresh();
      throw error;
    }
  } catch (error) {
    return fail(error);
  }
}

export async function startLinkedInOAuthAction(): Promise<{ error?: string }> {
  try {
    await requireAdmin();
    const connection = getLinkedInConnection(false);
    if (!connection.canAuthorize) {
      return {
        error:
          "LinkedIn Client ID / Secret が未設定です。w_member_social で個人プロフィール投稿できるアプリを用意してください。会社ページは作成しません。",
      };
    }
    const state = randomBytes(16).toString("hex");
    const cookieStore = await cookies();
    cookieStore.set(LINKEDIN_OAUTH_STATE_COOKIE, state, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 600,
      secure: process.env.NODE_ENV === "production",
    });
    redirect(getLinkedInAuthorizeUrl(state));
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return fail(error);
  }
}

export async function publishLinkedInPostAction(
  formData: FormData,
): Promise<{ error?: string; message?: string }> {
  try {
    await requireAdmin();
    const postId = String(formData.get("postId") ?? "").trim();
    if (!postId) return { error: "投稿対象がありません。" };
    const post = await getSocialPostById(postId);
    if (!post) {
      return { error: "投稿が見つかりません。migration 054 を実行したか確認してください。" };
    }
    if (post.platform !== "linkedin") {
      return { error: "この投稿は LinkedIn 向けではありません。" };
    }
    if (post.status === "posted") {
      return { error: "すでに LinkedIn へ投稿済みです。" };
    }
    const storedToken = await getLinkedInStoredToken();
    const connection = getLinkedInConnection(Boolean(storedToken));
    if (!connection.configured) {
      return {
        error:
          "LinkedIn のアクセストークンがありません。w_member_social で認証するか、LINKEDIN_ACCESS_TOKEN をサーバー環境変数に設定してください。会社ページは使いません。",
      };
    }
    try {
      const result = await postToLinkedInMember(post.content, storedToken);
      await markSocialPostPosted(post.id, result);
      refresh();
      return { message: `LinkedIn に投稿しました: ${result.externalPostUrl}` };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await markSocialPostFailed(post.id, message).catch(() => undefined);
      refresh();
      throw error;
    }
  } catch (error) {
    return fail(error);
  }
}
