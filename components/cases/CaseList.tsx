"use client";

import { useMemo, useState } from "react";
import { CaseCard } from "@/components/cases/CaseCard";
import { CaseFilter } from "@/components/cases/CaseFilter";
import { EmptyCasesState } from "@/components/cases/EmptyCasesState";
import {
  caseCategories,
  type Case,
  type ExclusiveFilter,
} from "@/lib/types";

type CaseListProps = {
  cases: Case[];
  initialCategory?: string;
};

export function CaseList({ cases, initialCategory = "すべて" }: CaseListProps) {
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
        item.title.toLowerCase().includes(q) ||
        item.productName.toLowerCase().includes(q) ||
        item.makerName.toLowerCase().includes(q) ||
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
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((item, index) => (
            <CaseCard key={item.id} caseItem={item} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
