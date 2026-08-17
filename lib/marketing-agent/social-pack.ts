import { completeJson } from "@/lib/marketing-agent/ai";
import { asRecord, asString } from "@/lib/marketing-agent/json";
import {
  SOCIAL_TASK,
  SOCIAL_THEME_TASK,
  systemPrompt,
} from "@/lib/marketing-agent/prompts";
import {
  PUBLIC_URL_MISSING,
  assertPublishedUrlLive,
  findPublishedPage,
  listSocialTargetPages,
  sanitizeSocialPayload,
  type PublishedPageRef,
} from "@/lib/marketing-agent/published-urls";
import { getSiteUrl, isOfficialSiteUrl } from "@/lib/site";

export type SocialTheme = {
  theme: string;
  angle: string;
  whyNow: string;
  relatedPagePath: string | null;
};

export type PastSocialTheme = {
  theme: string;
  angle?: string;
};

const DEFAULT_EN_PATHS = [
  "/en/japan-market-entry",
  "/en/how-to-sell-in-japan",
  "/en/japan-market-entry/how-to-find-japanese-distributors",
  "/en/register/maker",
];

function scorePage(theme: SocialTheme, page: PublishedPageRef): number {
  const hay = `${theme.theme} ${theme.angle} ${theme.whyNow}`.toLowerCase();
  const needle = `${page.label} ${page.path}`.toLowerCase();
  let score = 0;
  const keywords = [
    ["distributor", "卸", "partner", "販売"],
    ["retail", "小売", "retailer"],
    ["enter", "参入", "market-entry"],
    ["moq", "wholesale", "卸"],
    ["food", "機能"],
    ["register", "list", "maker"],
    ["demand", "需要"],
    ["negotiat", "商談"],
  ];
  for (const group of keywords) {
    if (group.some((word) => hay.includes(word)) && group.some((word) => needle.includes(word))) {
      score += 3;
    }
  }
  for (const token of hay.split(/[^a-z0-9\u3040-\u30ff\u4e00-\u9faf]+/i)) {
    if (token.length < 4) continue;
    if (needle.includes(token)) score += 1;
  }
  if (page.path.includes("japan-market-entry")) score += 1;
  return score;
}

export function resolveThemePublishedPage(theme: SocialTheme): PublishedPageRef {
  const suggested = theme.relatedPagePath
    ? findPublishedPage(theme.relatedPagePath)
    : null;
  if (suggested) return suggested;

  const catalog = listSocialTargetPages("en");
  const ranked = [...catalog].sort(
    (left, right) => scorePage(theme, right) - scorePage(theme, left),
  );
  if (ranked[0] && scorePage(theme, ranked[0]) > 0) return ranked[0];

  for (const path of DEFAULT_EN_PATHS) {
    const page = findPublishedPage(path);
    if (page) return page;
  }
  throw new Error(PUBLIC_URL_MISSING);
}

export async function pickSocialTheme(input: {
  pastThemes: PastSocialTheme[];
  catalog: PublishedPageRef[];
  siteOrigin: string;
}): Promise<SocialTheme> {
  const raw = await completeJson(
    [
      { role: "system", content: systemPrompt(SOCIAL_THEME_TASK) },
      {
        role: "user",
        content: JSON.stringify({
          audience: "overseas brands and manufacturers considering Japan",
          pastThemes: input.pastThemes.slice(0, 20),
          catalog: input.catalog.map((page) => ({
            path: page.path,
            label: page.label,
            url: page.url,
          })),
          siteOrigin: input.siteOrigin,
        }),
      },
    ],
    { temperature: 0.7, maxTokens: 900 },
  );

  const theme = asString(raw.theme).trim();
  const angle = asString(raw.angle).trim();
  if (!theme || !angle) {
    throw new Error("SNSテーマを決められませんでした。");
  }

  const relatedPagePath =
    asString(raw.relatedPagePath || raw.pagePath).trim() || null;
  const duplicate = input.pastThemes.some((item) => {
    const previous = `${item.theme} ${item.angle ?? ""}`.toLowerCase();
    const next = `${theme} ${angle}`.toLowerCase();
    return previous === next || previous.includes(theme.toLowerCase());
  });
  if (duplicate && input.pastThemes.length > 0) {
    const retry = await completeJson(
      [
        { role: "system", content: systemPrompt(SOCIAL_THEME_TASK) },
        {
          role: "user",
          content: JSON.stringify({
            instruction: "The previous theme duplicated a recent one. Pick a clearly different angle.",
            rejectedTheme: { theme, angle },
            pastThemes: input.pastThemes.slice(0, 20),
            catalog: input.catalog.map((page) => ({
              path: page.path,
              label: page.label,
            })),
          }),
        },
      ],
      { temperature: 0.85, maxTokens: 900 },
    );
    const nextTheme = asString(retry.theme).trim() || theme;
    const nextAngle = asString(retry.angle).trim() || angle;
    return {
      theme: nextTheme,
      angle: nextAngle,
      whyNow: asString(retry.whyNow) || asString(raw.whyNow),
      relatedPagePath:
        asString(retry.relatedPagePath || retry.pagePath).trim() || relatedPagePath,
    };
  }

  return {
    theme,
    angle,
    whyNow: asString(raw.whyNow),
    relatedPagePath,
  };
}

