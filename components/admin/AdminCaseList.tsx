"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { reviewCaseAction } from "@/lib/actions";
import { Button } from "@/components/ui/Button";
import type { AdminCaseListItem } from "@/lib/admin";
import { reviewStatusLabels, type ReviewStatus } from "@/lib/types";

type AdminCaseListProps = {
  items: AdminCaseListItem[];
  currentFilter: string;
};

const filters: { key: string; label: string }[] = [
  { key: "pending_review", label: "審査待ち" },
  { key: "approved", label: "承認済" },
  { key: "rejected", label: "却下" },
  { key: "withdrawn", label: "取り下げ" },
  { key: "all", label: "すべて" },
];

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
    <div className="space-y-6">
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
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-surface px-5 py-10 text-center text-muted">
          該当する案件がありません。
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface p-4"
            >
              <div>
                <Link
                  href={`/admin/cases/${item.id}`}
                  className="font-medium text-navy hover:text-teal hover:underline"
                >
                  {item.title}
                </Link>
                <p className="mt-1 text-xs text-muted">
                  {item.makerName} ・ {item.category} ・{" "}
                  {reviewStatusLabels[item.reviewStatus as ReviewStatus]} ・
                  status={item.status}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {item.reviewStatus === "pending_review" ? (
                  <>
                    <Button
                      type="button"
                      onClick={() => review(item.id, "approved")}
                      disabled={loadingId === item.id}
                    >
                      {loadingId === item.id ? "処理中..." : "承認"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => review(item.id, "rejected")}
                      disabled={loadingId === item.id}
                    >
                      却下
                    </Button>
                  </>
                ) : null}
                <Button href={`/admin/cases/${item.id}`} variant="ghost">
                  詳細
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
