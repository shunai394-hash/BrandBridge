"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { sendMessageAction } from "@/lib/actions";
import { Button } from "@/components/ui/Button";
import { TextArea } from "@/components/ui/Input";

type MessageFormProps = {
  negotiationId: string;
};

export function MessageForm({ negotiationId }: MessageFormProps) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await sendMessageAction({ negotiationId, body });
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setBody("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 border-t border-border pt-4">
      <TextArea
        label="メッセージ"
        name="body"
        rows={3}
        required
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="相手へのメッセージを入力"
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" disabled={loading || !body.trim()}>
        {loading ? "送信中..." : "送信する"}
      </Button>
    </form>
  );
}
