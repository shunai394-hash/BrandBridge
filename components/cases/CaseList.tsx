"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CaseFilter } from "@/components/cases/CaseFilter";
import { EmptyCasesState } from "@/components/cases/EmptyCasesState";
import { Button } from "@/components/ui/Button";
import {
  caseNumberClassName,
  caseNumberHeaderClassName,
  casePublicStatusLabel,
} from "@/lib/case-display";
import {
  caseCategories,
  salesFormatLabel,
  targetCountryLabel,
  type Case,
  type ExclusiveFilter,
  type UserRole,
} from "@/lib/types";

type CaseListProps = {
  cases: Case[];
  initialCategory?: string;
  viewerRole?: UserRole | null;
};

export function CaseList({
  cases,
  initialCategory = "すべて",
}: CaseListProps) {
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

    return cases.filter((item) => {
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
        item.caseNumber.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.productName.toLowerCase().includes(q) ||
        (item.sku?.toLowerCase().includes(q) ?? false) ||
        item.summary.toLowerCase().includes(q);

      return (
        matchCategory &&
        matchCountry &&
        matchFormat &&
        matchExclusive &&
        matchKeyword
      );
    });
  }, [cases, keyword, category, country, salesFormat, exclusive]);

  if (cases.length === 0) {
    return <EmptyCasesState variant="list" />;
  }

  return (
    <div className="space-y-6">
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

      <p className="text-sm text-muted">{filtered.length}件の案件</p>

      {filtered.length === 0 ? (
        <EmptyCasesState variant="filtered" />
      ) : (
        <div className="w-full overflow-x-auto rounded-lg border border-border bg-surface">
          <table className="w-full min-w-[56rem] table-fixed text-left text-sm">
            <thead className="border-b border-border bg-cream/50 text-xs text-muted">
              <tr>
                <th className={`${caseNumberHeaderClassName()} w-[7.5rem]`}>
                  案件番号
                </th>
                <th className="px-4 py-3 font-medium">商品名</th>
                <th className="w-36 px-4 py-3 font-medium">カテゴリ</th>
                <th className="w-28 px-4 py-3 font-medium">原産国</th>
                <th className="w-28 px-4 py-3 font-medium">販売形式</th>
                <th className="w-24 px-4 py-3 font-medium">応募件数</th>
                <th className="w-24 px-4 py-3 font-medium">状態</th>
                <th className="w-44 px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const status = casePublicStatusLabel({
                  status: item.status,
                  reviewStatus: item.reviewStatus,
                });
                const negotiateHref = `/cases/${item.id}/negotiation`;

                return (
                  <tr
                    key={item.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className={caseNumberClassName()}>{item.caseNumber}</td>
                    <td className="px-4 py-3">
                      {/* 商品名のみ詳細へ（行全体のクリック遷移はしない） */}
                      <p className="mb-0.5 font-mono text-xs text-teal">
                        {item.sku?.trim() || "—"}
                      </p>
                      <Link
                        href={`/cases/${item.id}`}
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
                          className="text-sm font-medium text-teal hover:underline"
                        >
                          詳細
                        </Link>
                        <Button href={negotiateHref}>交渉する</Button>
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
