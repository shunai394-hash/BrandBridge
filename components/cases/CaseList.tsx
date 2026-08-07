"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { CaseFilter } from "@/components/cases/CaseFilter";
import { EmptyCasesState } from "@/components/cases/EmptyCasesState";
import { Button } from "@/components/ui/Button";
import { casePublicStatusLabel } from "@/lib/case-display";
import {
  displayMoq,
  displayPriceBand,
  matchesMoqFilter,
  priceBandPresets,
  PRICE_BAND_QUOTE_REQUIRED,
} from "@/lib/price-display";
import {
  caseCategories,
  salesFormatLabel,
  targetCountryLabel,
  type Case,
  type CaseStatus,
  type ExclusiveFilter,
  type ReviewStatus,
  type SalesFormat,
  type TargetCountry,
  type UserRole,
} from "@/lib/types";

/** Row for /cases — never includes caseNumber. */
export type CaseListItem = {
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
  productImageUrl: string | null;
  priceBand: string | null;
  minOrder: string | null;
  /** Server may send this; CaseList must NOT display it. Use apiMeta only. */
  applicationCount?: number;
  status: CaseStatus;
  reviewStatus: ReviewStatus;
  /** Server may send this; CaseList must NOT display it. Use apiMeta only. */
  hasDeal?: boolean;
};

type PageAuthDebug = {
  userId: string | null;
  count: number;
  atl0010: {
    sku: string | null;
    applicationCount: number;
    hasDeal: boolean;
  } | null;
  hyc0003: {
    sku: string | null;
    applicationCount: number;
    hasDeal: boolean;
  } | null;
  aob0002: {
    sku: string | null;
    applicationCount: number;
    hasDeal: boolean;
  } | null;
};

type CaseListProps = {
  items?: CaseListItem[];
  cases?: Case[] | CaseListItem[];
  initialCategory?: string;
  viewerRole?: UserRole | null;
  /** Server CASE PAGE AUTH payload — logged in browser for guest vs login compare */
  pageAuthDebug?: PageAuthDebug;
};

/** Bump when list columns change so StaleProductListGuard can force refresh. */
export const CASE_LIST_VERSION = "sku-pricing-moq-v25";

type CaseMeta = {
  applicationCount: number;
  hasDeal: boolean;
};

type DisplayRow = {
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
  productImageUrl: string | null;
  priceBand: string | null;
  minOrder: string | null;
  status: CaseStatus;
  reviewStatus: ReviewStatus;
};

