import {
  ALWAYS_MANUAL_PLATFORMS,
  OFFICIAL_API_PLATFORMS,
  type SocialPlatform,
} from "./types";

/**
 * Official API credentials live in env / secret storage.
 * DB only stores oauth_secret_ref (the env var name).
 * Cookies and SNS passwords are never read or stored.
 */

const PLATFORM_SECRET_ENV: Partial<Record<SocialPlatform, string>> = {
  x: "MARKETING_X_ACCESS_TOKEN",
  linkedin: "MARKETING_LINKEDIN_ACCESS_TOKEN",
  instagram: "MARKETING_INSTAGRAM_ACCESS_TOKEN",
  tiktok: "MARKETING_TIKTOK_ACCESS_TOKEN",
  youtube: "MARKETING_YOUTUBE_ACCESS_TOKEN",
  reddit: "MARKETING_REDDIT_ACCESS_TOKEN",
};

export function defaultSecretRef(platform: SocialPlatform): string | null {
  return PLATFORM_SECRET_ENV[platform] ?? null;
}

export function resolveSecret(ref: string | null | undefined): string | null {
  if (!ref) return null;
  const name = ref.replace(/^env:/i, "").trim();
  if (!/^[A-Z][A-Z0-9_]*$/.test(name)) return null;
  const value = process.env[name]?.trim();
  return value && value.length > 0 ? value : null;
}

export function isOfficialApiPlatform(platform: SocialPlatform): boolean {
  return OFFICIAL_API_PLATFORMS.includes(platform);
}

export function isAlwaysManual(platform: SocialPlatform): boolean {
  return ALWAYS_MANUAL_PLATFORMS.includes(platform);
}

export function officialApiConnected(
  platform: SocialPlatform,
  secretRef?: string | null,
): boolean {
  if (isAlwaysManual(platform)) return false;
  if (!isOfficialApiPlatform(platform)) return false;
  const ref = secretRef || defaultSecretRef(platform);
  return Boolean(resolveSecret(ref));
}

export function extraOfficialEnvOk(platform: SocialPlatform): boolean {
  if (platform === "instagram") {
    return Boolean(process.env.MARKETING_INSTAGRAM_BUSINESS_ID?.trim());
  }
  if (platform === "reddit") {
    return Boolean(process.env.MARKETING_REDDIT_USERNAME?.trim());
  }
  if (platform === "tiktok") {
    return Boolean(process.env.MARKETING_TIKTOK_ACCESS_TOKEN?.trim());
  }
  return true;
}
