import { getInstagramConnection } from "@/lib/social/instagram";
import { getLinkedInConnection } from "@/lib/social/linkedin";
import { hasLinkedInStoredToken, listSocialPosts } from "@/lib/social/store";
import { getTikTokConnection } from "@/lib/social/tiktok";
import type { SocialDashboard, SocialPost } from "@/lib/social/types";
import { getXConnection } from "@/lib/social/x";

export async function loadSocialDashboard(): Promise<SocialDashboard> {
  const hasLinkedInToken = await hasLinkedInStoredToken().catch(() => false);
  const posts = await listSocialPosts(80).catch(() => [] as SocialPost[]);
  return {
    posts,
    x: getXConnection(),
    linkedin: getLinkedInConnection(hasLinkedInToken),
    instagram: getInstagramConnection(),
    tiktok: getTikTokConnection(),
  };
}
