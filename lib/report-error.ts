type AppError = Error & {
  digest?: string;
  cause?: unknown;
};

function serializeCause(cause: unknown): string | undefined {
  if (cause == null) return undefined;
  if (cause instanceof Error) {
    return `${cause.name}: ${cause.message}`;
  }
  try {
    return JSON.stringify(cause);
  } catch {
    return String(cause);
  }
}

/** Structured fields safe to log / optionally display. */
export function getErrorDiagnostics(error: AppError) {
  return {
    name: error.name || "Error",
    message: error.message || "(no message)",
    digest: error.digest ?? null,
    stack: error.stack ?? null,
    cause: serializeCause(error.cause),
    env: process.env.NODE_ENV,
    showDetails:
      process.env.NODE_ENV === "development" ||
      process.env.NEXT_PUBLIC_SHOW_ERROR_DETAILS === "true",
  };
}

/**
 * Log to browser console (and Vercel Runtime Logs when the boundary runs on server).
 * Prefer looking for the original server exception in Function / Runtime logs by digest.
 */
export function reportBoundaryError(
  boundary: "app/error" | "app/global-error",
  error: AppError,
) {
  const diagnostics = getErrorDiagnostics(error);
  const payload = {
    boundary,
    ...diagnostics,
    href: typeof window !== "undefined" ? window.location.href : null,
    time: new Date().toISOString(),
  };

  // Multi-line + object so Vercel / browser both surface something useful
  console.error(
    `[${boundary}] ${diagnostics.name}: ${diagnostics.message}`,
    diagnostics.digest ? `(digest: ${diagnostics.digest})` : "(no digest)",
  );
  console.error(`[${boundary}] diagnostics`, payload);
  if (diagnostics.stack) {
    console.error(`[${boundary}] stack\n${diagnostics.stack}`);
  }
  if (diagnostics.cause) {
    console.error(`[${boundary}] cause`, diagnostics.cause);
  }

  return diagnostics;
}
