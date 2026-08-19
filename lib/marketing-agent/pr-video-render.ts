import { probeAudioDuration } from "@/lib/marketing-agent/pr-video-tts";
import { MarketingAgentError } from "@/lib/marketing-agent/ai";
import {
  fileExists,
  runFfmpeg,
} from "@/lib/marketing-agent/pr-video-ffmpeg";
import type { PrVideoScene } from "@/lib/marketing-agent/pr-script";
import {
  directCinematography,
  needsCinematicUpgrade,
} from "@/lib/marketing-agent/cinematography";
import {
  burnSubtitlesOntoVideo,
  resolveSubtitleFont,
  writeNarrationAssFile,
} from "@/lib/marketing-agent/pr-video-subtitles";
import {
  resolvePrVideoEngine,
  type PrVideoEngine,
  type PrVideoProductContext,
} from "@/lib/marketing-agent/pr-video-engine";
import {
  renderPrVideoWithMoneyPrinterTurbo,
} from "@/lib/marketing-agent/pr-video-mpt";
import path from "node:path";

export const VIDEO_WIDTH = 1080;
export const VIDEO_HEIGHT = 1920;
export const VIDEO_FPS = 24;

const BGM_CANDIDATES = [
  path.join(process.cwd(), "public", "audio", "brandbridge-bgm.wav"),
  path.join(process.cwd(), "public", "brandbridge-bgm.wav"),
  path.join(process.cwd(), "brandbridge-bgm.wav"),
];

async function resolveBgmPath(): Promise<string | null> {
  for (const candidate of BGM_CANDIDATES) {
    if (await fileExists(candidate)) {
      return candidate;
    }
  }
  return null;
}

const BGM_VOLUME = 0.12;

type KenBurns = {
  z: string;
  x: string;
  y: string;
};

function cameraToKenBurns(
  camera: PrVideoScene["camera"],
  frames: number,
): KenBurns {
  const n = Math.max(frames, 1);
  const ease = `min(on/${n},1)`;

  switch (camera) {
    case "wide":
      return {
        z: "1.04",
        x: "iw/2-(iw/zoom/2)",
        y: "ih/2-(ih/zoom/2)",
      };
    case "medium":
      return {
        z: `min(1.04+0.0012*on,1.14)`,
        x: "iw/2-(iw/zoom/2)",
        y: `ih/2-(ih/zoom/2)+0.02*(ih-ih/zoom)*sin(on/14)`,
      };
    case "close":
      return {
        z: `min(1.12+0.0016*on,1.24)`,
        x: "iw/2-(iw/zoom/2)",
        y: "(ih-ih/zoom)*0.28",
      };
    case "zoom_in":
      return {
        z: `min(1.02+0.0026*on,1.28)`,
        x: "iw/2-(iw/zoom/2)",
        y: "ih/2-(ih/zoom/2)",
      };
    case "zoom_out":
      return {
        z: `max(1.28-0.0026*on,1.04)`,
        x: "iw/2-(iw/zoom/2)",
        y: "ih/2-(ih/zoom/2)",
      };
    case "pan_left":
      return {
        z: "1.20",
        x: `(iw-iw/zoom)*(1-${ease})`,
        y: "ih/2-(ih/zoom/2)",
      };
    case "pan_right":
      return {
        z: "1.20",
        x: `(iw-iw/zoom)*${ease}`,
        y: "ih/2-(ih/zoom/2)",
      };
    case "tilt_up":
      return {
        z: "1.18",
        x: "iw/2-(iw/zoom/2)",
        y: `(ih-ih/zoom)*(1-${ease})`,
      };
    case "tilt_down":
      return {
        z: "1.18",
        x: "iw/2-(iw/zoom/2)",
        y: `(ih-ih/zoom)*${ease}`,
      };
    case "dolly_in":
      return {
        z: `min(1.06+0.0034*on,1.38)`,
        x: "iw/2-(iw/zoom/2)",
        y: `ih/2-(ih/zoom/2)+0.04*(ih-ih/zoom)*${ease}`,
      };
    case "dolly_out":
      return {
        z: `max(1.34-0.0032*on,1.06)`,
        x: "iw/2-(iw/zoom/2)",
        y: `ih/2-(ih/zoom/2)-0.03*(ih-ih/zoom)*${ease}`,
      };
    case "tracking":
      return {
        z: "1.16",
        x: `(iw-iw/zoom)*${ease}`,
        y: `ih/2-(ih/zoom/2)+0.06*(ih-ih/zoom)*sin(on/16)`,
      };
    case "orbit":
      return {
        z: "1.18",
        x: `iw/2-(iw/zoom/2)+0.16*(iw-iw/zoom)*sin(2*PI*on/${n})`,
        y: `ih/2-(ih/zoom/2)+0.08*(ih-ih/zoom)*cos(2*PI*on/${n})`,
      };
    case "parallax":
      return {
        z: `min(1.08+0.0030*on,1.32)`,
        x: `(iw-iw/zoom)*${ease}`,
        y: `ih/2-(ih/zoom/2)+0.07*(ih-ih/zoom)*sin(on/18)`,
      };
    case "focus_pull":
      return {
        z: `min(1.10+0.0022*on,1.30)`,
        x: "iw/2-(iw/zoom/2)",
        y: `(ih-ih/zoom)*0.32`,
      };
    case "over_shoulder":
      return {
        z: `min(1.16+0.0014*on,1.26)`,
        x: `(iw-iw/zoom)*0.22`,
        y: "(ih-ih/zoom)*0.38",
      };
    case "drift":
      return {
        z: "1.14",
        x: `iw/2-(iw/zoom/2)+0.05*(iw-iw/zoom)*sin(on/13)`,
        y: `ih/2-(ih/zoom/2)+0.04*(ih-ih/zoom)*cos(on/17)`,
      };
    default:
      return {
        z: "1.10",
        x: "iw/2-(iw/zoom/2)",
        y: "ih/2-(ih/zoom/2)",
      };
  }
}

