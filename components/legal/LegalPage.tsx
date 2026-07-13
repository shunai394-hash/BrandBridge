import type { ReactNode } from "react";

type LegalPageProps = {
  title: string;
  updatedAt: string;
  children: ReactNode;
};

export function LegalPage({ title, updatedAt, children }: LegalPageProps) {
  return (
    <article className="mx-auto max-w-3xl px-5 py-12 md:py-16">
      <header className="mb-10 border-b border-border pb-6">
        <h1 className="font-[family-name:var(--font-shippori)] text-3xl text-navy md:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-sm text-muted">最終更新日: {updatedAt}</p>
      </header>
      <div className="space-y-8 text-sm leading-relaxed text-foreground/90 md:text-base [&_h2]:font-[family-name:var(--font-shippori)] [&_h2]:text-xl [&_h2]:text-navy [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5 [&_p]:text-muted [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
        {children}
      </div>
    </article>
  );
}
