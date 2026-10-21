import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/auth", "/staff", "/payment", "/register"],
    },
    sitemap: "https://www.ycct10.in/sitemap.xml",
  };
}
