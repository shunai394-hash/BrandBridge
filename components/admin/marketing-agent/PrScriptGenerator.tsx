"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { generatePrVideoScriptAction } from "@/lib/marketing-agent/actions";
import type {
  PrScriptProductSnapshot,
  PrVideoScript,
} from "@/lib/marketing-agent/pr-script";
import { SubmitButton } from "@/components/admin/marketing-agent/SubmitButton";
import {
  describePrVideoStage,
  redactSecrets,
  type PrVideoStage,
} from "@/lib/marketing-agent/redact";

export type PrScriptCaseOption = {
  id: string;
  caseNumber: string;
  productName: string;
  brandName?: string | null;
  category: string;
  makerName: string;
};

function formatPrVideoScriptText(script: PrVideoScript): string {
  const scenes = script.scenes
    .map((scene) =>
      [
        `[Scene ${scene.sceneNumber}]`,
        `Duration: ${scene.durationSeconds} sec`,
        "Visual:",
        scene.visual,
        "Narration:",
        scene.narrationText,
        "On-screen text:",
        scene.onScreenText,
      ].join("\n"),
    )
    .join("\n\n");

  const fullNarration = script.scenes
    .map((scene) => scene.narrationText)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  return [
    `Title: ${script.title}`,
    `Hook: ${script.hook}`,
    `Total duration: ${script.totalDurationSeconds} sec`,
    "",
    scenes,
    "",
    "Full narration:",
    fullNarration,
    "",
    `CTA: ${script.cta}`,
  ].join("\n");
}

function safeFileSlug(value: string): string {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return slug || "script";
}

