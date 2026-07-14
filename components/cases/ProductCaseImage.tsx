export const PRODUCT_IMAGE_PLACEHOLDER = "/product-placeholder.svg";

type ProductCaseImageProps = {
  src?: string | null;
  alt?: string;
  /**
   * - detail: real image up to 400px; NULL → small placeholder only (no large frame)
   * - thumb: list/admin thumbnail (or small placeholder)
   * - card: card media when image exists; NULL → small placeholder
   */
  size?: "detail" | "thumb" | "card" | "tiny";
  className?: string;
  imageClassName?: string;
};

const PLACEHOLDER_FRAME: Record<
  NonNullable<ProductCaseImageProps["size"]>,
  string
> = {
  detail: "h-14 w-14",
  thumb: "h-12 w-12",
  card: "h-14 w-14",
  tiny: "h-10 w-10",
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
 * NULL product_image_url → small placeholder only (never a large empty frame).
 * Real URL → sized frame; detail max 400px.
 */
export function ProductCaseImage({
  src,
  alt = "",
  size = "thumb",
  className = "",
  imageClassName = "object-cover",
}: ProductCaseImageProps) {
  const url = src?.trim() || null;
  const isPlaceholder = !url;
  const frame = isPlaceholder ? PLACEHOLDER_FRAME[size] : IMAGE_FRAME[size];

  return (
    <span
      className={[
        "relative inline-block overflow-hidden rounded-md border border-border bg-cream",
        frame,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url || PRODUCT_IMAGE_PLACEHOLDER}
        alt={isPlaceholder ? "商品画像未設定" : alt}
        className={["h-full w-full", imageClassName].join(" ")}
      />
    </span>
  );
}
