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

const PLATFORM_FORMAT: Record<SocialPlatform, string> = {
  brandbridge_blog: "full_guide",
  medium: "essay",
  substack: "newsletter",
  linkedin: "b2b_short",
  x: "thread",
  instagram: "carousel_script",
  youtube: "video_script",
  reddit: "helpful_answer",
};

function fallbackBody(platform: SocialPlatform, article: MarketingContent): {
  title: string;
  body: string;
  cta: string;
} {
  const keyword = article.targetKeyword || "Japan market entry";
  const def =
    article.definition ||
    `${keyword} is how overseas brands find Japanese distributors, retailers, or wholesale partners.`;
  const urlHint = "/en/register/maker";
  switch (platform) {
    case "brandbridge_blog":
      return {
        title: article.title,
        body: article.body,
        cta: article.cta || "Register on BrandBridge.",
      };
    case "medium":
      return {
        title: "How Overseas Brands Can Find Japanese Distributors",
        body: [
          def,
          "",
          "Most first meetings fail because brands send a brochure instead of wholesale terms.",
          "Japanese distributors usually want MOQ, price band, exclusivity stance, and who handles import.",
          "BrandBridge is a matching layer for that conversation — not a substitute for the contract.",
        ].join("\n"),
        cta: `Start on BrandBridge: ${urlHint}`,
      };
    case "substack":
      return {
        title: "Japan Market Entry Insights",
        body: [
          `This week: ${keyword}.`,
          def,
          "If you are an overseas brand, prepare a one-page partner brief before outreach.",
          "If you are a Japanese partner, look for brands that already know their first-lot terms.",
        ].join("\n"),
        cta: "Read the hub: /en/japan-market-entry",
      };
    case "linkedin":
      return {
        title: `A practical note on ${keyword}`,
        body: [
          `Overseas brands asking “how do we find a Japanese distributor?” usually skip terms.`,
          "A usable first brief: product, channel, MOQ, Incoterms, exclusivity yes/no.",
          "That is the conversation BrandBridge is built to start.",
        ].join("\n"),
        cta: "BrandBridge — structured Japan-partner matching",
      };
    case "x":
      return {
        title: `${keyword} tips`,
        body: [
          `1/ ${keyword}: Japanese partners want terms, not just a brand story.`,
          "2/ Prepare MOQ, wholesale range, and exclusivity stance before outreach.",
          "3/ BrandBridge matches overseas brands with Japanese sales partners — then you negotiate.",
        ].join("\n"),
        cta: "brandbridge /en",
      };
    case "instagram":
      return {
        title: `${keyword} carousel`,
        body: [
          "Slide 1: Want to sell in Japan?",
          `Slide 2: ${def}`,
          "Slide 3: Distributors ask for MOQ and wholesale terms first.",
          "Slide 4: Retailers ask who already imports and supports the brand.",
          "Slide 5: BrandBridge structures that first meeting.",
          "Slide 6: CTA — register as a brand or Japanese partner.",
        ].join("\n"),
        cta: "Link in bio: /en/register/maker",
      };
    case "youtube":
      return {
        title: `${keyword} — 60s / 8min outline`,
        body: [
          "SHORTS (45s): Hook — overseas brands fail Japan outreach by sending PDFs. Then 3 terms to prepare. CTA.",
          "LONG: 0:00 problem, 1:00 what Japanese distributors need, 3:00 retailers vs wholesalers, 5:00 how BrandBridge matching works, 7:00 CTA to register.",
        ].join("\n"),
        cta: "Description link: /en/japan-market-entry",
      };
    case "reddit":
      return {
        title: `Re: looking for a Japanese distributor`,
        body: [
          "If you are an overseas brand, Japanese partners typically want a short commercial brief before a call: MOQ, wholesale, exclusivity, and import responsibility.",
          "A matching platform can help you reach partners who already work those terms. It will not replace your own import/regulatory work.",
          "I work on BrandBridge, which is built for that first structured discussion — happy to answer questions about the process (not pitching a specific product).",
        ].join("\n"),
        cta: "Helpful links only if asked — no spam in the thread.",
      };
  }
}

export async function repurposeArticle(
  article: MarketingContent,
  platform: SocialPlatform,
): Promise<{ title: string; format: string; body: string; cta: string }> {
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
      };
    }
  }
  const fb = fallbackBody(platform, article);
  return {
    title: fb.title,
    format: PLATFORM_FORMAT[platform],
    body: fb.body,
    cta: fb.cta,
  };
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

    // Instagram / YouTube require media assets + extra IDs; keep manual until fully configured.
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
