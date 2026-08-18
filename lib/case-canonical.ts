/**
 * Public catalog canonicalization for duplicate SKU listings.
 *
 * Cause: `cases.id` is a new UUID on every create, and `sku` has no unique
 * constraint (migration 028). The same maker SKU can therefore appear at
 * multiple `/cases/{uuid}` URLs.
 *
 * Known duplicate (SKU 202686 / Ptit Ninja Multivitamines):
 * keep the live listing, 301 the other UUID. Rows are not deleted.
 */

export const CANONICAL_PTIT_NINJA_CASE_ID =
  "3774182c-a581-4c03-8f6a-c60b9034820c";

/** Duplicate public URL → canonical case id. Do not delete the source row. */
export const KNOWN_CASE_ID_REDIRECTS: Record<string, string> = {
  "7c990b6e-6dc8-49ea-99b8-11da060a4327": CANONICAL_PTIT_NINJA_CASE_ID,
};

export function resolveKnownCanonicalCaseId(caseId: string): string | null {
  return KNOWN_CASE_ID_REDIRECTS[caseId] ?? null;
}

type CanonicalizableCase = {
  id: string;
  makerId: string;
  sku: string | null;
  createdAt: string;
};

/**
 * Keep one public listing per (maker, SKU). Prefer a known canonical id,
 * otherwise the oldest row. Listings without SKU are left unchanged.
 */
export function pickCanonicalPublicCases<T extends CanonicalizableCase>(
  cases: T[],
): T[] {
  const redirected = new Set(Object.keys(KNOWN_CASE_ID_REDIRECTS));
  const visible = cases.filter((item) => !redirected.has(item.id));
  const chosen = new Map<string, T>();
  const withoutSku: T[] = [];

  for (const item of visible) {
    const sku = item.sku?.trim();
    if (!sku) {
      withoutSku.push(item);
      continue;
    }

    const key = `${item.makerId}::${sku.toLowerCase()}`;
    const prev = chosen.get(key);
    if (!prev) {
      chosen.set(key, item);
      continue;
    }
    chosen.set(key, preferCanonicalCase(prev, item));
  }

  const keep = new Set([
    ...withoutSku.map((item) => item.id),
    ...[...chosen.values()].map((item) => item.id),
  ]);

  return visible.filter((item) => keep.has(item.id));
}

function preferCanonicalCase<T extends CanonicalizableCase>(
  a: T,
  b: T,
): T {
  if (a.id === CANONICAL_PTIT_NINJA_CASE_ID) return a;
  if (b.id === CANONICAL_PTIT_NINJA_CASE_ID) return b;
  return new Date(a.createdAt).getTime() <= new Date(b.createdAt).getTime()
    ? a
    : b;
}