export async function generateSocialPostsWithAi(input: {
  theme: SocialTheme;
  canonicalUrl: string;
  siteOrigin: string;
  pageLabel: string;
}): Promise<Record<string, unknown>> {
  return completeJson(
    [
      { role: "system", content: systemPrompt(SOCIAL_TASK) },
      {
        role: "user",
        content: JSON.stringify({
          theme: input.theme.theme,
          angle: input.theme.angle,
          whyNow: input.theme.whyNow,
          pageLabel: input.pageLabel,
          canonicalUrl: input.canonicalUrl,
          siteOrigin: input.siteOrigin,
          allowedUrls: [input.canonicalUrl],
        }),
      },
    ],
    { temperature: 0.7, maxTokens: 3600 },
  );
}

export function assertSocialPayloadUrls(
  posts: Record<string, unknown>,
  canonicalUrl: string,
  origin = getSiteUrl(),
): void {
  const blobs: string[] = [];
  const walk = (value: unknown) => {
    if (typeof value === "string") blobs.push(value);
    else if (Array.isArray(value)) value.forEach(walk);
    else if (value && typeof value === "object") {
      Object.entries(value as Record<string, unknown>).forEach(([key, item]) => {
        if (key === "canonicalUrl" || key === "siteOrigin") return;
        walk(item);
      });
    }
  };
  walk(posts);

  const text = blobs.join("\n");
  if (/brandbridge\.co\b/i.test(text)) {
    throw new Error(PUBLIC_URL_MISSING);
  }
  const urls = text.match(/https?:\/\/[^\s<>"')\]]+/gi) ?? [];
  for (const raw of urls) {
    const candidate = raw.replace(/[.,;:]+$/, "");
    if (!isOfficialSiteUrl(candidate, origin)) {
      throw new Error(PUBLIC_URL_MISSING);
    }
    const normalizedCandidate = candidate.replace(/\/$/, "");
    const normalizedCanonical = canonicalUrl.replace(/\/$/, "");
    const normalizedOrigin = origin.replace(/\/$/, "");
    if (
      normalizedCandidate !== normalizedCanonical &&
      normalizedCandidate !== normalizedOrigin
    ) {
      throw new Error(PUBLIC_URL_MISSING);
    }
  }
}

export async function buildVerifiedSocialPack(input: {
  theme: SocialTheme;
}): Promise<{
  theme: SocialTheme;
  page: PublishedPageRef;
  posts: Record<string, unknown>;
}> {
  const origin = getSiteUrl();
  const page = resolveThemePublishedPage(input.theme);
  await assertPublishedUrlLive(page.url, origin);
  const raw = await generateSocialPostsWithAi({
    theme: input.theme,
    canonicalUrl: page.url,
    siteOrigin: origin,
    pageLabel: page.label,
  });
  const posts = sanitizeSocialPayload(raw, page.url, origin);
  assertSocialPayloadUrls(posts, page.url, origin);
  return { theme: input.theme, page, posts };
}
