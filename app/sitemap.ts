import type { MetadataRoute } from "next";

import { getPublishedContents } from "@/lib/contents";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://infohub-production-78c5.up.railway.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
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
  } catch (error) {
    console.error("Erro ao gerar sitemap dinâmico:", error);

    return [
      {
        url: baseUrl,
        changeFrequency: "daily",
        priority: 1,
      },
    ];
  }
}
