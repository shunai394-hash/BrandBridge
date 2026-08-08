"use client";

import { useState } from "react";

export function StripeCheckoutButton() {
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    console.log("[Checkout Button] clicked");

    try {
      setLoading(true);

      console.log("[Checkout Button] calling /api/checkout");

      const res = await fetch("/api/checkout", {
        method: "POST",
      });

      console.log("[Checkout Button] response status:", res.status);

      const data = await res.json();

      console.log("[Checkout Button] response data:", data);

      if (!res.ok) {
        alert(
          data.detail
            ? `${data.error}\n\n詳細: ${data.detail}`
            : data.error || "決済エラー"
        );
        return;
      }

      if (data.url) {
        console.log("[Checkout Button] redirecting to Stripe");
        window.location.href = data.url;
        return;
      }

      alert("Stripe URLを取得できませんでした");
    } catch (error) {
      console.error("[Checkout Button] error:", error);

      alert(
        error instanceof Error
          ? `通信エラー: ${error.message}`
          : "通信エラーが発生しました"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCheckout}
      disabled={loading}
      className="w-full rounded-md bg-teal px-4 py-3 text-white"
    >
      {loading ? "処理中..." : "Growthに申し込む"}
    </button>
  );
}
