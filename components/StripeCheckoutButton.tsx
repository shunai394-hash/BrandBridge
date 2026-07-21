"use client";

import { useState } from "react";

export function StripeCheckoutButton() {
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    setLoading(true);

    const res = await fetch("/api/checkout", {
      method: "POST",
    });

    const data = await res.json();

    if (data.url) {
      window.location.href = data.url;
    }

    setLoading(false);
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