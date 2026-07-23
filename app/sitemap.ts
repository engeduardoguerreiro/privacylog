import type { MetadataRoute } from "next";
import { getProductBaseUrl } from "@/lib/subdomain";
import { studioClinics } from "@/lib/studio/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const main = getProductBaseUrl("main");
  const studio = getProductBaseUrl("studio");

  return [
    { url: main, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${main}/lounge`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: studio, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${studio}/planos`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${studio}/clinicas`, lastModified: new Date(), changeFrequency: "daily", priority: 0.85 },
    { url: `${studio}/solicitar-site`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    ...studioClinics.map((clinic) => ({
      url: `${studio}/clinicas/${clinic.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: clinic.plan === "black" ? 0.85 : 0.75,
    })),
  ];
}
