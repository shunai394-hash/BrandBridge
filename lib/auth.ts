import { createClient } from "@/lib/supabase/server";
import type { Profile, SessionUser, UserRole } from "@/lib/types";

export type AdminAccessDiagnosis =
  | { ok: true; user: SessionUser }
  | {
      ok: false;
      code: "NO_AUTH_USER" | "NO_PROFILE" | "ROLE_INSUFFICIENT" | "ACCOUNT_INACTIVE";
      message: string;
      authUserId?: string;
      role?: string | null;
    };

/**
 * Resolve current auth user by session cookie, then load profiles by auth.uid() (= user.id).
 * Never look up profiles by email for access control.
 */
export async function diagnoseAdminAccess(): Promise<AdminAccessDiagnosis> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        ok: false,
        code: "NO_AUTH_USER",
        message: "Authユーザーなし（セッションがありません。再ログインしてください）",
      };
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("[diagnoseAdminAccess] profiles query", profileError.message);
    }

    if (!profile) {
      return {
        ok: false,
        code: "NO_PROFILE",
        message: `profilesなし（auth.uid=${user.id} に対応する profiles 行がありません）`,
        authUserId: user.id,
      };
    }

    const role = profile.role as string | null;
    if (profile.is_active === false) {
      return {
        ok: false,
        code: "ACCOUNT_INACTIVE",
        message: "アカウントが停止されています",
        authUserId: user.id,
        role,
      };
    }

    if (role !== "admin") {
      return {
        ok: false,
        code: "ROLE_INSUFFICIENT",
        message: `role不足（現在の role=${role ?? "null"}。admin が必要です）`,
        authUserId: user.id,
        role,
      };
    }

    return {
      ok: true,
      user: {
        id: profile.id,
        email: profile.email,
        name: profile.contact_name,
        role: "admin",
        companyName: profile.company_name,
        isActive: true,
      },
    };
  } catch (error) {
    console.error("[diagnoseAdminAccess]", error);
    return {
      ok: false,
      code: "NO_AUTH_USER",
      message: "Authユーザーなし（セッション確認中にエラーが発生しました）",
    };
  }
}

export async function getCurrentProfile(): Promise<Profile | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (error || !data) return null;
    return data as Profile;
  } catch (error) {
    console.error("[getCurrentProfile]", error);
    return null;
  }
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  return {
    id: profile.id,
    email: profile.email,
    name: profile.contact_name,
    role: profile.role as UserRole,
    companyName: profile.company_name,
    isActive: profile.is_active !== false,
  };
}

function assertActive(session: SessionUser) {
  if (!session.isActive) {
    throw new Error("ACCOUNT_INACTIVE");
  }
}

export async function requireMaker(): Promise<SessionUser> {
  const session = await getSessionUser();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  assertActive(session);
  if (session.role !== "maker") {
    throw new Error("FORBIDDEN_MAKER_ONLY");
  }
  return session;
}

export async function requirePartner(): Promise<SessionUser> {
  const session = await getSessionUser();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  assertActive(session);
  if (session.role !== "partner") {
    throw new Error("FORBIDDEN_PARTNER_ONLY");
  }
  return session;
}

export async function requireAdmin(): Promise<SessionUser> {
  const diagnosis = await diagnoseAdminAccess();
  if (!diagnosis.ok) {
    if (diagnosis.code === "NO_AUTH_USER") throw new Error("UNAUTHORIZED");
    if (diagnosis.code === "ACCOUNT_INACTIVE") throw new Error("ACCOUNT_INACTIVE");
    if (diagnosis.code === "NO_PROFILE") throw new Error("NO_PROFILE");
    throw new Error("FORBIDDEN_ADMIN_ONLY");
  }
  return diagnosis.user;
}

export async function requireActiveUser(): Promise<SessionUser> {
  const session = await getSessionUser();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  assertActive(session);
  return session;
}
