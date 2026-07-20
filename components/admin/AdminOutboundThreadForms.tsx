"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  addOutboundProspectMessageAction,
  replyOutboundThreadAction,
} from "@/lib/actions";
import { Button } from "@/components/ui/Button";
import { TextArea } from "@/components/ui/Input";

type Props = {
  outboundEmailId: string;
};

export function AdminOutboundThreadForms({ outboundEmailId }: Props) {
  const router = useRouter();
  const [adminBody, setAdminBody] = useState("");
  const [prospectBody, setProspectBody] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState<"admin" | "prospect" | null>(null);

  async function sendAdminReply(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading("admin");
    const result = await replyOutboundThreadAction({
      outboundEmailId,
      message: adminBody,
    });
    setLoading(null);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSuccess("返信メールを送信しました。");
    setAdminBody("");
    router.refresh();
  }

  async function logProspect(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading("prospect");
    const result = await addOutboundProspectMessageAction({
      outboundEmailId,
      message: prospectBody,
    });
    setLoading(null);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSuccess("先方からの返信を受信箱・スレッドに記録しました。");
    setProspectBody("");
    router.refresh();
  }

  return (
    <div className="mt-8 space-y-6">
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {success ? <p className="text-sm text-teal">{success}</p> : null}

      <form
        onSubmit={sendAdminReply}
        className="space-y-4 rounded-lg border border-border bg-surface p-5"
      >
        <h3 className="font-medium text-navy">このスレッドに返信</h3>
        <p className="text-xs text-muted">
          同じ宛先へメール送信し、スレッドに時系列で追加されます。
        </p>
        <TextArea
          label="本文"
          name="adminBody"
          value={adminBody}
          onChange={(e) => setAdminBody(e.target.value)}
          required
          rows={6}
        />
        <Button type="submit" disabled={loading === "admin"}>
          {loading === "admin" ? "送信中..." : "返信を送信"}
        </Button>
      </form>

      <form
        onSubmit={logProspect}
        className="space-y-4 rounded-lg border border-dashed border-border bg-cream/40 p-5"
      >
        <h3 className="font-medium text-navy">先方返信の手動記録</h3>
        <p className="text-xs text-muted">
          Resend 受信Webhook未設定時用。届いた返信を貼ると受信箱に反映し状態を
          replied にします。
        </p>
        <TextArea
          label="先方メッセージ"
          name="prospectBody"
          value={prospectBody}
          onChange={(e) => setProspectBody(e.target.value)}
          required
          rows={5}
        />
        <Button
          type="submit"
          variant="outline"
          disabled={loading === "prospect"}
        >
          {loading === "prospect" ? "保存中..." : "受信箱・スレッドに記録"}
        </Button>
      </form>
    </div>
  );
}
