"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ProductCaseImage } from "@/components/cases/ProductCaseImage";
import { withdrawCaseAction } from "@/lib/actions";
import { Button } from "@/components/ui/Button";
import {
  caseNumberClassName,
  caseNumberHeaderClassName,
  casePublicStatusLabel,
} from "@/lib/case-display";
import type { Case } from "@/lib/types";

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
      {error ? (
        <p
          className="whitespace-pre-wrap rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      <div className="overflow-x-auto rounded-lg border border-border bg-surface">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-border bg-cream/50 text-xs text-muted">
            <tr>
              <th className={caseNumberHeaderClassName()}>案件番号</th>
              <th className="px-4 py-3 font-medium">商品画像</th>
              <th className="px-4 py-3 font-medium">商品名</th>
              <th className="px-4 py-3 font-medium">状態</th>
              <th className="px-4 py-3 font-medium">応募件数</th>
              <th className="px-4 py-3 font-medium">交渉件数</th>
              <th className="px-4 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const canEdit = item.reviewStatus !== "withdrawn";
              const canWithdraw =
                item.status === "open" && item.reviewStatus !== "withdrawn";
              const status = casePublicStatusLabel({
                status: item.status,
                reviewStatus: item.reviewStatus,
              });

              return (
                <tr
                  key={item.id}
                  className="border-b border-border last:border-0"
                >
                  <td className={caseNumberClassName()}>{item.caseNumber}</td>
                  <td className="px-4 py-3">
                    <ProductCaseImage
                      src={item.productImageUrl}
                      alt={item.productName}
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-navy">
                    {item.productName}
                  </td>
                  <td className="px-4 py-3">
                    {item.reviewStatus === "approved" &&
                    item.status === "open" ? (
                      <span className="text-teal">{status}</span>
                    ) : item.reviewStatus === "rejected" ? (
                      <span className="text-red-600">{status}</span>
                    ) : (
                      <span className="text-navy">{status}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{item.applicationCount ?? 0}件</td>
                  <td className="px-4 py-3">{item.negotiationCount ?? 0}件</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {canEdit ? (
                        <Button
                          href={`/maker/cases/${item.id}/edit`}
                          variant="outline"
                        >
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
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted">
        <Link href="/cases" className="text-teal hover:underline">
          公開案件一覧へ
        </Link>
      </p>
    </div>
  );
}
