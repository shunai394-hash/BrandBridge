type BadgeTone = "teal" | "amber" | "red" | "muted" | "navy";

const tones: Record<BadgeTone, string> = {
  teal: "bg-teal/10 text-teal-dark",
  amber: "bg-amber-50 text-amber-800",
  red: "bg-red-50 text-red-700",
  muted: "bg-cream text-muted",
  navy: "bg-navy/10 text-navy",
};

export function StatusBadge({
  label,
  tone = "muted",
}: {
  label: string;
  tone?: BadgeTone;
}) {
  return (
    <span
      className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {label}
    </span>
  );
}

export function runStatusTone(
  status: string | null,
): BadgeTone {
  if (status === "succeeded") return "teal";
  if (status === "running" || status === "pending") return "amber";
  if (status === "failed") return "red";
  return "muted";
}

export function priorityTone(priority: string): BadgeTone {
  if (priority === "high") return "red";
  if (priority === "low") return "muted";
  return "amber";
}
