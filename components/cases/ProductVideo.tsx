import { parseProductVideoUrl } from "@/lib/product-video";

type ProductVideoProps = {
  url?: string | null;
  locale?: "ja" | "en";
};

/**
 * Optional product intro video under the image gallery.
 * YouTube / Vimeo → embed; other URLs → text link. Null/empty → render nothing.
 */
export function ProductVideo({ url, locale = "ja" }: ProductVideoProps) {
  const parsed = parseProductVideoUrl(url);
  if (!parsed) return null;

  const title = locale === "en" ? "Product Video" : "商品紹介動画";
  const openLabel =
    locale === "en" ? "Open video in a new tab" : "動画を新しいタブで開く";

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
