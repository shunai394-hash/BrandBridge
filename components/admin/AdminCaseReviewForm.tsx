"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { reviewCaseAction } from "@/lib/actions";
import { Button } from "@/components/ui/Button";
import { TextArea } from "@/components/ui/Input";
import type { Case } from "@/lib/types";
import { reviewStatusLabels } from "@/lib/types";

type AdminCaseReviewFormProps = {
  caseItem: Case;
};

export function AdminCaseReviewForm({ caseItem }: AdminCaseReviewFormProps) {
  const router = useRouter();
  const [note, setNote] = useState(caseItem.reviewNote ?? "");
  const [loading, setLoading] = useState<"approved" | "rejected" | null>(null);
  const [error, setError] = useState("");

  async function submit(status: "approved" | "rejected") {
    setError("");
    setLoading(status);
    const result = await reviewCaseAction({
      caseId: caseItem.id,
      reviewStatus: status,
      reviewNote: note,
    });
    setLoading(null);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <form
      onSubmit={(e: FormEvent) => e.preventDefault()}
      className="mt-8 space-y-4 rounded-lg border border-teal/25 bg-cream/70 p-5"
    >
      <p className="text-sm text-muted">
        現在の審査ステータス:{" "}
        <strong className="text-navy">
          {reviewStatusLabels[caseItem.reviewStatus]}
        </strong>
      </p>
      <TextArea
        label="審査メモ（却下理由など）"
        name="reviewNote"
        rows={3}
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <p className="text-xs text-muted">
        承認: review_status=approved / status=open（一覧に公開）
        <br />
        却下: review_status=rejected / status=closed（非公開）
      </p>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          onClick={() => submit("approved")}
          disabled={loading !== null}
        >
          {loading === "approved" ? "処理中..." : "承認する"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => submit("rejected")}
          disabled={loading !== null}
        >
          {loading === "rejected" ? "処理中..." : "却下する"}
        </Button>
      </div>
    </form>
  );
}
