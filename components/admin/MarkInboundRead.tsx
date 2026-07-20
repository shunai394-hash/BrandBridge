"use client";

import { useEffect, useRef } from "react";
import { markInboundEmailReadAction } from "@/lib/actions";

type Props = {
  inboundId?: string;
  outboundEmailId?: string | null;
  markAllForOutbound?: boolean;
};

/** Marks inbound email(s) as read when a thread/inbox item is opened. */
export function MarkInboundRead({
  inboundId,
  outboundEmailId,
  markAllForOutbound,
}: Props) {
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    if (!inboundId && !markAllForOutbound) return;
    done.current = true;
    void markInboundEmailReadAction({
      inboundId,
      outboundEmailId,
      markAllForOutbound,
    });
  }, [inboundId, outboundEmailId, markAllForOutbound]);

  return null;
}
