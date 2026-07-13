"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toggleFavoriteAction } from "@/lib/actions";
import { Button } from "@/components/ui/Button";

type FavoriteButtonProps = {
  caseId: string;
  initialFavorited: boolean;
  isLoggedIn: boolean;
};

export function FavoriteButton({
  caseId,
  initialFavorited,
  isLoggedIn,
}: FavoriteButtonProps) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    if (!isLoggedIn) {
      window.location.href = `/login?next=/cases/${caseId}`;
      return;
    }

    setError("");
    setLoading(true);
    const result = await toggleFavoriteAction(caseId);
    setLoading(false);

    if (result.error === "LOGIN_REQUIRED") {
      window.location.href = `/login?next=/cases/${caseId}`;
      return;
    }
    if (result.error) {
      setError(result.error);
      return;
    }

    setFavorited(Boolean(result.favorited));
    router.refresh();
  }

  return (
    <div>
      <Button
        type="button"
        variant={favorited ? "secondary" : "outline"}
        onClick={handleClick}
        disabled={loading}
      >
        {loading
          ? "更新中..."
          : favorited
            ? "お気に入り解除"
            : "お気に入りに追加"}
      </Button>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
