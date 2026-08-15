import { probeAudioDuration } from "@/lib/marketing-agent/pr-video-tts";
import { MarketingAgentError } from "@/lib/marketing-agent/ai";
import {
  fileExists,
  runFfmpeg,
} from "@/lib/marketing-agent/pr-video-ffmpeg";
import type { PrVideoScene } from "@/lib/marketing-agent/pr-script";
import path from "node:path";

export const VIDEO_WIDTH = 1080;
export const VIDEO_HEIGHT = 1920;
export const VIDEO_FPS = 24;

const BGM_PATH = path.join(
  process.cwd(),
  "public",
  "audio",
  "brandbridge-bgm.wav",
);

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

  switch (camera) {
    case "wide":
      return {
        z: "1.01",
        x: "iw/2-(iw/zoom/2)",
        y: "ih/2-(ih/zoom/2)",
      };

    case "medium":
      return {
        z: "min(1+0.0008*on,1.10)",
        x: "iw/2-(iw/zoom/2)",
        y: "ih/2-(ih/zoom/2)",
      };

    case "close":
      return {
        z: "min(1+0.0018*on,1.22)",
        x: "iw/2-(iw/zoom/2)",
        y: "ih/2-(ih/zoom/2)",
      };

    case "zoom_in":
      return {
        z: "min(1+0.0030*on,1.35)",
        x: "iw/2-(iw/zoom/2)",
        y: "ih/2-(ih/zoom/2)",
      };

    case "zoom_out":
      return {
        z: "max(1.32-0.0030*on,1.02)",
        x: "iw/2-(iw/zoom/2)",
        y: "ih/2-(ih/zoom/2)",
      };

    case "pan_left":
      return {
        z: "1.18",
        x: `(iw-iw/zoom)*(1-min(on/${n},1))`,
        y: "ih/2-(ih/zoom/2)",
      };

    case "pan_right":
      return {
        z: "1.18",
        x: `(iw-iw/zoom)*min(on/${n},1)`,
        y: "ih/2-(ih/zoom/2)",
      };

    case "tracking":
      return {
        z: "1.14",
        x: `(iw-iw/zoom)*min(on/${n},1)`,
        y: `(ih-ih/zoom)*min(on/${n},1)`,
      };

    case "over_shoulder":
      return {
        z: "1.20",
        x: "iw/2-(iw/zoom/2)",
        y: "(ih-ih/zoom)*0.35",
      };

    default:
      return {
        z: "1.08",
        x: "iw/2-(iw/zoom/2)",
        y: "ih/2-(ih/zoom/2)",
      };
  }
}

function transitionToXfade(
  transition: PrVideoScene["transition"],
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

    case "cut":
    default:
      return "fade";
  }
}

function transitionDuration(
  transition: PrVideoScene["transition"],
): number {
  if (transition === "cut") {
    return 0.01;
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

    const duration =
      transitionDuration(
        scene.transition,
      );

    const transition =
      transitionToXfade(
        scene.transition,
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
}): Promise<{
  width: number;
  height: number;
  durationSeconds: number;
}> {
  if (input.imagePaths.length === 0) {
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

  const sceneFiles: string[] = [];

  for (
    let i = 0;
    i < input.scenes.length;
    i += 1
  ) {
    const scene =
      input.scenes[i];

    if (!scene) {
      continue;
    }

    const imagePath =
      input.imagePaths[
        i % input.imagePaths.length
      ];

    if (!imagePath) {
      continue;
    }

    const duration =
      Math.max(
        scene.durationSeconds,
        1.2,
      );

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

    const sceneFile =
      path.join(
        input.workDir,
        `scene-${i}.mp4`,
      );

    const vf = [
      `scale=${VIDEO_WIDTH}:${VIDEO_HEIGHT}:force_original_aspect_ratio=increase`,
      `crop=${VIDEO_WIDTH}:${VIDEO_HEIGHT}`,
      `zoompan=z='${kb.z}':x='${kb.x}':y='${kb.y}':d=1:s=${VIDEO_WIDTH}x${VIDEO_HEIGHT}:fps=${VIDEO_FPS}`,
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
    input.scenes,
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

  if (
    bgmEnabled &&
    !(await fileExists(BGM_PATH))
  ) {
    throw new MarketingAgentError(
      "RENDER_FAILURE",
      "BrandBridge BGMファイルが見つかりません。",
    );
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
    transitionedFile,

    "-i",
    narrationInput,
  ];

  if (bgmEnabled) {
    muxArgs.push(
      "-stream_loop",
      "-1",
      "-i",
      BGM_PATH,
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
