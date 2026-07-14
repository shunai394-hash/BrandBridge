"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { sendMessageAction } from "@/lib/actions";
import { uploadNegotiationAttachment } from "@/lib/negotiation-attachment-upload";
import { Button } from "@/components/ui/Button";
import { TextArea } from "@/components/ui/Input";

type MessageFormProps = {
  negotiationId: string;
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MessageForm({ negotiationId }: MessageFormProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [body, setBody] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!body.trim() && !file) {
      setError("メッセージまたは添付ファイルを指定してください");
      return;
    }

    setLoading(true);

    let attachment:
      | { path: string; name: string; mime: string; size: number }
      | null = null;

    if (file) {
      const uploaded = await uploadNegotiationAttachment(negotiationId, file);
      if (!uploaded.ok) {
        setLoading(false);
        setError(uploaded.error);
        return;
      }
      attachment = {
        path: uploaded.path,
        name: uploaded.name,
        mime: uploaded.mime,
        size: uploaded.size,
      };
    }

    const result = await sendMessageAction({
      negotiationId,
      body,
      attachment,
    });
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setBody("");
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <TextArea
        label="本文"
        name="body"
        rows={4}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="返信内容を入力"
      />

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          添付ファイル（任意）
        </label>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.doc,.docx,.xls,.xlsx,.txt,.csv,application/pdf,image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-muted file:mr-3 file:rounded-md file:border-0 file:bg-cream file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-navy hover:file:bg-cream/80"
        />
        <p className="mt-1 text-xs text-muted">
          PDF / 画像 / Word / Excel / テキスト / CSV（最大10MB）
        </p>
        {file ? (
          <p className="mt-1.5 text-sm text-navy">
            選択中: {file.name}（{formatBytes(file.size)}）
            <button
              type="button"
              className="ml-2 text-xs text-muted underline"
              onClick={() => {
                setFile(null);
                if (fileRef.current) fileRef.current.value = "";
              }}
            >
              解除
            </button>
          </p>
        ) : null}
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" disabled={loading || (!body.trim() && !file)}>
        {loading ? "送信中..." : "返信する"}
      </Button>
    </form>
  );
}
