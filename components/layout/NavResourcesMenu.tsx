"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

type NavResourcesMenuProps = {
  locale: "en" | "ja";
};

export function NavResourcesMenu({ locale }: NavResourcesMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const en = locale === "en";
  const triggerLabel = en ? "Resources" : "ガイド";
  const items = en
    ? [
        {
          href: "/en/how-to-sell-in-japan",
          label: "How to Sell in Japan",
        },
        {
          href: "/en/japan-partner-demand-snapshot",
          label: "Japan Partner Demand Snapshot",
        },
        {
          href: "/en/japan-market-for-functional-food-brands",
          label: "Functional Food & Wellness",
        },
        {
          href: "/en/product-showcase",
          label: "Featured Brands",
        },
      ]
    : [
        {
          href: "/how-to-sell-in-japan",
          label: "日本で販売する方法",
        },
        {
          href: "/product-showcase",
          label: "商品掲載サンプル",
        },
      ];

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="text-white/85 transition hover:text-white"
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
      >
        {triggerLabel}
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute top-full left-0 z-50 min-w-[14rem] pt-2"
        >
          <div className="rounded-md border border-white/15 bg-navy-deep py-1.5 shadow-lg">
            {items.map((item) => (
              <Link
                key={item.href}
                role="menuitem"
                href={item.href}
                prefetch={false}
                className="block px-3.5 py-2 text-sm text-white/90 transition hover:bg-white/10 hover:text-white"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
