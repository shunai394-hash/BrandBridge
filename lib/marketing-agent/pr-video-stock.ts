import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { MarketingAgentError } from "@/lib/marketing-agent/ai";
import { fileExists } from "@/lib/marketing-agent/pr-video-ffmpeg";
import { probeMoneyPrinterTurbo } from "@/lib/marketing-agent/pr-video-mpt";
import type { PrVideoScene } from "@/lib/marketing-agent/pr-script";

const execFileAsync = promisify(execFile);

export type StockProvider =
  | "pexels"
  | "pixabay"
  | "coverr"
  | "mixkit"
  | "local"
  | "none";

export type StockClip = {
  path: string;
  provider: Exclude<StockProvider, "none">;
  searchTerm: string;
  sourceUrl?: string;
};

export type StockFetchResult = {
  clips: StockClip[];
  provider: StockProvider;
  keywords: string[][];
  reason?: string;
};

const HELPER_RELATIVE = path.join(
  "services",
  "moneyprinterturbo",
  "search_stock.py",
);

const MAX_CLIP_BYTES = 28 * 1024 * 1024;

type PublicCatalogEntry = {
  keywords: string[];
  urls: string[];
};

/**
 * No-key live-action fallback. Curated public Pexels video files
 * (https://www.pexels.com/license/). When PEXELS_API_KEY is set,
 * MoneyPrinterTurbo search is used instead.
 */
const PUBLIC_STOCK_CATALOG: PublicCatalogEntry[] = [
  {
    keywords: ["tokyo", "city", "skyline", "japan", "district", "street", "night"],
    urls: [
      "https://videos.pexels.com/video-files/856973/856973-hd_1280_720_25fps.mp4",
      "https://videos.pexels.com/video-files/857195/857195-hd_1280_720_25fps.mp4",
      "https://videos.pexels.com/video-files/855564/855564-hd_1280_720_24fps.mp4",
    ],
  },
  {
    keywords: ["office", "business", "professional", "laptop", "meeting", "b2b", "people"],
    urls: [
      "https://videos.pexels.com/video-files/3045163/3045163-hd_1920_1080_25fps.mp4",
      "https://videos.pexels.com/video-files/3209298/3209298-hd_1280_720_25fps.mp4",
      "https://videos.pexels.com/video-files/3129671/3129671-hd_1280_720_30fps.mp4",
    ],
  },
  {
    keywords: ["retail", "store", "shop", "shelf", "product"],
    urls: [
      "https://videos.pexels.com/video-files/3571264/3571264-hd_1280_720_30fps.mp4",
      "https://videos.pexels.com/video-files/5752729/5752729-hd_1280_720_30fps.mp4",
    ],
  },
  {
    keywords: ["trade", "shipping", "container", "port", "global", "warehouse", "ocean"],
    urls: [
      "https://videos.pexels.com/video-files/1409899/1409899-hd_1280_720_25fps.mp4",
      "https://videos.pexels.com/video-files/1093662/1093662-hd_1280_720_30fps.mp4",
    ],
  },
  {
    keywords: ["handshake", "partnership", "cta", "closing", "skyline"],
    urls: [
      "https://videos.pexels.com/video-files/3195394/3195394-hd_1280_720_25fps.mp4",
      "https://videos.pexels.com/video-files/7578541/7578541-hd_1280_720_30fps.mp4",
    ],
  },
];

function envKey(name: string): string {
  return process.env[name]?.trim() || "";
}

export function stockApiKeys(): {
  pexels: string;
  pixabay: string;
  coverr: string;
} {
  return {
    pexels: envKey("PEXELS_API_KEY") || envKey("PEXELS_API_KEYS").split(",")[0]?.trim() || "",
    pixabay: envKey("PIXABAY_API_KEY") || envKey("PIXABAY_API_KEYS").split(",")[0]?.trim() || "",
    coverr: envKey("COVERR_API_KEY") || envKey("COVERR_API_KEYS").split(",")[0]?.trim() || "",
  };
}

export function sceneSearchTerms(scene: PrVideoScene): string[] {
  const fromScene = (scene.searchKeywords ?? [])
    .map((item) => item.trim())
    .filter(Boolean);
  if (fromScene.length > 0) return fromScene.slice(0, 4);
  const prompt = (scene.visualPrompt || scene.visual || scene.location).trim();
  return prompt ? [prompt] : ["modern office business"];
}

function parseHelperResult(stdout: string, stderr: string): Record<string, unknown> {
  const lines = `${stdout}\n${stderr}`
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("MPT_STOCK "));
  const last = lines[lines.length - 1];
  if (!last) {
    throw new MarketingAgentError(
      "RENDER_FAILURE",
      "MoneyPrinterTurbo stock search returned no result payload.",
    );
  }
  return JSON.parse(last.slice("MPT_STOCK ".length)) as Record<string, unknown>;
}

async function downloadUrlToFile(
  url: string,
  dest: string,
): Promise<boolean> {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(60_000),
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
    });
    if (!response.ok) return false;
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.byteLength < 32_000 || bytes.byteLength > MAX_CLIP_BYTES) {
      return false;
    }
    await writeFile(dest, bytes);
    return await fileExists(dest);
  } catch {
    return false;
  }
}

function scoreCatalog(entry: PublicCatalogEntry, terms: string[]): number {
  const hay = terms.join(" ").toLowerCase();
  return entry.keywords.reduce(
    (score, keyword) => (hay.includes(keyword) ? score + 2 : score),
    0,
  );
}

