import { asRecord, asString, asStringArray } from "@/lib/marketing-agent/json";
import { getInstagramConnection } from "@/lib/social/instagram";
import { getTikTokConnection } from "@/lib/social/tiktok";
import { getXConnection } from "@/lib/social/x";
import { hasLinkedInStoredToken } from "@/lib/social/store";
import type { SocialPlatform, SocialPostStatus } from "@/lib/social/types";

export type SocialPackInsert = {
  platform: SocialPlatform;
  content: string;
  mediaUrl?: string | null;
  status: SocialPostStatus;
  metadata?: Record<string, unknown>;
};

function xStatus(): SocialPostStatus {
  return getXConnection().configured ? "ready" : "api_unavailable";
}

async function linkedInStatus(): Promise<SocialPostStatus> {
  const envToken = Boolean(process.env.LINKEDIN_ACCESS_TOKEN?.trim());
  const stored = await hasLinkedInStoredToken().catch(() => false);
  return envToken || stored ? "ready" : "api_unavailable";
}

function instagramStatus(): SocialPostStatus {
  return getInstagramConnection().configured ? "ready" : "api_unavailable";
}

function tiktokStatus(): SocialPostStatus {
  return getTikTokConnection().configured ? "ready" : "api_unavailable";
}

export async function socialInsertsFromPack(
  posts: Record<string, unknown>,
): Promise<SocialPackInsert[]> {
  const linkedin = asRecord(posts.linkedin);
  const substack = asRecord(posts.substack);
  const reddit = asRecord(posts.reddit);
  const instagram = asRecord(posts.instagram);
  const tiktok = asRecord(posts.tiktok);
  const facebook = asRecord(posts.facebook);
  const tweets = Array.isArray(posts.x) ? posts.x : [];
  const linkedinStatus = await linkedInStatus();
  const igHashtags = asStringArray(instagram.hashtags);
  const ttHashtags = asStringArray(tiktok.hashtags);
  const linkedinText = asString(linkedin.text);
  const items: SocialPackInsert[] = [];

  if (linkedinText) {
    items.push({
      platform: "linkedin",
      content: linkedinText,
      status: linkedinStatus,
    });
  }

  tweets.forEach((tweet, index) => {
    const text = asString(asRecord(tweet).text);
    if (!text) return;
    items.push({
      platform: "x",
      content: text,
      status: xStatus(),
      metadata: { index },
    });
  });

  const substackText = [asString(substack.subject), asString(substack.text)]
    .filter(Boolean)
    .join("\n\n");
  if (substackText) {
    items.push({
      platform: "substack",
      content: substackText,
      status: "manual",
      metadata: { subject: asString(substack.subject) },
    });
  }

  const redditText = [asString(reddit.title), asString(reddit.text)]
    .filter(Boolean)
    .join("\n\n");
  if (redditText) {
    items.push({
      platform: "reddit",
      content: redditText,
      status: "manual",
      metadata: { title: asString(reddit.title) },
    });
  }

  const facebookText = asString(facebook.text);
  if (facebookText) {
    items.push({
      platform: "facebook",
      content: facebookText,
      status: "manual",
    });
  }

  const igCaption = asString(instagram.caption) || asString(instagram.text);
  if (igCaption) {
    const mediaPurpose =
      asString(instagram.media) ||
      asString(instagram.mediaPurpose) ||
      "still_or_carousel";
    items.push({
      platform: "instagram",
      content: [
        igCaption,
        igHashtags
          .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`))
          .join(" "),
      ]
        .filter(Boolean)
        .join("\n\n"),
      status: instagramStatus(),
      metadata: {
        caption: igCaption,
        hashtags: igHashtags,
        mediaPurpose,
      },
    });
  }

  const ttCaption = asString(tiktok.caption) || asString(tiktok.text);
  const ttTitle = asString(tiktok.title);
  if (ttCaption || ttTitle) {
    items.push({
      platform: "tiktok",
      content: [
        ttTitle,
        ttCaption,
        ttHashtags
          .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`))
          .join(" "),
      ]
        .filter(Boolean)
        .join("\n\n"),
      mediaUrl: asString(tiktok.mediaUrl) || asString(tiktok.media_url) || null,
      status: tiktokStatus(),
      metadata: {
        title: ttTitle,
        caption: ttCaption,
        hashtags: ttHashtags,
      },
    });
  }

  return items.filter((item) => item.content.trim());
}
