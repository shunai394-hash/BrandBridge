/**
 * X posting for Marketing Agent (OAuth 1.0a HMAC-SHA1).
 * Production flow: verify via GET /2/users/me, post via POST /2/tweets after admin click.
 * Test post/delete scripts live in scripts/test-x*.mjs and are not called from this module.
 */
import crypto from "node:crypto";
import OAuth from "oauth-1.0a";
import type { SocialConnectionStatus, SocialPublishResult } from "@/lib/social/types";

const USERS_ME = "https://api.x.com/2/users/me";
const TWEETS = "https://api.x.com/2/tweets";

function readXCredentials() {
  const apiKey = process.env.X_API_KEY?.trim() ?? "";
  const apiSecret = process.env.X_API_SECRET?.trim() ?? "";
  const accessToken = process.env.X_ACCESS_TOKEN?.trim() ?? "";
  const accessTokenSecret = process.env.X_ACCESS_TOKEN_SECRET?.trim() ?? "";
  return { apiKey, apiSecret, accessToken, accessTokenSecret };
}

export function getXConnection(): SocialConnectionStatus {
  const creds = readXCredentials();
  const configured = Boolean(
    creds.apiKey && creds.apiSecret && creds.accessToken && creds.accessTokenSecret,
  );
  return {
    configured,
    label: configured ? "X API 接続済" : "X API 未設定",
    note: configured
      ? "管理画面から確認後に投稿できます（自動投稿なし）"
      : "X_API_KEY / X_API_SECRET / X_ACCESS_TOKEN / X_ACCESS_TOKEN_SECRET をサーバー環境変数に設定してください",
  };
}

function createOAuth() {
  const creds = readXCredentials();
  if (!creds.apiKey || !creds.apiSecret || !creds.accessToken || !creds.accessTokenSecret) {
    throw new Error("X API の認証情報が未設定です。");
  }
  const oauth = new OAuth({
    consumer: { key: creds.apiKey, secret: creds.apiSecret },
    signature_method: "HMAC-SHA1",
    hash_function(baseString, key) {
      return crypto.createHmac("sha1", key).update(baseString).digest("base64");
    },
  });
  return {
    oauth,
    token: { key: creds.accessToken, secret: creds.accessTokenSecret },
  };
}

async function signedFetch(
  url: string,
  method: "GET" | "POST" | "DELETE",
  body?: unknown,
): Promise<Response> {
  const { oauth, token } = createOAuth();
  const auth = oauth.authorize({ url, method }, token);
  const headers: Record<string, string> = {
    ...oauth.toHeader(auth),
  };
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  return fetch(url, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
}

export async function verifyXAuth(): Promise<{
  id: string;
  username: string;
  name: string;
}> {
  const response = await signedFetch(USERS_ME, "GET");
  const raw = await response.text();
  if (!response.ok) {
    throw new Error(`X認証に失敗しました（HTTP ${response.status}）。`);
  }
  const parsed = JSON.parse(raw) as {
    data?: { id?: string; username?: string; name?: string };
  };
  const id = parsed.data?.id ?? "";
  const username = parsed.data?.username ?? "";
  if (!id || !username) {
    throw new Error("X認証レスポンスが不正です。");
  }
  return {
    id,
    username,
    name: parsed.data?.name ?? username,
  };
}

export async function postToX(text: string): Promise<SocialPublishResult> {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error("投稿文が空です。");
  }
  const response = await signedFetch(TWEETS, "POST", { text: trimmed });
  const raw = await response.text();
  if (!response.ok) {
    throw new Error(`X投稿に失敗しました（HTTP ${response.status}）: ${raw.slice(0, 240)}`);
  }
  const parsed = JSON.parse(raw) as { data?: { id?: string } };
  const id = parsed.data?.id ?? "";
  if (!id) {
    throw new Error("X投稿は成功しましたが tweet ID を取得できませんでした。");
  }
  return {
    externalPostId: id,
    externalPostUrl: `https://x.com/i/web/status/${id}`,
  };
}
