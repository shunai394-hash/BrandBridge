"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CaseFilter } from "@/components/cases/CaseFilter";
import { EmptyCasesState } from "@/components/cases/EmptyCasesState";
import { Button } from "@/components/ui/Button";
import { casePublicStatusLabel } from "@/lib/case-display";
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
  applicationCount: number;
  status: CaseStatus;
  reviewStatus: ReviewStatus;
};

type CaseListProps = {
  /** Current page path */
  items?: CaseListItem[];
  /**
   * Soft Nav / HEAD RSC still sends `cases` + viewerRole for logged-in users.
   * Accept and map — never render caseNumber / BB- / 交渉する.
   */
  cases?: Case[] | CaseListItem[];
  initialCategory?: string;
  viewerRole?: UserRole | null;
};

export const CASE_LIST_VERSION = "sku-first-v10";

function toRow(item: Case | CaseListItem): CaseListItem {
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
    applicationCount: item.applicationCount ?? 0,
    status: item.status,
    reviewStatus: item.reviewStatus,
  };
}

/**
 * Sole /cases table for guest and logged-in.
 * Soft Nav module identity: components/cases/CaseList.tsx
 */
export function CaseList({
  items,
  cases,
  initialCategory = "すべて",
  viewerRole: _viewerRole,
}: CaseListProps) {
  const rows: CaseListItem[] = useMemo(() => {
    if (items?.length) return items;
    if (cases?.length) return cases.map(toRow);
    return [];
  }, [items, cases]);

  const startCategory = (caseCategories as readonly string[]).includes(
    initialCategory,
  )
    ? initialCategory
    : "すべて";

  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState(startCategory);
  const [country, setCountry] = useState("すべて");
  const [salesFormat, setSalesFormat] = useState("すべて");
  const [exclusive, setExclusive] = useState<ExclusiveFilter>("すべて");

  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    return rows.filter((item) => {
      const matchCategory = category === "すべて" || item.category === category;
      const matchCountry =
        country === "すべて" || item.targetCountry === country;
      const matchFormat =
        salesFormat === "すべて" || item.salesFormat === salesFormat;
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
        item.makerName.toLowerCase().includes(q);
      return (
        matchCategory &&
        matchCountry &&
        matchFormat &&
        matchExclusive &&
        matchKeyword
      );
    });
  }, [rows, keyword, category, country, salesFormat, exclusive]);

  if (rows.length === 0) {
    return <EmptyCasesState variant="list" />;
  }

  return (
    <div
      className="space-y-6"
      data-component="CaseList"
      data-product-list-version={CASE_LIST_VERSION}
      data-testid="product-list-root"
    >
      <CaseFilter
        keyword={keyword}
        category={category}
        country={country}
        salesFormat={salesFormat}
        exclusive={exclusive}
        categories={caseCategories}
        onKeywordChange={setKeyword}
        onCategoryChange={setCategory}
        onCountryChange={setCountry}
        onSalesFormatChange={setSalesFormat}
        onExclusiveChange={setExclusive}
      />

      <p className="text-sm text-muted">{filtered.length}件の商品</p>

      {filtered.length === 0 ? (
        <EmptyCasesState variant="filtered" />
      ) : (
        <div className="w-full overflow-x-auto rounded-lg border border-border bg-surface">
          <table
            className="w-full min-w-[56rem] table-fixed text-left text-sm"
            data-testid="product-list-table"
          >
            <thead className="border-b border-border bg-cream/50 text-xs text-muted">
              <tr>
                <th className="w-[10rem] px-4 py-3 font-medium" scope="col">
                  商品番号（SKU）
                </th>
                <th className="px-4 py-3 font-medium" scope="col">
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
              {filtered.map((item) => {
                const status = casePublicStatusLabel({
                  status: item.status,
                  reviewStatus: item.reviewStatus,
                });
                const negotiateHref = `/cases/${item.id}/negotiation`;
                const sku = item.sku?.trim() || "";

                return (
                  <tr
                    key={item.id}
                    className="border-b border-border last:border-0"
                    data-product-id={item.id}
                  >
                    <td className="px-4 py-3 font-mono text-xs font-medium text-teal">
                      {sku || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/cases/${item.id}`}
                        prefetch={false}
                        className="font-medium text-navy hover:text-teal hover:underline"
                      >
                        {item.productName}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{item.category}</td>
                    <td className="px-4 py-3">
                      {targetCountryLabel(item.targetCountry)}
                    </td>
                    <td className="px-4 py-3">
                      {salesFormatLabel(item.salesFormat)}
                    </td>
                    <td className="px-4 py-3">
                      {item.applicationCount ?? 0}件
                    </td>
                    <td className="px-4 py-3">
                      {status === "公開中" ? (
                        <span className="text-teal">{status}</span>
                      ) : (
                        <span className="text-navy">{status}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
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
