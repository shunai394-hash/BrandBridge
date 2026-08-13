const TONES: Record<string, string> = {
  idea: "bg-cream text-navy",
  planned: "bg-cream text-navy",
  draft: "bg-cream text-muted",
  review: "bg-amber-50 text-amber-800",
  pending_review: "bg-amber-50 text-amber-800",
  approved: "bg-teal/10 text-teal-dark",
  scheduled: "bg-navy/10 text-navy",
  published: "bg-teal text-white",
  failed: "bg-red-50 text-red-700",
  archived: "bg-cream text-muted",
  manual_publish_required: "bg-amber-50 text-amber-900",
  high: "bg-red-50 text-red-700",
  medium: "bg-cream text-navy",
  low: "bg-cream text-muted",
  open: "bg-navy/10 text-navy",
  running: "bg-amber-50 text-amber-800",
  completed: "bg-teal/10 text-teal-dark",
  active: "bg-teal/10 text-teal-dark",
};

export function StatusBadge({ value }: { value: string }) {
  return (
    <span
      className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${TONES[value] || "bg-cream text-muted"}`}
    >
      {value}
    </span>
  );
}
