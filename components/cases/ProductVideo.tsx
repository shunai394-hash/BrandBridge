import { parseProductVideoUrl } from "@/lib/product-video";

type ProductVideoProps = {
  url?: string | null;
  locale?: "ja" | "en";
  /**
   * When true, keep the Product Video heading even if no playable URL is set.
   * Used by sales sample pages so the section layout stays complete.
   */
  showEmpty?: boolean;
  /** Optional poster for self-hosted mp4/webm players. */
  poster?: string | null;
};

/**
 * Optional product intro video under the image gallery.
 * YouTube / Vimeo → embed; mp4/webm → HTML5 player; other URLs → text link.
 * Null/empty → render nothing unless showEmpty.
 */
export function ProductVideo({
  url,
  locale = "ja",
  showEmpty = false,
  poster = null,
}: ProductVideoProps) {
  const parsed = parseProductVideoUrl(url);
  if (!parsed && !showEmpty) return null;

  const title = locale === "en" ? "Product Video" : "商品紹介動画";
  const openLabel =
    locale === "en" ? "Open video in a new tab" : "動画を新しいタブで開く";
  const emptyLabel =
    locale === "en"
      ? "No product introduction video yet."
      : "商品紹介動画はまだ登録されていません。";

  if (!parsed) {
    return (
      <section className="mt-8" lang={locale === "en" ? "en" : undefined}>
        <h2 className="font-[family-name:var(--font-shippori)] text-xl text-navy">
          {title}
        </h2>
        <div className="mt-3 flex min-h-[10rem] items-center justify-center rounded-lg border border-dashed border-border bg-cream px-4 py-8 text-center">
          <p className="text-sm text-muted">{emptyLabel}</p>
        </div>
      </section>
    );
  }

  if (parsed.kind === "youtube" || parsed.kind === "vimeo") {
    return (
      <section className="mt-8" lang={locale === "en" ? "en" : undefined}>
        <h2 className="font-[family-name:var(--font-shippori)] text-xl text-navy">
          {title}
        </h2>
        <div className="mt-3 overflow-hidden rounded-lg border border-border bg-navy-deep/5 shadow-[0_8px_24px_rgba(20,32,51,0.06)]">
          <div className="relative aspect-video w-full">
            <iframe
              src={parsed.embedUrl}
              title={title}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        </div>
        <p className="mt-2 text-xs text-muted">
          <a
            href={parsed.watchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal hover:underline"
          >
            {openLabel}
          </a>
        </p>
      </section>
    );
  }

  if (parsed.kind === "file") {
    return (
      <section className="mt-8" lang={locale === "en" ? "en" : undefined}>
        <h2 className="font-[family-name:var(--font-shippori)] text-xl text-navy">
          {title}
        </h2>
        <div className="mt-3 overflow-hidden rounded-lg border border-border bg-navy-deep/5 shadow-[0_8px_24px_rgba(20,32,51,0.06)]">
          <div className="relative aspect-video w-full bg-navy-deep/10">
            <video
              className="absolute inset-0 h-full w-full object-contain"
              controls
              playsInline
              preload="metadata"
              poster={poster?.trim() || undefined}
            >
              <source src={parsed.href} type="video/mp4" />
            </video>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-8" lang={locale === "en" ? "en" : undefined}>
      <h2 className="font-[family-name:var(--font-shippori)] text-xl text-navy">
        {title}
      </h2>
      <div className="mt-3 rounded-lg border border-border bg-surface px-4 py-4">
        <a
          href={parsed.href}
          target="_blank"
          rel="noopener noreferrer"
          className="break-all text-sm font-medium text-teal hover:underline"
        >
          {parsed.href}
        </a>
        <p className="mt-1 text-xs text-muted">{openLabel}</p>
      </div>
    </section>
  );
}
