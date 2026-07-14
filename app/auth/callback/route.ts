import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import {
  isIntentRole,
  isSafeAppPath,
  resolveRoleDestination,
} from "@/lib/auth-flow";

/**
 * Supabase Auth callback (email confirm / OAuth / password recovery).
 * Handles Google OAuth errors from the provider query string.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;
  const code = url.searchParams.get("code");
  const oauthError = url.searchParams.get("error");
  const oauthDescription =
    url.searchParams.get("error_description") ??
    url.searchParams.get("error_code");
  const requestedNext = url.searchParams.get("next");
  const intentRole = url.searchParams.get("intent_role");

  // Provider / user cancelled / misconfigured Google OAuth
  if (oauthError) {
    console.error("[auth/callback] oauth provider error", {
      oauthError,
      oauthDescription,
    });
    const params = new URLSearchParams({
      error: "oauth",
      provider: "google",
    });
    if (oauthDescription) {
      params.set("detail", oauthDescription.replace(/\+/g, " "));
    } else {
      params.set("detail", oauthError);
    }
    return NextResponse.redirect(`${origin}/login?${params.toString()}`);
  }

  if (!code) {
    return NextResponse.redirect(
      `${origin}/login?error=oauth&provider=google&detail=${encodeURIComponent(
        "認証コードがありません。Googleログインをやり直してください。",
      )}`,
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("[auth/callback] exchange failed", error.message);
    const hint = mapExchangeError(error.message);
    return NextResponse.redirect(
      `${origin}/login?error=oauth&provider=google&detail=${encodeURIComponent(hint)}`,
    );
  }

  // Password recovery → force update-password page
  if (
    isSafeAppPath(requestedNext) &&
    requestedNext.startsWith("/login/update-password")
  ) {
    return NextResponse.redirect(`${origin}/login/update-password`);
  }

  await applyIntentRoleIfNeeded(intentRole);

  const destination = await resolvePostAuthPath(requestedNext);
  return NextResponse.redirect(`${origin}${destination}`);
}

function mapExchangeError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("provider is not enabled") || lower.includes("unsupported provider")) {
    return "Googleプロバイダが有効ではありません。Supabase Authentication → Providers → Google を有効にしてください。";
  }
  if (lower.includes("redirect") || lower.includes("redirect_uri")) {
    return "リダイレクトURLが一致しません。Supabase の Redirect URLs に /auth/callback を追加してください。";
  }
  if (lower.includes("invalid flow state") || lower.includes("pkce")) {
    return "認証セッションが無効です。もう一度 Google でログインしてください。";
  }
  return message;
}

function isGoogleUser(user: {
  app_metadata?: { provider?: string; providers?: string[] | string };
  identities?: Array<{ provider?: string }>;
}): boolean {
  const providers =
    user.app_metadata?.providers ??
    (user.app_metadata?.provider ? [user.app_metadata.provider] : []);
  if (Array.isArray(providers) && providers.includes("google")) return true;
  if (providers === "google") return true;
  if (user.app_metadata?.provider === "google") return true;
  return Boolean(user.identities?.some((i) => i.provider === "google"));
}

async function applyIntentRoleIfNeeded(intentRoleRaw: string | null) {
  if (!isIntentRole(intentRoleRaw)) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();

  // Only set role for incomplete / default users — never demote admin
  if (profile?.role === "admin") return;
  if (profile?.onboarding_completed === true && profile.role) return;

  const { error } = await supabase
    .from("profiles")
    .update({ role: intentRoleRaw })
    .eq("id", user.id);

  if (error) {
    console.error("[auth/callback] intent_role update failed", error.message);
  }

  await supabase.auth.updateUser({
    data: { role: intentRoleRaw },
  });
}

async function resolvePostAuthPath(requestedNext: string | null) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return "/login?error=oauth&detail=セッション取得に失敗しました";

  // Email/password users must be confirmed; Google OAuth is treated as verified
  if (!isGoogleUser(user) && !user.email_confirmed_at) {
    return "/login?error=email_unconfirmed";
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, onboarding_completed, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.is_active === false) {
    return "/login?error=ACCOUNT_INACTIVE";
  }

  const role =
    (profile?.role as string | undefined) ??
    (user.user_metadata?.role as string | undefined);
  const completed = profile?.onboarding_completed === true;

  return resolveRoleDestination({
    role,
    onboardingCompleted: completed,
    requestedNext,
  });
}
