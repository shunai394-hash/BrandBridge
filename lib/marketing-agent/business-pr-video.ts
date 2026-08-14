import { MarketingAgentError } from "@/lib/marketing-agent/ai";
import {
  generateBusinessPrVideo,
  type BusinessPrImageBytes,
} from "@/lib/marketing-agent/pr-video-core";
import {
  assertSafeProductImageUrl,
  readSafeProductImage,
} from "@/lib/marketing-agent/pr-video-image";
import { normalizePrVideoScript, type PrVideoScript } from "@/lib/marketing-agent/pr-script";

export const MIN_BUSINESS_PR_IMAGES = 2;
export const MAX_BUSINESS_PR_IMAGES = 16;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

function presentText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function contentTypeFromName(name: string, fallback: string): string {
  const lower = name.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  return fallback;
}

function assertImageType(contentType: string, name = ""): string {
  const type = (contentType || contentTypeFromName(name, "")).split(";")[0].trim().toLowerCase();
  if (!ALLOWED_TYPES.has(type) && !/\.(jpe?g|png|webp)$/i.test(name)) {
    throw new MarketingAgentError(
      "INVALID_IMAGE_URL",
      "画像は JPEG / PNG / WebP のみ利用できます。",
    );
  }
  return ALLOWED_TYPES.has(type) ? type : contentTypeFromName(name, "image/jpeg");
}

async function readUploadedImage(
  value: FormDataEntryValue,
): Promise<BusinessPrImageBytes | null> {
  if (typeof value === "string") return null;
  if (typeof Blob === "undefined" || !(value instanceof Blob) || value.size === 0) {
    return null;
  }
  if (value.size > MAX_IMAGE_BYTES) {
    throw new MarketingAgentError(
      "INVALID_IMAGE_URL",
      "画像が大きすぎます。1枚あたり8MBまでです。",
    );
  }
  const name = "name" in value && typeof value.name === "string" ? value.name : "";
  const contentType = assertImageType(value.type || "", name);
  const bytes = Buffer.from(await value.arrayBuffer());
  if (bytes.byteLength < 32) {
    throw new MarketingAgentError("INVALID_IMAGE_URL", "画像ファイルが不正です。");
  }
  return { bytes, contentType };
}

async function readOptionalImageUrls(raw: string): Promise<BusinessPrImageBytes[]> {
  if (!raw.trim()) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    parsed = raw
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  const urls = Array.isArray(parsed)
    ? parsed.map((item) => presentText(item)).filter((item): item is string => item != null)
    : [];

  const images: BusinessPrImageBytes[] = [];
  for (const url of urls) {
    const safe = assertSafeProductImageUrl(url);
    images.push(await readSafeProductImage(safe));
  }
  return images;
}

export async function collectBusinessPrImages(
  form: FormData,
): Promise<BusinessPrImageBytes[]> {
  const uploaded: BusinessPrImageBytes[] = [];
  for (const value of form.getAll("images")) {
    const image = await readUploadedImage(value);
    if (image) uploaded.push(image);
  }
  const fromUrls = await readOptionalImageUrls(String(form.get("imageUrls") ?? ""));
  const images = [...uploaded, ...fromUrls];
  if (images.length > MAX_BUSINESS_PR_IMAGES) {
    throw new MarketingAgentError(
      "INVALID_IMAGE_URL",
      `画像は最大${MAX_BUSINESS_PR_IMAGES}枚までです。`,
    );
  }
  if (images.length < MIN_BUSINESS_PR_IMAGES) {
    throw new MarketingAgentError(
      "MISSING_IMAGE",
      "画像を2枚以上追加してください。商品画像である必要はありません。",
    );
  }
  return images;
}

export async function generateBusinessPrVideoFromForm(input: {
  script: PrVideoScript;
  images: BusinessPrImageBytes[];
  companyName: string;
}) {
  const script = normalizePrVideoScript(input.script);
  if (!script) {
    throw new MarketingAgentError(
      "INVALID_AI_RESPONSE",
      "台本が不正です。先に事業PRの台本を生成してください。",
    );
  }
  const companyName = presentText(input.companyName) || "BrandBridge";
  return generateBusinessPrVideo({
    script,
    images: input.images,
    companyName,
  });
}
