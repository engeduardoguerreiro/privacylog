import type { MetadataRoute } from "next";
import { getProductBaseUrl } from "@/lib/subdomain";

export default function robots(): MetadataRoute.Robots {
  const site = getProductBaseUrl("main");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/studio/painel", "/login"],
      },
    ],
    sitemap: `${site}/sitemap.xml`,
  };
}
