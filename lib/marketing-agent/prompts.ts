export const BRAND_CONTEXT = `
BrandBridge is a B2B matching platform that connects overseas brands/manufacturers who want to enter Japan with qualified Japanese sales partners (distributors, retailers, wholesalers, importers, e-commerce operators).

Primary audience for English content:
Overseas brand and manufacturer decision-makers considering Japan market entry — founders, export managers, international sales, and brand owners. They need practical, specific answers, not tourism copy or generic "doing business in Japan" essays.

What BrandBridge does:
- Lets product providers list products with commercial terms (MOQ, wholesale range, exclusivity, shipping).
- Lets Japanese sales partners browse and start negotiations.
- Operators can mediate. BrandBridge does not take payment for the goods themselves.

Voice:
- Practical, concrete, specific to Japan B2B distribution.
- Answer the search intent first.
- Explain Japan-specific partner, wholesale, import, and channel realities.
- Natural path to BrandBridge (list a brand / browse opportunities) without hype or hard sell.
- No filler, no "in today's fast-paced world", no fake statistics, no invented case studies.
- Do not claim BrandBridge has exclusive data unless it is clearly a platform capability (listings, terms, partner matching).
`.trim();

export const JSON_ONLY =
  "Respond with a single JSON object only. No markdown outside JSON. Do not wrap in code fences.";

export function systemPrompt(task: string): string {
  return `${BRAND_CONTEXT}\n\nTask: ${task}\n\n${JSON_ONLY}`;
}

export const SITE_ANALYSIS_TASK = `
Analyze BrandBridge public pages for SEO and content quality.
Return JSON:
{
  "summary": "short paragraph",
  "importantPages": [{"url": "", "why": ""}],
  "thinContent": [{"url": "", "issue": ""}],
  "titleMetaFixes": [{"url": "", "currentTitle": "", "issue": "", "suggestedTitle": "", "suggestedDescription": ""}],
  "internalLinkGaps": [{"url": "", "issue": ""}],
  "keywordInsights": {
    "lowCtr": [{"query": "", "page": "", "impressions": 0, "ctr": 0, "why": "", "fix": ""}],
    "strikingDistance": [{"query": "", "page": "", "position": 0, "why": "", "fix": ""}],
    "weakConversion": [{"page": "", "clicks": 0, "why": "", "fix": ""}],
    "uncoveredThemes": [{"theme": "", "evidence": "", "suggestedAngle": ""}],
    "improveExisting": [{"url": "", "theme": "", "whyBetterThanNewArticle": "", "fix": ""}]
  },
  "recommendations": [
    {"category": "seo"|"keyword"|"existing_page"|"geo"|"internal_link"|"content", "title": "", "description": "", "priority": "high"|"medium"|"low", "data": {}}
  ]
}
If Search Console data is missing, still analyze the site and say so in summary. Do not invent GSC metrics.
`.trim();

export const CONTENT_OPPORTUNITIES_TASK = `
Propose the next English articles BrandBridge should write for overseas brands entering Japan.
Prefer Japan market entry, distributors, retailers, wholesale terms, import, category-specific entry (e.g. functional food), and partner-finding topics that the current site does not cover well.
Each idea must be specific, not a generic "guide to Japan".
If competitorGaps or marketSignals are provided, rank ideas using search demand + competitor strength + BrandBridge coverage + competitor content gaps + BrandBridge fit. Prefer topics competitors leave thin and overseas brands actually search for.
Return JSON:
{
  "ideas": [
    {
      "title": "",
      "topic": "",
      "targetKeyword": "",
      "searchIntent": "informational"|"commercial"|"transactional"|"navigational",
      "targetAudience": "overseas manufacturers considering Japan market entry",
      "contentType": "article"|"guide"|"comparison"|"faq",
      "priority": "high"|"medium"|"low",
      "reasoning": "Why write this now; expected traffic/search demand; BrandBridge conversion path (which page to send readers to and why). Include whether improving an existing URL is better than a new article."
    }
  ]
}
Return 6 to 10 ideas, highest priority first. No duplicate of existing URLs unless the idea is explicitly an improvement rewrite.
`.trim();

