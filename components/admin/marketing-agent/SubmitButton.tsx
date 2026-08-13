"use client";

import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  children: string;
  pendingLabel?: string;
  variant?: "primary" | "outline";
  className?: string;
};

export function SubmitButton({
  children,
  pendingLabel = "実行中…",
  variant = "primary",
  className = "",
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  const base =
    variant === "outline"
      ? "border border-border bg-transparent text-navy hover:border-teal hover:text-teal"
      : "bg-teal text-white hover:bg-teal-dark";

  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex cursor-pointer items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${base} ${className}`}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
