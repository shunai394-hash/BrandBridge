import { looksLikeJapanese } from "@/lib/en-case-catalog";
import {
  ENGLISH_CASE_MARKER,
  ENGLISH_INQUIRY_MARKER,
} from "@/lib/inquiry-language";

const LEGACY_EN_INQUIRY = "[English inquiry / Overseas brand]";

/** Remove internal language markers so they never reach public UI. */
export function stripInternalLangMarkers(text: string): string {
  return text
    .split(ENGLISH_CASE_MARKER).join("")
    .split(ENGLISH_INQUIRY_MARKER).join("")
    .split(LEGACY_EN_INQUIRY).join("")
    .replace(/\[lang:(?:en|ja)\]/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Japanese public pages: strip markers and hide English-only blobs.
 * Product names that are legitimately English (no JP script) are kept when short.
 */
export function publicJaText(
  value: string | null | undefined,
  options?: { allowEnglishName?: boolean },
): string {
  const stripped = stripInternalLangMarkers(value ?? "");
  if (!stripped) return "";
  if (looksLikeJapanese(stripped)) return stripped;
  if (options?.allowEnglishName && stripped.length <= 80) return stripped;
  return "";
}
