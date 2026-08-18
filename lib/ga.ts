export const GA_MEASUREMENT_ID = "G-Q6DFW7PY0N";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackGaEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>,
): void {
  if (typeof window === "undefined") return;
  window.gtag?.("event", eventName, params);
}
