import type { Metadata } from "next";
import { DummyCatalogShowcase } from "@/components/cases/DummyCatalogShowcase";
import { ProductShowcase } from "@/components/cases/ProductShowcase";
import { getEnglishProductShowcaseSample } from "@/lib/product-showcase-sample";

export const metadata: Metadata = {
  title: "Product Showcase Sample | BrandBridge",
  description:
    "Preview how a finished BrandBridge product listing looks for overseas product suppliers—image, video, description, features, and deal terms.",
};

export const dynamic = "force-dynamic";

export default function EnglishProductShowcasePage() {
  const sample = getEnglishProductShowcaseSample();

  return (
    <div className="mx-auto max-w-4xl px-5 py-12 md:py-16">
      <ProductShowcase caseItem={sample} locale="en" />
      <DummyCatalogShowcase locale="en" />
    </div>
  );
}
