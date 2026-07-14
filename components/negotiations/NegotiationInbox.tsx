"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  NegotiationStatusBadge,
  PipelineStatusBadge,
} from "@/components/negotiations/NegotiationStatusBadge";
import type { ApplicationStatus, NegotiationListItem } from "@/lib/types";

type FilterKey = "all" | "unread" | ApplicationStatus;

type NegotiationInboxProps = {
  items: NegotiationListItem[];
  /** Role-specific empty hint */
  emptyHint?: string;
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function NegotiationInbox({
  items,
  emptyHint = "案件詳細から交渉を申し込むと、ここに表示されます。",
}: NegotiationInboxProps) {
  const [filter, setFilter] = useState<FilterKey>("all");

  const unreadThreads = useMemo(
    () => items.filter((i) => (i.unreadCount ?? 0) > 0).length,
    [items],
  );

  const filters: { key: FilterKey; label: string }[] = [
    { key: "all", label: `すべて (${items.length})` },
    { key: "unread", label: `未読 (${unreadThreads})` },
    { key: "pending", label: "審査中" },
    { key: "accepted", label: "承認済" },
    { key: "rejected", label: "却下" },
  ];

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    if (filter === "unread") {
      return items.filter((item) => (item.unreadCount ?? 0) > 0);
    }
    return items.filter((item) => item.applicationStatus === filter);
  }, [items, filter]);

  return (
    <div className="space-y-5">
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
        <p className="rounded-lg border border-dashed border-border bg-surface px-5 py-10 text-center text-sm text-muted">
          {items.length === 0
            ? `まだ交渉がありません。${emptyHint}`
            : "該当する交渉がありません。"}
        </p>
      ) : (
        <ul className="overflow-hidden rounded-lg border border-border bg-surface">
          {filtered.map((item) => {
            const hasUnread = (item.unreadCount ?? 0) > 0;
            return (
              <li
                key={item.id}
                className="border-b border-border last:border-0"
              >
                <Link
                  href={`/negotiations/${item.id}`}
                  className={[
                    "block px-4 py-3.5 transition hover:bg-cream/60 md:px-5",
                    hasUnread ? "bg-cream/35" : "",
                  ].join(" ")}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={[
                        "mt-2 h-2 w-2 shrink-0 rounded-full",
                        hasUnread ? "bg-teal" : "bg-transparent",
                      ].join(" ")}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                        <p
                          className={[
                            "truncate text-sm",
                            hasUnread
                              ? "font-semibold text-navy"
                              : "font-medium text-navy",
                          ].join(" ")}
                        >
                          {item.topic}
                        </p>
                        <time className="shrink-0 text-xs text-muted">
                          {formatDateTime(
                            item.lastMessageAt ?? item.updatedAt,
                          )}
                        </time>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-muted">
                        <span className="font-mono text-teal">
                          {item.caseNumber}
                        </span>
                        <span className="mx-1.5">·</span>
                        {item.productName}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted">
                        相手: {item.counterpartName}
                        {hasUnread
                          ? ` · 未読 ${item.unreadCount}件`
                          : item.messageCount
                            ? ` · メッセージ ${item.messageCount}件`
                            : ""}
                      </p>
                      <p
                        className={[
                          "mt-1.5 line-clamp-1 text-sm",
                          hasUnread
                            ? "font-medium text-foreground"
                            : "text-muted",
                        ].join(" ")}
                      >
                        {item.lastMessagePreview || "（メッセージなし）"}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <NegotiationStatusBadge
                          status={item.applicationStatus}
                        />
                        {item.pipelineStatus ? (
                          <PipelineStatusBadge status={item.pipelineStatus} />
                        ) : null}
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
