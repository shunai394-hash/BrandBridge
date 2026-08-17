import type { SocialConnectionStatus } from "@/lib/social/types";

export function getTikTokConnection(): SocialConnectionStatus {
  return {
    configured: false,
    label: "TikTok API未接続",
    note: "TikTok は API unavailable です。投稿素材の確認・コピーのみ。Content Posting API には接続しません。",
  };
}
