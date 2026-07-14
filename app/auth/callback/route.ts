import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import {
  isIntentRole,
  isSafeAppPath,
  resolveRoleDestination,
} from "@/lib/auth-flow";

/**
 * Supabase Auth callback (email confirm / OAuth / password recovery).
 * No pre-auth drafts. Role + onboarding decide destination.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const origin = url.origin;
  const requestedNext = url.searchParams.get("next");
  const intentRole = url.searchParams.get("intent_role");

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth_callback`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("[auth/callback] exchange failed", error.message);
    return NextResponse.redirect(
      `${origin}/login?error=auth_callback&detail=${encodeURIComponent(error.message)}`,
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

  if (!user) return "/login";

  // Email users must be confirmed (Google OAuth is treated as verified)
  const providers =
    user.app_metadata?.providers ??
    (user.app_metadata?.provider ? [user.app_metadata.provider] : []);
  const isGoogle = Array.isArray(providers)
    ? providers.includes("google")
    : providers === "google";
  if (!isGoogle && !user.email_confirmed_at) {
    return "/login?error=email_unconfirmed";
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();

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
