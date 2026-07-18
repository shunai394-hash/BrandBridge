/**
 * Display helpers for case list tables (partner / maker / admin).
 */

import type { CaseStatus, ReviewStatus } from "@/lib/types";
import { reviewStatusLabels } from "@/lib/types";

export function formatCaseDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/** Marketplace-facing status for partner / maker lists */
export function casePublicStatusLabel(input: {
  status: CaseStatus | string;
  reviewStatus: ReviewStatus | string;
  hasDeal?: boolean;
}): string {
  const { status, reviewStatus, hasDeal } = input;
  if (hasDeal) return "成約済み";
  if (reviewStatus === "withdrawn") return "取り下げ";
  if (reviewStatus === "rejected") return "不承認";
  if (reviewStatus === "pending_review") return "審査待ち";
  if (reviewStatus === "approved" && status === "open") return "公開中";
  if (reviewStatus === "approved" && status === "closed") return "公開終了";
  return (
    reviewStatusLabels[reviewStatus as ReviewStatus] ?? String(reviewStatus)
  );
}

export function caseNumberClassName() {
  return "sticky left-0 z-10 border-r border-border bg-surface px-4 py-3 font-mono text-xs font-medium text-navy";
}

export function caseNumberHeaderClassName() {
  return "sticky left-0 z-20 border-r border-border bg-cream/50 px-4 py-3 font-medium";
}
