import { redirect } from "next/navigation";

/** Alias route — Japanese product showcase lives at /product-showcase. */
export default function JapaneseProductShowcaseAliasPage() {
  redirect("/product-showcase");
}
