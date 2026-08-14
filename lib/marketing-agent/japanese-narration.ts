/**
 * Pure checks for spoken Japanese narration. No framework imports.
 * Rejects English dumps and nonsense loops such as "Chinese Chinese Chinese".
 */

function codePoint(char: string): number {
  return char.codePointAt(0) ?? 0;
}

function isHiragana(char: string): boolean {
  const c = codePoint(char);
  return c >= 0x3040 && c <= 0x309f;
}

function isKana(char: string): boolean {
  const c = codePoint(char);
  return c >= 0x3040 && c <= 0x30ff;
}

function isCjk(char: string): boolean {
  const c = codePoint(char);
  return (
    (c >= 0x3040 && c <= 0x30ff) ||
    (c >= 0x4e00 && c <= 0x9faf) ||
    (c >= 0x3400 && c <= 0x4dbf)
  );
}

const REPEATED_LATIN = /\b([A-Za-z]{2,})\b(?:[\s,、.。/|-]+\1\b){2,}/;
const LANGUAGE_DUMP =
  /\b(Chinese|English|Spanish|French|Korean|German|Italian|Portuguese|Language)\b(?:[\s,、.。]+\b(?:Chinese|English|Spanish|French|Korean|German|Italian|Portuguese|Language)\b){1,}/i;

export function japaneseNarrationIssues(text: string): string[] {
  const trimmed = text.replace(/\s+/g, " ").trim();
  const issues: string[] = [];
  if (!trimmed) {
    issues.push("empty");
    return issues;
  }

  const chars = Array.from(trimmed);
  const hiragana = chars.some(isHiragana);
  const kana = chars.some(isKana);
  const jp = chars.filter(isCjk).length;

  if (!hiragana && !kana) {
    issues.push("missing-kana");
  } else if (!hiragana) {
    issues.push("missing-hiragana");
  }
  if (REPEATED_LATIN.test(trimmed) || LANGUAGE_DUMP.test(trimmed)) {
    issues.push("repeated-foreign");
  }
  const chineseHits = trimmed.match(/\bChinese\b/gi);
  if (chineseHits && chineseHits.length >= 2) {
    issues.push("language-dump");
  }
  if (jp < 12) {
    issues.push("too-short-japanese");
  }
  return issues;
}

export function isNaturalJapaneseNarration(text: string): boolean {
  return japaneseNarrationIssues(text).length === 0;
}
