"use client";

import { useEffect, useRef, useState } from "react";
import { generateBusinessPrVideoScriptAction } from "@/lib/marketing-agent/actions";
import type { PrVideoScript } from "@/lib/marketing-agent/pr-script";
import { SubmitButton } from "@/components/admin/marketing-agent/SubmitButton";
import {
  describePrVideoStage,
  redactSecrets,
  type PrVideoStage,
} from "@/lib/marketing-agent/redact";

type ImageItem = {
  id: string;
  file: File;
  previewUrl: string;
  hint: string;
};

function formatBusinessPrScriptText(script: PrVideoScript): string {
  const scenes = script.scenes
    .map((scene) =>
      [
        `シーン ${scene.sceneNumber}`,
        `長さ: ${scene.durationSeconds}秒`,
        `場所: ${scene.location}`,
        `人物: ${scene.character}`,
        `動作: ${scene.action}`,
        `カメラ: ${scene.camera}`,
        `トランジション: ${scene.transition}`,
        "映像:",
        scene.visual,
        "ナレーション:",
        scene.narrationText,
      ].join("\n"),
    )
    .join("\n\n");

  const fullNarration = script.scenes
    .map((scene) => scene.narrationText)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  return [
    `タイトル: ${script.title}`,
    `フック: ${script.hook}`,
    `合計時間: ${script.totalDurationSeconds}秒`,
    "",
    scenes,
    "",
    "全編ナレーション:",
    fullNarration,
    "",
    `CTA: ${script.cta}`,
  ].join("\n");
}

function revokeVideoUrl(url: string | null) {
  if (url?.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}

async function compressBusinessPrImage(file: File): Promise<File> {
  if (file.size <= 280 * 1024 && /jpe?g$/i.test(file.type)) {
    return file;
  }

  const bitmap = await createImageBitmap(file);
  const longest = Math.max(bitmap.width, bitmap.height);
  const scale = longest > 1280 ? 1280 / longest : 1;
  const width = Math.max(2, Math.round(bitmap.width * scale));
  const height = Math.max(2, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    return file;
  }
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", 0.72);
  });
  if (!blob || blob.size < 32) {
    return file;
  }

  const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
  return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
}

