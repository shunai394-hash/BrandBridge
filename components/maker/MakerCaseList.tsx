"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { withdrawCaseAction } from "@/lib/actions";
import { Button } from "@/components/ui/Button";
import type { Case } from "@/lib/types";
import { reviewStatusLabels } from "@/lib/types";

type MakerCaseListProps = {
  items: Case[];
};

export function MakerCaseList({ items }: MakerCaseListProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function withdraw(id: string) {
    if (!confirm("この案件を取り下げますか？（一覧の一般公開から外れます）")) {
      return;
    }
    setError("");
    setLoadingId(id);
    const result = await withdrawCaseAction(id);
    setLoadingId(null);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-surface px-5 py-10 text-center">
        <p className="text-muted">まだ案件がありません。</p>
        <Button href="/maker/cases/new" className="mt-4">
          案件を登録する
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <ul className="space-y-3">
        {items.map((item) => {
          const canEdit = item.reviewStatus !== "withdrawn";
          const canWithdraw =
            item.status === "open" && item.reviewStatus !== "withdrawn";

          return (
            <li
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface p-4"
            >
              <div>
                <Link
                  href={`/cases/${item.id}`}
                  className="font-medium text-navy hover:text-teal hover:underline"
                >
                  {item.title}
                </Link>
                <p className="mt-1 text-xs text-muted">
                  {item.productName} ・ {reviewStatusLabels[item.reviewStatus]} ・
                  status={item.status}
                </p>
                <p className="mt-0.5 font-mono text-[11px] text-muted">{item.id}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {canEdit ? (
                  <Button href={`/maker/cases/${item.id}/edit`} variant="outline">
                    編集
                  </Button>
                ) : null}
                {canWithdraw ? (
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={loadingId === item.id}
                    onClick={() => withdraw(item.id)}
                  >
                    {loadingId === item.id ? "処理中..." : "取り下げ"}
                  </Button>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
