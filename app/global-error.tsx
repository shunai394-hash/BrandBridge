"use client";

import { useEffect } from "react";
import {
  getErrorDiagnostics,
  reportBoundaryError,
} from "@/lib/report-error";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  const diagnostics = getErrorDiagnostics(error);

  useEffect(() => {
    reportBoundaryError("app/global-error", error);
  }, [error]);

  return (
    <html lang="ja">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily:
            '"Zen Kaku Gothic New", "Hiragino Sans", "Noto Sans JP", sans-serif',
          background: "#f4f7f9",
          color: "#142033",
        }}
      >
        <div style={{ maxWidth: 520, padding: 24, textAlign: "center" }}>
          <p style={{ color: "#1a8a8a", fontSize: 14, margin: 0 }}>ERROR</p>
          <h1 style={{ fontSize: 28, marginTop: 12, marginBottom: 0 }}>
            重大なエラーが発生しました
          </h1>
          <p style={{ color: "#5a6a7d", lineHeight: 1.7, marginTop: 16 }}>
            ページを再読み込みするか、しばらくしてから再度アクセスしてください。
          </p>

          <div
            style={{
              marginTop: 16,
              textAlign: "left",
              background: "#eef3f7",
              border: "1px solid #d5dee8",
              borderRadius: 8,
              padding: 12,
              fontSize: 12,
              color: "#5a6a7d",
              lineHeight: 1.6,
            }}
          >
            <p style={{ margin: 0 }}>
              <strong style={{ color: "#142033" }}>digest:</strong>{" "}
              {diagnostics.digest ?? "(なし)"}
            </p>
            <p style={{ margin: "6px 0 0" }}>
              <strong style={{ color: "#142033" }}>name:</strong>{" "}
              {diagnostics.name}
            </p>
            {diagnostics.showDetails ? (
              <>
                <p style={{ margin: "8px 0 0", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                  <strong style={{ color: "#142033" }}>message:</strong>{" "}
                  {diagnostics.message}
                </p>
                {diagnostics.cause ? (
                  <p style={{ margin: "8px 0 0", wordBreak: "break-word" }}>
                    <strong style={{ color: "#142033" }}>cause:</strong>{" "}
                    {diagnostics.cause}
                  </p>
                ) : null}
                {diagnostics.stack ? (
                  <pre
                    style={{
                      marginTop: 12,
                      maxHeight: 180,
                      overflow: "auto",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      background: "rgba(12,21,36,0.06)",
                      borderRadius: 6,
                      padding: 8,
                      fontSize: 11,
                    }}
                  >
                    {diagnostics.stack}
                  </pre>
                ) : null}
              </>
            ) : (
              <p style={{ margin: "8px 0 0" }}>
                詳細表示はオフです。Vercel Runtime Logs で digest を検索するか、
                NEXT_PUBLIC_SHOW_ERROR_DETAILS=true を設定して再デプロイしてください。
              </p>
            )}
          </div>

          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              marginTop: 28,
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={reset}
              style={{
                background: "#1a8a8a",
                color: "#fff",
                border: 0,
                borderRadius: 6,
                padding: "10px 20px",
                cursor: "pointer",
              }}
            >
              再試行
            </button>
            <a
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                border: "1px solid #d5dee8",
                borderRadius: 6,
                padding: "10px 20px",
                color: "#142033",
                textDecoration: "none",
              }}
            >
              トップへ
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
