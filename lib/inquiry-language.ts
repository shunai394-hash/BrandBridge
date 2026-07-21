/** Marker embedded in inquiry message body (no DB column). */
export const ENGLISH_INQUIRY_MARKER = "[lang:en]";

/** Same marker embedded in English-registered case description/offer (no DB column). */
export const ENGLISH_CASE_MARKER = "[lang:en]";

/** Legacy marker from early English contact form. */
const ENGLISH_INQUIRY_MARKER_LEGACY = "[English inquiry / Overseas brand]";

export type InquiryLanguage = "en" | "ja";

export function detectInquiryLanguage(message: string): InquiryLanguage {
  const text = message ?? "";
  if (
    text.includes(ENGLISH_INQUIRY_MARKER) ||
    text.includes(ENGLISH_INQUIRY_MARKER_LEGACY)
  ) {
    return "en";
  }
  return "ja";
}

export function inquiryLanguageLabel(message: string): "English" | "Japanese" {
  return detectInquiryLanguage(message) === "en" ? "English" : "Japanese";
}

/** Detect English product listing from existing text fields (no schema change). */
export function detectCaseLanguage(
  text: string | null | undefined,
): InquiryLanguage {
  const t = text ?? "";
  if (
    t.includes(ENGLISH_CASE_MARKER) ||
    t.includes(ENGLISH_INQUIRY_MARKER_LEGACY)
  ) {
    return "en";
  }
  return "ja";
}

export function caseLanguageLabel(
  text: string | null | undefined,
): "English" | "Japanese" {
  return detectCaseLanguage(text) === "en" ? "English" : "Japanese";
}

/**
 * Product ID embedded in English contact message body (no DB column).
 * Matches: `Product ID: …` or `?product=` / `&product=` in Source line.
 */
export function extractInquiryProductId(message: string): string | null {
  const text = message ?? "";
  const fromLine = text.match(/Product ID:\s*([^\s\n]+)/i);
  if (fromLine?.[1]?.trim()) return fromLine[1].trim();

  const fromQuery = text.match(/[?&]product=([^&\s\n]+)/i);
  if (fromQuery?.[1]?.trim()) {
    try {
      return decodeURIComponent(fromQuery[1].trim());
    } catch {
      return fromQuery[1].trim();
    }
  }
  return null;
}

/** Product display name from English inquiry message (no DB column). */
export function extractInquiryProductName(message: string): string | null {
  const text = message ?? "";
  const fromLine = text.match(/Product Name:\s*(.+)/i);
  if (fromLine?.[1]?.trim()) {
    const name = fromLine[1].trim();
    if (name && name !== "(not specified)") return name;
  }
  return null;
}
