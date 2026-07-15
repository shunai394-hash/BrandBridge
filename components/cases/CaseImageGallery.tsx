"use client";

import { useState } from "react";
import { ProductCaseImage } from "@/components/cases/ProductCaseImage";
import type { CaseImage } from "@/lib/types";

type CaseImageGalleryProps = {
  images?: CaseImage[];
  /** Legacy fallback when gallery empty */
  productImageUrl?: string | null;
  alt: string;
};

/**
 * Detail gallery: large main image + thumbnail strip.
 */
export function CaseImageGallery({
  images,
  productImageUrl,
  alt,
}: CaseImageGalleryProps) {
  const list =
    images && images.length > 0
      ? images
      : productImageUrl?.trim()
        ? [
            {
              id: "legacy",
              caseId: "",
              imageUrl: productImageUrl.trim(),
              storagePath: null,
              sortOrder: 0,
              createdAt: "",
            },
          ]
        : [];

  const [activeIndex, setActiveIndex] = useState(0);
  const active = list[Math.min(activeIndex, Math.max(list.length - 1, 0))];

  if (list.length === 0) {
    return (
      <div>
        <p className="mb-2 text-xs font-medium tracking-wide text-muted">
          商品画像
        </p>
        <ProductCaseImage src={null} alt={alt} size="detail" />
        <p className="mt-1.5 text-xs text-muted">画像未登録</p>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-2 text-xs font-medium tracking-wide text-muted">
        商品画像
      </p>
      <div className="overflow-hidden rounded-md border border-border bg-cream">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={active.imageUrl}
          alt={alt}
          className="mx-auto max-h-[400px] w-full object-contain"
        />
      </div>

      {list.length > 1 ? (
        <ul className="mt-3 flex flex-wrap gap-2">
          {list.map((img, index) => (
            <li key={img.id}>
              <button
                type="button"
                onClick={() => setActiveIndex(index)}
                className={[
                  "h-16 w-16 overflow-hidden rounded border-2",
                  index === activeIndex
                    ? "border-teal"
                    : "border-transparent opacity-80 hover:opacity-100",
                ].join(" ")}
                aria-label={`画像 ${index + 1} を表示`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.imageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
