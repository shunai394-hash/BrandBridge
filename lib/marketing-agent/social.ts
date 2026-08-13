import { chatCompletion } from "./ai";
import { parseJsonFromAi, textOrNull } from "./json";
import { repurposePrompt, SYSTEM_MARKETER } from "./prompts";
import {
  extraOfficialEnvOk,
  officialApiConnected,
  resolveSecret,
} from "./secrets";
import type { MarketingContent, SocialPlatform, SocialPost } from "./types";
import { utmForPlatform } from "./utm";

export type RepurposedVariant = {
  title: string;
  format: string;
  body: string;
  cta: string;
  hook: string | null;
  narration: string | null;
  caption: string | null;
  hashtags: string[];
};

const PLATFORM_FORMAT: Record<SocialPlatform, string> = {
  brandbridge_blog: "full_guide",
  medium: "essay",
  substack: "newsletter",
  linkedin: "b2b_short",
  x: "thread",
  instagram: "carousel_reel",
  tiktok: "short_video",
  youtube: "video_script",
  reddit: "helpful_answer",
};

function fallbackBody(platform: SocialPlatform, article: MarketingContent): RepurposedVariant {
  const keyword = article.targetKeyword || "Japan market entry";
  const def =
    article.definition ||
    `${keyword} is how overseas brands find Japanese distributors, retailers, or wholesale partners.`;
  const urlHint = "/en/register/maker";
  switch (platform) {
    case "brandbridge_blog":
      return {
        title: article.title,
        format: PLATFORM_FORMAT.brandbridge_blog,
        body: article.body,
        cta: article.cta || "Register on BrandBridge.",
        hook: null,
        narration: null,
        caption: null,
        hashtags: [],
      };
    case "medium":
      return {
        title: "How Overseas Brands Can Find Japanese Distributors",
        format: PLATFORM_FORMAT.medium,
        body: [
          def,
          "",
          "Most first meetings fail because brands send a brochure instead of wholesale terms.",
          "Japanese distributors usually want MOQ, price band, exclusivity stance, and who handles import.",
          "BrandBridge is a matching layer for that conversation — not a substitute for the contract.",
        ].join("\n"),
        cta: `Start on BrandBridge: ${urlHint}`,
        hook: null,
        narration: null,
        caption: null,
        hashtags: ["JapanMarketEntry", "DistributorSearch"],
      };
    case "substack":
      return {
        title: "Japan Market Entry Insights",
        format: PLATFORM_FORMAT.substack,
        body: [
          `This week: ${keyword}.`,
          def,
          "If you are an overseas brand, prepare a one-page partner brief before outreach.",
          "If you are a Japanese partner, look for brands that already know their first-lot terms.",
        ].join("\n"),
        cta: "Read the hub: /en/japan-market-entry",
        hook: null,
        narration: null,
        caption: null,
        hashtags: [],
      };
    case "linkedin":
      return {
        title: `A practical note on ${keyword}`,
        format: PLATFORM_FORMAT.linkedin,
        body: [
          `Overseas brands asking how to find a Japanese distributor usually skip commercial terms.`,
          "A usable first brief for a Japanese partner: product, channel, MOQ, Incoterms, exclusivity yes/no.",
          "BrandBridge is built to start that structured B2B discussion — not to replace the contract.",
        ].join("\n"),
        cta: "If you are entering Japan, register as a brand on BrandBridge.",
        hook: null,
        narration: null,
        caption: null,
        hashtags: ["B2B", "JapanMarketEntry", "Wholesale"],
      };
    case "x":
      return {
        title: `${keyword} tips`,
        format: PLATFORM_FORMAT.x,
        body: [
          `1/ ${keyword}: Japanese partners want terms, not just a brand story.`,
          "2/ Prepare MOQ, wholesale range, and exclusivity stance before outreach.",
          "3/ BrandBridge matches overseas brands with Japanese sales partners — then you negotiate.",
        ].join("\n"),
        cta: "brandbridge /en",
        hook: null,
        narration: null,
        caption: null,
        hashtags: ["JapanMarket"],
      };
    case "instagram":
      return {
        title: `${keyword} carousel / reel`,
        format: PLATFORM_FORMAT.instagram,
        body: [
          "CAROUSEL",
          "Slide 1 — Cover: Selling into Japan is a partner problem, not a translation problem.",
          "Slide 2 — What Japanese distributors ask first: MOQ, wholesale band, exclusivity.",
          "Slide 3 — What retailers ask: who imports, who supports the brand after the first lot.",
          "Slide 4 — Prepare a one-page brief before outreach.",
          "Slide 5 — BrandBridge structures that first meeting. It does not sell for you.",
          "Slide 6 — CTA: register as a brand or Japanese partner.",
          "",
          "REEL (12–20s beats)",
          "0–3s: overseas brands keep sending PDFs",
          "3–10s: three terms Japanese partners actually need",
          "10–18s: BrandBridge is the matching layer",
        ].join("\n"),
        cta: "Link in bio → /en/register/maker",
        hook: "Japan outreach fails when you send a brochure, not terms.",
        narration: null,
        caption:
          "Carousel + Reel: what Japanese distributors actually need before a first call. Not a blog paste.",
        hashtags: [
          "JapanMarketEntry",
          "JapaneseDistributor",
          "SellInJapan",
          "B2B",
        ],
      };
    case "tiktok":
      return {
        title: `${keyword} — 20s TikTok`,
        format: PLATFORM_FORMAT.tiktok,
        body: [
          "0–2s HOOK: Stop emailing Japanese distributors a brand PDF.",
          "2–10s: They want MOQ, wholesale range, and who handles import.",
          "10–18s: Prepare a one-page brief. Then find a partner who can discuss it.",
          "18–25s: BrandBridge matches overseas brands with Japanese sales partners.",
        ].join("\n"),
        cta: "Link in bio: start a structured Japan-partner discussion.",
        hook: "Your Japan outreach is dying in the inbox.",
        narration:
          "Japanese distributors do not need another brochure. They need first-lot terms. BrandBridge is a matching platform for that conversation — you still negotiate the deal.",
        caption:
          "15–30s: what to prepare before you look for a Japanese distributor. Manual publish until official TikTok API + video file are connected.",
        hashtags: [
          "JapanMarketEntry",
          "JapaneseDistributor",
          "ImportToJapan",
          "Wholesale",
          "B2B",
        ],
      };
    case "youtube":
      return {
        title: `${keyword} — 60s / 8min outline`,
        format: PLATFORM_FORMAT.youtube,
        body: [
          "SHORTS (45s): Hook — overseas brands fail Japan outreach by sending PDFs. Then 3 terms to prepare. CTA.",
          "LONG: 0:00 problem, 1:00 what Japanese distributors need, 3:00 retailers vs wholesalers, 5:00 how BrandBridge matching works, 7:00 CTA to register.",
        ].join("\n"),
        cta: "Description link: /en/japan-market-entry",
        hook: "Overseas brands fail Japan outreach by sending PDFs.",
        narration: null,
        caption: null,
        hashtags: ["JapanMarketEntry"],
      };
    case "reddit":
      return {
        title: `Re: looking for a Japanese distributor`,
        format: PLATFORM_FORMAT.reddit,
        body: [
          "If you are an overseas brand, Japanese partners typically want a short commercial brief before a call: MOQ, wholesale, exclusivity, and import responsibility.",
          "A matching platform can help you reach partners who already work those terms. It will not replace your own import/regulatory work.",
          "I work on BrandBridge, which is built for that first structured discussion — happy to answer questions about the process (not pitching a specific product).",
        ].join("\n"),
        cta: "Helpful links only if asked — no spam in the thread.",
        hook: null,
        narration: null,
        caption: null,
        hashtags: [],
      };
  }
}

