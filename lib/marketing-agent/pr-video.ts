import { getCaseById } from "@/lib/cases";
import { MarketingAgentError } from "@/lib/marketing-agent/ai";
import { normalizePrVideoScript, type PrVideoScript } from "@/lib/marketing-agent/pr-script";
import {
  generatePrVideoFromRemote,
  renderPrVideoWithImage,
  scaleSceneDurations,
  type PrVideoRenderResult,
} from "@/lib/marketing-agent/pr-video-core";
import { assertSafeProductImageUrl } from "@/lib/marketing-agent/pr-video-image";
import { assertFfmpegAvailable } from "@/lib/marketing-agent/pr-video-ffmpeg";
import type { PrVideoProductContext } from "@/lib/marketing-agent/pr-video-engine";
import type { Case } from "@/lib/types";
import path from "node:path";

export {
  generatePrVideoFromRemote,
  scaleSceneDurations,
  type PrVideoRenderResult,
};

export function caseImageUrl(caseItem: Case): string | null {
  return caseImageUrls(caseItem)[0] ?? null;
}

export function caseImageUrls(caseItem: Case): string[] {
  const urls: string[] = [];
  const seen = new Set<string>();
  const push = (raw: string | null | undefined) => {
    const value = raw?.trim();
    if (!value || seen.has(value)) return;
    seen.add(value);
    urls.push(value);
  };
  for (const image of caseItem.images ?? []) {
    push(image.imageUrl);
  }
  push(caseItem.productImageUrl);
  return urls;
}

export function caseLocalVideoPaths(caseItem: Case): string[] {
  const raw = caseItem.productVideoUrl?.trim();
  if (!raw || !raw.startsWith("/")) return [];
  if (raw.includes("\\") || raw.includes("\0")) return [];
  const ext = path.extname(raw).toLowerCase();
  if (![".mp4", ".mov", ".webm", ".mkv"].includes(ext)) return [];
  const publicRoot = path.resolve(/* turbopackIgnore: true */ process.cwd(), "public");
  const resolved = path.resolve(publicRoot, `.${raw}`);
  if (resolved !== publicRoot && !resolved.startsWith(publicRoot + path.sep)) {
    return [];
  }
  return [resolved];
}

export function productContextFromCase(
  caseItem: Case,
  script?: PrVideoScript,
): PrVideoProductContext {
  return {
    productName: caseItem.productName || caseItem.id,
    brandName: caseItem.brandName,
    category: caseItem.category,
    description: caseItem.description || caseItem.summary,
    country:
      caseItem.shipFrom ||
      caseItem.targetCountry ||
      caseItem.region ||
      caseItem.makerHeadquarters,
    moq: caseItem.minOrder,
    sellingPoint: caseItem.productStrengths || caseItem.productFeatures,
    cta: script?.cta ?? null,
  };
}

export async function generatePrVideoMp4(input: {
  caseId: string;
  script: PrVideoScript;
}): Promise<PrVideoRenderResult> {
  await assertFfmpegAvailable();

  const script = normalizePrVideoScript(input.script);
  if (!script) {
    throw new MarketingAgentError(
      "INVALID_AI_RESPONSE",
      "Invalid PR script. Generate the script again before creating a video.",
    );
  }

  const caseItem = await getCaseById(input.caseId);
  if (!caseItem) {
    throw new MarketingAgentError(
      "INVALID_CASE",
      "Could not load this product. Generation was not started.",
    );
  }

  const imageRaws = caseImageUrls(caseItem);
  if (imageRaws.length === 0) {
    throw new MarketingAgentError(
      "MISSING_IMAGE",
      "This product has no image. Add one product image and try again.",
    );
  }
  const safeImages = [];
  for (const url of imageRaws) {
    try {
      safeImages.push(assertSafeProductImageUrl(url));
    } catch {
      continue;
    }
  }
  const [primary, ...extra] = safeImages;
  if (!primary) {
    throw new MarketingAgentError(
      "MISSING_IMAGE",
      "This product has no image. Add one product image and try again.",
    );
  }

  return renderPrVideoWithImage({
    script,
    safeImage: primary,
    extraSafeImages: extra,
    extraVideoPaths: caseLocalVideoPaths(caseItem),
    productName: caseItem.productName || caseItem.id,
    product: productContextFromCase(caseItem, script),
  });
}
