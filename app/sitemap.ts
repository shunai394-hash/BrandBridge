import type { MetadataRoute } from "next";
import { listOpenCases } from "@/lib/cases";
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
    "/terms",
    "/privacy",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === "" || path === "/cases" ? "daily" : "monthly",
    priority: path === "" ? 1 : path === "/cases" ? 0.9 : 0.6,
  }));

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

  return [...staticRoutes, ...caseRoutes];
}
