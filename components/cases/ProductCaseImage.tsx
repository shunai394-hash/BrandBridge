export const PRODUCT_IMAGE_PLACEHOLDER = "/product-placeholder.svg";

type ProductCaseImageProps = {
  src?: string | null;
  alt?: string;
  /** Tailwind size classes for the frame */
  className?: string;
  /** img object-fit area classes */
  imageClassName?: string;
};

/**
 * Case product thumbnail. Uses a shared placeholder when product_image_url is empty.
 */
export function ProductCaseImage({
  src,
  alt = "",
  className = "h-14 w-14",
  imageClassName = "object-cover",
}: ProductCaseImageProps) {
  const url = src?.trim() || PRODUCT_IMAGE_PLACEHOLDER;
  const isPlaceholder = !src?.trim();

  return (
    <span
      className={[
        "relative inline-block overflow-hidden rounded-md border border-border bg-cream",
        className,
      ].join(" ")}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={isPlaceholder ? "商品画像プレースホルダー" : alt}
        className={["h-full w-full", imageClassName].join(" ")}
      />
    </span>
  );
}
