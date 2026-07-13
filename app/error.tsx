"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("[app/error]", error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-5 py-24 text-center">
      <p className="text-sm font-medium tracking-wide text-teal">ERROR</p>
      <h1 className="mt-3 font-[family-name:var(--font-shippori)] text-3xl text-navy">
        エラーが発生しました
      </h1>
      <p className="mt-4 leading-relaxed text-muted">
        一時的な問題の可能性があります。再試行するか、トップページからやり直してください。
      </p>
      {error.digest ? (
        <p className="mt-3 text-xs text-muted">参考コード: {error.digest}</p>
      ) : null}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button type="button" onClick={reset}>
          再試行
        </Button>
        <Button href="/" variant="outline">
          トップへ
        </Button>
        <Button href="/contact" variant="ghost">
          お問い合わせ
        </Button>
      </div>
    </div>
  );
}
