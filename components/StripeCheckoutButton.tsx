"use client";

import { useState } from "react";

export function StripeCheckoutButton() {
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    try {
      setLoading(true);

      const res = await fetch("/api/checkout", {
        method: "POST",
      });

      const data = await res.json();

      console.log("checkout response:", data);

      if (!res.ok) {
        alert(data.error || "決済エラー");
        return;
      }

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      alert("Stripe URLが取得できませんでした");

    } catch (error) {
      console.error(error);
      alert("通信エラーが発生しました");

    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="w-full rounded-md bg-teal px-4 py-3 text-white"
    >
      {loading ? "処理中..." : "Growthに申し込む"}
    </button>
  );
}