function extraSceneFilters(
  camera: PrVideoScene["camera"],
  frames: number,
): string[] {
  if (camera === "orbit") {
    return [`rotate=0.018*sin(2*PI*n/${Math.max(frames, 1)}):ow=iw:oh=ih:c=black`];
  }
  if (camera === "drift") {
    return [`rotate=0.01*sin(2*PI*n/${Math.max(frames, 1)}):ow=iw:oh=ih:c=black`];
  }
  return [];
}

function transitionToXfade(
  transition: PrVideoScene["transition"],
  previousCamera?: PrVideoScene["camera"],
): string {
  switch (transition) {
    case "fade":
      return "fade";
    case "dissolve":
      return "dissolve";
    case "slide_left":
      return "slideleft";
    case "slide_right":
      return "slideright";
    case "wipe":
      return "wipeleft";
    case "zoom":
      return "zoomin";
    case "motion_blur":
      return "hblur";
    case "match_cut":
      return "fade";
    case "continue":
      if (previousCamera === "pan_right" || previousCamera === "tracking") {
        return "slideright";
      }
      if (previousCamera === "pan_left") {
        return "slideleft";
      }
      if (previousCamera === "tilt_up") {
        return "slideup";
      }
      if (previousCamera === "tilt_down") {
        return "slidedown";
      }
      return "dissolve";
    case "cut":
    default:
      return "fade";
  }
}

function transitionDuration(
  transition: PrVideoScene["transition"],
): number {
  if (transition === "cut" || transition === "match_cut") {
    return 0.04;
  }
  if (transition === "motion_blur") {
    return 0.28;
  }
  return 0.45;
}