function toDisplayRow(item: Case | CaseListItem): DisplayRow {
  return {
    id: item.id,
    title: item.title,
    productName: item.productName,
    sku: item.sku ?? null,
    summary: item.summary,
    makerName: item.makerName,
    category: item.category,
    targetCountry: item.targetCountry,
    salesFormat: item.salesFormat,
    isExclusive: item.isExclusive,
    productImageUrl: item.productImageUrl ?? null,
    priceBand: item.priceBand ?? null,
    minOrder: item.minOrder ?? null,
    status: item.status,
    reviewStatus: item.reviewStatus,
  };
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

/**
 * Sole /cases table for guest and logged-in.
 * Columns: SKU → 商品名 → カテゴリ → 原産国 → 販売形式 →
 * 参考卸価格帯 → MOQ → 応募件数 → 状態 → 操作
 * （一覧に商品画像は出さない）
 */
export function CaseList({
  items,
  cases,
  initialCategory = "すべて",
  viewerRole: _viewerRole,
  pageAuthDebug,
}: CaseListProps) {
  const sourceItems = items?.length ? items : cases?.length ? cases : [];
  const rows = sourceItems;

  useEffect(() => {
    if (pageAuthDebug) {
      console.log("CASE PAGE AUTH", pageAuthDebug);
    }
  }, [pageAuthDebug, rows]);

  const baseRows: DisplayRow[] = useMemo(
    () => sourceItems.map(toDisplayRow),
    [sourceItems],
  );

  const startCategory = (caseCategories as readonly string[]).includes(
    initialCategory,
  )
    ? initialCategory
    : "すべて";

  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState(startCategory);
  const [country, setCountry] = useState("すべて");
  const [salesFormat, setSalesFormat] = useState("すべて");
  const [priceBand, setPriceBand] = useState("すべて");
  const [moq, setMoq] = useState("すべて");
  const [exclusive, setExclusive] = useState<ExclusiveFilter>("すべて");
  const [apiMeta, setApiMeta] = useState<Record<string, CaseMeta> | null>(
    null,
  );

  const rowIdsKey = useMemo(
    () =>
      baseRows
        .map((r) => r.id)
        .sort()
        .join(","),
    [baseRows],
  );
  const rowsRef = useRef(baseRows);
  rowsRef.current = baseRows;
  const rowIdsKeyRef = useRef(rowIdsKey);
  rowIdsKeyRef.current = rowIdsKey;

  useEffect(() => {
    // CaseList is only mounted on /cases; always load counts when rows exist.
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
        for (const row of rowsRef.current) {
          next[row.id] = readMeta(root, row.id, row.sku?.trim() || null);
        }

        if (rowIdsKeyRef.current !== keyAtStart) return;
        setApiMeta(next);
      } catch (err) {
        console.error("[CaseList] case-application-counts", err);
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
    return baseRows.filter((item) => {
      const matchCategory = category === "すべて" || item.category === category;
      const matchCountry =
        country === "すべて" || item.targetCountry === country;
      const matchFormat =
        salesFormat === "すべて" || item.salesFormat === salesFormat;
      const displayedBand = displayPriceBand(item.priceBand);
      const matchPriceBand =
        priceBand === "すべて" ||
        (priceBand === "__other__"
          ? !(priceBandPresets as readonly string[]).includes(displayedBand)
          : displayedBand === priceBand ||
            (priceBand === PRICE_BAND_QUOTE_REQUIRED &&
              !item.priceBand?.trim()));
      const matchMoq = matchesMoqFilter(item.minOrder, moq);
      const matchExclusive =
        exclusive === "すべて" ||
        (exclusive === "独占可" && item.isExclusive) ||
        (exclusive === "非独占" && !item.isExclusive);
      const matchKeyword =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.productName.toLowerCase().includes(q) ||
        (item.sku?.toLowerCase().includes(q) ?? false) ||
        item.summary.toLowerCase().includes(q) ||
        item.makerName.toLowerCase().includes(q) ||
        displayedBand.toLowerCase().includes(q) ||
        displayMoq(item.minOrder).toLowerCase().includes(q);
      return (
        matchCategory &&
        matchCountry &&
        matchFormat &&
        matchPriceBand &&
        matchMoq &&
        matchExclusive &&
        matchKeyword
      );
    });
  }, [
    baseRows,
    keyword,
    category,
    country,
    salesFormat,
    priceBand,
    moq,
    exclusive,
  ]);

  if (baseRows.length === 0) {
    return <EmptyCasesState variant="list" />;
  }

  return (
    <div
      className="space-y-6"
      data-component="CaseList"
      data-product-list-version={CASE_LIST_VERSION}
      data-counts-ready={apiMeta ? "1" : "0"}
      data-testid="product-list-root"
    >
      <CaseFilter
        keyword={keyword}
        category={category}
        country={country}
        salesFormat={salesFormat}
        priceBand={priceBand}
        moq={moq}
        exclusive={exclusive}
        categories={caseCategories}
        onKeywordChange={setKeyword}
        onCategoryChange={setCategory}
        onCountryChange={setCountry}
        onSalesFormatChange={setSalesFormat}
        onPriceBandChange={setPriceBand}
        onMoqChange={setMoq}
        onExclusiveChange={setExclusive}
      />

      <p className="text-sm text-muted">{filtered.length}件の商品</p>

      {filtered.length === 0 ? (
        <EmptyCasesState variant="filtered" />
      ) : (
        <div className="w-full overflow-x-auto rounded-lg border border-border bg-surface">
          <table
            className="w-full min-w-[72rem] table-fixed text-left text-sm"
            data-testid="product-list-table"
          >
            <thead className="border-b border-border bg-cream/50 text-xs text-muted">
              <tr>
                <th className="w-[9rem] px-3 py-3 font-medium" scope="col">
                  商品番号（SKU）
                </th>
                <th className="px-3 py-3 font-medium" scope="col">
                  商品名
                </th>
                <th className="w-28 px-3 py-3 font-medium" scope="col">
                  カテゴリ
                </th>
                <th className="w-24 px-3 py-3 font-medium" scope="col">
                  原産国
                </th>
                <th className="w-24 px-3 py-3 font-medium" scope="col">
                  販売形式
                </th>
                <th className="w-36 px-3 py-3 font-medium" scope="col">
                  参考卸価格帯
                </th>
                <th className="w-28 px-3 py-3 font-medium" scope="col">
                  MOQ（最低発注数量）
                </th>
                <th className="w-24 px-3 py-3 font-medium" scope="col">
                  応募件数
                </th>
                <th className="w-24 px-3 py-3 font-medium" scope="col">
                  状態
                </th>
                <th className="w-40 px-3 py-3 font-medium" scope="col">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const applicationCount = apiMeta
                  ? (apiMeta[item.id]?.applicationCount ?? 0)
                  : null;
                const hasDeal = apiMeta
                  ? Boolean(apiMeta[item.id]?.hasDeal)
                  : false;
                const status = apiMeta
                  ? casePublicStatusLabel({
                      status: item.status,
                      reviewStatus: item.reviewStatus,
                      hasDeal: apiMeta[item.id]?.hasDeal,
                    })
                  : "…";
                const negotiateHref = `/cases/${item.id}/negotiation`;
                const sku = item.sku?.trim() || "";

                return (
                  <tr
                    key={item.id}
                    className="border-b border-border last:border-0"
                    data-product-id={item.id}
                    data-has-deal={
                      apiMeta ? (hasDeal ? "1" : "0") : undefined
                    }
                    data-price-band={displayPriceBand(item.priceBand)}
                    data-moq={displayMoq(item.minOrder)}
                  >
                    <td className="px-3 py-3 font-mono text-xs font-medium text-teal">
                      {sku || "—"}
                    </td>
                    <td className="px-3 py-3">
                      <Link
                        href={`/cases/${item.id}`}
                        prefetch={false}
                        className="font-medium text-navy hover:text-teal hover:underline"
                      >
                        {item.productName}
                      </Link>
                    </td>
                    <td className="px-3 py-3">{item.category}</td>
                    <td className="px-3 py-3">
                      {targetCountryLabel(item.targetCountry)}
                    </td>
                    <td className="px-3 py-3">
                      {salesFormatLabel(item.salesFormat)}
                    </td>
                    <td className="px-3 py-3 font-medium text-navy">
                      {displayPriceBand(item.priceBand)}
                    </td>
                    <td className="px-3 py-3">{displayMoq(item.minOrder)}</td>
                    <td
                      className="px-3 py-3"
                      data-application-count={
                        applicationCount === null
                          ? undefined
                          : applicationCount
                      }
                      data-sku={sku || undefined}
                    >
                      {applicationCount === null
                        ? "…"
                        : `${applicationCount}件`}
                    </td>
                    <td className="px-3 py-3" data-status={status}>
                      {status === "成約済み" ? (
                        <span className="font-medium text-red-600">
                          {status}
                        </span>
                      ) : status === "公開中" ? (
                        <span className="text-teal">{status}</span>
                      ) : (
                        <span className="text-navy">{status}</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <Link
                          href={`/cases/${item.id}`}
                          prefetch={false}
                          className="text-sm font-medium text-teal hover:underline"
                        >
                          詳細
                        </Link>
                        <Button href={negotiateHref} prefetch={false}>
                          交渉開始
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

export { CaseList as ProductList };
