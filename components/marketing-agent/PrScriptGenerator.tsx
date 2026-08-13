"use client";

import { useState } from "react";
import { generatePrVideoScriptAction } from "@/lib/marketing-agent/actions";
import type { PrVideoScript } from "@/lib/marketing-agent/types";
import { SubmitButton } from "./SubmitButton";

export type PrScriptCaseOption = {
  id: string;
  caseNumber: string;
  productName: string;
  makerName: string;
};

export function PrScriptGenerator({
  cases,
  casesError,
}: {
  cases: PrScriptCaseOption[];
  casesError?: string;
}) {
  const [ok, setOk] = useState<boolean | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [script, setScript] = useState<PrVideoScript | null>(null);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        登録済み Case の商品情報から、短尺 PR 動画用の台本 JSON を生成します。音声・動画生成は行いません。
      </p>
      {casesError ? (
        <p className="text-sm text-red-600">{casesError}</p>
      ) : null}
      {cases.length === 0 && !casesError ? (
        <p className="text-sm text-muted">選択できる Case がありません。</p>
      ) : null}

      <form
        className="space-y-3"
        action={async (formData) => {
          setMessage(null);
          setScript(null);
          setOk(null);
          const result = await generatePrVideoScriptAction(formData);
          setOk(result.ok);
          setMessage(result.message);
          setScript(result.script ?? null);
        }}
      >
        <label className="block text-sm">
          <span className="font-medium text-navy">Case</span>
          <select
            name="caseId"
            required
            disabled={cases.length === 0}
            className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2"
            defaultValue=""
          >
            <option value="" disabled>
              Case を選択
            </option>
            {cases.map((item) => (
              <option key={item.id} value={item.id}>
                {item.caseNumber} / {item.productName}（{item.makerName}）
              </option>
            ))}
          </select>
        </label>
        <SubmitButton pendingLabel="台本を生成中...">PR台本を生成</SubmitButton>
      </form>

      {message ? (
        <p className={ok ? "text-xs text-teal" : "text-xs text-red-600"}>
          {message}
        </p>
      ) : null}

      {script ? (
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium text-muted">hook</p>
            <p className="mt-1 text-sm text-navy">{script.hook}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted">scenes</p>
            <ol className="mt-2 space-y-2">
              {script.scenes.map((scene, index) => (
                <li
                  key={`${index}-${scene.caption}`}
                  className="rounded-md border border-border px-3 py-3 text-sm"
                >
                  <p className="text-xs text-muted">
                    Scene {index + 1} / {scene.duration}秒
                  </p>
                  <p className="mt-1 text-navy">
                    <span className="text-muted">visual: </span>
                    {scene.visual}
                  </p>
                  <p className="mt-1 text-navy">
                    <span className="text-muted">voiceover: </span>
                    {scene.voiceover}
                  </p>
                  <p className="mt-1 text-navy">
                    <span className="text-muted">caption: </span>
                    {scene.caption}
                  </p>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <p className="text-xs font-medium text-muted">narrationText</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-navy">
              {script.narrationText}
            </p>
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