async function buildTransitionVideo(
  sceneFiles: string[],
  scenes: PrVideoScene[],
  outFile: string,
): Promise<void> {
  if (sceneFiles.length === 1) {
    await runFfmpeg(
      [
        "-y",
        "-i",
        sceneFiles[0]!,
        "-c",
        "copy",
        outFile,
      ],
      30_000,
    );

    return;
  }

  const inputs: string[] = [];

  for (const file of sceneFiles) {
    inputs.push("-i", file);
  }

  const filters: string[] = [];

  let currentLabel = "[0:v:0]";

  let cumulativeDuration =
    scenes[0]?.durationSeconds ?? 1.2;

  for (
    let i = 1;
    i < sceneFiles.length;
    i += 1
  ) {
    const scene = scenes[i];

    if (!scene) {
      continue;
    }

    const previous = scenes[i - 1];
    const duration =
      transitionDuration(
        scene.transition,
      );

    const transition =
      transitionToXfade(
        scene.transition,
        previous?.camera,
      );

    const nextLabel =
      `[v${i}]`;

    const offset =
      Math.max(
        0,
        cumulativeDuration -
          duration,
      );

    filters.push(
      `${currentLabel}[${i}:v:0]xfade=transition=${transition}:duration=${duration.toFixed(
        3,
      )}:offset=${offset.toFixed(3)}${nextLabel}`,
    );

    currentLabel =
      nextLabel;

    cumulativeDuration =
      cumulativeDuration +
      scene.durationSeconds -
      duration;
  }

  await runFfmpeg(
    [
      "-y",
      ...inputs,
      "-filter_complex",
      filters.join(";"),
      "-map",
      currentLabel,
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
      outFile,
    ],
    60_000,
  );
}

