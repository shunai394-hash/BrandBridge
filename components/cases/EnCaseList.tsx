"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { casePublicStatusLabel } from "@/lib/case-display";
import {
  enCategoryLabel,
  resolveEnCatalogDisplay,
} from "@/lib/en-case-catalog";
import {
  brandDisplayName,
  brandOriginBadge,
  lookingForLabel,
  opportunityMoqLabel,
  partnershipLabel,
  targetChannelsLabel,
} from "@/lib/en-japan-opportunity";
import type {
  CaseStatus,
  ReviewStatus,
  SalesFormat,
  TargetCountry,
} from "@/lib/types";

export type EnCaseListItem = {
  id: string;
  title: string;
  productName: string;
  sku: string | null;
  summary: string;
  makerName: string;
  brandName: string | null;
  shipFrom: string | null;
  partnerChannels: string | null;
  category: string;
  targetCountry: TargetCountry;
  salesFormat: SalesFormat;
  isExclusive: boolean;
  priceBand: string | null;
  minOrder: string | null;
  status: CaseStatus;
  reviewStatus: ReviewStatus;
};

type CaseMeta = {
  applicationCount: number;
  hasDeal: boolean;
};

const STATUS_EN: Record<string, string> = {
  成約済み: "Deal closed",
  取り下げ: "Withdrawn",
  不承認: "Rejected",
  審査待ち: "Pending review",
  公開中: "Open",
  公開終了: "Closed",
};

function statusLabelEn(input: {
  status: CaseStatus;
  reviewStatus: ReviewStatus;
  hasDeal?: boolean;
}): string {
  const ja = casePublicStatusLabel(input);
  return STATUS_EN[ja] ?? ja;
}

function readMeta(
  json: Record<string, unknown>,
  id: string,
  sku: string | null,
): CaseMeta {
  const byId = json[id];
  const bySku = sku ? json[sku] : undefined;
  const entry =
    byId && typeof byId === "object" && !Array.isArray(byId)
      ? byId
      : bySku && typeof bySku === "object" && !Array.isArray(bySku)
        ? bySku
        : null;
  if (!entry) return { applicationCount: 0, hasDeal: false };
  const meta = entry as Record<string, unknown>;
  return {
    applicationCount: Number(meta.applicationCount) || 0,
    hasDeal: Boolean(meta.hasDeal),
  };
}

type EnCaseListProps = {
  items: EnCaseListItem[];
};

/**
 * English /en/cases — Japan expansion opportunities (display framing only).
 */
