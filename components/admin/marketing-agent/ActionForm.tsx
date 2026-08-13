"use client";

import { useActionState } from "react";
import type { ReactNode } from "react";
import { SubmitButton } from "@/components/admin/marketing-agent/SubmitButton";

type ActionResult = { error?: string };

type ActionFormProps = {
  action: (formData: FormData) => Promise<ActionResult>;
  children?: ReactNode;
  label: string;
  pendingLabel?: string;
  variant?: "primary" | "outline";
  className?: string;
};

export function ActionForm({
  action,
  children,
  label,
  pendingLabel,
  variant = "primary",
  className = "",
}: ActionFormProps) {
  const [state, formAction] = useActionState(
    async (_prev: ActionResult, formData: FormData): Promise<ActionResult> => {
      return action(formData);
    },
    {},
  );

  return (
    <form action={formAction} className={className}>
      {children}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <SubmitButton variant={variant} pendingLabel={pendingLabel}>
          {label}
        </SubmitButton>
        {state.error ? (
          <p className="text-sm text-red-700">{state.error}</p>
        ) : null}
      </div>
    </form>
  );
}

export function VoidActionForm({
  action,
  label,
  pendingLabel,
  variant = "primary",
  className = "",
}: {
  action: () => Promise<ActionResult>;
  label: string;
  pendingLabel?: string;
  variant?: "primary" | "outline";
  className?: string;
}) {
  const wrapped = async () => action();
  return (
    <ActionForm
      action={wrapped}
      label={label}
      pendingLabel={pendingLabel}
      variant={variant}
      className={className}
    />
  );
}
