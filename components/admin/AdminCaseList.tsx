"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ProductCaseImage } from "@/components/cases/ProductCaseImage";
import { reviewCaseAction } from "@/lib/actions";
import { Button } from "@/components/ui/Button";
import type { AdminCaseListItem } from "@/lib/admin";
import {
  caseNumberClassName,
  caseNumberHeaderClassName,
  formatCaseDate,
} from "@/lib/case-display";
import {
  reviewStatusLabels,
  targetCountryLabel,
  type ReviewStatus,
  type TargetCountry,
} from "@/lib/types";

type AdminCaseListProps = {
  items: AdminCaseListItem[];
  currentFilter: string;
};

const filters: { key: string; label: string }[] = [
  { key: "pending_review", label: "審査待ち" },
  { key: "approved", label: "承認済" },
  { key: "rejected", label: "不承認" },
  { key: "withdrawn", label: "取り下げ" },
  { key: "all", label: "すべて" },
];

function statusLabel(item: AdminCaseListItem): string {
  if (item.reviewStatus === "pending_review") return "審査待ち";
  if (item.reviewStatus === "approved" && item.status === "open") {
    return "承認（公開）";
  }
  if (item.reviewStatus === "rejected") return "不承認";
  return (
    reviewStatusLabels[item.reviewStatus as ReviewStatus] ?? item.reviewStatus
  );
}

export function AdminCaseList({ items, currentFilter }: AdminCaseListProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function review(
    id: string,
    reviewStatus: Extract<ReviewStatus, "approved" | "rejected">,
  ) {
    setError("");
    setLoadingId(id);
    const result = await reviewCaseAction({
      caseId: id,
      reviewStatus,
    });
    setLoadingId(null);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <Link
            key={f.key}
            href={`/admin/cases?status=${f.key}`}
            className={[
              "rounded-md px-3.5 py-2 text-sm transition",
              currentFilter === f.key
                ? "bg-navy text-white"
                : "border border-border bg-surface text-muted hover:text-teal",
            ].join(" ")}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {error ? (
        <p
          className="whitespace-pre-wrap rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-surface px-5 py-10 text-center text-muted">
          該当する案件がありません。
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-surface">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border bg-cream/50 text-xs text-muted">
              <tr>
                <th className={caseNumberHeaderClassName()}>案件番号</th>
                <th className="px-4 py-3 font-medium">商品画像</th>
                <th className="px-4 py-3 font-medium">商品名</th>
                <th className="px-4 py-3 font-medium">原産国</th>
                <th className="px-4 py-3 font-medium">登録日</th>
                <th className="px-4 py-3 font-medium">状態</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const busy = loadingId === item.id;
                const canReview = item.reviewStatus === "pending_review";
                return (
                  <tr
                    key={item.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className={caseNumberClassName()}>{item.caseNumber}</td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/cases/${item.id}`} className="inline-block">
                        <ProductCaseImage
                          src={item.productImageUrl}
                          alt={item.productName}
                        />
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/cases/${item.id}`}
                        className="font-medium text-navy hover:text-teal hover:underline"
                      >
                        {item.productName}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      {item.targetCountry
                        ? targetCountryLabel(
                            item.targetCountry as TargetCountry,
                          )
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {formatCaseDate(item.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      {item.reviewStatus === "approved" ? (
                        <span className="text-teal">{statusLabel(item)}</span>
                      ) : item.reviewStatus === "rejected" ? (
                        <span className="text-red-600">{statusLabel(item)}</span>
                      ) : (
                        <span className="text-navy">{statusLabel(item)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {canReview ? (
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            onClick={() => review(item.id, "approved")}
                            disabled={busy}
                          >
                            {busy ? "..." : "承認"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => review(item.id, "rejected")}
                            disabled={busy}
                          >
                            {busy ? "..." : "不承認"}
                          </Button>
                        </div>
                      ) : (
                        <Button
                          href={`/admin/cases/${item.id}`}
                          variant="ghost"
                        >
                          詳細
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
