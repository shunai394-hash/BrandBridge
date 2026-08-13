import { getSiteUrl } from "@/lib/site";
import type { SocialPlatform } from "./types";

export function buildUtmUrl(options: {
  path?: string;
  source: string;
  medium: string;
  campaign: string;
  content?: string;
}): string {
  const base = getSiteUrl();
  const path = options.path?.startsWith("/") ? options.path : "/en";
  const url = new URL(`${base}${path}`);
  url.searchParams.set("utm_source", options.source);
  url.searchParams.set("utm_medium", options.medium);
  url.searchParams.set("utm_campaign", options.campaign);
  if (options.content) {
    url.searchParams.set("utm_content", options.content);
  }
  return url.toString();
}

export function utmForPlatform(
  platform: SocialPlatform,
  campaign: string,
  contentSlug?: string,
): {
  source: string;
  medium: string;
  campaign: string;
  content: string;
  url: string;
} {
  const source = platform === "brandbridge_blog" ? "brandbridge" : platform;
  const medium =
    platform === "brandbridge_blog" ||
    platform === "medium" ||
    platform === "substack"
      ? "article"
      : "social";
  const content = contentSlug || platform;
  return {
    source,
    medium,
    campaign,
    content,
    url: buildUtmUrl({
      path: "/en",
      source,
      medium,
      campaign,
      content,
    }),
  };
}