export function BusinessPrVideoGenerator() {
  const [started, setStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [script, setScript] = useState<PrVideoScript | null>(null);
  const [copyState, setCopyState] = useState<string | null>(null);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [bgmEnabled, setBgmEnabled] = useState(true);
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imagesRef = useRef<ImageItem[]>([]);
  const videoUrlRef = useRef<string | null>(null);

  imagesRef.current = images;
  videoUrlRef.current = videoUrl;

  useEffect(() => {
    return () => {
      revokeVideoUrl(videoUrlRef.current);

      for (const item of imagesRef.current) {
        URL.revokeObjectURL(item.previewUrl);
      }
    };
  }, []);

  useEffect(() => {
    if (videoStatus !== "generating") {
      return;
    }

    const startedAt = Date.now();

    const timer = window.setInterval(() => {
      setElapsedSeconds(
        Math.floor((Date.now() - startedAt) / 1000),
      );
    }, 1000);

    return () => window.clearInterval(timer);
  }, [videoStatus]);

  const addFiles = (fileList: FileList | null) => {
    if (!fileList) {
      return;
    }

    const next: ImageItem[] = [];

    for (const file of Array.from(fileList)) {
      if (!file.type.startsWith("image/")) {
        continue;
      }

      next.push({
        id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,
        file,
        previewUrl: URL.createObjectURL(file),
        hint: "",
      });
    }

    if (next.length === 0) {
      return;
    }

    setImages((current) => [
      ...current,
      ...next,
    ].slice(0, 16));
  };

  if (!started) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted">
          会社・事業の説明と複数の画像から、日本語ナレーション付きの縦型PR動画を作成します。
        </p>

        <button
          type="button"
          className="inline-flex cursor-pointer items-center justify-center rounded-md bg-teal px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-dark"
          onClick={() => setStarted(true)}
        >
          事業PR動画を作成
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <form
        className="space-y-3"
        action={async (formData) => {
          if (images.length < 2) {
            setError("画像を2枚以上追加してください。");
            return;
          }

          setError(null);
          setScript(null);
          setCopyState(null);
          setVideoError(null);
          setVideoStatus("idle");
          setVideoStage(undefined);
          setVideoHttpStatus(null);

          setVideoUrl((current) => {
            revokeVideoUrl(current);
            return null;
          });

          formData.set("imageCount", String(images.length));
          formData.set(
            "imageHints",
            JSON.stringify(
              images
                .map((item) => item.hint.trim())
                .filter(Boolean),
            ),
          );

          const result =
            await generateBusinessPrVideoScriptAction(
              formData,
            );

          if (result.error) {
            setError(result.error);
            return;
          }

          setScript(result.script ?? null);
        }}
      >
        <label className="block text-sm text-muted">
          会社・ブランド名
          <input
            name="companyName"
            required
            defaultValue="BrandBridge"
            className="mt-1 block w-full max-w-xl rounded-md border border-border bg-surface px-3 py-2 text-navy"
          />
        </label>

        <label className="block text-sm text-muted">
          事業内容
          <textarea
            name="businessDescription"
            required
            rows={3}
            defaultValue="海外ブランドと日本の販売パートナーをつなぐB2Bマッチングプラットフォームです。"
            className="mt-1 block w-full max-w-xl rounded-md border border-border bg-surface px-3 py-2 text-navy"
          />
        </label>

        <label className="block text-sm text-muted">
          ターゲット
          <textarea
            name="targetAudience"
            required
            rows={2}
            defaultValue="日本市場に進出したい海外ブランドと、新しい商品を探している日本の販売事業者。"
            className="mt-1 block w-full max-w-xl rounded-md border border-border bg-surface px-3 py-2 text-navy"
          />
        </label>

        <label className="block text-sm text-muted">
          動画の目的
          <textarea
            name="videoPurpose"
            required
            rows={2}
            defaultValue="BrandBridgeを知ってもらい、サービスへのアクセスと問い合わせにつなげる。"
            className="mt-1 block w-full max-w-xl rounded-md border border-border bg-surface px-3 py-2 text-navy"
          />
        </label>

        <label className="block text-sm text-muted">
          日本市場との関係
          <textarea
            name="japanMarketRelation"
            rows={2}
            defaultValue="海外ブランドの日本市場進出を、現地パートナーとのマッチングで支援します。"
            className="mt-1 block w-full max-w-xl rounded-md border border-border bg-surface px-3 py-2 text-navy"
          />
        </label>

        <label className="block text-sm text-muted">
          希望する雰囲気
          <input
            name="mood"
            defaultValue="信頼感があり、誠実でプロフェッショナルなビジネス動画"
            className="mt-1 block w-full max-w-xl rounded-md border border-border bg-surface px-3 py-2 text-navy"
          />
        </label>

        <div className="space-y-2">
          <p className="text-sm text-muted">
            使用する画像（2枚以上）
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(event) => {
              addFiles(event.target.files);
              event.target.value = "";
            }}
          />

          <button
            type="button"
            className="inline-flex cursor-pointer items-center justify-center rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium text-navy transition hover:border-teal hover:text-teal"
            onClick={() => fileInputRef.current?.click()}
          >
            画像を追加
          </button>

          <p className="text-xs text-muted">
            商品、オフィス、人物、ブランドイメージなどの画像を追加できます。
          </p>

          {images.length > 0 ? (
            <ul className="grid gap-3 sm:grid-cols-2">
              {images.map((item, index) => (
                <li
                  key={item.id}
                  className="rounded-lg border border-border bg-surface p-3 text-sm"
                >
                  <img
                    src={item.previewUrl}
                    alt=""
                    className="mb-2 h-28 w-full rounded-md object-cover"
                  />

                  <p className="text-xs text-muted">
                    画像 {index + 1}
                  </p>

                  <input
                    value={item.hint}
                    placeholder="例：商品 / オフィス / 人物"
                    className="mt-1 block w-full rounded-md border border-border bg-surface px-2 py-1 text-navy"
                    onChange={(event) => {
                      const hint = event.target.value;

                      setImages((current) =>
                        current.map((row) =>
                          row.id === item.id
                            ? { ...row, hint }
                            : row,
                        ),
                      );
                    }}
                  />

                  <button
                    type="button"
                    className="mt-2 text-xs text-red-700 hover:underline"
                    onClick={() => {
                      URL.revokeObjectURL(item.previewUrl);

                      setImages((current) =>
                        current.filter(
                          (row) => row.id !== item.id,
                        ),
                      );
                    }}
                  >
                    削除
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted">
              まだ画像がありません。
            </p>
          )}
        </div>

        <SubmitButton pendingLabel="台本を生成中...">
          日本語で台本を作成
        </SubmitButton>
      </form>

      {error ? (
        <p className="text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="space-y-3 rounded-lg border border-teal/40 bg-surface p-4">
        <p className="text-sm font-medium text-navy">
          動画を生成
        </p>

        <p className="text-xs text-muted">
          日本語ナレーション付きの1080×1920縦型PR動画を作成します。
        </p>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={
              videoStatus === "generating" ||
              !script ||
              images.length < 2
            }
            className="inline-flex cursor-pointer items-center justify-center rounded-md bg-teal px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-dark disabled:cursor-not-allowed disabled:opacity-60"
            onClick={async () => {
              if (
                !script ||
                images.length < 2 ||
                generatingLock.current
              ) {
                return;
              }

              generatingLock.current = true;

              setVideoError(null);
              setVideoStage("ffmpeg");
              setVideoHttpStatus(null);
              setElapsedSeconds(0);
              setVideoStatus("generating");

              setVideoUrl((current) => {
                revokeVideoUrl(current);
                return null;
              });

              try {
                const companyName =
                  (
                    document.querySelector(
                      'input[name="companyName"]',
                    ) as HTMLInputElement | null
                  )?.value.trim() || "BrandBridge";

                const body = new FormData();

                body.set("companyName", companyName);
                body.set(
                  "script",
                  JSON.stringify(script),
                );
                body.set(
                  "bgmEnabled",
                  String(bgmEnabled),
                );

                for (const item of images) {
                  const file = await compressBusinessPrImage(item.file);
                  body.append("images", file, file.name);
                }

                const response = await fetch(
                  "/admin/marketing-agent/business-pr-video",
                  {
                    method: "POST",
                    body,
                  },
                );

                const contentType =
                  response.headers.get(
                    "content-type",
                  ) ?? "";

                const httpStatus = response.status;

                setVideoHttpStatus(httpStatus);

                if (!response.ok) {
                  let message =
                    `動画生成に失敗しました（HTTP ${httpStatus}）。`;

                  let stage:
                    | PrVideoStage
                    | undefined = "vercel";

                  if (
                    contentType.includes(
                      "application/json",
                    )
                  ) {
                    const payload =
                      (await response.json()) as {
                        error?: string;
                        stage?: PrVideoStage;
                      };

                    if (payload.error) {
                      message =
                        `動画生成に失敗しました（HTTP ${httpStatus}）：${redactSecrets(payload.error)}`;
                    }

                    if (payload.stage) {
                      stage = payload.stage;
                    }
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
                      "Cloud Run から署名付きURLが返りませんでした。",
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

                const blob =
                  await response.blob();

                if (blob.size < 1024) {
                  setVideoStage("ffmpeg");
                  setVideoError(
                    "動画ファイルが空です。",
                  );
                  setVideoStatus("failed");
                  return;
                }

                const disposition =
                  response.headers.get(
                    "content-disposition",
                  ) ?? "";

                const match =
                  disposition.match(
                    /filename="([^"]+)"/,
                  );

                setVideoName(
                  match?.[1] ||
                    "brandbridge-pr-video.mp4",
                );

                setVideoUrl(
                  URL.createObjectURL(blob),
                );

                setVideoStage("ffmpeg");
                setVideoStatus("completed");
              } catch (caught) {
                const raw =
                  caught instanceof Error
                    ? caught.message
                    : "動画生成に失敗しました。";

                setVideoStage("vercel");
                setVideoError(
                  `動画生成に失敗しました: ${redactSecrets(raw)}`,
                );
                setVideoStatus("failed");
              } finally {
                generatingLock.current = false;
              }
            }}
          >
            {videoStatus === "generating"
              ? "動画を生成中..."
              : "動画を生成"}
          </button>

          <button
            type="button"
            className={`inline-flex cursor-pointer items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition ${
              bgmEnabled
                ? "border-teal bg-teal/10 text-teal"
                : "border-border bg-transparent text-navy"
            }`}
            onClick={() =>
              setBgmEnabled((current) => !current)
            }
          >
            BGM: {bgmEnabled ? "ON" : "OFF"}
          </button>

          {script ? (
            <button
              type="button"
              className="inline-flex cursor-pointer items-center justify-center rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium text-navy transition hover:border-teal hover:text-teal"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(
                    formatBusinessPrScriptText(
                      script,
                    ),
                  );

                  setCopyState(
                    "コピーしました。",
                  );
                } catch {
                  setCopyState(
                    "コピーに失敗しました。",
                  );
                }
              }}
            >
              台本をコピー
            </button>
          ) : null}
        </div>

        <p className="text-xs text-muted">
          状態：{" "}
          {videoStatus === "generating"
            ? "生成中"
            : videoStatus === "completed"
              ? "完了"
              : videoStatus === "failed"
                ? "失敗"
                : script
                  ? images.length < 2
                    ? "画像を2枚以上追加してください"
                    : "内容を確認して動画を生成できます"
                  : "先に日本語で台本を作成してください"}
        </p>

        {videoStatus === "generating" ? (
          <p className="text-xs text-muted">
            経過: {elapsedSeconds}秒
          </p>
        ) : null}

        {videoStatus === "failed" ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            <p className="font-medium">
              生成失敗
              {videoHttpStatus
                ? ` (HTTP ${videoHttpStatus})`
                : ""}
            </p>

            <p className="mt-1 text-xs">
              段階:{" "}
              {describePrVideoStage(
                videoStage,
              )}
            </p>

            {videoError ? (
              <p className="mt-1">
                {videoError}
              </p>
            ) : null}
          </div>
        ) : null}

        {copyState ? (
          <p className="text-xs text-teal">
            {copyState}
          </p>
        ) : null}

        {videoStatus === "completed" &&
        videoUrl ? (
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
              MP4をダウンロード
            </a>
          </div>
        ) : null}
      </div>

      {script ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-surface p-4 text-sm">
            <p className="text-xs text-muted">
              タイトル
            </p>

            <p className="mt-1 text-navy">
              {script.title}
            </p>

            <p className="mt-3 text-xs text-muted">
              フック
            </p>

            <p className="mt-1 text-navy">
              {script.hook}
            </p>
          </div>

          <ol className="space-y-3">
            {script.scenes.map((scene) => (
              <li
                key={`${scene.sceneNumber}-${scene.narrationText}`}
                className="rounded-lg border border-border bg-surface p-4 text-sm"
              >
                <p className="font-medium text-navy">
                  シーン {scene.sceneNumber}
                </p>

                <p className="mt-2 text-xs text-muted">
                  ナレーション
                </p>

                <p className="mt-1 text-navy">
                  {scene.narrationText}
                </p>

                <p className="mt-2 text-xs text-muted">
                  映像
                </p>

                <p className="mt-1 text-navy">
                  {scene.visual}
                </p>

                <p className="mt-2 text-xs text-muted">
                  場所 / 人物 / カメラ
                </p>

                <p className="mt-1 text-navy">
                  {scene.location} /{" "}
                  {scene.character} /{" "}
                  {scene.camera}
                </p>
              </li>
            ))}
          </ol>

          <div className="rounded-lg border border-border bg-surface p-4 text-sm">
            <p className="text-xs text-muted">
              CTA
            </p>

            <p className="mt-1 text-navy">
              {script.cta}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
