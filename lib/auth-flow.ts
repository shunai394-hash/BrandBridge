import type { UserRole } from "@/lib/types";

export type IntentRole = "maker" | "partner";

export function isSafeAppPath(path: string | null | undefined): path is string {
  return Boolean(path && path.startsWith("/") && !path.startsWith("//"));
}

/** Legacy /admin/dashboard → /admin（管理画面は /admin のみ） */
export function normalizeAdminPath(path: string): string {
  if (path === "/admin/dashboard" || path.startsWith("/admin/dashboard?")) {
    return path.replace(/^\/admin\/dashboard/, "/admin");
  }
  return path;
}

export function setupPathForRole(role: IntentRole): string {
  return role === "maker" ? "/maker/setup" : "/partner/setup";
}

export function defaultHomeForRole(role: string | null | undefined): string {
  if (role === "admin") return "/admin";
  if (role === "maker") return "/maker/registration-complete";
  if (role === "partner") return "/cases?welcome=partner";
  return "/cases";
}

/**
 * Post-auth destination. Incomplete maker/partner → setup.
 * Never save profile/product data before this redirect resolves.
 */
export function resolveRoleDestination(input: {
  role: string | null | undefined;
  onboardingCompleted: boolean;
  requestedNext?: string | null;
}): string {
  const { role, onboardingCompleted, requestedNext } = input;

  if (role === "admin") {
    if (!isSafeAppPath(requestedNext)) return "/admin";
    return normalizeAdminPath(requestedNext);
  }

  if (role === "maker" && !onboardingCompleted) return "/maker/setup";
  if (role === "partner" && !onboardingCompleted) return "/partner/setup";

  if (isSafeAppPath(requestedNext)) {
    // Don't send incomplete users to arbitrary next (except their setup)
    if (
      !onboardingCompleted &&
      (role === "maker" || role === "partner") &&
      !requestedNext.startsWith("/maker/setup") &&
      !requestedNext.startsWith("/partner/setup") &&
      !requestedNext.startsWith("/login/update-password")
    ) {
      return setupPathForRole(role);
    }
    return normalizeAdminPath(requestedNext);
  }

  return defaultHomeForRole(role);
}

export function isIntentRole(value: string | null | undefined): value is IntentRole {
  return value === "maker" || value === "partner";
}

export function asUserRole(value: string | null | undefined): UserRole | null {
  if (value === "maker" || value === "partner" || value === "admin") {
    return value;
  }
  return null;
}
