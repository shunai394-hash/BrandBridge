import { ImageResponse } from "next/og";

export const alt =
  "BrandBridge — 日本進出したい海外ブランドと売れる販売パートナーをつなぐ";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "linear-gradient(125deg, #0c1524 0%, #142033 48%, #146f6f 100%)",
          padding: 72,
          color: "#ffffff",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 28,
            letterSpacing: 4,
            color: "rgba(255,255,255,0.7)",
          }}
        >
          BtoB MATCHING
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              display: "flex",
              fontSize: 84,
              fontWeight: 700,
              letterSpacing: -1,
              lineHeight: 1.05,
            }}
          >
            BrandBridge
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 36,
              color: "rgba(255,255,255,0.88)",
              maxWidth: 820,
              lineHeight: 1.35,
            }}
          >
            日本進出したい海外ブランドと売れる販売パートナーをつなぐ
          </div>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 22,
            color: "rgba(255,255,255,0.65)",
          }}
        >
          条件が見えるBtoBマッチング · ベータ先行登録受付中
        </div>
      </div>
    ),
    { ...size },
  );
}
