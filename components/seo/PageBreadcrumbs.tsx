import Link from "next/link";
import {
  breadcrumbJsonLd,
  type BreadcrumbItem,
} from "@/lib/seo-jsonld";

type PageBreadcrumbsProps = {
  items: BreadcrumbItem[];
  className?: string;
};

export function PageBreadcrumbs({ items, className }: PageBreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd(items)),
        }}
      />
      <nav aria-label="パンくずリスト" className={className ?? "mb-6"}>
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
          {items.map((item, index) => {
            const last = index === items.length - 1;
            return (
              <li key={`${item.name}-${index}`} className="flex items-center gap-2">
                {index > 0 ? (
                  <span aria-hidden="true" className="text-border">
                    /
                  </span>
                ) : null}
                {last || !item.path ? (
                  <span
                    className={last ? "text-navy" : undefined}
                    aria-current={last ? "page" : undefined}
                  >
                    {item.name}
                  </span>
                ) : (
                  <Link
                    href={item.path}
                    className="text-teal hover:underline"
                  >
                    {item.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