export async function renderPrVideoMp4(input: {
  workDir: string;
  imagePaths: string[];
  audioPath: string;
  scenes: PrVideoScene[];
  outFile: string;
  bgmEnabled?: boolean;
  subtitlesEnabled?: boolean;
  engine?: PrVideoEngine;
  product?: PrVideoProductContext;
  videoPaths?: string[];
  materialMode?: "mixed" | "video-first";
}): Promise<{
  width: number;
  height: number;
  durationSeconds: number;
}> {
  const engine = input.engine ?? resolvePrVideoEngine();
  if (engine === "moneyprinterturbo") {
    try {
      const mpt = await renderPrVideoWithMoneyPrinterTurbo({
        workDir: input.workDir,
        imagePaths: input.imagePaths,
        audioPath: input.audioPath,
        scenes: input.scenes,
        outFile: input.outFile,
        bgmEnabled: input.bgmEnabled,
        subtitlesEnabled: input.subtitlesEnabled,
        product: input.product,
        videoPaths: input.videoPaths,
        materialMode: input.materialMode,
      });
      if (mpt) {
        return mpt;
      }
    } catch (error) {
      if (
        error instanceof MarketingAgentError &&
        (error.code === "MISSING_IMAGE" || error.code === "INVALID_IMAGE_URL")
      ) {
        throw error;
      }
      const detail =
        error instanceof Error ? error.message : "MoneyPrinterTurbo unavailable";
      console.warn(
        `[pr-video] MoneyPrinterTurbo failed, falling back to BrandBridge renderer: ${detail}`,
      );
    }
  }

  if (input.imagePaths.length === 0 && (input.videoPaths?.length ?? 0) === 0) {
    throw new MarketingAgentError(
      "MISSING_IMAGE",
      "画像が指定されていません。",
    );
  }

  if (input.scenes.length === 0) {
    throw new MarketingAgentError(
      "RENDER_FAILURE",
      "動画シーンが指定されていません。",
    );
  }

  const directedScenes = needsCinematicUpgrade(input.scenes)
    ? directCinematography(input.scenes, input.outFile)
    : input.scenes;

  let kenBurnsImages = input.imagePaths;
  if (
    input.materialMode !== "video-first" &&
    kenBurnsImages.length === 0 &&
    (input.videoPaths?.length ?? 0) > 0
  ) {
    kenBurnsImages = [];
    for (let index = 0; index < (input.videoPaths ?? []).length; index += 1) {
      const videoPath = input.videoPaths?.[index];
      if (!videoPath) continue;
      const still = path.join(input.workDir, `fallback-still-${index}.jpg`);
      try {
        await runFfmpeg(
          ["-y", "-i", videoPath, "-ss", "0.4", "-frames:v", "1", still],
          20_000,
        );
        if (await fileExists(still)) kenBurnsImages.push(still);
      } catch {
        continue;
      }
    }
  }

  if (
    kenBurnsImages.length === 0 &&
    (input.videoPaths?.length ?? 0) === 0
  ) {
    throw new MarketingAgentError(
      "MISSING_IMAGE",
      "画像が指定されていません。",
    );
  }

  const sceneFiles: string[] = [];

  for (
    let i = 0;
    i < directedScenes.length;
    i += 1
  ) {
    const scene =
      directedScenes[i];

    if (!scene) {
      continue;
    }

    const imagePath =
      kenBurnsImages[
        i % kenBurnsImages.length
      ];

    const stockVideo =
      input.materialMode === "video-first" &&
      (input.videoPaths?.length ?? 0) > 0
        ? input.videoPaths![i % input.videoPaths!.length]
        : undefined;

    if (!imagePath && !stockVideo) {
      continue;
    }

    const duration =
      Math.max(
        scene.durationSeconds,
        1.2,
      );

    const sceneFile =
      path.join(
        input.workDir,
        `scene-${i}.mp4`,
      );

    if (stockVideo) {
      await runFfmpeg(
        [
          "-y",
          "-stream_loop",
          "-1",
          "-i",
          stockVideo,
          "-vf",
          `scale=${VIDEO_WIDTH}:${VIDEO_HEIGHT}:force_original_aspect_ratio=increase,crop=${VIDEO_WIDTH}:${VIDEO_HEIGHT},fps=${VIDEO_FPS},format=yuv420p`,
          "-t",
          duration.toFixed(3),
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
          sceneFile,
        ],
        60_000,
      );
      sceneFiles.push(sceneFile);
      continue;
    }

    if (!imagePath) {
      continue;
    }

    const frames =
      Math.max(
        Math.round(
          duration * VIDEO_FPS,
        ),
        VIDEO_FPS,
      );

    const kb =
      cameraToKenBurns(
        scene.camera,
        frames,
      );

    const vf = [
      `scale=${VIDEO_WIDTH}:${VIDEO_HEIGHT}:force_original_aspect_ratio=increase`,
      `crop=${VIDEO_WIDTH}:${VIDEO_HEIGHT}`,
      `zoompan=z='${kb.z}':x='${kb.x}':y='${kb.y}':d=1:s=${VIDEO_WIDTH}x${VIDEO_HEIGHT}:fps=${VIDEO_FPS}`,
      ...extraSceneFilters(scene.camera, frames),
      "format=yuv420p",
    ].join(",");

    await runFfmpeg(
      [
        "-y",
        "-loop",
        "1",
        "-framerate",
        String(VIDEO_FPS),
        "-i",
        imagePath,
        "-vf",
        vf,
        "-t",
        duration.toFixed(3),
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
        sceneFile,
      ],
      60_000,
    );

    sceneFiles.push(sceneFile);
  }

  if (sceneFiles.length === 0) {
    throw new MarketingAgentError(
      "RENDER_FAILURE",
      "動画シーンを生成できませんでした。",
    );
  }

  const transitionedFile =
    path.join(
      input.workDir,
      "transitioned.mp4",
    );

  await buildTransitionVideo(
    sceneFiles,
    directedScenes,
    transitionedFile,
  );

  const videoDur =
    await probeAudioDuration(
      transitionedFile,
    );

  const narrationDur =
    await probeAudioDuration(
      input.audioPath,
    );

  if (
    !Number.isFinite(videoDur) ||
    videoDur < 1
  ) {
    throw new MarketingAgentError(
      "RENDER_FAILURE",
      "生成した動画の長さを確認できません。",
    );
  }

  if (
    !Number.isFinite(narrationDur) ||
    narrationDur < 0
  ) {
    throw new MarketingAgentError(
      "RENDER_FAILURE",
      "ナレーションの長さを確認できません。",
    );
  }

  const bgmEnabled =
    input.bgmEnabled ?? true;
  const subtitlesEnabled =
    input.subtitlesEnabled ?? true;
  const bgmPath = bgmEnabled ? await resolveBgmPath() : null;

  if (bgmEnabled && !bgmPath) {
    throw new MarketingAgentError(
      "RENDER_FAILURE",
      "BrandBridge BGMファイルが見つかりません。",
    );
  }

  let videoForMux = transitionedFile;

  if (subtitlesEnabled) {
    const font = await resolveSubtitleFont();
    const assPath = path.join(input.workDir, "narration.ass");
    const subtitledFile = path.join(
      input.workDir,
      "subtitled.mp4",
    );
    const subtitleDuration = Math.max(
      videoDur,
      narrationDur,
    );

    if (font) {
      try {
        const wrote = await writeNarrationAssFile({
          scenes: directedScenes,
          durationSeconds: subtitleDuration,
          outFile: assPath,
          width: VIDEO_WIDTH,
          height: VIDEO_HEIGHT,
          fontFamily: font.family,
        });

        if (wrote) {
          await burnSubtitlesOntoVideo({
            videoPath: transitionedFile,
            assPath,
            fontsDir: font.fontsDir,
            outFile: subtitledFile,
          });
          videoForMux = subtitledFile;
        }
      } catch {
        videoForMux = transitionedFile;
      }
    }
  }

  const finalDuration =
    Math.max(
      videoDur,
      narrationDur,
    );

  const narrationInput =
    input.audioPath;

  const muxArgs: string[] = [
    "-y",

    "-i",
    videoForMux,

    "-i",
    narrationInput,
  ];

  if (bgmEnabled && bgmPath) {
    muxArgs.push(
      "-stream_loop",
      "-1",
      "-i",
      bgmPath,
    );
  }

  const filterParts: string[] = [
    `[1:a]apad=whole_dur=${finalDuration.toFixed(3)}[narration]`,
  ];

  if (bgmEnabled) {
    filterParts.push(
      `[2:a]volume=${BGM_VOLUME.toFixed(2)},atrim=duration=${finalDuration.toFixed(3)},asetpts=N/SR/TB[bgm]`,
      `[narration][bgm]amix=inputs=2:duration=longest:dropout_transition=2:normalize=0[aout]`,
    );
  } else {
    filterParts.push(
      `[narration]atrim=duration=${finalDuration.toFixed(3)},asetpts=N/SR/TB[aout]`,
    );
  }

  muxArgs.push(
    "-filter_complex",
    filterParts.join(";"),

    "-map",
    "0:v:0",

    "-map",
    "[aout]",

    "-t",
    finalDuration.toFixed(3),

    "-c:v",
    "copy",

    "-c:a",
    "aac",

    "-b:a",
    "160k",

    "-ac",
    "2",

    "-ar",
    "44100",

    "-movflags",
    "+faststart",

    input.outFile,
  );

  await runFfmpeg(
    muxArgs,
    60_000,
  );

  const finalDur =
    await probeAudioDuration(
      input.outFile,
    );

  if (
    !(await fileExists(
      input.outFile,
    )) ||
    !Number.isFinite(finalDur) ||
    finalDur < 1
  ) {
    throw new MarketingAgentError(
      "RENDER_FAILURE",
      "MP4 output was incomplete.",
    );
  }

  return {
    width: VIDEO_WIDTH,
    height: VIDEO_HEIGHT,
    durationSeconds: finalDur,
  };
}
