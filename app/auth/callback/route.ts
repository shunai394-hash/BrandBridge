import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  isIntentRole,
  isSafeAppPath,
  resolveRoleDestination,
} from "@/lib/auth-flow";
import { AUTH_COOKIE_OPTIONS } from "@/lib/supabase/cookie-options";
import type { SupabaseClient, User } from "@supabase/supabase-js";

type CookieToSet = {
  name: string;
  value: string;
  options: Record<string, unknown>;
};

/**
 * Supabase Auth callback (email confirm / OAuth / password recovery).
 *
 * Critical: session cookies from exchangeCodeForSession must be attached
 * directly to the redirect NextResponse. Next.js 15+ does not reliably
 * propagate cookies().set(...) onto a later NextResponse.redirect(...),
 * which produced session-only / missing cookies after browser restart.
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const origin = url.origin;
  const code = url.searchParams.get("code");
  const oauthError = url.searchParams.get("error");
  const oauthDescription =
    url.searchParams.get("error_description") ??
    url.searchParams.get("error_code");
  const requestedNext = url.searchParams.get("next");
  const intentRole = url.searchParams.get("intent_role");

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

  const cookieJar: CookieToSet[] = [];
  const responseHeaders: Record<string, string> = {};

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: AUTH_COOKIE_OPTIONS,
      cookies: {
        getAll(): { name: string; value: string }[] {
          const map = new Map<string, string>();
          for (const c of request.cookies.getAll()) {
            map.set(c.name, c.value);
          }
          for (const entry of cookieJar) {
            if (!entry.value) {
              map.delete(entry.name);
            } else {
              map.set(entry.name, entry.value);
            }
          }
          return Array.from(map.entries()).map(([name, value]) => ({
            name,
            value,
          }));
        },
        setAll(cookiesToSet, headers) {
          for (const cookie of cookiesToSet) {
            const next: CookieToSet = {
              name: cookie.name,
              value: cookie.value,
              options: { ...(cookie.options as Record<string, unknown>) },
            };
            const idx = cookieJar.findIndex((c) => c.name === next.name);
            if (idx >= 0) {
              cookieJar[idx] = next;
            } else {
              cookieJar.push(next);
            }
          }
          Object.assign(responseHeaders, headers);
        },
      },
    },
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("[auth/callback] exchange failed", error.message);
    const hint = mapExchangeError(error.message);
    return NextResponse.redirect(
      `${origin}/login?error=oauth&provider=google&detail=${encodeURIComponent(hint)}`,
    );
  }

  if (
    isSafeAppPath(requestedNext) &&
    requestedNext.startsWith("/login/update-password")
  ) {
    return redirectWithSessionCookies(
      `${origin}/login/update-password`,
      cookieJar,
      responseHeaders,
    );
  }

  await applyIntentRoleIfNeeded(supabase, intentRole);
  await stampEnRegistrationLocaleIfNeeded(supabase, requestedNext);
  const destination = await resolvePostAuthPath(supabase, requestedNext);

  return redirectWithSessionCookies(
    `${origin}${destination}`,
    cookieJar,
    responseHeaders,
  );
}

function redirectWithSessionCookies(
  location: string,
  cookieJar: CookieToSet[],
  headers: Record<string, string>,
) {
  const response = NextResponse.redirect(location);

  for (const { name, value, options } of cookieJar) {
    const maxAge =
      typeof options.maxAge === "number"
        ? options.maxAge
        : AUTH_COOKIE_OPTIONS.maxAge;

    if (!value) {
      response.cookies.set(name, "", {
        path: AUTH_COOKIE_OPTIONS.path,
        sameSite: AUTH_COOKIE_OPTIONS.sameSite,
        secure: AUTH_COOKIE_OPTIONS.secure,
        httpOnly: AUTH_COOKIE_OPTIONS.httpOnly,
        maxAge: 0,
      });
    } else {
      response.cookies.set(name, value, {
        path: AUTH_COOKIE_OPTIONS.path,
        sameSite: AUTH_COOKIE_OPTIONS.sameSite,
        secure: AUTH_COOKIE_OPTIONS.secure,
        httpOnly: AUTH_COOKIE_OPTIONS.httpOnly,
        maxAge,
      });
    }
  }

  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }

  return response;
}

function mapExchangeError(message: string): string {
  const lower = message.toLowerCase();
  if (
    lower.includes("provider is not enabled") ||
    lower.includes("unsupported provider")
  ) {
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

async function applyIntentRoleIfNeeded(
  supabase: SupabaseClient,
  intentRoleRaw: string | null,
) {
  if (!isIntentRole(intentRoleRaw)) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();

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

/** Persist EN maker locale so later logins keep English setup (no schema change). */
async function stampEnRegistrationLocaleIfNeeded(
  supabase: SupabaseClient,
  requestedNext: string | null,
) {
  if (
    requestedNext !== "/en/maker/setup" &&
    requestedNext !== "/en/register/maker"
  ) {
    return;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const meta = user.user_metadata ?? {};
  if (meta.registration_locale === "en") return;

  await supabase.auth.updateUser({
    data: {
      ...meta,
      registration_locale: "en",
      registration_source: "/en/register/maker",
    },
  });
}

async function resolvePostAuthPath(
  supabase: SupabaseClient,
  requestedNext: string | null,
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return "/login?error=oauth&detail=セッション取得に失敗しました";

  if (!isGoogleUser(user as User) && !user.email_confirmed_at) {
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
    registrationLocale:
      (user.user_metadata?.registration_locale as string | undefined) ?? null,
    registrationSource:
      (user.user_metadata?.registration_source as string | undefined) ?? null,
  });
}
