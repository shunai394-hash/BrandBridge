import {
  getSalesMailboxInfo,
  listEmailThreadSummaries,
  listInboundEmails,
  listOutboundEmails,
} from "@/lib/admin-outbound-mail";

export async function loadMailShellCounts() {
  const [inbox, sent, threads, mailbox] = await Promise.all([
    listInboundEmails(),
    listOutboundEmails(),
    listEmailThreadSummaries(),
    Promise.resolve(getSalesMailboxInfo()),
  ]);

  return {
    unreadCount: inbox.unreadCount,
    sentCount: sent.items.length,
    threadCount: threads.items.length,
    fromFormatted: mailbox.fromFormatted,
    replyTo: mailbox.replyTo,
    envError: mailbox.error,
    inbox,
    sent,
    threads,
  };
}