function parseHashtags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => String(item).replace(/^#/, "").trim())
    .filter((item) => item.length > 0)
    .slice(0, 12);
}

export async function repurposeArticle(
  article: MarketingContent,
  platform: SocialPlatform,
): Promise<RepurposedVariant> {
  const ai = await chatCompletion(
    [
      { role: "system", content: SYSTEM_MARKETER },
      {
        role: "user",
        content: repurposePrompt(
          platform,
          `${article.title}\n${article.definition || ""}\n${article.body}`,
        ),
      },
    ],
    { temperature: 0.5, maxTokens: 1800 },
  );
  if (ai.ok) {
    const parsed = parseJsonFromAi<Record<string, unknown>>(ai.text);
    if (parsed?.body) {
      return {
        title: String(parsed.title || article.title),
        format: String(parsed.format || PLATFORM_FORMAT[platform]),
        body: String(parsed.body),
        cta: textOrNull(parsed.cta) || article.cta || "",
        hook: textOrNull(parsed.hook),
        narration: textOrNull(parsed.narration),
        caption: textOrNull(parsed.caption),
        hashtags: parseHashtags(parsed.hashtags),
      };
    }
  }
  return fallbackBody(platform, article);
}

export async function publishViaOfficialApi(params: {
  platform: SocialPlatform;
  body: string;
  secretRef: string | null;
}): Promise<{ ok: boolean; mode: "official_api" | "manual"; error?: string }> {
  const { platform, body, secretRef } = params;
  if (!officialApiConnected(platform, secretRef) || !extraOfficialEnvOk(platform)) {
    return { ok: false, mode: "manual", error: "Manual Publish Required" };
  }
  const token = resolveSecret(secretRef);
  if (!token) {
    return { ok: false, mode: "manual", error: "Manual Publish Required" };
  }

  try {
    if (platform === "x") {
      const res = await fetch("https://api.twitter.com/2/tweets", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: body.slice(0, 270) }),
      });
      if (!res.ok) {
        return {
          ok: false,
          mode: "official_api",
          error: `X API HTTP ${res.status}`,
        };
      }
      return { ok: true, mode: "official_api" };
    }

    if (platform === "linkedin") {
      const author = process.env.MARKETING_LINKEDIN_AUTHOR_URN?.trim();
      if (!author) {
        return { ok: false, mode: "manual", error: "Manual Publish Required" };
      }
      const res = await fetch("https://api.linkedin.com/v2/ugcPosts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-Restli-Protocol-Version": "2.0.0",
        },
        body: JSON.stringify({
          author,
          lifecycleState: "PUBLISHED",
          specificContent: {
            "com.linkedin.ugc.ShareContent": {
              shareCommentary: { text: body.slice(0, 2900) },
              shareMediaCategory: "NONE",
            },
          },
          visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
        }),
      });
      if (!res.ok) {
        return {
          ok: false,
          mode: "official_api",
          error: `LinkedIn API HTTP ${res.status}`,
        };
      }
      return { ok: true, mode: "official_api" };
    }

    if (platform === "reddit") {
      const username = process.env.MARKETING_REDDIT_USERNAME?.trim();
      const subreddit = process.env.MARKETING_REDDIT_SUBREDDIT?.trim();
      if (!username || !subreddit) {
        return { ok: false, mode: "manual", error: "Manual Publish Required" };
      }
      const res = await fetch("https://oauth.reddit.com/api/submit", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": `brandbridge-marketing/1.0 (by /u/${username})`,
        },
        body: new URLSearchParams({
          sr: subreddit,
          kind: "self",
          title: body.split("\n")[0]?.slice(0, 120) || "Japan market entry note",
          text: body,
        }),
      });
      if (!res.ok) {
        return {
          ok: false,
          mode: "official_api",
          error: `Reddit API HTTP ${res.status}`,
        };
      }
      return { ok: true, mode: "official_api" };
    }

    if (
      platform === "tiktok" ||
      platform === "instagram" ||
      platform === "youtube"
    ) {
      return {
        ok: false,
        mode: "manual",
        error:
          "Manual Publish Required — official video/media API is not fully connected (script saved).",
      };
    }

    return { ok: false, mode: "manual", error: "Manual Publish Required" };
  } catch (error) {
    return {
      ok: false,
      mode: "official_api",
      error: error instanceof Error ? error.message : "official API failed",
    };
  }
}

export function attachUtm(
  platform: SocialPlatform,
  campaign: string,
  slug?: string | null,
): Pick<
  SocialPost,
  "utmSource" | "utmMedium" | "utmCampaign" | "utmContent" | "destinationUrl"
> {
  const utm = utmForPlatform(platform, campaign, slug || undefined);
  return {
    utmSource: utm.source,
    utmMedium: utm.medium,
    utmCampaign: utm.campaign,
    utmContent: utm.content,
    destinationUrl: utm.url,
  };
}
