/**
 * Configurable BrandBridge outbound From address.
 * Set MAIL_FROM_NAME + MAIL_FROM_ADDRESS for production (e.g. sales@brandbridge.jp).
 * Falls back to Resend onboarding address for local/dev.
 */
export function getMailFrom(): {
  name: string;
  address: string;
  formatted: string;
} {
  const name = process.env.MAIL_FROM_NAME?.trim() || "BrandBridge";
  const address =
    process.env.MAIL_FROM_ADDRESS?.trim() || "onboarding@resend.dev";
  return {
    name,
    address,
    formatted: `${name} <${address}>`,
  };
}
