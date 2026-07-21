"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PipelineStatusBadge } from "@/components/negotiations/NegotiationStatusBadge";
import {
  negotiationInboxCopy,
  type NegotiationUiLocale,
} from "@/lib/negotiation-ui";
import type { NegotiationListItem } from "@/lib/types";

type FilterKey = "all" | "unread" | "active" | "closed";

type NegotiationInboxProps = {
  items: NegotiationListItem[];
  /** Role-specific empty hint (overrides locale default when set) */
  emptyHint?: string;
  /** Default Japanese — Japanese routes unchanged. */
  locale?: NegotiationUiLocale;
};

function formatDateTime(value: string, locale: NegotiationUiLocale) {
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "ja-JP", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function NegotiationInbox({
  items,
  emptyHint,
  locale = "ja",
}: NegotiationInboxProps) {
  const t = negotiationInboxCopy[locale];
  const resolvedEmptyHint = emptyHint ?? t.emptyHintMaker;
  const [filter, setFilter] = useState<FilterKey>("all");

  const unreadThreads = useMemo(
    () => items.filter((i) => (i.unreadCount ?? 0) > 0).length,
    [items],
  );

  const activeCount = useMemo(
    () => items.filter((i) => i.applicationStatus !== "rejected").length,
    [items],
  );
  const closedCount = useMemo(
    () => items.filter((i) => i.applicationStatus === "rejected").length,
    [items],
  );

  const filters: { key: FilterKey; label: string }[] = [
    { key: "all", label: `${t.filters.all} (${items.length})` },
    { key: "unread", label: `${t.filters.unread} (${unreadThreads})` },
    { key: "active", label: `${t.filters.active} (${activeCount})` },
    { key: "closed", label: `${t.filters.closed} (${closedCount})` },
  ];

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    if (filter === "unread") {
      return items.filter((item) => (item.unreadCount ?? 0) > 0);
    }
    if (filter === "active") {
      return items.filter((item) => item.applicationStatus !== "rejected");
    }
    return items.filter((item) => item.applicationStatus === "rejected");
  }, [items, filter]);

  return (
    <div className="space-y-5" lang={locale === "en" ? "en" : undefined}>
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
            ? `${t.empty} ${resolvedEmptyHint}`
            : t.emptyFiltered}
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
                  href={
                    locale === "en"
                      ? `/en/negotiations/${item.id}`
                      : `/negotiations/${item.id}`
                  }
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
                            locale,
                          )}
                        </time>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-muted">
                        <span className="font-mono text-teal">
                          {t.sku}: {item.productSku?.trim() || "—"}
                        </span>
                        <span className="mx-1.5">·</span>
                        {item.productName}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted">
                        {t.counterpart}: {item.counterpartName}
                        {hasUnread
                          ? ` · ${t.unreadCount(item.unreadCount ?? 0)}`
                          : item.messageCount
                            ? ` · ${t.messageCount(item.messageCount)}`
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
                        {item.lastMessagePreview || t.noMessage}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {item.applicationStatus === "rejected" ? (
                          <span className="inline-flex rounded border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
                            {t.statusClosed}
                          </span>
                        ) : item.pipelineStatus ? (
                          <PipelineStatusBadge
                            status={item.pipelineStatus}
                            locale={locale}
                          />
                        ) : (
                          <span className="inline-flex rounded border border-teal/25 bg-teal/10 px-2 py-0.5 text-xs font-medium text-teal-dark">
                            {t.statusActive}
                          </span>
                        )}
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