export const ARTICLE_DRAFT_TASK = `
Write a practical English SEO article draft for overseas brands/manufacturers considering Japan market entry.
Rules:
- Answer the search intent in the first screen.
- Be specific to Japanese B2B distribution, wholesale, partners, import, and commercial terms.
- No generic filler. No fake stats or invented interviews.
- Include a natural BrandBridge path (list brand / Japan opportunities) without aggressive selling.
- Use clear H2/H3, short paragraphs, bullets, at least one comparison or checklist, and FAQ.
Return JSON:
{
  "title": "",
  "slug": "kebab-case-slug",
  "metaTitle": "50-60 chars",
  "metaDescription": "140-160 chars",
  "h1": "",
  "suggestedHeadings": ["H2: ...", "H3: ..."],
  "content": "full markdown article including H1, sections, FAQ, and a short CTA",
  "faq": [{"question": "", "answer": ""}],
  "internalLinks": [{"targetPath": "", "anchor": "", "reason": ""}],
  "cta": "",
  "seoNotes": "editor notes for title/meta/headings/links",
  "geoNotes": "how to make this more extractable for AI search: definitions, FAQ, tables, citations to add",
  "jsonLd": { "article": {}, "faqPage": {} }
}
jsonLd should be valid schema.org JSON objects (Article and FAQPage), not a string.
`.trim();

export const GEO_TASK = `
Propose GEO (generative engine optimization) improvements so AI search systems can extract clear answers from BrandBridge content.
Focus on: direct answers to questions, FAQ, definitions, comparison tables, bullets, structured answers, and where to add sources.
Return JSON:
{
  "summary": "",
  "recommendations": [
    {
      "title": "",
      "description": "",
      "priority": "high"|"medium"|"low",
      "targetUrl": "",
      "question": "",
      "suggestedAnswer": "",
      "format": "faq"|"definition"|"table"|"bullets"|"jsonld",
      "jsonLd": {}
    }
  ]
}
Do not claim we will auto-publish. These are editor suggestions only.
`.trim();

export const INTERNAL_LINKS_TASK = `
Propose internal links between existing BrandBridge public pages (and any draft titles provided).
Each suggestion must use a real target path from the provided catalog.
Return JSON:
{
  "links": [
    {"sourcePath": "", "targetPath": "", "anchor": "", "reason": "", "priority": "high"|"medium"|"low"}
  ]
}
Return 8 to 15 high-quality links. Prefer EN Japan-market-entry cluster and JA for-makers/for-partners/pricing. No circular spam.
`.trim();

export const SOCIAL_TASK = `
Create social/off-platform posts in English promoting a BrandBridge article/topic for overseas brand operators.
Do NOT reuse the same copy across platforms.
- LinkedIn: for overseas founders/export managers; professional, insight-led, 120-220 words, 1 CTA.
- X: 1-2 short posts, information-dense, no hashtag stuffing, max 260 chars each.
- Substack: newsletter-style, 300-500 words, deepens the article, ends with a soft CTA.
- Reddit: helpful answer to a realistic community question (r/Entrepreneur, r/smallbusiness, or export-adjacent). No blatant spam; mention BrandBridge once, only if useful.
Return JSON:
{
  "linkedin": {"text": ""},
  "x": [{"text": ""}],
  "substack": {"subject": "", "text": ""},
  "reddit": {"title": "", "text": ""}
}
`.trim();

export const PR_VIDEO_SCRIPT_TASK = `
Write a short-form (~30 second) product PR video script for one BrandBridge Case.
The product is from an overseas brand/maker and is being introduced for the Japanese market.
This is not an SEO article and not a competitor analysis.

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

Return JSON:
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
}
`.trim();
