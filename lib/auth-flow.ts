import type { UserRole } from "@/lib/types";

export type IntentRole = "maker" | "partner";

export function isSafeAppPath(path: string | null | undefined): path is string {
  return Boolean(path && path.startsWith("/") && !path.startsWith("//"));
}

/** Legacy /admin/dashboard → /admin */
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
 * Post-auth destination.
 *
 * Important:
 * A user can have multiple capabilities.
 * The primary `role` is NOT enough to decide the destination.
 *
 * Example:
 *   role       = "partner"
 *   isMaker    = true
 *   isPartner  = true
 *
 * When the user explicitly requested /maker/setup,
 * the maker setup flow must take priority.
 */
export function resolveRoleDestination(input: {
  role: string | null | undefined;
  onboardingCompleted: boolean;
  requestedNext?: string | null;
  /** Capability flags for dual-role accounts. */
  isMaker?: boolean;
  isPartner?: boolean;
  /** From auth user_metadata (English register flow). */
  registrationLocale?: string | null;
  registrationSource?: string | null;
}): string {
  const {
    role,
    onboardingCompleted,
    requestedNext,
    isMaker = false,
    isPartner = false,
    registrationLocale,
    registrationSource,
  } = input;

  if (role === "admin") {
    if (!isSafeAppPath(requestedNext)) return "/admin";
    return normalizeAdminPath(requestedNext);
  }

  const prefersEnglishMakerSetup =
    registrationLocale === "en" ||
    registrationSource === "/en/register/maker" ||
    (typeof registrationSource === "string" &&
      registrationSource.startsWith("/en/"));

  const wantsMakerSetup =
    isSafeAppPath(requestedNext) &&
    (requestedNext.startsWith("/maker/setup") ||
      requestedNext.startsWith("/en/maker/setup"));

  const wantsPartnerSetup =
    isSafeAppPath(requestedNext) &&
    requestedNext.startsWith("/partner/setup");

  /**
   * Explicit setup destination always wins.
   *
   * This is critical for dual-role users:
   * role=partner + isMaker=true
   * must still be able to enter /maker/setup.
   */
  if (wantsMakerSetup && isMaker) {
    if (requestedNext?.startsWith("/en/maker/setup")) {
      return "/en/maker/setup";
    }
    return "/maker/setup";
  }

  if (wantsPartnerSetup && isPartner) {
    return "/partner/setup";
  }

  /**
   * Legacy single-role accounts.
   */
  if (role === "maker" && !onboardingCompleted) {
    if (wantsMakerSetup) {
      if (requestedNext?.startsWith("/en/maker/setup")) {
        return "/en/maker/setup";
      }
      return "/maker/setup";
    }

    if (prefersEnglishMakerSetup) {
      return "/en/maker/setup";
    }

    return "/maker/setup";
  }

  if (role === "partner" && !onboardingCompleted) {
    if (wantsPartnerSetup) {
      return "/partner/setup";
    }

    return "/partner/setup";
  }

  /**
   * For completed accounts, respect an explicit safe destination.
   */
  if (isSafeAppPath(requestedNext)) {
    return normalizeAdminPath(requestedNext);
  }

  /**
   * Dual-role completed accounts default to their primary role,
   * but explicit setup navigation above always takes priority.
   */
  if (role === "maker" || isMaker) {
    return "/maker/registration-complete";
  }

  if (role === "partner" || isPartner) {
    return "/cases?welcome=partner";
  }

  return "/cases";
}

export function isIntentRole(
  value: string | null | undefined,
): value is IntentRole {
  return value === "maker" || value === "partner";
}

export function asUserRole(
  value: string | null | undefined,
): UserRole | null {
  if (value === "maker" || value === "partner" || value === "admin") {
    return value;
  }
  return null;
}
