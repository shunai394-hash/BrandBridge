import { createClient } from "@/lib/supabase/server";
import type { Profile, SessionUser, UserRole } from "@/lib/types";

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
  const session = await getSessionUser();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  assertActive(session);
  if (session.role !== "admin") {
    throw new Error("FORBIDDEN_ADMIN_ONLY");
  }
  return session;
}

export async function requireActiveUser(): Promise<SessionUser> {
  const session = await getSessionUser();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  assertActive(session);
  return session;
}
