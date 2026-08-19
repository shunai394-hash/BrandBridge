import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/login",
          "/login/",
          "/profile/edit",
          "/negotiations",
          "/negotiations/",
          "/maker/",
          "/partner/",
          "/favorites",
          "/deals",
          "/en/login",
          "/en/login/",
          "/en/negotiations",
          "/en/negotiations/",
          "/en/favorites",
          "/en/deals",
          "/en/profile",
          "/en/maker/",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
