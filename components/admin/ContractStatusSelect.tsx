"use client";

import { useTransition } from "react";
import { updateNegotiationPipelineStatus } from "@/lib/contract-actions";

type ContractStatusSelectProps = {
  negotiationId: string;
  status: string;
};

const statuses = [
  { value: "in_negotiation", label: "交渉中" },
  { value: "terms_review", label: "条件確認中" },
  { value: "contract_prep", label: "契約準備中" },
  { value: "won", label: "契約済み" },
  { value: "closed", label: "終了" },
];

export function ContractStatusSelect({
  negotiationId,
  status,
}: ContractStatusSelectProps) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      value={status}
      disabled={pending}
      onChange={(e) => {
        startTransition(async () => {
          await updateNegotiationPipelineStatus(
            negotiationId,
            e.target.value
          );
        });
      }}
      className="rounded border px-3 py-2"
    >
      {statuses.map((item) => (
        <option key={item.value} value={item.value}>
          {item.label}
        </option>
      ))}
    </select>
  );
}

