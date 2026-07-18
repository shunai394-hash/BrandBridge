"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PipelineStatusBadge } from "@/components/negotiations/NegotiationStatusBadge";
import type { NegotiationListItem } from "@/lib/types";

type FilterKey = "all" | "active" | "closed";

const filters: { key: FilterKey; label: string }[] = [
  { key: "all", label: "すべて" },
  { key: "active", label: "交渉中" },
  { key: "closed", label: "終了" },
];

type NegotiationListProps = {
  items: NegotiationListItem[];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export function NegotiationList({ items }: NegotiationListProps) {
  const [filter, setFilter] = useState<FilterKey>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    if (filter === "active") {
      return items.filter((item) => item.applicationStatus !== "rejected");
    }
    return items.filter((item) => item.applicationStatus === "rejected");
  }, [items, filter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {filters.map((item) => {
          const active = filter === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilter(item.key)}
              className={[
                "rounded-md px-3.5 py-2 text-sm transition",
                active
                  ? "bg-navy text-white"
                  : "border border-border bg-surface text-muted hover:border-teal hover:text-teal",
              ].join(" ")}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-surface px-5 py-10 text-center text-muted">
          まだ交渉がありません。
        </p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((item) => (
            <li key={item.id}>
              <Link
                href={`/negotiations/${item.id}`}
                className="block rounded-lg border border-border bg-surface p-5 transition hover:-translate-y-0.5 hover:border-teal/40 hover:shadow-[0_12px_32px_rgba(20,32,51,0.08)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-[family-name:var(--font-shippori)] text-lg text-navy">
                      {item.topic}
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      <span className="font-mono text-teal">
                        商品コード（SKU）：{item.productSku?.trim() || "—"}
                      </span>
                      {" · "}
                      {item.productName}
                    </p>
                    <p className="mt-0.5 text-sm text-muted">
                      相手: {item.counterpartName}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    {item.applicationStatus === "rejected" ? (
                      <span className="inline-flex rounded border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
                        終了
                      </span>
                    ) : item.pipelineStatus ? (
                      <PipelineStatusBadge status={item.pipelineStatus} />
                    ) : (
                      <span className="inline-flex rounded border border-teal/25 bg-teal/10 px-2 py-0.5 text-xs font-medium text-teal-dark">
                        交渉中
                      </span>
                    )}
                  </div>
                </div>
                <p className="mt-3 text-xs text-muted">
                  開始日: {formatDate(item.createdAt)}
                  {item.hasDeal ? " ・成約済" : ""}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
