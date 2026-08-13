"use client";

import { useState, type ReactNode } from "react";
import { SubmitButton } from "./SubmitButton";

type ActionResult = { ok: boolean; message: string };

export function ActionForm({
  action,
  children,
  label,
  pendingLabel,
  hidden,
}: {
  action: (formData: FormData) => Promise<ActionResult>;
  children?: ReactNode;
  label: string;
  pendingLabel?: string;
  hidden?: Record<string, string>;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [ok, setOk] = useState<boolean | null>(null);

  return (
    <form
      className="space-y-2"
      action={async (formData) => {
        setMessage(null);
        const result = await action(formData);
        setOk(result.ok);
        setMessage(result.message);
      }}
    >
      {hidden
        ? Object.entries(hidden).map(([key, value]) => (
            <input key={key} type="hidden" name={key} value={value} />
          ))
        : null}
      {children}
      <SubmitButton pendingLabel={pendingLabel}>{label}</SubmitButton>
      {message ? (
        <p className={ok ? "text-xs text-teal" : "text-xs text-red-600"}>
          {message}
        </p>
      ) : null}
    </form>
  );
}
