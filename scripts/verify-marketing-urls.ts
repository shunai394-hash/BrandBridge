import {
  PUBLIC_URL_MISSING,
  findPublishedPage,
  publishedPageForDraftSlug,
  resolvePublishedPageOrThrow,
  rewriteToCanonicalUrl,
} from "../lib/marketing-agent/published-urls";

const origin = "https://brandbridge.example";
const livePath = "/en/japan-market-entry/how-to-find-japanese-distributors";
const live = findPublishedPage(livePath, origin);
const invented = publishedPageForDraftSlug("find-japanese-distributor", origin);
const inventedUrl = findPublishedPage(
  "https://brandbridge.co/find-japanese-distributor",
  origin,
);

const failures: string[] = [];

function assert(condition: unknown, message: string) {
  if (!condition) failures.push(message);
}

assert(live?.url === `${origin}${livePath}`, "published distributor page must resolve");
assert(invented === null, "draft slug must not invent a public URL");
assert(inventedUrl === null, "brandbridge.co must not resolve as official");

try {
  resolvePublishedPageOrThrow("find-japanese-distributor", origin);
  failures.push("invented slug must throw");
} catch (error) {
  assert(
    error instanceof Error && error.message === PUBLIC_URL_MISSING,
    `expected ${PUBLIC_URL_MISSING}`,
  );
}

const rewritten = rewriteToCanonicalUrl(
  "Read more: https://brandbridge.co/find-japanese-distributor",
  `${origin}${livePath}`,
  origin,
);
assert(
  rewritten.includes(`${origin}${livePath}`),
  "rewritten text must use official origin + real path",
);
assert(
  !rewritten.includes("brandbridge.co"),
  "rewritten text must not keep brandbridge.co",
);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("marketing url policy ok");
console.log("live", live?.url);
console.log("rewritten", rewritten);
