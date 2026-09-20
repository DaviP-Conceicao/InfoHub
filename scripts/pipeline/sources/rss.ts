import type {
  PipelineSource,
  RawSourceItem,
} from "../types";
import { pipelineConfig } from "../config";

function decodeXml(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getTag(block: string, tag: string): string | null {
  const regex = new RegExp(
    `<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`,
    "i"
  );

  const match = block.match(regex);

  return match ? decodeXml(match[1]) : null;
}

function getBlocks(xml: string): string[] {
  return xml.match(/<item(?:\s[^>]*)?>[\s\S]*?<\/item>/gi) ?? [];
}

function makeExternalId(url: string, title: string): string {
  return `${url}|${title}`
    .toLowerCase()
    .trim();
}

function makeSource(url: string, index: number): PipelineSource {
  return {
    id: `rss-${index + 1}`,
    name: `RSS ${index + 1}`,
    url,
    type: "rss",
  };
}

async function fetchWithTimeout(
  url: string
): Promise<string> {
  const controller = new AbortController();

  const timeout = setTimeout(
    () => controller.abort(),
    pipelineConfig.requestTimeoutMs
  );

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "InfoHub-Pipeline/1.0",
        Accept:
          "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
      },
    });

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status} ao buscar ${url}`
      );
    }

    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchRssSource(
  source: PipelineSource
): Promise<RawSourceItem[]> {
  const xml = await fetchWithTimeout(source.url);
  const blocks = getBlocks(xml);

  return blocks
    .slice(0, pipelineConfig.maxItemsPerSource)
    .map((block) => {
      const title = getTag(block, "title") ?? "";
      const url =
        getTag(block, "link") ??
        getTag(block, "guid") ??
        "";

      const publishedAt =
        getTag(block, "pubDate") ??
        getTag(block, "published") ??
        getTag(block, "updated");

      const description =
        getTag(block, "description") ??
        getTag(block, "summary");

      return {
        sourceId: source.id,
        sourceName: source.name,
        sourceUrl: source.url,
        fetchedAt: new Date().toISOString(),
        externalId: makeExternalId(url, title),
        title,
        url,
        publishedAt,
        description,
      };
    })
    .filter((item) => item.title || item.url);
}

export async function fetchConfiguredRssSources(): Promise<{
  source: PipelineSource;
  items: RawSourceItem[];
}[]> {
  const results: {
    source: PipelineSource;
    items: RawSourceItem[];
  }[] = [];

  for (const [index, url] of pipelineConfig.rssUrls.entries()) {
    const source = makeSource(url, index);

    console.log(`Fonte: ${source.url}`);

    const items = await fetchRssSource(source);

    console.log(`  Itens coletados: ${items.length}`);

    results.push({
      source,
      items,
    });
  }

  return results;
}
