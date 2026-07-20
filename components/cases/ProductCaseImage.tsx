export const PRODUCT_IMAGE_PLACEHOLDER = "/product-placeholder.svg";

type ProductCaseImageProps = {
  src?: string | null;
  alt?: string;
  /**
   * - detail: real image up to 400px; NULL → text-only empty state (unless usePlaceholder)
   * - thumb: list/admin thumbnail
   * - card: card media
   */
  size?: "detail" | "thumb" | "card" | "tiny";
  className?: string;
  imageClassName?: string;
  /** When true and src is empty, show /product-placeholder.svg */
  usePlaceholder?: boolean;
};

const EMPTY_FRAME: Record<NonNullable<ProductCaseImageProps["size"]>, string> =
  {
    detail: "aspect-square h-auto w-full max-w-[400px] min-h-[8rem]",
    thumb: "h-14 w-14",
    card: "h-40 w-full",
    tiny: "h-20 w-20",
  };

const IMAGE_FRAME: Record<NonNullable<ProductCaseImageProps["size"]>, string> =
  {
    detail: "aspect-square h-auto w-full max-w-[400px]",
    thumb: "h-14 w-14",
    card: "h-40 w-full",
    tiny: "h-10 w-10",
  };

/**
 * Product image display.
 * Real URL → sized frame.
 * Empty + usePlaceholder → placeholder SVG.
 * Empty otherwise → text-only empty state.
 */
export function ProductCaseImage({
  src,
  alt = "",
  size = "thumb",
  className = "",
  imageClassName = "object-cover",
  usePlaceholder = false,
}: ProductCaseImageProps) {
  const url = src?.trim() || null;
  const displayUrl = url || (usePlaceholder ? PRODUCT_IMAGE_PLACEHOLDER : null);

  if (!displayUrl) {
    return (
      <span
        className={[
          "inline-flex flex-col items-center justify-center gap-0.5 rounded-md border border-dashed border-border bg-cream px-2 text-center",
          EMPTY_FRAME[size],
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        role="img"
        aria-label="商品画像 未登録"
      >
        <span className="text-xs font-medium text-navy">商品画像</span>
        <span className="text-xs text-muted">未登録</span>
      </span>
    );
  }

  return (
    <span
      className={[
        "relative inline-block overflow-hidden rounded-md border border-border bg-cream",
        IMAGE_FRAME[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={displayUrl}
        alt={url ? alt : "商品画像未登録"}
        className={["h-full w-full", imageClassName].join(" ")}
      />
    </span>
  );
}
