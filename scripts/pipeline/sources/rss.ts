import type {
  PipelineSource,
  RawSourceItem,
} from "../types";
import { pipelineConfig } from "../config";
import { isIP } from "node:net";

const MAX_REDIRECTS = 5;

function isBlockedIpv4(hostname: string): boolean {
  const octets = hostname.split(".").map(Number);

  if (octets.length !== 4 || octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) {
    return false;
  }

  const [first, second] = octets;

  return first === 0 ||
    first === 10 ||
    first === 127 ||
    (first === 100 && second >= 64 && second <= 127) ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && (second === 0 || second === 168)) ||
    (first === 198 && (second === 18 || second === 19 || second === 51)) ||
    (first === 203 && second === 0) ||
    first >= 224;
}

function isBlockedIpv6(hostname: string): boolean {
  const normalized = hostname.toLowerCase();

  if (normalized === "::" || normalized === "::1" || normalized.startsWith("fc") || normalized.startsWith("fd") || normalized.startsWith("fe8") || normalized.startsWith("fe9") || normalized.startsWith("fea") || normalized.startsWith("feb") || normalized.startsWith("ff") || normalized.startsWith("2001:db8:")) {
    return true;
  }

  const mappedIpv4 = normalized.match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/);

  return mappedIpv4 ? isBlockedIpv4(mappedIpv4[1]) : false;
}

function isBlockedHostname(hostname: string): boolean {
  const normalized = hostname.toLowerCase().replace(/^\[|\]$/g, "").replace(/\.$/, "");

  return normalized === "localhost" ||
    normalized.endsWith(".localhost") ||
    normalized === "local" ||
    normalized === "ip6-localhost" ||
    normalized === "metadata.google.internal" ||
    normalized.endsWith(".internal") ||
    (isIP(normalized) === 4 && isBlockedIpv4(normalized)) ||
    (isIP(normalized) === 6 && isBlockedIpv6(normalized));
}

export function validateRssUrl(value: string): URL {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new Error("URL RSS inválida ou não permitida.");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("URL RSS inválida ou não permitida.");
  }

  if (url.username || url.password || isBlockedHostname(url.hostname)) {
    throw new Error("URL RSS inválida ou não permitida.");
  }

  return url;
}

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
  let nextUrl = validateRssUrl(url);

  const controller = new AbortController();

  const timeout = setTimeout(
    () => controller.abort(),
    pipelineConfig.requestTimeoutMs
  );

  try {
    for (let redirect = 0; redirect <= MAX_REDIRECTS; redirect += 1) {
      const response = await fetch(nextUrl, {
        redirect: "manual",
        signal: controller.signal,
        headers: {
          "User-Agent": "InfoHub-Pipeline/1.0",
          Accept:
            "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
        },
      });

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get("location");

        if (!location || redirect === MAX_REDIRECTS) {
          throw new Error("Redirecionamento RSS inválido ou excedeu o limite.");
        }

        nextUrl = validateRssUrl(new URL(location, nextUrl).toString());
        continue;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ao buscar a fonte RSS.`);
      }

      return await response.text();
    }

    throw new Error("Redirecionamento RSS inválido ou excedeu o limite.");
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