export function EnCaseList({ items }: EnCaseListProps) {
  const [keyword, setKeyword] = useState("");
  const [apiMeta, setApiMeta] = useState<Record<string, CaseMeta> | null>(
    null,
  );

  const rowIdsKey = useMemo(
    () =>
      items
        .map((r) => r.id)
        .sort()
        .join(","),
    [items],
  );
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const rowIdsKeyRef = useRef(rowIdsKey);
  rowIdsKeyRef.current = rowIdsKey;

  useEffect(() => {
    if (!rowIdsKey) return;
    const ids = rowIdsKey.split(",");
    const keyAtStart = rowIdsKey;

    async function load(attempt: number) {
      try {
        const res = await fetch("/api/case-application-counts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids }),
          cache: "no-store",
          credentials: "same-origin",
        });
        if (!res.ok) throw new Error(`counts ${res.status}`);
        const json: unknown = await res.json();
        if (
          json &&
          typeof json === "object" &&
          typeof (json as { error?: unknown }).error === "string"
        ) {
          throw new Error((json as { error: string }).error);
        }
        const root =
          json && typeof json === "object"
            ? (json as Record<string, unknown>)
            : {};
        const next: Record<string, CaseMeta> = {};
        for (const row of itemsRef.current) {
          next[row.id] = readMeta(root, row.id, row.sku?.trim() || null);
        }
        if (rowIdsKeyRef.current !== keyAtStart) return;
        setApiMeta(next);
      } catch (err) {
        console.error("[EnCaseList] case-application-counts", err);
        if (rowIdsKeyRef.current !== keyAtStart) return;
        if (attempt < 3) {
          await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
          if (rowIdsKeyRef.current === keyAtStart) await load(attempt + 1);
        }
      }
    }

    void load(0);
  }, [rowIdsKey]);

  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      const en = resolveEnCatalogDisplay({
        id: item.id,
        sku: item.sku,
        productName: item.productName,
        category: item.category,
        summary: item.summary,
      });
      const brand = brandDisplayName({
        brandName: item.brandName,
        productName: en.productName,
        makerName: item.makerName,
      });
      return (
        brand.toLowerCase().includes(q) ||
        en.productName.toLowerCase().includes(q) ||
        item.productName.toLowerCase().includes(q) ||
        (item.sku?.toLowerCase().includes(q) ?? false) ||
        en.category.toLowerCase().includes(q) ||
        item.makerName.toLowerCase().includes(q) ||
        (item.brandName?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [items, keyword]);

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-surface px-5 py-10 text-center text-sm text-muted">
        No open Japan expansion opportunities yet.
      </div>
    );
  }

  return (
    <div className="space-y-6" data-component="EnCaseList">
      <label className="block max-w-md text-sm">
        <span className="mb-1.5 block font-medium text-navy">Search</span>
        <input
          type="search"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Brand, category, SKU…"
          className="w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20"
        />
      </label>

      <p className="text-sm text-muted">
        {filtered.length === 1
          ? "1 opportunity"
          : `${filtered.length} opportunities`}
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-surface px-5 py-10 text-center text-sm text-muted">
          No opportunities match your search.
        </div>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => {
            const en = resolveEnCatalogDisplay({
              id: item.id,
              sku: item.sku,
              productName: item.productName,
              category: item.category,
              summary: item.summary,
            });
            const origin = brandOriginBadge({
              shipFrom: item.shipFrom,
              targetCountry: item.targetCountry,
            });
            const brand = brandDisplayName({
              brandName: item.brandName,
              productName: en.productName,
              makerName: item.makerName,
            });
            const lookingFor = lookingForLabel(item.salesFormat);
            const partnership = partnershipLabel({
              salesFormat: item.salesFormat,
              isExclusive: item.isExclusive,
            });
            const category = enCategoryLabel(item.category);
            const moq = opportunityMoqLabel(item.minOrder);
            const target = targetChannelsLabel({
              partnerChannels: item.partnerChannels,
              salesFormat: item.salesFormat,
            });
            const hasDeal = apiMeta
              ? Boolean(apiMeta[item.id]?.hasDeal)
              : false;
            const status = apiMeta
              ? statusLabelEn({
                  status: item.status,
                  reviewStatus: item.reviewStatus,
                  hasDeal: apiMeta[item.id]?.hasDeal,
                })
              : "…";
            const detailHref = `/en/cases/${item.id}`;
            const negotiateHref = `/cases/${item.id}/negotiation`;

            return (
              <li key={item.id}>
                <article
                  className="flex h-full flex-col rounded-lg border border-border bg-surface p-5 transition duration-200 hover:-translate-y-0.5 hover:border-teal/50 hover:shadow-[0_12px_32px_rgba(20,32,51,0.08)]"
                  data-product-id={item.id}
                  data-has-deal={
                    apiMeta ? (hasDeal ? "1" : "0") : undefined
                  }
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium text-navy">
                      <span aria-hidden="true">{origin.flag} </span>
                      {origin.label}
                    </p>
                    <span
                      className={
                        status === "Deal closed"
                          ? "text-xs font-medium text-red-600"
                          : status === "Open"
                            ? "text-xs text-teal"
                            : "text-xs text-muted"
                      }
                      data-status={status}
                    >
                      {status}
                    </span>
                  </div>

                  <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-teal">
                    Japan Expansion Opportunity
                  </p>

                  <h2 className="mt-2 font-[family-name:var(--font-shippori)] text-xl leading-snug text-navy">
                    <Link
                      href={detailHref}
                      prefetch={false}
                      className="hover:text-teal hover:underline"
                    >
                      {brand}
                    </Link>
                  </h2>

                  <dl className="mt-4 flex-1 space-y-2.5 text-sm">
                    <div className="grid grid-cols-[6.5rem_1fr] gap-x-2 gap-y-1">
                      <dt className="text-muted">Brand</dt>
                      <dd className="font-medium text-navy">{brand}</dd>
                      <dt className="text-muted">Looking for</dt>
                      <dd className="text-navy">{lookingFor}</dd>
                      <dt className="text-muted">Partnership</dt>
                      <dd className="text-navy">{partnership}</dd>
                      <dt className="text-muted">Category</dt>
                      <dd className="text-navy">{category}</dd>
                      <dt className="text-muted">MOQ</dt>
                      <dd className="text-navy">{moq}</dd>
                      <dt className="text-muted">Target</dt>
                      <dd className="text-navy">{target}</dd>
                    </div>
                  </dl>

                  {en.summary ? (
                    <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-foreground/80">
                      {en.summary}
                    </p>
                  ) : null}

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <Link
                      href={detailHref}
                      prefetch={false}
                      className="text-sm font-medium text-teal hover:underline"
                    >
                      View Opportunity
                    </Link>
                    <Button href={negotiateHref} prefetch={false}>
                      Discuss Partnership
                    </Button>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

