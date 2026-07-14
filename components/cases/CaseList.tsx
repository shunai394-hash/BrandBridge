"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CaseFilter } from "@/components/cases/CaseFilter";
import { EmptyCasesState } from "@/components/cases/EmptyCasesState";
import { ProductCaseImage } from "@/components/cases/ProductCaseImage";
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
        <div className="overflow-x-auto rounded-lg border border-border bg-surface">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border bg-cream/50 text-xs text-muted">
              <tr>
                <th className={caseNumberHeaderClassName()}>案件番号</th>
                <th className="px-4 py-3 font-medium">商品画像</th>
                <th className="px-4 py-3 font-medium">商品名</th>
                <th className="px-4 py-3 font-medium">カテゴリ</th>
                <th className="px-4 py-3 font-medium">原産国</th>
                <th className="px-4 py-3 font-medium">販売形式</th>
                <th className="px-4 py-3 font-medium">応募件数</th>
                <th className="px-4 py-3 font-medium">状態</th>
                <th className="px-4 py-3 font-medium">操作</th>
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
                      <Link href={`/cases/${item.id}`} className="inline-block">
                        <ProductCaseImage
                          src={item.productImageUrl}
                          alt={item.productName}
                        />
                      </Link>
                    </td>
                    <td className="px-4 py-3">
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
                      <div className="flex flex-wrap gap-2">
                        <Button href={`/cases/${item.id}`} variant="ghost">
                          詳細
                        </Button>
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
