export type SocialPlatform =
  | "x"
  | "linkedin"
  | "instagram"
  | "tiktok"
  | "substack"
  | "reddit"
  | "facebook";

export type SocialPostStatus =
  | "draft"
  | "ready"
  | "posted"
  | "failed"
  | "manual"
  | "api_unavailable";

export type SocialPost = {
  id: string;
  recommendationId: string | null;
  platform: SocialPlatform;
  content: string;
  mediaUrl: string | null;
  status: SocialPostStatus;
  externalPostId: string | null;
  externalPostUrl: string | null;
  errorMessage: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  postedAt: string | null;
};

export type SocialConnectionStatus = {
  configured: boolean;
  label: string;
  note: string;
  /** LinkedIn OAuth 開始に Client ID / Secret があるか（トークン有無とは別） */
  canAuthorize?: boolean;
};

export type SocialPublishResult = {
  externalPostId: string;
  externalPostUrl: string;
};

export type SocialDashboard = {
  posts: SocialPost[];
  x: SocialConnectionStatus;
  linkedin: SocialConnectionStatus;
  instagram: SocialConnectionStatus;
  tiktok: SocialConnectionStatus;
};
