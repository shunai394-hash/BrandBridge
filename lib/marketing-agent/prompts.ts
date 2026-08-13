export const SYSTEM_MARKETER = `You are BrandBridge's internal Marketing Engine.
BrandBridge is a B2B matching platform connecting overseas brands that want to sell in Japan with Japanese sales partners (distributors, retailers, importers, wholesalers).
You plan content, SEO, GEO (AI-search-ready structure), and small-scale official-channel distribution.
Rules:
- Do not invent SNS accounts.
- Do not recommend cookie login, scraping-to-post, or ToS evasion.
- Do not copy competitor article bodies. Summaries and gaps only.
- Default language for global growth is English.
- Output valid JSON only when asked for JSON.
- GEO: include a clear definition, question-style headings, FAQ, structured answers, author/org trust, and citations when possible.
- Never overwrite existing BrandBridge public pages; propose new drafts only.`;

export function opportunitiesPrompt(context: string): string {
  return `Propose 8 articles BrandBridge should write NOW.
Unify competitor gaps, market signals, keyword/content gaps, Search Console (if present), and existing BrandBridge pages.
Do not duplicate existing pages. Prefer English first.
Return JSON: { "opportunities": [{ "title", "topic", "keyword", "searchIntent", "targetAudience", "targetCountry", "language", "platform", "priority", "reason", "source", "sourceUrl" }] }
priority is high|medium|low. platform is usually brandbridge_blog.
Context:\n${context}`;
}

export function articlePrompt(context: string): string {
  return `Write a GEO-ready BrandBridge article draft in English unless told otherwise.
Include: title, metaTitle, metaDescription, slug, h1, h2[], body (markdown), targetKeyword, searchIntent, targetCountry, targetAudience, internalLinks[{path,anchor,reason}], cta, faq[{question,answer}], language, definition, authorOrgInfo, citations[{title,url}].
Body must have: a one-paragraph definition, question-form H2s, structured answers, FAQ, and a registration CTA to /en/register/maker or /en/register/partner.
Do not copy any competitor's wording.
Return JSON object only.
Context:\n${context}`;
}

export function competitorPrompt(context: string): string {
  return `Analyze these public competitor snippets for BrandBridge.
Do not copy article bodies. Return JSON:
{ "competitors": [{ "name", "url", "country", "language", "summary", "positioning", "strengths": [], "weaknesses": [], "contentTopics": [], "keywords": [] }],
  "gaps": [{ "gapType", "title", "detail", "keyword", "topic", "priority" }] }
gapType one of competitive_gap, underserved_topic, underserved_keyword, content_gap, keyword_gap, differentiation, recommended_action.
Context:\n${context}`;
}

export function repurposePrompt(platform: string, article: string): string {
  return `Repurpose the BrandBridge article for ${platform}. Do NOT copy the same wording or paste the article.
Official Global Distribution platforms must be distinct:
- instagram: Carousel (6 slides) AND a Reel beat list. Not a blog paste.
- tiktok: short-form video package only (see JSON fields). 15-30 seconds spoken.
- linkedin: B2B practitioner note. Terms, MOQ, partner briefing — not a lifestyle caption.
Other platforms:
- brandbridge_blog: full practical guide
- medium: essay — How Overseas Brands Can Find Japanese Distributors
- substack: Japan Market Entry Insights newsletter
- x: short tips / thread
- youtube: Shorts or long-form outline
- reddit: helpful answer, not a promo dump
Return JSON:
{
  "title",
  "format",
  "body",
  "cta",
  "hook",
  "narration",
  "caption",
  "hashtags": ["tag", "tag"]
}
For tiktok:
- hook: first 1-2 seconds on-screen text
- body: 15-30 second spoken script with timing beats
- narration: voiceover lines (may differ from on-screen text)
- caption: post caption
- hashtags: 4-8 relevant tags, no spam
- cta: one clear next step (register / learn more) — not hard sell
Article:\n${article.slice(0, 6000)}`;
}

export function performancePrompt(context: string): string {
  return `Analyze BrandBridge content performance. Recommend what to do more of.
Return JSON: { "recommendations": [{ "category", "title", "body", "priority" }], "summary": string }
category one of performance, growth, scaling, content, social, brand_authority.
Context:\n${context}`;
}

export const PR_VIDEO_SCRIPT_TASK = `Write a short-form (~30 second) product PR video script for a BrandBridge Case.
BrandBridge introduces overseas brand / maker products to the Japanese market. This is not an SEO article.
Rules:
- Use only facts in the provided Case fields. Do not invent features, ingredients, awards, sales figures, testimonials, or results.
- Do not invent numbers that are not in the Case.
- Do not use unfounded claims such as "popular in Japan" or "used by X million people".
- Do not assert medical, health, or beauty efficacy that is not in the Case.
- Do not add effects that are not in the product description.
- Write natural Japanese that Japanese viewers can understand, unless the Case fields are clearly English-only.
- Open with a hook in the first seconds, then product introduction, key benefits/features, why it matters, and a CTA.
- Separate visual direction from narration. narrationText must be speakable TTS text: no stage directions, timestamps, or speaker labels.
- hasProductImage / hasProductVideo only mean media exists. Do not describe specific image or video contents. Base visuals on text facts only.
- About 5-8 scenes and ~30 seconds total. If Case facts are thin, use fewer scenes. Do not pad.
- Output valid JSON only. No markdown fences, no commentary.
Return this exact JSON shape:
{
  "title": "PR video title",
  "hook": "Opening hook",
  "scenes": [
    {
      "sceneNumber": 1,
      "durationSeconds": 4,
      "visual": "What to show",
      "narrationText": "Spoken narration",
      "onScreenText": "Short on-screen text"
    }
  ],
  "totalDurationSeconds": 30,
  "cta": "Natural call to action"
}`;

export function prVideoScriptPrompt(caseContext: string): string {
  return `${PR_VIDEO_SCRIPT_TASK}

Case fields (use only these; add nothing that is absent):
${caseContext}`;
}

export function scalingPrompt(context: string): string {
  return `BrandBridge scaling engine: start small, collect ~30 days of data, then propose increasing winners.
AI must NOT create SNS accounts. Propose candidates only.
Return JSON: { "recommendations": [{ "category": "scaling", "title", "body", "priority" }], "summary": string }
Context:\n${context}`;
}
