"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { withdrawCaseAction } from "@/lib/actions";
import { Button } from "@/components/ui/Button";
import { casePublicStatusLabel } from "@/lib/case-display";
import {
  salesFormatLabel,
  targetCountryLabel,
  type Case,
} from "@/lib/types";

type MakerCaseListProps = {
  items: Case[];
};

function skuCellClassName() {
  return "sticky left-0 z-10 border-r border-border bg-surface px-3 py-3 font-mono text-xs font-medium text-teal sm:px-4";
}

function skuHeaderClassName() {
  return "sticky left-0 z-20 border-r border-border bg-cream/50 px-3 py-3 font-medium sm:px-4";
}

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
      <div className="w-full overflow-x-auto rounded-lg border border-border bg-surface">
        <table className="w-full min-w-[64rem] table-fixed text-left text-sm">
          <thead className="border-b border-border bg-cream/50 text-xs text-muted">
            <tr>
              <th className={`${skuHeaderClassName()} w-[8.5rem]`}>
                商品コード（SKU）
              </th>
              <th className="w-[14rem] px-4 py-3 font-medium sm:w-auto">
                商品名
              </th>
              <th className="w-36 px-4 py-3 font-medium">カテゴリ</th>
              <th className="w-28 px-4 py-3 font-medium">原産国</th>
              <th className="w-28 px-4 py-3 font-medium">販売形式</th>
              <th className="w-24 px-4 py-3 font-medium">応募件数</th>
              <th className="w-24 px-4 py-3 font-medium">状態</th>
              <th className="w-44 px-4 py-3 font-medium">操作</th>
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
              const sku = item.sku?.trim() || "";

              return (
                <tr
                  key={item.id}
                  className="border-b border-border last:border-0"
                >
                  <td className={skuCellClassName()}>
                    <span
                      className="block truncate"
                      title={sku || undefined}
                    >
                      {sku || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-navy">
                    <span className="line-clamp-2 break-words">
                      {item.productName}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="line-clamp-2">{item.category}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {targetCountryLabel(item.targetCountry)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {salesFormatLabel(item.salesFormat)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {item.applicationCount ?? 0}件
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {item.reviewStatus === "approved" &&
                    item.status === "open" ? (
                      <span className="text-teal">{status}</span>
                    ) : item.reviewStatus === "rejected" ? (
                      <span className="text-red-600">{status}</span>
                    ) : (
                      <span className="text-navy">{status}</span>
                    )}
                  </td>
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
        横スクロールで全列を確認できます。商品コード未入力は「—」と表示します。{" "}
        <Link href="/cases" className="text-teal hover:underline">
          公開案件一覧へ
        </Link>
      </p>
    </div>
  );
}
