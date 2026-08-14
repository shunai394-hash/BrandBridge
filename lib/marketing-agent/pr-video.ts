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
import type { Case } from "@/lib/types";

export {
  generatePrVideoFromRemote,
  scaleSceneDurations,
  type PrVideoRenderResult,
};

export function caseImageUrl(caseItem: Case): string | null {
  const gallery = caseItem.images?.[0]?.imageUrl?.trim();
  if (gallery) return gallery;
  const legacy = caseItem.productImageUrl?.trim();
  return legacy || null;
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

  const imageRaw = caseImageUrl(caseItem);
  if (!imageRaw) {
    throw new MarketingAgentError(
      "MISSING_IMAGE",
      "This product has no image. Add one product image and try again.",
    );
  }
  const safeImage = assertSafeProductImageUrl(imageRaw);

  return renderPrVideoWithImage({
    script,
    safeImage,
    productName: caseItem.productName || caseItem.id,
  });
}
