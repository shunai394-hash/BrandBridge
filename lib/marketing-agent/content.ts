import { completeJson } from "@/lib/marketing-agent/ai";
import { ARTICLE_DRAFT_TASK, systemPrompt } from "@/lib/marketing-agent/prompts";
import { asRecord, asString } from "@/lib/marketing-agent/json";
import type { MarketingContentIdea } from "@/lib/marketing-agent/types";
import { listPublicCatalogPages } from "@/lib/marketing-agent/site-catalog";
import { getOfficialPublicOrigin } from "@/lib/site";

export async function generateArticleDraftWithAi(input: {
  idea: MarketingContentIdea;
}): Promise<{
  title: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  content: string;
  seoNotes: string;
  geoNotes: string;
  extras: Record<string, unknown>;
}> {
  const catalog = listPublicCatalogPages()
    .filter((page) => page.seoImportance !== "low")
    .map((page) => ({
      path: page.path || "/",
      language: page.language,
      pageType: page.pageType,
      label: page.label,
    }));

  const raw = await completeJson(
    [
      { role: "system", content: systemPrompt(ARTICLE_DRAFT_TASK) },
      {
        role: "user",
        content: JSON.stringify({
          idea: {
            title: input.idea.title,
            topic: input.idea.topic,
            targetKeyword: input.idea.targetKeyword,
            searchIntent: input.idea.searchIntent,
            targetAudience: input.idea.targetAudience,
            contentType: input.idea.contentType,
            reasoning: input.idea.reasoning,
          },
          internalLinkCatalog: catalog,
          officialOrigin: getOfficialPublicOrigin(),
          language: "en",
          note: "slug is editorial only and is not a live public URL",
        }),
      },
    ],
    { temperature: 0.55, maxTokens: 5000, timeoutMs: 70_000 },
  );

  const title = asString(raw.title) || input.idea.title;
  const slug =
    asString(raw.slug)
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "japan-market-entry-draft";
  const content = asString(raw.content);
  if (!content.trim()) {
    throw new Error("AI が記事本文を返しませんでした。");
  }

  const jsonLd = asRecord(raw.jsonLd);
  const geoNotes = [
    asString(raw.geoNotes),
    Object.keys(jsonLd).length > 0
      ? `\n\nJSON-LD suggestion:\n${JSON.stringify(jsonLd, null, 2)}`
      : "",
  ]
    .join("")
    .trim();

  const seoBits = [
    asString(raw.seoNotes),
    asString(raw.h1) ? `H1: ${asString(raw.h1)}` : "",
    Array.isArray(raw.suggestedHeadings)
      ? `Headings:\n${(raw.suggestedHeadings as unknown[])
          .map((item) => `- ${String(item)}`)
          .join("\n")}`
      : "",
    asString(raw.cta) ? `CTA: ${asString(raw.cta)}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  return {
    title,
    slug,
    metaTitle: asString(raw.metaTitle) || title,
    metaDescription: asString(raw.metaDescription),
    content,
    seoNotes: seoBits,
    geoNotes,
    extras: raw,
  };
}
