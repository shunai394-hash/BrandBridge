"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createDealAction,
  updateCommissionRateAction,
  updatePipelineStatusAction,
} from "@/lib/actions";
import {
  PipelineStatusBadge,
  NegotiationStatusBadge,
} from "@/components/negotiations/NegotiationStatusBadge";
import { Button } from "@/components/ui/Button";
import { Input, TextArea } from "@/components/ui/Input";
import type { AdminNegotiationListItem } from "@/lib/admin";
import {
  pipelineStatusLabels,
  pipelineStatusOptions,
  type PipelineStatus,
} from "@/lib/types";

type AdminNegotiationBoardProps = {
  items: AdminNegotiationListItem[];
  defaultCommissionRate: number;
};

function formatYen(n: number) {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(n);
}

export function AdminNegotiationBoard({
  items,
  defaultCommissionRate,
}: AdminNegotiationBoardProps) {
  const router = useRouter();
  const [rate, setRate] = useState(String(defaultCommissionRate));
  const [rateLoading, setRateLoading] = useState(false);
  const [error, setError] = useState("");
  const [pipelineLoading, setPipelineLoading] = useState<string | null>(null);
  const [dealOpenId, setDealOpenId] = useState<string | null>(null);
  const [dealAmount, setDealAmount] = useState("");
  const [dealNote, setDealNote] = useState("");
  const [dealRate, setDealRate] = useState(String(defaultCommissionRate));
  const [dealLoading, setDealLoading] = useState(false);

  const previewCommission = useMemo(() => {
    const amount = Number(dealAmount);
    const r = Number(dealRate);
    if (Number.isNaN(amount) || Number.isNaN(r)) return 0;
    return Math.round(amount * (r / 100));
  }, [dealAmount, dealRate]);

  async function saveRate(e: FormEvent) {
    e.preventDefault();
    setError("");
    setRateLoading(true);
    const result = await updateCommissionRateAction(Number(rate));
    setRateLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  async function changePipeline(id: string, pipelineStatus: PipelineStatus) {
    setError("");
    setPipelineLoading(id);
    const result = await updatePipelineStatusAction({
      negotiationId: id,
      pipelineStatus,
    });
    setPipelineLoading(null);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  async function submitDeal(e: FormEvent) {
    e.preventDefault();
    if (!dealOpenId) return;
    setError("");
    setDealLoading(true);
    const result = await createDealAction({
      negotiationId: dealOpenId,
      dealAmount: Number(dealAmount),
      commissionRate: Number(dealRate),
      commissionNote: dealNote,
    });
    setDealLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setDealOpenId(null);
    setDealAmount("");
    setDealNote("");
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={saveRate}
        className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-surface p-4"
      >
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-navy">デフォルト仲介手数料率（%）</span>
          <input
            type="number"
            min={0}
            max={100}
            step={0.01}
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            className="w-32 rounded-md border border-border px-3 py-2 text-sm"
          />
        </label>
        <Button type="submit" disabled={rateLoading}>
          {rateLoading ? "保存中..." : "手数料率を保存"}
        </Button>
        <p className="text-xs text-muted">初期値 5%。成約化時のデフォルトに使います。</p>
      </form>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-surface px-5 py-10 text-center text-muted">
          交渉はまだありません。
        </p>
      ) : (
        <ul className="space-y-4">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-lg border border-border bg-surface p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link
                    href={`/negotiations/${item.id}`}
                    className="font-medium text-navy hover:text-teal hover:underline"
                  >
                    {item.caseTitle}
                  </Link>
                  <p className="mt-1 text-xs text-muted">
                    商品提供企業: {item.makerName} ／ パートナー: {item.partnerName}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <NegotiationStatusBadge status={item.applicationStatus} />
                    <PipelineStatusBadge status={item.pipelineStatus} />
                    {item.hasDeal ? (
                      <span className="rounded border border-teal/30 bg-teal/10 px-2 py-0.5 text-xs text-teal-dark">
                        成約登録済
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              {item.applicationStatus === "accepted" ? (
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 text-sm">
                    <span className="text-muted">パイプライン</span>
                    <select
                      className="rounded-md border border-border px-2 py-1.5 text-sm"
                      value={item.pipelineStatus ?? "in_negotiation"}
                      disabled={pipelineLoading === item.id}
                      onChange={(e) =>
                        changePipeline(
                          item.id,
                          e.target.value as PipelineStatus,
                        )
                      }
                    >
                      {pipelineStatusOptions.map((s) => (
                        <option key={s} value={s}>
                          {pipelineStatusLabels[s]}
                        </option>
                      ))}
                    </select>
                  </label>
                  {!item.hasDeal ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setDealOpenId(item.id);
                        setDealRate(String(defaultCommissionRate));
                      }}
                    >
                      成約化
                    </Button>
                  ) : (
                    <Button href="/deals" variant="ghost">
                      成約一覧へ
                    </Button>
                  )}
                </div>
              ) : null}

              {dealOpenId === item.id ? (
                <form
                  onSubmit={submitDeal}
                  className="mt-4 space-y-3 rounded-md border border-teal/25 bg-cream/60 p-4"
                >
                  <p className="text-sm font-medium text-navy">成約登録</p>
                  <Input
                    label="成約金額（円）"
                    name="dealAmount"
                    type="number"
                    min={0}
                    required
                    value={dealAmount}
                    onChange={(e) => setDealAmount(e.target.value)}
                  />
                  <Input
                    label="手数料率（%）"
                    name="commissionRate"
                    type="number"
                    min={0}
                    max={100}
                    step={0.01}
                    required
                    value={dealRate}
                    onChange={(e) => setDealRate(e.target.value)}
                  />
                  <p className="text-xs text-muted">
                    手数料見込: {formatYen(previewCommission)}
                  </p>
                  <TextArea
                    label="手数料メモ（任意）"
                    name="commissionNote"
                    rows={2}
                    value={dealNote}
                    onChange={(e) => setDealNote(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button type="submit" disabled={dealLoading}>
                      {dealLoading ? "登録中..." : "成約として登録"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setDealOpenId(null)}
                    >
                      キャンセル
                    </Button>
                  </div>
                </form>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
