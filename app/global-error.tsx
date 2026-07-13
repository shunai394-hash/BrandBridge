"use client";

import { useEffect } from "react";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("[app/global-error]", error);
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
        <div style={{ maxWidth: 480, padding: 24, textAlign: "center" }}>
          <p style={{ color: "#1a8a8a", fontSize: 14, margin: 0 }}>ERROR</p>
          <h1 style={{ fontSize: 28, marginTop: 12, marginBottom: 0 }}>
            重大なエラーが発生しました
          </h1>
          <p style={{ color: "#5a6a7d", lineHeight: 1.7, marginTop: 16 }}>
            ページを再読み込みするか、しばらくしてから再度アクセスしてください。
          </p>
          {error.digest ? (
            <p style={{ color: "#5a6a7d", fontSize: 12, marginTop: 12 }}>
              参考コード: {error.digest}
            </p>
          ) : null}
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
