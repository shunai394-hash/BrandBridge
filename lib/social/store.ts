import { createClient } from "@/lib/supabase/server";
import { isMissingRelationError } from "@/lib/marketing-agent/store";
import type {
  SocialPlatform,
  SocialPost,
  SocialPostStatus,
} from "@/lib/social/types";

type PostRow = {
  id: string;
  recommendation_id: string | null;
  platform: SocialPlatform;
  content: string;
  media_url: string | null;
  status: SocialPostStatus;
  external_post_id: string | null;
  external_post_url: string | null;
  error_message: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  posted_at: string | null;
};

type TokenRow = {
  platform: "linkedin";
  access_token: string;
  refresh_token: string | null;
  expires_at: string | null;
  account_label: string | null;
};

function mapPost(row: PostRow): SocialPost {
  return {
    id: row.id,
    recommendationId: row.recommendation_id,
    platform: row.platform,
    content: row.content,
    mediaUrl: row.media_url,
    status: row.status,
    externalPostId: row.external_post_id,
    externalPostUrl: row.external_post_url,
    errorMessage: row.error_message,
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
    postedAt: row.posted_at,
  };
}

export async function insertSocialPosts(
  items: Array<{
    recommendationId?: string | null;
    platform: SocialPlatform;
    content: string;
    mediaUrl?: string | null;
    status: SocialPostStatus;
    metadata?: Record<string, unknown>;
  }>,
): Promise<SocialPost[]> {
  if (items.length === 0) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("social_posts")
    .insert(
      items.map((item) => ({
        recommendation_id: item.recommendationId ?? null,
        platform: item.platform,
        content: item.content,
        media_url: item.mediaUrl ?? null,
        status: item.status,
        metadata: item.metadata ?? {},
      })),
    )
    .select("*");
  if (error) {
    if (isMissingRelationError(error)) return [];
    throw new Error(error.message);
  }
  return ((data ?? []) as PostRow[]).map(mapPost);
}

export async function listSocialPosts(limit = 40): Promise<SocialPost[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("social_posts")
    .select(
      "id, recommendation_id, platform, content, media_url, status, external_post_id, external_post_url, error_message, metadata, created_at, posted_at",
    )
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    if (isMissingRelationError(error)) return [];
    throw error;
  }
  return ((data ?? []) as PostRow[]).map(mapPost);
}

export async function getSocialPostById(id: string): Promise<SocialPost | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("social_posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    if (isMissingRelationError(error)) return null;
    throw error;
  }
  return data ? mapPost(data as PostRow) : null;
}

export async function markSocialPostPosted(
  id: string,
  input: {
    externalPostId: string;
    externalPostUrl: string;
  },
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("social_posts")
    .update({
      status: "posted",
      external_post_id: input.externalPostId,
      external_post_url: input.externalPostUrl,
      error_message: null,
      posted_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function markSocialPostFailed(
  id: string,
  message: string,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("social_posts")
    .update({
      status: "failed",
      error_message: message,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function hasLinkedInStoredToken(): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("social_oauth_tokens")
    .select("expires_at")
    .eq("platform", "linkedin")
    .maybeSingle();
  if (error) {
    if (isMissingRelationError(error)) return false;
    throw error;
  }
  const row = data as Pick<TokenRow, "expires_at"> | null;
  if (!row) return false;
  if (row.expires_at && new Date(row.expires_at).getTime() <= Date.now()) {
    return false;
  }
  return true;
}

export async function getLinkedInStoredToken(): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("social_oauth_tokens")
    .select("access_token, expires_at")
    .eq("platform", "linkedin")
    .maybeSingle();
  if (error) {
    if (isMissingRelationError(error)) return null;
    throw error;
  }
  const row = data as Pick<TokenRow, "access_token" | "expires_at"> | null;
  if (!row?.access_token) return null;
  if (row.expires_at && new Date(row.expires_at).getTime() <= Date.now()) {
    return null;
  }
  return row.access_token;
}

export async function upsertLinkedInToken(input: {
  accessToken: string;
  refreshToken?: string | null;
  expiresIn?: number | null;
  accountLabel?: string | null;
}): Promise<void> {
  const supabase = await createClient();
  const expiresAt =
    input.expiresIn && input.expiresIn > 0
      ? new Date(Date.now() + input.expiresIn * 1000).toISOString()
      : null;
  const { error } = await supabase.from("social_oauth_tokens").upsert(
    {
      platform: "linkedin",
      access_token: input.accessToken,
      refresh_token: input.refreshToken ?? null,
      expires_at: expiresAt,
      account_label: input.accountLabel ?? null,
    },
    { onConflict: "platform" },
  );
  if (error) throw new Error(error.message);
}
