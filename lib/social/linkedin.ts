import {
  assertNoVercelAppUrl,
  getSiteUrl,
  rewriteVercelAppUrls,
} from "@/lib/site";
import type { SocialConnectionStatus, SocialPublishResult } from "@/lib/social/types";

const AUTH_URL = "https://www.linkedin.com/oauth/v2/authorization";
const TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken";
const USERINFO_URL = "https://api.linkedin.com/v2/userinfo";
const UGC_POSTS_URL = "https://api.linkedin.com/v2/ugcPosts";

const MEMBER_SCOPES = "openid profile w_member_social";

export const LINKEDIN_PROFILE_URL = "https://www.linkedin.com/in/brandbridge/";

export function getLinkedInRedirectUri(): string {
  return `${getSiteUrl()}/api/linkedin/callback`;
}

export const LINKEDIN_OAUTH_STATE_COOKIE = "bb_linkedin_oauth_state";

export function getLinkedInConnection(hasStoredToken: boolean): SocialConnectionStatus {
  const clientId = process.env.LINKEDIN_CLIENT_ID?.trim() ?? "";
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET?.trim() ?? "";
  const envToken = process.env.LINKEDIN_ACCESS_TOKEN?.trim() ?? "";
  const canAuthorize = Boolean(clientId && clientSecret);
  const configured = Boolean(envToken || hasStoredToken);
  return {
    configured,
    canAuthorize,
    label: configured ? "LinkedIn 接続済" : "LinkedIn API未接続",
    note: configured
      ? `個人プロフィール（${LINKEDIN_PROFILE_URL}）への投稿用。会社ページは使いません。`
      : "LinkedIn API未接続です。個人プロフィール投稿（w_member_social）の認証情報が揃うまで投稿ボタンは出しません。会社ページは作成しません。",
  };
}

export function getLinkedInAuthorizeUrl(state: string): string {
  const clientId = process.env.LINKEDIN_CLIENT_ID?.trim() ?? "";
  if (!clientId) {
    throw new Error(
      "LinkedIn Client ID が未設定です。Developer Portal で個人プロフィール投稿（w_member_social）が使えるアプリを用意してから設定してください。会社ページは作成しません。",
    );
  }
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: getLinkedInRedirectUri(),
    scope: MEMBER_SCOPES,
    state,
  });
  return `${AUTH_URL}?${params.toString()}`;
}

export async function exchangeLinkedInCode(code: string): Promise<{
  accessToken: string;
  expiresIn: number | null;
  refreshToken: string | null;
}> {
  const clientId = process.env.LINKEDIN_CLIENT_ID?.trim() ?? "";
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET?.trim() ?? "";
  if (!clientId || !clientSecret) {
    throw new Error("LinkedIn Client ID / Client Secret が未設定です。");
  }
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: getLinkedInRedirectUri(),
    client_id: clientId,
    client_secret: clientSecret,
  });
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });
  const raw = await response.text();
  if (!response.ok) {
    throw new Error(`LinkedIn トークン取得に失敗しました（HTTP ${response.status}）。`);
  }
  const parsed = JSON.parse(raw) as {
    access_token?: string;
    expires_in?: number;
    refresh_token?: string;
  };
  if (!parsed.access_token) {
    throw new Error("LinkedIn トークンレスポンスが不正です。");
  }
  return {
    accessToken: parsed.access_token,
    expiresIn: typeof parsed.expires_in === "number" ? parsed.expires_in : null,
    refreshToken: parsed.refresh_token ?? null,
  };
}

async function resolveAccessToken(storedToken: string | null): Promise<string> {
  const envToken = process.env.LINKEDIN_ACCESS_TOKEN?.trim() ?? "";
  const token = storedToken?.trim() || envToken;
  if (!token) {
    throw new Error(
      "LinkedIn のアクセストークンがありません。w_member_social で認証するか、サーバー環境変数 LINKEDIN_ACCESS_TOKEN を設定してください。会社ページは使いません。",
    );
  }
  return token;
}

export async function getLinkedInAccountLabel(token: string): Promise<string | null> {
  const response = await fetch(USERINFO_URL, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!response.ok) return null;
  const profile = (await response.json()) as { name?: string; sub?: string };
  return profile.name || profile.sub || null;
}

export async function postToLinkedInMember(
  text: string,
  storedToken: string | null,
): Promise<SocialPublishResult> {
  const trimmed = rewriteVercelAppUrls(text.trim());
  if (!trimmed) throw new Error("投稿文が空です。");
  assertNoVercelAppUrl(trimmed);
  const token = await resolveAccessToken(storedToken);

  const me = await fetch(USERINFO_URL, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!me.ok) {
    throw new Error(
      `LinkedIn プロフィール取得に失敗しました（HTTP ${me.status}）。w_member_social 付きの個人トークンか確認してください。`,
    );
  }
  const profile = (await me.json()) as { sub?: string };
  if (!profile.sub) {
    throw new Error("LinkedIn メンバー ID を取得できませんでした。");
  }

  const response = await fetch(UGC_POSTS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify({
      author: `urn:li:person:${profile.sub}`,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text: trimmed },
          shareMediaCategory: "NONE",
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
      },
    }),
    cache: "no-store",
  });
  const raw = await response.text();
  if (!response.ok) {
    throw new Error(`LinkedIn 投稿に失敗しました（HTTP ${response.status}）: ${raw.slice(0, 240)}`);
  }
  const id = response.headers.get("x-restli-id") || raw.slice(0, 80);
  return {
    externalPostId: id,
    externalPostUrl: LINKEDIN_PROFILE_URL,
  };
}
