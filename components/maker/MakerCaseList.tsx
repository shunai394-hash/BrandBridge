"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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

/**
 * Soft Navigation で旧「案件番号」列が残っていたら /maker/cases をフルリロード。
 */
function StaleMakerListGuard() {
  useEffect(() => {
    if (typeof document === "undefined") return;
    const text = document.body?.innerText ?? "";
    if (!text.includes("案件番号")) return;
    const url = new URL(window.location.href);
    url.pathname = "/maker/cases";
    url.searchParams.set("_ml", "sku-v2");
    url.searchParams.set("_t", String(Date.now()));
    window.location.replace(url.toString());
  }, []);
  return null;
}

export function MakerCaseList({ items }: MakerCaseListProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function withdraw(id: string) {
    if (!confirm("この商品を取り下げますか？（一覧の一般公開から外れます）")) {
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

  // Always render table headers so column order is visible even with 0 items.
  return (
    <div
      className="space-y-4"
      data-maker-list="sku-first-v2"
      data-testid="maker-product-list"
    >
      <StaleMakerListGuard />
      {error ? (
        <p
          className="whitespace-pre-wrap rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-surface px-5 py-8 text-center">
          <p className="text-muted">まだ商品がありません。</p>
          <Button href="/maker/cases/new" className="mt-4">
            商品を登録する
          </Button>
        </div>
      ) : null}
      <div className="w-full overflow-x-auto rounded-lg border border-border bg-surface">
        <table
          className="w-full min-w-[64rem] table-fixed text-left text-sm"
          data-testid="maker-product-table"
        >
          <thead className="border-b border-border bg-cream/50 text-xs text-muted">
            <tr>
              <th
                className="sticky left-0 z-20 w-[9.5rem] border-r border-border bg-cream/50 px-3 py-3 font-medium sm:px-4"
                scope="col"
              >
                商品番号（SKU）
              </th>
              <th
                className="w-[14rem] px-4 py-3 font-medium sm:w-auto"
                scope="col"
              >
                商品名
              </th>
              <th className="w-36 px-4 py-3 font-medium" scope="col">
                カテゴリ
              </th>
              <th className="w-28 px-4 py-3 font-medium" scope="col">
                原産国
              </th>
              <th className="w-28 px-4 py-3 font-medium" scope="col">
                販売形式
              </th>
              <th className="w-24 px-4 py-3 font-medium" scope="col">
                応募件数
              </th>
              <th className="w-24 px-4 py-3 font-medium" scope="col">
                状態
              </th>
              <th className="w-44 px-4 py-3 font-medium" scope="col">
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-8 text-center text-sm text-muted"
                >
                  表示する商品がありません
                </td>
              </tr>
            ) : (
              items.map((item) => {
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
                    data-product-id={item.id}
                  >
                    <td className="sticky left-0 z-10 border-r border-border bg-surface px-3 py-3 font-mono text-xs font-medium text-teal sm:px-4">
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
              })
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted">
        横スクロールで全列を確認できます。商品番号（SKU）未入力は「—」と表示します。{" "}
        <Link
          href="/cases"
          prefetch={false}
          className="text-teal hover:underline"
        >
          公開商品一覧へ
        </Link>
      </p>
    </div>
  );
}

