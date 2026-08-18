import type { MetadataRoute } from "next";
import { listJaBlogSlugs } from "@/lib/blog/ja-articles";
import { listOpenCases } from "@/lib/cases";
import { listJaCategorySlugs } from "@/lib/ja-categories";
import { listModelCaseSlugs } from "@/lib/model-cases";
import { getSiteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/cases",
    "/register/maker",
    "/register/partner",
    "/login",
    "/contact",
    "/company",
    "/for-makers",
    "/for-partners",
    "/pricing",
    "/en",
    "/en/cases",
    "/en/contact",
    "/en/login",
    "/en/register/maker",
    "/en/register/partner",
    "/en/how-to-sell-in-japan",
    "/en/japan-market-entry",
    "/en/japan-market-entry/how-to-enter-the-japanese-market",
    "/en/japan-market-entry/how-to-find-japanese-distributors",
    "/en/japan-market-entry/how-to-find-a-japanese-distributor",
    "/en/japan-market-entry/how-to-find-japanese-retailers",
    "/en/japan-market-for-functional-food-brands",
    "/en/japan-partner-demand-snapshot",
    "/en/product-showcase",
    "/en/negotiations",
    "/en/deals",
    "/en/favorites",
    "/en/profile",
    "/en/products",
    "/how-to-sell-in-japan",
    "/ja/blog",
    "/ja/blog/how-to-sell-overseas-brands-in-japan",
    ...listJaBlogSlugs().map((slug) => `/ja/blog/${slug}`),
    "/ja/categories",
    ...listJaCategorySlugs().map((slug) => `/ja/categories/${slug}`),
    "/product-showcase",
    "/ja/product-showcase",
    "/terms",
    "/privacy",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === "" || path === "/cases" ? "daily" : "monthly",
    priority: path === "" ? 1 : path === "/cases" ? 0.9 : 0.6,
  }));

  const modelCaseRoutes: MetadataRoute.Sitemap = listModelCaseSlugs().map(
    (slug) => ({
      url: `${base}/en/model-cases/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.65,
    }),
  );

  let caseRoutes: MetadataRoute.Sitemap = [];
  try {
    const cases = await listOpenCases();
    caseRoutes = cases.map((item) => ({
      url: `${base}/cases/${item.id}`,
      lastModified: new Date(item.createdAt),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    caseRoutes = [];
  }

  return [...staticRoutes, ...modelCaseRoutes, ...caseRoutes];
}

