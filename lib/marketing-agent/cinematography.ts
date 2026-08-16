import type {
  PrVideoCamera,
  PrVideoScene,
  PrVideoTransition,
} from "@/lib/marketing-agent/pr-script";

export type SceneVisualKind =
  | "city_night"
  | "city_day"
  | "office"
  | "person"
  | "street"
  | "product"
  | "closing"
  | "interior";

const CAMERA_FAMILY: Record<PrVideoCamera, string> = {
  wide: "static",
  medium: "static",
  close: "static",
  zoom_in: "zoom",
  zoom_out: "zoom",
  pan_left: "pan",
  pan_right: "pan",
  tilt_up: "tilt",
  tilt_down: "tilt",
  dolly_in: "dolly",
  dolly_out: "dolly",
  tracking: "lateral",
  orbit: "orbit",
  parallax: "depth",
  focus_pull: "focus",
  over_shoulder: "character",
  drift: "micro",
};

const MOTION_FOR_KIND: Record<SceneVisualKind, PrVideoCamera[]> = {
  city_night: ["parallax", "drift", "tilt_up", "dolly_in", "tracking"],
  city_day: ["tracking", "parallax", "pan_right", "dolly_out", "tilt_down"],
  office: ["orbit", "over_shoulder", "focus_pull", "dolly_in", "pan_left"],
  person: ["orbit", "focus_pull", "dolly_in", "over_shoulder", "close"],
  street: ["tracking", "pan_left", "parallax", "dolly_out", "tilt_up"],
  product: ["focus_pull", "dolly_in", "orbit", "zoom_in", "drift"],
  closing: ["dolly_in", "focus_pull", "close", "zoom_in", "medium"],
  interior: ["pan_right", "tilt_down", "orbit", "medium", "dolly_out"],
};

function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash = Math.imul(hash ^ value.charCodeAt(i), 16777619);
  }
  return hash >>> 0;
}

export function classifySceneVisual(scene: PrVideoScene): SceneVisualKind {
  const text = [
    scene.location,
    scene.visual,
    scene.character,
    scene.action,
  ]
    .join(" ")
    .toLowerCase();

  if (/closing|cta|logo|エンド|締め|brandbridge/.test(text)) return "closing";
  if (/夜|neon|night|light|ボケ|イルミ|夜景/.test(text)) return "city_night";
  if (/東京|渋谷|街|city|street|tokyo|通り|交差点|看板/.test(text)) {
    return /person|人物|人|歩く|talk/.test(text) ? "street" : "city_day";
  }
  if (/office|オフィス|会議|desk|商談|打ち合わせ/.test(text)) return "office";
  if (/product|商品|ボトル|パッケージ/.test(text)) return "product";
  if (/人物|person|founder|担当|話す|顔|close/.test(text)) return "person";
  if (/室内|home|部屋|スタジオ/.test(text)) return "interior";
  return "interior";
}

function rotateList<T>(items: T[], offset: number): T[] {
  if (items.length === 0) return items;
  const start = offset % items.length;
  return [...items.slice(start), ...items.slice(0, start)];
}

function pickCamera(input: {
  kind: SceneVisualKind;
  previous?: PrVideoCamera;
  used: Set<PrVideoCamera>;
  salt: number;
  sceneIndex: number;
}): PrVideoCamera {
  const ranked = rotateList(
    MOTION_FOR_KIND[input.kind],
    (input.salt + input.sceneIndex * 17) % MOTION_FOR_KIND[input.kind].length,
  );
  const prevFamily = input.previous ? CAMERA_FAMILY[input.previous] : null;
  const preferred = ranked.filter((camera) => {
    if (input.used.has(camera)) return false;
    if (prevFamily && CAMERA_FAMILY[camera] === prevFamily) return false;
    return true;
  });
  return preferred[0] ?? ranked.find((camera) => !input.used.has(camera)) ?? ranked[0]!;
}

function pickTransition(input: {
  sceneIndex: number;
  isLast: boolean;
  previousCamera?: PrVideoCamera;
  camera: PrVideoCamera;
  kind: SceneVisualKind;
  previousTransition?: PrVideoTransition;
  salt: number;
}): PrVideoTransition {
  if (input.sceneIndex === 0) return "cut";
  if (input.isLast) return "fade";

  const candidates: PrVideoTransition[] = [];
  if (input.previousCamera === "pan_right" || input.camera === "tracking") {
    candidates.push("slide_left", "continue");
  }
  if (input.previousCamera === "pan_left") {
    candidates.push("slide_right", "continue");
  }
  if (input.kind === "city_night" || input.kind === "city_day") {
    candidates.push("dissolve", "fade");
  }
  if (input.kind === "person" || input.kind === "office") {
    candidates.push("match_cut", "dissolve");
  }
  if (input.camera === "dolly_in" || input.previousCamera === "dolly_in") {
    candidates.push("zoom", "motion_blur");
  }
  candidates.push("dissolve", "wipe", "cut", "motion_blur");

  const unique = candidates.filter(
    (item, index) =>
      candidates.indexOf(item) === index && item !== input.previousTransition,
  );
  return unique[(input.salt + input.sceneIndex * 11) % unique.length] ?? "dissolve";
}

export function needsCinematicUpgrade(scenes: PrVideoScene[]): boolean {
  if (scenes.length < 2) return false;
  const unique = new Set(scenes.map((scene) => scene.camera));
  if (unique.size <= 2) return true;
  const basic = new Set<PrVideoCamera>([
    "wide",
    "medium",
    "close",
    "zoom_in",
    "zoom_out",
    "pan_left",
    "pan_right",
  ]);
  return scenes.every((scene) => basic.has(scene.camera));
}

export function directCinematography(
  scenes: PrVideoScene[],
  saltSource = "",
): PrVideoScene[] {
  if (scenes.length === 0) return scenes;
  const salt = hashString(
    saltSource ||
      scenes
        .map((scene) => `${scene.location}|${scene.visual}|${scene.action}`)
        .join("||"),
  );
  const used = new Set<PrVideoCamera>();
  let previous: PrVideoCamera | undefined;
  let previousTransition: PrVideoTransition | undefined;

  return scenes.map((scene, index) => {
    const kind = classifySceneVisual(scene);
    const camera = pickCamera({
      kind,
      previous,
      used,
      salt,
      sceneIndex: index,
    });
    const transition = pickTransition({
      sceneIndex: index,
      isLast: index === scenes.length - 1,
      previousCamera: previous,
      camera,
      kind,
      previousTransition,
      salt,
    });
    used.add(camera);
    previous = camera;
    previousTransition = transition;
    return { ...scene, camera, transition };
  });
}
