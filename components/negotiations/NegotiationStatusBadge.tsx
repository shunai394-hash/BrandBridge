import type { ApplicationStatus, PipelineStatus } from "@/lib/types";
import {
  applicationStatusLabels,
  pipelineStatusLabels,
} from "@/lib/types";

const appStyles: Record<ApplicationStatus, string> = {
  pending: "bg-amber-50 text-amber-800 border-amber-200",
  accepted: "bg-teal/10 text-teal-dark border-teal/25",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

const pipelineStyles: Record<PipelineStatus, string> = {
  in_negotiation: "bg-sky-50 text-sky-800 border-sky-200",
  terms_review: "bg-indigo-50 text-indigo-800 border-indigo-200",
  contract_prep: "bg-violet-50 text-violet-800 border-violet-200",
  won: "bg-teal/10 text-teal-dark border-teal/30",
  closed: "bg-slate-100 text-slate-600 border-slate-200",
};

type NegotiationStatusBadgeProps = {
  status: ApplicationStatus;
};

export function NegotiationStatusBadge({ status }: NegotiationStatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded border px-2 py-0.5 text-xs font-medium ${appStyles[status]}`}
    >
      {applicationStatusLabels[status]}
    </span>
  );
}

type PipelineStatusBadgeProps = {
  status: PipelineStatus | null;
};

export function PipelineStatusBadge({ status }: PipelineStatusBadgeProps) {
  if (!status) return null;
  return (
    <span
      className={`inline-flex rounded border px-2 py-0.5 text-xs font-medium ${pipelineStyles[status]}`}
    >
      {pipelineStatusLabels[status]}
    </span>
  );
}
