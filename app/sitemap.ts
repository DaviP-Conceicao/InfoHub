import type { MetadataRoute } from "next";

import { getPublishedContents } from "@/lib/contents";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://infohub-production-78c5.up.railway.app";

  const contents = await getPublishedContents();

  const contentUrls: MetadataRoute.Sitemap = contents.map((content) => ({
    url: `${baseUrl}/conteudos/${encodeURIComponent(content.slug)}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      changeFrequency: "daily",
      priority: 1,
    },
    ...contentUrls,
  ];
}
