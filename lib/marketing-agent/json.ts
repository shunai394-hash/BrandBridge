export function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

export function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

export function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function stripFences(raw: string): string {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fenced?.[1]) return fenced[1].trim();
  const start = trimmed.indexOf("{");
  const startArr = trimmed.indexOf("[");
  if (start === -1 && startArr === -1) return trimmed;
  if (start === -1) return trimmed.slice(startArr);
  if (startArr === -1 || start < startArr) return trimmed.slice(start);
  return trimmed.slice(startArr);
}

export function parseJsonValue(raw: string): unknown {
  const candidate = stripFences(raw);
  try {
    return JSON.parse(candidate);
  } catch {
    const repaired = candidate
      .replace(/,\s*([}\]])/g, "$1")
      .replace(/[\u201c\u201d]/g, '"')
      .replace(/[\u2018\u2019]/g, "'");
    return JSON.parse(repaired);
  }
}

export function parseJsonRecord(raw: string): Record<string, unknown> {
  const parsed = parseJsonValue(raw);
  const record = asRecord(parsed);
  if (Object.keys(record).length > 0) return record;
  if (Array.isArray(parsed)) return { items: parsed };
  throw new Error("AIの応答がJSONオブジェクトではありません");
}

export function parseJsonArray(raw: string): unknown[] {
  const parsed = parseJsonValue(raw);
  if (Array.isArray(parsed)) return parsed;
  const record = asRecord(parsed);
  if (Array.isArray(record.items)) return record.items;
  if (Array.isArray(record.ideas)) return record.ideas;
  if (Array.isArray(record.recommendations)) return record.recommendations;
  throw new Error("AIの応答がJSON配列ではありません");
}
