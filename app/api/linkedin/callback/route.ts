import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import {
  exchangeLinkedInCode,
  getLinkedInAccountLabel,
  LINKEDIN_OAUTH_STATE_COOKIE,
} from "@/lib/social/linkedin";
import { upsertLinkedInToken } from "@/lib/social/store";

function redirectWith(origin: string, params: Record<string, string>) {
  const url = new URL("/admin/marketing-agent", origin);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  url.hash = "social";
  const response = NextResponse.redirect(url);
  response.cookies.set(LINKEDIN_OAUTH_STATE_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}

/**
 * LinkedIn member OAuth callback (openid / profile / w_member_social).
 * Stores the token server-side only. Does not create a LinkedIn Page.
 */
export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  try {
    await requireAdmin();
  } catch {
    return NextResponse.redirect(new URL("/login", origin));
  }

  const error = request.nextUrl.searchParams.get("error");
  if (error) {
    return redirectWith(origin, {
      linkedin: "error",
      detail: "LinkedIn 認証がキャンセルされたか、アプリ側で拒否されました。会社ページの作成は行いません。",
    });
  }

  const code = request.nextUrl.searchParams.get("code")?.trim() ?? "";
  const state = request.nextUrl.searchParams.get("state")?.trim() ?? "";
  const expected = request.cookies.get(LINKEDIN_OAUTH_STATE_COOKIE)?.value ?? "";
  if (!code || !state || !expected || state !== expected) {
    return redirectWith(origin, {
      linkedin: "error",
      detail: "LinkedIn 認証の state が一致しません。もう一度接続してください。",
    });
  }

  try {
    const tokens = await exchangeLinkedInCode(code);
    const accountLabel = await getLinkedInAccountLabel(tokens.accessToken);
    await upsertLinkedInToken({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
      accountLabel,
    });
    return redirectWith(origin, { linkedin: "connected" });
  } catch (caught) {
    const detail =
      caught instanceof Error
        ? caught.message
        : "LinkedIn トークンの保存に失敗しました。";
    return redirectWith(origin, { linkedin: "error", detail });
  }
}