function revokeVideoUrl(url: string | null) {
  if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
}

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function PrScriptGenerator({
  cases,
  casesError,
}: {
  cases: PrScriptCaseOption[];
  casesError?: string;
}) {
  const [selectedId, setSelectedId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [script, setScript] = useState<PrVideoScript | null>(null);
  const [product, setProduct] = useState<PrScriptProductSnapshot | null>(null);
  const [copyState, setCopyState] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoName, setVideoName] = useState("brandbridge-pr-video.mp4");
  const [videoStatus, setVideoStatus] = useState<
    "idle" | "generating" | "completed" | "failed"
  >("idle");
  const [videoError, setVideoError] = useState<string | null>(null);
  const [videoStage, setVideoStage] = useState<PrVideoStage | undefined>();
  const [videoHttpStatus, setVideoHttpStatus] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const generatingLock = useRef(false);

  useEffect(() => {
    return () => {
      revokeVideoUrl(videoUrl);
    };
  }, [videoUrl]);

  useEffect(() => {
    if (videoStatus !== "generating") return;
    const started = Date.now();
    const timer = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - started) / 1000));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [videoStatus]);

  const selected = useMemo(
    () => cases.find((item) => item.id === selectedId) ?? null,
    [cases, selectedId],
  );

  const displayName = product?.productName || selected?.productName || "";
  const displayBrand = product?.brandName || selected?.brandName || "—";
  const displayCategory = product?.category || selected?.category || "—";

  return (
    <div className="space-y-4">
      {casesError ? (
        <p className="text-sm text-red-700">{casesError}</p>
      ) : null}
      {cases.length === 0 && !casesError ? (
        <p className="text-sm text-muted">選択できる商品がありません。</p>
      ) : null}

      <form
        className="space-y-3"
        action={async (formData) => {
          setError(null);
          setScript(null);
          setProduct(null);
          setCopyState(null);
          setVideoError(null);
          setVideoStatus("idle");
          setVideoStage(undefined);
          setVideoHttpStatus(null);
          setVideoUrl((current) => {
            revokeVideoUrl(current);
            return null;
          });
          const result = await generatePrVideoScriptAction(formData);
          if (result.error) {
            setError(result.error);
            return;
          }
          setScript(result.script ?? null);
          setProduct(result.product ?? null);
        }}
      >
        <label className="block text-sm text-muted">
          商品を選択
          <select
            name="caseId"
            required
            disabled={cases.length === 0 || videoStatus === "generating"}
            className="mt-1 block w-full max-w-xl rounded-md border border-border bg-surface px-3 py-2 text-navy"
            value={selectedId}
            onChange={(event) => {
              setSelectedId(event.target.value);
              setScript(null);
              setProduct(null);
              setError(null);
              setCopyState(null);
              setVideoError(null);
              setVideoStatus("idle");
              setVideoStage(undefined);
              setVideoHttpStatus(null);
              setVideoUrl((current) => {
                revokeVideoUrl(current);
                return null;
              });
            }}
          >
            <option value="" disabled>
              商品を選択
            </option>
            {cases.map((item) => (
              <option key={item.id} value={item.id}>
                {item.productName}
                {item.category ? ` / ${item.category}` : ""}
                {item.caseNumber ? ` (${item.caseNumber})` : ""}
              </option>
            ))}
          </select>
        </label>

        {selected ? (
          <div className="rounded-lg border border-border bg-surface p-4 text-sm">
            <p className="text-xs text-muted">Selected Product</p>
            <p className="mt-1 text-navy">{displayName}</p>
            <p className="mt-2 text-xs text-muted">Brand</p>
            <p className="mt-1 text-navy">{displayBrand}</p>
            <p className="mt-2 text-xs text-muted">Category</p>
            <p className="mt-1 text-navy">{displayCategory}</p>
          </div>
        ) : null}

        <SubmitButton pendingLabel="Generating...">Generate PR Script</SubmitButton>
      </form>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      <div className="space-y-3 rounded-lg border border-teal/40 bg-surface p-4">
        <p className="text-sm font-medium text-navy">PR Video Generator</p>
        <p className="text-xs text-muted">
          台本の narration / 字幕と商品画像から、約30秒の 9:16 MP4 を生成します。MoneyPrinterTurbo が使える場合はシーン切替・カメラワーク・BGM・字幕で合成します。公開・SNS投稿はしません。
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={videoStatus === "generating" || !script || !selectedId}
            className="inline-flex cursor-pointer items-center justify-center rounded-md bg-teal px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-dark disabled:cursor-not-allowed disabled:opacity-60"
            onClick={async () => {
              if (!script || !selectedId || generatingLock.current) return;
              generatingLock.current = true;
              setVideoError(null);
              setVideoStage("cloud-run");
              setVideoHttpStatus(null);
              setElapsedSeconds(0);
              setVideoStatus("generating");
              setVideoUrl((current) => {
                revokeVideoUrl(current);
                return null;
              });
              try {
                const body = new FormData();
                body.set("caseId", selectedId);
                body.set("script", JSON.stringify(script));
                const response = await fetch("/admin/marketing-agent/pr-video", {
                  method: "POST",
                  body,
                });
                const contentType = response.headers.get("content-type") ?? "";
                const httpStatus = response.status;
                setVideoHttpStatus(httpStatus);

                if (!response.ok) {
                  let message = `Generation failed (HTTP ${httpStatus}).`;
                  let stage: PrVideoStage | undefined = "vercel";
                  if (contentType.includes("application/json")) {
                    const payload = (await response.json()) as {
                      error?: string;
                      stage?: PrVideoStage;
                      stageLabel?: string;
                    };
                    if (payload.error) {
                      message = `Generation failed (HTTP ${httpStatus}): ${redactSecrets(payload.error)}`;
                    }
                    if (payload.stage) stage = payload.stage;
                  }
                  setVideoStage(stage);
                  setVideoError(message);
                  setVideoStatus("failed");
                  return;
                }
                if (contentType.includes("application/json")) {
                  const payload = (await response.json()) as {
                    url?: string;
                    durationSeconds?: number;
                    stage?: PrVideoStage;
                  };
                  if (!payload.url) {
                    setVideoStage(payload.stage || "r2");
                    setVideoError(
                      "Generation failed: Cloud Run did not return a signed preview URL.",
                    );
                    setVideoStatus("failed");
                    return;
                  }
                  setVideoName("brandbridge-pr-video.mp4");
                  setVideoUrl(payload.url);
                  setVideoStage("r2");
                  setVideoStatus("completed");
                  return;
                }
                const blob = await response.blob();
                if (blob.size < 1024) {
                  setVideoStage("ffmpeg");
                  setVideoError("Video generation returned an empty file.");
                  setVideoStatus("failed");
                  return;
                }
                const disposition = response.headers.get("content-disposition") ?? "";
                const match = disposition.match(/filename="([^"]+)"/);
                setVideoName(match?.[1] || "brandbridge-pr-video.mp4");
                setVideoUrl(URL.createObjectURL(blob));
                setVideoStage("ffmpeg");
                setVideoStatus("completed");
              } catch (error) {
                const raw =
                  error instanceof Error ? error.message : "Video generation failed.";
                const timeout =
                  error instanceof Error &&
                  (error.name === "AbortError" || /timeout/i.test(raw));
                setVideoStage(timeout ? "timeout" : "vercel");
                setVideoHttpStatus(timeout ? 504 : null);
                setVideoError(
                  timeout
                    ? "Generation failed (HTTP 504): Timed out waiting for Cloud Run / FFmpeg."
                    : `Generation failed: ${redactSecrets(raw)}`,
                );
                setVideoStatus("failed");
              } finally {
                generatingLock.current = false;
              }
            }}
          >
            {videoStatus === "generating" ? "Generating PR video..." : "Generate PR Video"}
          </button>
          {script ? (
            <>
              <button
                type="button"
                className="inline-flex cursor-pointer items-center justify-center rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium text-navy transition hover:border-teal hover:text-teal"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(
                      formatPrVideoScriptText(script),
                    );
                    setCopyState("Copied.");
                  } catch {
                    setCopyState("Copy failed. Please try again.");
                  }
                }}
              >
                Copy Script
              </button>
              <button
                type="button"
                className="inline-flex cursor-pointer items-center justify-center rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium text-navy transition hover:border-teal hover:text-teal"
                onClick={() => {
                  const id = product?.id || selectedId || "script";
                  downloadText(
                    `brandbridge-pr-script-${safeFileSlug(id)}.txt`,
                    formatPrVideoScriptText(script),
                  );
                }}
              >
                Download TXT
              </button>
            </>
          ) : null}
        </div>
        <p className="text-xs text-muted">
          Status:{" "}
          {videoStatus === "generating"
            ? "generating"
            : videoStatus === "completed"
              ? "completed"
              : videoStatus === "failed"
                ? "failed"
                : script
                  ? "idle — script ready"
                  : "idle — generate a PR script first"}
        </p>
        {videoStatus === "generating" ? (
          <div className="rounded-md border border-teal/50 bg-teal/5 p-3 text-sm text-navy">
            <p className="font-medium">Generating PR video...</p>
            <p className="mt-1 text-xs text-muted">
              Please wait while the video is rendered. Rendering video with FFmpeg on
              Cloud Run. This may take a few minutes.
            </p>
            <p className="mt-1 text-xs text-muted">Elapsed: {elapsedSeconds}s</p>
          </div>
        ) : null}
        {videoStatus === "completed" ? (
          <p className="text-sm text-teal">completed — Preview and Download are ready.</p>
        ) : null}
        {videoStatus === "failed" ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            <p className="font-medium">
              failed
              {videoHttpStatus ? ` (HTTP ${videoHttpStatus})` : ""}
            </p>
            <p className="mt-1 text-xs">
              Stage: {describePrVideoStage(videoStage)}
            </p>
            {videoError ? <p className="mt-1">{videoError}</p> : null}
          </div>
        ) : null}
        {copyState ? <p className="text-xs text-teal">{copyState}</p> : null}
        {videoStatus === "completed" && videoUrl ? (
          <div className="space-y-3">
            <video
              className="mx-auto w-full max-w-[270px] rounded-md border border-border bg-black"
              style={{ aspectRatio: "9 / 16" }}
              src={videoUrl}
              controls
              playsInline
            />
            <a
              href={videoUrl}
              download={videoName}
              className="inline-flex cursor-pointer items-center justify-center rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium text-navy transition hover:border-teal hover:text-teal"
            >
              Download MP4
            </a>
          </div>
        ) : null}
      </div>

      {script ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-surface p-4 text-sm">
            <p className="text-xs text-muted">Title</p>
            <p className="mt-1 text-navy">{script.title}</p>
            <p className="mt-3 text-xs text-muted">Hook</p>
            <p className="mt-1 text-navy">{script.hook}</p>
            <p className="mt-3 text-xs text-muted">Total Duration</p>
            <p className="mt-1 text-navy">{script.totalDurationSeconds} sec</p>
          </div>

          <ol className="space-y-3">
            {script.scenes.map((scene) => (
              <li
                key={`${scene.sceneNumber}-${scene.onScreenText}`}
                className="rounded-lg border border-border bg-surface p-4 text-sm"
              >
                <p className="font-medium text-navy">Scene {scene.sceneNumber}</p>
                <p className="mt-2 text-xs text-muted">Duration</p>
                <p className="mt-1 text-navy">{scene.durationSeconds} sec</p>
                <p className="mt-2 text-xs text-muted">Visual</p>
                <p className="mt-1 text-navy">{scene.visual}</p>
                <p className="mt-2 text-xs text-muted">Narration</p>
                <p className="mt-1 text-navy">{scene.narrationText}</p>
                <p className="mt-2 text-xs text-muted">On-screen text</p>
                <p className="mt-1 text-navy">{scene.onScreenText}</p>
              </li>
            ))}
          </ol>

          <div className="rounded-lg border border-border bg-surface p-4 text-sm">
            <p className="text-xs text-muted">CTA</p>
            <p className="mt-1 text-navy">{script.cta}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
