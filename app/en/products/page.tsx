import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "My Products | BrandBridge",
  description:
    "Track your BrandBridge product listings and open English product pages.",
};

type PageProps = {
  searchParams: Promise<{ created?: string }>;
};

/** Legacy English products URL → canonical /en/maker/cases */
export default async function EnglishProductsRedirectPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const q = params.created
    ? `?created=${encodeURIComponent(params.created)}`
    : "";
  redirect(`/en/maker/cases${q}`);
}
