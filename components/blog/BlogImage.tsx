import Image from "next/image";
import { blogJapanSrc, type BlogJapanImageId } from "@/lib/blog/japan-images";

type BlogImageProps = {
  id: BlogJapanImageId;
  alt: string;
  variant?: "hero" | "section";
  look?: "default" | "onDark" | "guide";
  priority?: boolean;
  className?: string;
};

const LOOK_CLASS = {
  default: "rounded-xl border border-border bg-cream",
  onDark: "rounded-xl border border-white/15",
  guide: "rounded-2xl border border-black/8 bg-[#FAFAF8]",
} as const;

/**
 * Shared figure for JA/EN guides. Uses next/image so large originals in
 * public/images/blog/japan/ are resized instead of shipped at full file size.
 */
export function BlogImage({
  id,
  alt,
  variant = "section",
  look = "default",
  priority = false,
  className = "",
}: BlogImageProps) {
  const isHero = variant === "hero";

  return (
    <figure
      className={`overflow-hidden ${LOOK_CLASS[look]} ${
        isHero ? "mt-8" : "my-8"
      } ${className}`.trim()}
    >
      <div
        className={`relative w-full ${isHero ? "aspect-[16/9]" : "aspect-[16/10]"}`}
      >
        <Image
          src={blogJapanSrc(id)}
          alt={alt}
          fill
          sizes={
            isHero
              ? "(max-width: 768px) 100vw, 1152px"
              : "(max-width: 768px) 100vw, 768px"
          }
          className="object-cover"
          priority={priority}
          quality={72}
        />
      </div>
    </figure>
  );
}
