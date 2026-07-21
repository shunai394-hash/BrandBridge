"use client";

import { FormEvent, useState } from "react";
import { submitContactAction } from "@/lib/actions";
import { ENGLISH_INQUIRY_MARKER } from "@/lib/inquiry-language";
import { Button } from "@/components/ui/Button";
import { Input, TextArea } from "@/components/ui/Input";

function mapContactError(error: string): string {
  if (error.includes("お名前")) {
    return "Please enter a valid contact person name.";
  }
  if (error.includes("メールアドレス")) {
    return "Please enter a valid email address.";
  }
  if (error.includes("10文字")) {
    return "Please enter a message of at least 10 characters.";
  }
  if (error.includes("長すぎ")) {
    return "Your message is too long.";
  }
  if (error.includes("送信に失敗")) {
    return "Failed to send. Please try again later.";
  }
  return "Failed to send. Please try again later.";
}

type EnContactFormProps = {
  /** From /en/contact?product=[id] when linked from English product detail. */
  productId?: string;
  /** Resolved product display name (optional, for admin readability). */
  productName?: string;
  /** Listing maker / supplier company name from the product case. */
  listingCompanyName?: string;
};

export function EnContactForm({
  productId,
  productName,
  listingCompanyName,
}: EnContactFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const linkedProductId = productId?.trim() || "";
  const linkedProductName = productName?.trim() || "";
  const linkedCompanyName = listingCompanyName?.trim() || "";

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const companyName = String(form.get("companyName") ?? "").trim();
    const contactPerson = String(form.get("contactPerson") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const productCategory = String(form.get("productCategory") ?? "").trim();
    const targetMarket = String(form.get("targetMarket") ?? "").trim();
    const messageBody = String(form.get("message") ?? "").trim();

    if (!companyName) {
      setLoading(false);
      setError("Please enter your company name.");
      return;
    }

    const message = [
      ENGLISH_INQUIRY_MARKER,
      linkedProductId
        ? `Source: /en/contact?product=${linkedProductId}`
        : "Source: /en/contact",
      linkedProductId ? `Product ID: ${linkedProductId}` : null,
      linkedProductName ? `Product Name: ${linkedProductName}` : null,
      linkedCompanyName
        ? `Listing Company Name: ${linkedCompanyName}`
        : null,
      `Product Category: ${productCategory || "(not specified)"}`,
      `Target Market: ${targetMarket || "(not specified)"}`,
      "",
      messageBody,
    ]
      .filter((line): line is string => line != null)
      .join("\n");

    const result = await submitContactAction({
      name: contactPerson,
      email,
      companyName,
      category: "maker",
      message,
    });

    setLoading(false);
    if (result.error) {
      setError(mapContactError(result.error));
      return;
    }
    setDone(true);
    e.currentTarget.reset();
  }

  if (done) {
    return (
      <div className="rounded-lg border border-teal/25 bg-cream/70 px-5 py-8">
        <p className="font-[family-name:var(--font-shippori)] text-xl text-navy">
          Inquiry sent
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Thank you for contacting BrandBridge. We typically reply within 1–2
          business days.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-6"
          onClick={() => setDone(false)}
        >
          Send another inquiry
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Your Company Name"
        name="companyName"
        required
        maxLength={200}
        autoComplete="organization"
      />
      <Input
        label="Contact Person"
        name="contactPerson"
        required
        maxLength={100}
        autoComplete="name"
      />
      <Input
        label="Email"
        name="email"
        type="email"
        required
        maxLength={200}
        autoComplete="email"
      />
      <Input
        label="Product Category"
        name="productCategory"
        required
        maxLength={200}
        placeholder="e.g. Beauty, Food & Beverage, Home"
        defaultValue=""
      />
      <Input
        label="Target Market"
        name="targetMarket"
        required
        maxLength={200}
        placeholder="e.g. Japan, ASEAN, Global"
      />
      <TextArea
        label="Message"
        name="message"
        required
        rows={6}
        maxLength={4500}
        placeholder={
          linkedProductName
            ? `I am interested in ${linkedProductName}. Please tell me about distribution / partnership options in Japan.`
            : "Tell us about your interest, channel fit, and what you are looking for in Japan."
        }
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" disabled={loading}>
        {loading ? "Sending..." : "Send Inquiry"}
      </Button>
    </form>
  );
}
