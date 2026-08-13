"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  pendingLabel,
}: {
  children: string;
  pendingLabel?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex cursor-pointer items-center justify-center rounded-md bg-teal px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-dark disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? pendingLabel || "実行中..." : children}
    </button>
  );
}
