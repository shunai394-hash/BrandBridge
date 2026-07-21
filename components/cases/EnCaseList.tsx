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
  displayMoq,
  displayPriceBand,
  PRICE_BAND_QUOTE_REQUIRED,
} from "@/lib/price-display";
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

const SALES_FORMAT_EN: Record<SalesFormat, string> = {
  wholesale: "Wholesale",
  consignment: "Consignment",
  agency: "Agency",
  oem: "OEM / ODM",
  ec: "E-commerce",
  other: "Other",
};

const TARGET_MARKET_EN: Record<TargetCountry, string> = {
  JP: "Japan",
  US: "United States",
  CN: "China",
  ASEAN: "ASEAN",
  EU: "Europe",
  GLOBAL: "Global",
  OTHER: "Other",
};

const STATUS_EN: Record<string, string> = {
  成約済み: "Deal closed",
  取り下げ: "Withdrawn",
  不承認: "Rejected",
  審査待ち: "Pending review",
  公開中: "Open",
  公開終了: "Closed",
};

function displayPriceBandEn(value: string | null | undefined): string {
  const t = displayPriceBand(value);
  if (t === PRICE_BAND_QUOTE_REQUIRED || t === "見積条件あり") {
    return "Quote required";
  }
  return t;
}

function displayMoqEn(value: string | null | undefined): string {
  const t = displayMoq(value);
  if (t === "応相談") return "Negotiable";
  return t;
}

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
 * English /en/cases table — same columns as Japanese CaseList, English labels only.
 * No product images / card catalog UI.
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
      return (
        en.productName.toLowerCase().includes(q) ||
        item.productName.toLowerCase().includes(q) ||
        (item.sku?.toLowerCase().includes(q) ?? false) ||
        en.category.toLowerCase().includes(q) ||
        item.makerName.toLowerCase().includes(q)
      );
    });
  }, [items, keyword]);

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-surface px-5 py-10 text-center text-sm text-muted">
        No open products yet.
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
          placeholder="SKU, product name, category…"
          className="w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20"
        />
      </label>

      <p className="text-sm text-muted">
        {filtered.length} product{filtered.length === 1 ? "" : "s"}
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-surface px-5 py-10 text-center text-sm text-muted">
          No products match your search.
        </div>
      ) : (
        <div className="w-full overflow-x-auto rounded-lg border border-border bg-surface">
          <table className="w-full min-w-[72rem] table-fixed text-left text-sm">
            <thead className="border-b border-border bg-cream/50 text-xs text-muted">
              <tr>
                <th className="w-[9rem] px-3 py-3 font-medium" scope="col">
                  SKU
                </th>
                <th className="px-3 py-3 font-medium" scope="col">
                  Product Name
                </th>
                <th className="w-28 px-3 py-3 font-medium" scope="col">
                  Category
                </th>
                <th className="w-28 px-3 py-3 font-medium" scope="col">
                  Country of Origin
                </th>
                <th className="w-28 px-3 py-3 font-medium" scope="col">
                  Sales Format
                </th>
                <th className="w-36 px-3 py-3 font-medium" scope="col">
                  Wholesale Price Range
                </th>
                <th className="w-28 px-3 py-3 font-medium" scope="col">
                  MOQ
                </th>
                <th className="w-28 px-3 py-3 font-medium" scope="col">
                  Application Count
                </th>
                <th className="w-28 px-3 py-3 font-medium" scope="col">
                  Status
                </th>
                <th className="w-48 px-3 py-3 font-medium" scope="col">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const en = resolveEnCatalogDisplay({
                  id: item.id,
                  sku: item.sku,
                  productName: item.productName,
                  category: item.category,
                  summary: item.summary,
                });
                const applicationCount = apiMeta
                  ? (apiMeta[item.id]?.applicationCount ?? 0)
                  : null;
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
                const sku = item.sku?.trim() || "";
                const detailHref = `/en/cases/${item.id}`;
                const negotiateHref = `/cases/${item.id}/negotiation`;

                return (
                  <tr
                    key={item.id}
                    className="border-b border-border last:border-0"
                    data-product-id={item.id}
                    data-has-deal={
                      apiMeta ? (hasDeal ? "1" : "0") : undefined
                    }
                  >
                    <td className="px-3 py-3 font-mono text-xs font-medium text-teal">
                      {sku || "—"}
                    </td>
                    <td className="px-3 py-3">
                      <Link
                        href={detailHref}
                        prefetch={false}
                        className="font-medium text-navy hover:text-teal hover:underline"
                      >
                        {en.productName}
                      </Link>
                    </td>
                    <td className="px-3 py-3">
                      {enCategoryLabel(item.category)}
                    </td>
                    <td className="px-3 py-3">
                      {TARGET_MARKET_EN[item.targetCountry] ??
                        item.targetCountry}
                    </td>
                    <td className="px-3 py-3">
                      {SALES_FORMAT_EN[item.salesFormat] ?? item.salesFormat}
                    </td>
                    <td className="px-3 py-3 font-medium text-navy">
                      {displayPriceBandEn(item.priceBand)}
                    </td>
                    <td className="px-3 py-3">
                      {displayMoqEn(item.minOrder)}
                    </td>
                    <td className="px-3 py-3">
                      {applicationCount === null
                        ? "…"
                        : String(applicationCount)}
                    </td>
                    <td className="px-3 py-3" data-status={status}>
                      {status === "Deal closed" ? (
                        <span className="font-medium text-red-600">
                          {status}
                        </span>
                      ) : status === "Open" ? (
                        <span className="text-teal">{status}</span>
                      ) : (
                        <span className="text-navy">{status}</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <Link
                          href={detailHref}
                          prefetch={false}
                          className="text-sm font-medium text-teal hover:underline"
                        >
                          View Details
                        </Link>
                        <Button href={negotiateHref} prefetch={false}>
                          Start Negotiation
                        </Button>
                      </div>
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
