import path from "node:path";
import { copyFile } from "node:fs/promises";
import type { PrVideoCamera, PrVideoScene, PrVideoTransition } from "@/lib/marketing-agent/pr-script";
import { fileExists, runFfmpeg } from "@/lib/marketing-agent/pr-video-ffmpeg";

export type MptMaterialType = "image" | "video";

export type MptSceneJob = {
  sceneNumber: number;
  durationSeconds: number;
  camera: PrVideoCamera;
  transition: PrVideoTransition;
  onScreenText: string;
  narrationText: string;
  materialType: MptMaterialType;
  materialPath: string;
};

const VIDEO_EXT = new Set([".mp4", ".mov", ".webm", ".mkv"]);

export function isVideoPath(filePath: string): boolean {
  return VIDEO_EXT.has(path.extname(filePath).toLowerCase());
}

export function sceneDisplayText(scene: PrVideoScene): string {
  const onScreen = scene.onScreenText.trim();
  if (onScreen) return onScreen;
  return scene.narrationText.replace(/\s+/g, " ").trim();
}

async function renderMotionPlate(input: {
  imagePath: string;
  outFile: string;
  durationSeconds: number;
  kind: "track" | "drift";
}): Promise<boolean> {
  const duration = Math.max(input.durationSeconds, 1.2).toFixed(3);
  const vf =
    input.kind === "track"
      ? `scale=1620:2880:force_original_aspect_ratio=increase,crop=1620:2880,crop=1080:1920:x='(in_w-out_w)*min(t/${duration},1)':y='(in_h-out_h)*0.35',format=yuv420p`
      : `scale=1400:2489:force_original_aspect_ratio=increase,crop=1400:2489,crop=1080:1920:x='(in_w-out_w)/2+0.10*(in_w-out_w)*sin(2*PI*t/${duration})':y='(in_h-out_h)/2+0.08*(in_h-out_h)*cos(2*PI*t/${duration})',format=yuv420p`;

  try {
    await runFfmpeg(
      [
        "-y",
        "-loop",
        "1",
        "-i",
        input.imagePath,
        "-vf",
        vf,
        "-t",
        duration,
        "-r",
        "30",
        "-an",
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-crf",
        "26",
        "-pix_fmt",
        "yuv420p",
        "-movflags",
        "+faststart",
        input.outFile,
      ],
      60_000,
    );
    return await fileExists(input.outFile);
  } catch {
    return false;
  }
}

async function prepareImageForEngine(
  imagePath: string,
  workDir: string,
  index: number,
): Promise<string> {
  const ext = path.extname(imagePath).toLowerCase();
  if (ext === ".webp") {
    const converted = path.join(workDir, `scene-image-${index}.jpg`);
    await runFfmpeg(["-y", "-i", imagePath, "-frames:v", "1", converted], 20_000);
    return converted;
  }
  return imagePath;
}

/**
 * Map BrandBridge scenes onto stills and motion clips.
 * Video lookup is best-effort: missing or failed B-roll never fails the job.
 * `video-first` assigns a real clip to every scene when stock footage exists.
 */
export async function assignSceneMaterials(input: {
  workDir: string;
  scenes: PrVideoScene[];
  imagePaths: string[];
  videoPaths?: string[];
  materialMode?: "mixed" | "video-first";
}): Promise<MptSceneJob[]> {
  const videos = (input.videoPaths ?? []).filter((file) => isVideoPath(file));
  const images = input.imagePaths;
  if (images.length === 0 && videos.length === 0) return [];

  const videoFirst = input.materialMode === "video-first" && videos.length > 0;
  const jobs: MptSceneJob[] = [];

  for (let index = 0; index < input.scenes.length; index += 1) {
    const scene = input.scenes[index]!;
    const imagePath = images.length > 0 ? images[index % images.length]! : "";
    const preparedImage = imagePath
      ? await prepareImageForEngine(imagePath, input.workDir, index)
      : "";
    let materialType: MptMaterialType = preparedImage ? "image" : "video";
    let materialPath = preparedImage;

    const wantVideo = videoFirst || index % 2 === 1;
    if (wantVideo || !preparedImage) {
      const existing =
        videos.length > 0
          ? videos[index % videos.length]
          : undefined;
      if (existing) {
        const dest = path.join(
          input.workDir,
          `scene-video-${index}${path.extname(existing)}`,
        );
        await copyFile(existing, dest);
        materialType = "video";
        materialPath = dest;
      } else if (preparedImage) {
        const plate = path.join(input.workDir, `scene-broll-${index}.mp4`);
        const kind = index % 4 === 1 ? "track" : "drift";
        const made = await renderMotionPlate({
          imagePath: preparedImage,
          outFile: plate,
          durationSeconds: scene.durationSeconds,
          kind,
        });
        if (made) {
          materialType = "video";
          materialPath = plate;
        }
      }
    }

    if (!materialPath) continue;

    jobs.push({
      sceneNumber: scene.sceneNumber,
      durationSeconds: Math.max(scene.durationSeconds, 1.2),
      camera: scene.camera,
      transition: scene.transition,
      onScreenText: sceneDisplayText(scene),
      narrationText: scene.narrationText.trim(),
      materialType,
      materialPath,
    });
  }

  return jobs;
}

export function hasMixedMaterialTypes(jobs: MptSceneJob[]): boolean {
  const types = new Set(jobs.map((job) => job.materialType));
  return types.has("image") && types.has("video");
}
