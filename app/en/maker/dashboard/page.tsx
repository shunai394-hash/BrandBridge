import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "My Products | BrandBridge",
};

type PageProps = {
  searchParams: Promise<{ created?: string }>;
};

/** Legacy English maker dashboard → canonical /en/products */
export default async function EnglishMakerDashboardRedirect({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const q = params.created
    ? `?created=${encodeURIComponent(params.created)}`
    : "";
  redirect(`/en/products${q}`);
}
