"use client";

import { useMemo, useState } from "react";
import { generatePrVideoScriptAction } from "@/lib/marketing-agent/actions";
import type {
  PrScriptProductSnapshot,
  PrVideoScript,
} from "@/lib/marketing-agent/pr-script";
import { SubmitButton } from "@/components/admin/marketing-agent/SubmitButton";

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
  const [error, setError] = useState<string | null>(null);
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
            disabled={cases.length === 0}
            className="mt-1 block w-full max-w-xl rounded-md border border-border bg-surface px-3 py-2 text-navy"
            value={selectedId}
            onChange={(event) => {
              setSelectedId(event.target.value);
              setScript(null);
              setProduct(null);
              setError(null);
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

      {script ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
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
          </div>
          {copyState ? <p className="text-xs text-teal">{copyState}</p> : null}

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