async function fetchPublicCatalog(input: {
  workDir: string;
  termsPerScene: string[][];
}): Promise<StockClip[]> {
  const destDir = path.join(input.workDir, "stock-public");
  await mkdir(destDir, { recursive: true });
  const usedUrls = new Set<string>();
  const clips: StockClip[] = [];

  for (let index = 0; index < input.termsPerScene.length; index += 1) {
    const terms = input.termsPerScene[index] ?? [];
    const ranked = [...PUBLIC_STOCK_CATALOG].sort(
      (a, b) => scoreCatalog(b, terms) - scoreCatalog(a, terms),
    );
    let saved: StockClip | null = null;
    for (const entry of ranked) {
      for (const url of entry.urls) {
        if (usedUrls.has(url)) continue;
        const dest = path.join(destDir, `scene-${index}.mp4`);
        const ok = await downloadUrlToFile(url, dest);
        if (!ok) continue;
        usedUrls.add(url);
        saved = {
          path: dest,
          provider: url.includes("pexels.com") ? "pexels" : "mixkit",
          searchTerm: terms[0] || entry.keywords[0] || "stock",
          sourceUrl: url,
        };
        break;
      }
      if (saved) break;
    }
    if (saved) clips.push(saved);
  }

  return clips;
}

async function fetchViaMoneyPrinterTurbo(input: {
  workDir: string;
  termsPerScene: string[][];
}): Promise<StockFetchResult | null> {
  const keys = stockApiKeys();
  if (!keys.pexels && !keys.pixabay && !keys.coverr) {
    return null;
  }

  const probe = await probeMoneyPrinterTurbo();
  const helperPath = path.resolve(
    /* turbopackIgnore: true */ process.cwd(),
    HELPER_RELATIVE,
  );
  if (!probe.available || !(await fileExists(helperPath))) {
    return null;
  }

  const jobFile = path.join(input.workDir, "mpt-stock-job.json");
  await writeFile(
    jobFile,
    JSON.stringify({
      mptRoot: probe.root,
      workDir: input.workDir,
      searchTerms: input.termsPerScene.map((terms) => terms[0] || "modern office"),
      searchTermsPerScene: input.termsPerScene,
    }),
    "utf8",
  );

  try {
    const { stdout, stderr } = await execFileAsync(
      probe.pythonPath,
      [helperPath, "--job", jobFile],
      {
        cwd: probe.root,
        timeout: 180_000,
        maxBuffer: 8 * 1024 * 1024,
        env: {
          ...process.env,
          PYTHONIOENCODING: "utf-8",
          PEXELS_API_KEY: keys.pexels,
          PIXABAY_API_KEY: keys.pixabay,
          COVERR_API_KEY: keys.coverr,
        },
      },
    );
    const result = parseHelperResult(String(stdout), String(stderr));
    if (result.ok !== true) return null;
    const videos = Array.isArray(result.videos) ? result.videos : [];
    const clips: StockClip[] = [];
    for (const item of videos) {
      if (!item || typeof item !== "object") continue;
      const row = item as Record<string, unknown>;
      const filePath = String(row.path ?? "").trim();
      if (!filePath || !(await fileExists(filePath))) continue;
      const providerRaw = String(row.provider ?? "pexels").toLowerCase();
      const provider: StockClip["provider"] =
        providerRaw === "pixabay" || providerRaw === "coverr"
          ? providerRaw
          : "pexels";
      clips.push({
        path: filePath,
        provider,
        searchTerm: String(row.searchTerm ?? ""),
        sourceUrl: String(row.sourceUrl ?? "") || undefined,
      });
    }
    if (clips.length === 0) {
      return {
        clips: [],
        provider: "none",
        keywords: input.termsPerScene,
        reason: String(result.reason ?? "MoneyPrinterTurbo returned no clips."),
      };
    }
    return {
      clips,
      provider: clips[0]?.provider ?? "pexels",
      keywords: input.termsPerScene,
    };
  } catch {
    return null;
  }
}

async function fetchLocalStock(workDir: string): Promise<StockClip[]> {
  const dir = path.resolve(
    /* turbopackIgnore: true */ process.cwd(),
    "public",
    "videos",
    "stock",
  );
  if (!(await fileExists(dir))) return [];
  const { readdir } = await import("node:fs/promises");
  const names = await readdir(dir);
  const clips: StockClip[] = [];
  for (const name of names) {
    if (!/\.(mp4|mov|webm|mkv)$/i.test(name)) continue;
    const filePath = path.join(dir, name);
    clips.push({
      path: filePath,
      provider: "local",
      searchTerm: name,
    });
  }
  void workDir;
  return clips;
}

export async function fetchStockClipsForScenes(input: {
  workDir: string;
  scenes: PrVideoScene[];
}): Promise<StockFetchResult> {
  const termsPerScene = input.scenes.map((scene) => sceneSearchTerms(scene));
  const destDir = path.join(input.workDir, "stock");
  await mkdir(destDir, { recursive: true });

  const mpt = await fetchViaMoneyPrinterTurbo({
    workDir: destDir,
    termsPerScene,
  });
  if (mpt && mpt.clips.length > 0) {
    return mpt;
  }

  const publicClips = await fetchPublicCatalog({
    workDir: destDir,
    termsPerScene,
  });
  if (publicClips.length > 0) {
    return {
      clips: publicClips,
      provider: publicClips[0]?.provider ?? "pexels",
      keywords: termsPerScene,
      reason: mpt?.reason,
    };
  }

  const local = await fetchLocalStock(destDir);
  if (local.length > 0) {
    return {
      clips: local,
      provider: "local",
      keywords: termsPerScene,
    };
  }

  return {
    clips: [],
    provider: "none",
    keywords: termsPerScene,
    reason: "No stock API keys and public/local stock clips were unavailable.",
  };
}
