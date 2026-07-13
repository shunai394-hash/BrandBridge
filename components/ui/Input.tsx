import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
};

const fieldClass =
  "w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20";

export function Input({ label, error, id, className = "", ...props }: InputProps) {
  const fieldId = id ?? props.name;

  return (
    <label className="flex flex-col gap-1.5 text-sm" htmlFor={fieldId}>
      <span className="font-medium text-navy">{label}</span>
      <input id={fieldId} className={`${fieldClass} ${className}`} {...props} />
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </label>
  );
}

export function TextArea({
  label,
  error,
  id,
  className = "",
  rows = 4,
  ...props
}: TextAreaProps) {
  const fieldId = id ?? props.name;

  return (
    <label className="flex flex-col gap-1.5 text-sm" htmlFor={fieldId}>
      <span className="font-medium text-navy">{label}</span>
      <textarea
        id={fieldId}
        rows={rows}
        className={`${fieldClass} resize-y ${className}`}
        {...props}
      />
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </label>
  );
}
