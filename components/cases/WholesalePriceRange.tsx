import type { WholesalePriceLocale } from "@/lib/wholesale-price-display";
import { resolveWholesalePriceDisplay } from "@/lib/wholesale-price-display";

type WholesalePriceRangeProps = {
  priceBand: string | null | undefined;
  locale: WholesalePriceLocale;
  className?: string;
};

/**
 * Locale-aware wholesale band:
 * - EN: USD primary + Approx. JPY
 * - JA: JPY primary + Approx. USD
 * Empty / quote / unparseable → single safe line (no throw).
 */
export function WholesalePriceRange({
  priceBand,
  locale,
  className,
}: WholesalePriceRangeProps) {
  const resolved = resolveWholesalePriceDisplay(priceBand, locale);

  if (resolved.kind === "single") {
    return <span className={className}>{resolved.primary}</span>;
  }

  return (
    <span className={["block", className].filter(Boolean).join(" ")}>
      <span className="block">{resolved.primary}</span>
      <span className="mt-0.5 block text-xs text-muted">{resolved.secondary}</span>
    </span>
  );
}
