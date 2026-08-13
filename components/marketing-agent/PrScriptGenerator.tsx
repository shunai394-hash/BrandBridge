"use client";

import { useMemo, useState } from "react";
import { generatePrVideoScriptAction } from "@/lib/marketing-agent/actions";
import type {
  PrScriptProductSnapshot,
  PrVideoScript,
} from "@/lib/marketing-agent/pr-script";
import { SubmitButton } from "./SubmitButton";

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
  const [ok, setOk] = useState<boolean | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [script, setScript] = useState<PrVideoScript | null>(null);
  const [product, setProduct] = useState<PrScriptProductSnapshot | null>(null);
  const [copyState, setCopyState] = useState<string | null>(null);

  const selected = useMemo(
    () => cases.find((item) => item.id === selectedId) ?? null,
    [cases, selectedId],
  );

  const displayName = product?.productName || selected?.productName || "";
  const displayBrand = product?.brandName || selected?.brandName || "—";
  const displayCategory = product?.category || selected?.category || "—";

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        商品（Case）を1つ選び、短尺 PR 動画用の台本を生成します。結果は画面表示のみで、DB
        には保存しません。音声・動画生成は行いません。
      </p>
      {casesError ? (
        <p className="text-sm text-red-600">{casesError}</p>
      ) : null}
      {cases.length === 0 && !casesError ? (
        <p className="text-sm text-muted">選択できる商品がありません。</p>
      ) : null}

      <form
        className="space-y-3"
        action={async (formData) => {
          setMessage(null);
          setScript(null);
          setProduct(null);
          setOk(null);
          setCopyState(null);
          const result = await generatePrVideoScriptAction(formData);
          setOk(result.ok);
          setMessage(result.message);
          setScript(result.script ?? null);
          setProduct(result.product ?? null);
        }}
      >
        <label className="block text-sm">
          <span className="font-medium text-navy">商品を選択</span>
          <select
            name="caseId"
            required
            disabled={cases.length === 0}
            className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2"
            value={selectedId}
            onChange={(event) => {
              setSelectedId(event.target.value);
              setScript(null);
              setProduct(null);
              setMessage(null);
              setOk(null);
              setCopyState(null);
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
          <div className="rounded-md border border-border bg-cream/50 px-3 py-3 text-sm">
            <p className="text-xs font-medium text-muted">選択中の商品</p>
            <p className="mt-1 text-navy">
              <span className="text-muted">商品名: </span>
              {displayName}
            </p>
            <p className="mt-1 text-navy">
              <span className="text-muted">ブランド: </span>
              {displayBrand}
            </p>
            <p className="mt-1 text-navy">
              <span className="text-muted">カテゴリー: </span>
              {displayCategory}
            </p>
          </div>
        ) : null}

        <SubmitButton pendingLabel="Generating...">Generate PR Script</SubmitButton>
      </form>

      {message ? (
        <p className={ok ? "text-xs text-teal" : "text-xs text-red-600"}>
          {message}
        </p>
      ) : null}

      {script ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="inline-flex cursor-pointer items-center justify-center rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-navy transition hover:bg-cream/50"
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
              className="inline-flex cursor-pointer items-center justify-center rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-navy transition hover:bg-cream/50"
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
          </div>
          {copyState ? <p className="text-xs text-teal">{copyState}</p> : null}

          <div>
            <p className="text-xs font-medium text-muted">title</p>
            <p className="mt-1 text-sm text-navy">{script.title}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted">hook</p>
            <p className="mt-1 text-sm text-navy">{script.hook}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted">
              scenes / {script.totalDurationSeconds} sec
            </p>
            <ol className="mt-2 space-y-2">
              {script.scenes.map((scene) => (
                <li
                  key={`${scene.sceneNumber}-${scene.onScreenText}`}
                  className="rounded-md border border-border px-3 py-3 text-sm"
                >
                  <p className="text-xs text-muted">
                    Scene {scene.sceneNumber} / {scene.durationSeconds} sec
                  </p>
                  <p className="mt-1 text-navy">
                    <span className="text-muted">visual: </span>
                    {scene.visual}
                  </p>
                  <p className="mt-1 text-navy">
                    <span className="text-muted">narrationText: </span>
                    {scene.narrationText}
                  </p>
                  <p className="mt-1 text-navy">
                    <span className="text-muted">onScreenText: </span>
                    {scene.onScreenText}
                  </p>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <p className="text-xs font-medium text-muted">cta</p>
            <p className="mt-1 text-sm text-navy">{script.cta}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
