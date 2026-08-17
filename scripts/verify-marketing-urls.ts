import {
  PUBLIC_URL_MISSING,
  findPublishedPage,
  listSocialTargetPages,
  publishedPageForDraftSlug,
  resolvePublishedPageOrThrow,
  rewriteToCanonicalUrl,
  sanitizeSocialPayload,
} from "../lib/marketing-agent/published-urls";
import { assertSocialPayloadUrls } from "../lib/marketing-agent/social-pack";
import {
  OFFICIAL_PUBLIC_ORIGIN,
  containsVercelAppUrl,
  isAllowedSnsPublicUrl,
  toOfficialPublicUrl,
} from "../lib/site";

const vercelDeployment =
  "https://brandbridge-mljj1cmxd-shunai394-9704s-projects.vercel.app";
const jaPath = "/ja/blog/how-to-sell-overseas-brands-in-japan";
const enPath = "/en/japan-market-entry";
const jaOfficial = `${OFFICIAL_PUBLIC_ORIGIN}${jaPath}`;
const enOfficial = `${OFFICIAL_PUBLIC_ORIGIN}${enPath}`;

const failures: string[] = [];

function assert(condition: unknown, message: string) {
  if (!condition) failures.push(message);
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function recordText(value: unknown, key: string): string {
  if (!value || typeof value !== "object") return "";
  const field = (value as Record<string, unknown>)[key];
  return asString(field);
}

const ja = findPublishedPage(jaPath);
const en = findPublishedPage(enPath);
const fromVercel = findPublishedPage(`${vercelDeployment}${jaPath}`);
const invented = publishedPageForDraftSlug("find-japanese-distributor");
const inventedUrl = findPublishedPage(
  "https://brandbridge.co/find-japanese-distributor",
);

assert(ja?.url === jaOfficial, "JA blog must use www.brandbridge.jp");
assert(en?.url === enOfficial, "EN guide must use www.brandbridge.jp");
assert(
  fromVercel?.url === jaOfficial,
  "vercel.app path must rebuild as official JA URL",
);
assert(invented === null, "draft slug must not invent a public URL");
assert(inventedUrl === null, "brandbridge.co must not resolve as official");
assert(
  !containsVercelAppUrl(ja?.url ?? ""),
  "JA catalog URL must not contain vercel.app",
);
assert(isAllowedSnsPublicUrl(jaOfficial), "official JA URL must be allowed");
assert(
  !isAllowedSnsPublicUrl(`${vercelDeployment}${jaPath}`),
  "vercel deployment URL must be forbidden",
);

try {
  resolvePublishedPageOrThrow("find-japanese-distributor");
  failures.push("invented slug must throw");
} catch (error) {
  assert(
    error instanceof Error && error.message === PUBLIC_URL_MISSING,
    `expected ${PUBLIC_URL_MISSING}`,
  );
}

const rewritten = rewriteToCanonicalUrl(
  `Read more: ${vercelDeployment}${enPath}`,
  enOfficial,
);
assert(rewritten.includes(enOfficial), "rewritten text must use official EN URL");
assert(!containsVercelAppUrl(rewritten), "rewritten text must not keep vercel.app");

const dirtyPack = {
  linkedin: { text: `Hello ${vercelDeployment}/en/how-to-sell-in-japan` },
  x: [{ text: `Tweet ${vercelDeployment}${jaPath}` }],
  facebook: { text: `FB ${vercelDeployment}/en` },
  substack: { subject: "Note", text: `Substack ${vercelDeployment}${enPath}` },
  reddit: { title: "R", text: `Reddit ${vercelDeployment}${enPath}` },
  instagram: { caption: `IG ${vercelDeployment}${jaPath}` },
  tiktok: { title: "TT", caption: `TikTok ${vercelDeployment}${enPath}` },
  canonicalUrl: `${vercelDeployment}${enPath}`,
};

const cleaned = sanitizeSocialPayload(dirtyPack, `${vercelDeployment}${enPath}`);
assertSocialPayloadUrls(cleaned, asString(cleaned.canonicalUrl));

const firstTweet = Array.isArray(cleaned.x) ? cleaned.x[0] : null;
const platforms: Array<[string, string]> = [
  ["linkedin", recordText(cleaned.linkedin, "text")],
  ["x", recordText(firstTweet, "text")],
  ["facebook", recordText(cleaned.facebook, "text")],
  ["substack", recordText(cleaned.substack, "text")],
  ["reddit", recordText(cleaned.reddit, "text")],
  ["instagram", recordText(cleaned.instagram, "caption")],
  ["tiktok", recordText(cleaned.tiktok, "caption")],
];

for (const [platform, text] of platforms) {
  assert(text.length > 0, `${platform} copy must exist after sanitize`);
  assert(!containsVercelAppUrl(text), `${platform} must not contain vercel.app`);
  assert(
    text.includes("https://www.brandbridge.jp"),
    `${platform} must include official origin`,
  );
}

assert(
  cleaned.canonicalUrl === enOfficial,
  "sanitized canonicalUrl must be official EN URL",
);
assert(
  cleaned.siteOrigin === OFFICIAL_PUBLIC_ORIGIN,
  "sanitized siteOrigin must be official origin",
);

const socialPages = listSocialTargetPages();
for (const page of socialPages) {
  assert(
    page.url.startsWith(OFFICIAL_PUBLIC_ORIGIN),
    `catalog ${page.path} must use official origin`,
  );
  assert(!containsVercelAppUrl(page.url), `catalog ${page.path} has vercel.app`);
}

assert(
  toOfficialPublicUrl(jaPath) === jaOfficial,
  "toOfficialPublicUrl(JA path) mismatch",
);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("marketing url policy ok");
console.log("ja", ja?.url);
console.log("en", en?.url);
console.log("rewritten", rewritten);
