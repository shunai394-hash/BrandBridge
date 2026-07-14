"use client";

import { useId, useState, type InputHTMLAttributes } from "react";

type PasswordInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  label: string;
  error?: string;
};

const fieldClass =
  "w-full rounded-md border border-border bg-surface px-3.5 py-2.5 pr-11 text-sm text-foreground outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20";

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    // eye-off
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
        aria-hidden
      >
        <path d="M3 3l18 18" />
        <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
        <path d="M9.9 5.1A10.5 10.5 0 0 1 12 5c5 0 9.3 3.1 11 7.5a11.7 11.7 0 0 1-1.7 3.1" />
        <path d="M6.6 6.6A11.6 11.6 0 0 0 1 12.5C2.7 16.9 7 20 12 20a10.8 10.8 0 0 0 5.4-1.4" />
      </svg>
    );
  }

  // eye
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden
    >
      <path d="M1 12.5C2.7 8.1 7 5 12 5s9.3 3.1 11 7.5c-1.7 4.4-6 7.5-11 7.5S2.7 16.9 1 12.5z" />
      <circle cx="12" cy="12.5" r="3" />
    </svg>
  );
}

export function PasswordInput({
  label,
  error,
  id,
  className = "",
  ...props
}: PasswordInputProps) {
  const autoId = useId();
  const fieldId = id ?? props.name ?? autoId;
  const [visible, setVisible] = useState(false);

  return (
    <label className="flex flex-col gap-1.5 text-sm" htmlFor={fieldId}>
      <span className="font-medium text-navy">{label}</span>
      <span className="relative block">
        <input
          id={fieldId}
          type={visible ? "text" : "password"}
          className={`${fieldClass} ${className}`}
          {...props}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 flex items-center px-3 text-muted transition hover:text-navy"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "パスワードを隠す" : "パスワードを表示"}
          aria-pressed={visible}
          tabIndex={0}
        >
          <EyeIcon open={visible} />
        </button>
      </span>
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </label>
  );
}
