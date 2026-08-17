import type { SocialConnectionStatus } from "@/lib/social/types";

export function getInstagramConnection(): SocialConnectionStatus {
  return {
    configured: false,
    label: "Instagram API未接続",
    note: "Instagram は API unavailable です。生成文のコピーのみ。自動投稿しません。",
  };
}
