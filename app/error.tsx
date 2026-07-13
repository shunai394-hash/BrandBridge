"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import {
  getErrorDiagnostics,
  reportBoundaryError,
} from "@/lib/report-error";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorPageProps) {
  const diagnostics = getErrorDiagnostics(error);

  useEffect(() => {
    reportBoundaryError("app/error", error);
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

      <div className="mt-4 w-full rounded-md border border-border bg-cream/80 px-4 py-3 text-left text-xs text-muted">
        <p>
          <span className="font-medium text-navy">digest:</span>{" "}
          {diagnostics.digest ?? "(なし)"}
        </p>
        <p className="mt-1">
          <span className="font-medium text-navy">name:</span> {diagnostics.name}
        </p>
        {diagnostics.showDetails ? (
          <>
            <p className="mt-2 whitespace-pre-wrap break-words">
              <span className="font-medium text-navy">message:</span>{" "}
              {diagnostics.message}
            </p>
            {diagnostics.cause ? (
              <p className="mt-2 break-words">
                <span className="font-medium text-navy">cause:</span>{" "}
                {diagnostics.cause}
              </p>
            ) : null}
            {diagnostics.stack ? (
              <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap break-words rounded bg-navy-deep/5 p-2 text-[11px] leading-relaxed text-navy/80">
                {diagnostics.stack}
              </pre>
            ) : null}
          </>
        ) : (
          <p className="mt-2">
            詳細表示はオフです。Vercel の Runtime Logs で digest
            を検索するか、一時的に{" "}
            <code className="rounded bg-white px-1">NEXT_PUBLIC_SHOW_ERROR_DETAILS=true</code>{" "}
            を設定して再デプロイしてください。
          </p>
        )}
      </div>

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
