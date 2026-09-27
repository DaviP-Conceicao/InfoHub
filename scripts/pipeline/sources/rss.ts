import type {
  PipelineSource,
  RawSourceItem,
} from "../types";
import { pipelineConfig } from "../config";
import { isIP } from "node:net";
import { promises as dnsPromises } from "node:dns";
import http from "node:http";
import https from "node:https";
import type { IncomingMessage, RequestOptions } from "node:http";

const MAX_REDIRECTS = 5;
const MAX_RESPONSE_BYTES = 2 * 1024 * 1024;

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

  if (normalized === "::" || normalized === "::1") {
    return true;
  }

  const mappedIpv4 = normalized.match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/);

  if (mappedIpv4) return isBlockedIpv4(mappedIpv4[1]);

  const firstSegment = Number.parseInt(normalized.split(":")[0] || "0", 16);
  const secondSegment = Number.parseInt(normalized.split(":")[1] || "0", 16);

  return (firstSegment & 0xfe00) === 0xfc00 || // Unique local fc00::/7
    (firstSegment & 0xffc0) === 0xfe80 || // Link-local fe80::/10
    (firstSegment & 0xff00) === 0xff00 || // Multicast ff00::/8
    (firstSegment === 0x2001 && secondSegment === 0x0db8); // Documentation 2001:db8::/32
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

export function validateResolvedRssAddresses(addresses: readonly { address: string }[]): void {
  if (addresses.length === 0 || addresses.some(({ address }) => isBlockedHostname(address))) {
    throw new Error("URL RSS inválida ou não permitida.");
  }
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
      const response = await requestPinned(nextUrl, controller.signal);

      if ((response.statusCode ?? 0) >= 300 && (response.statusCode ?? 0) < 400) {
        const location = response.headers.location;
        response.destroy();

        if (!location || redirect === MAX_REDIRECTS) {
          throw new Error("Redirecionamento RSS inválido ou excedeu o limite.");
        }

        nextUrl = validateRssUrl(new URL(location, nextUrl).toString());
        continue;
      }

      if (response.statusCode === undefined || response.statusCode < 200 || response.statusCode >= 300) {
        throw new Error(`HTTP ${response.statusCode ?? "erro"} ao buscar a fonte RSS.`);
      }

      return await readLimitedRssBody(response, controller.signal);
    }

    throw new Error("Redirecionamento RSS inválido ou excedeu o limite.");
  } finally {
    clearTimeout(timeout);
  }
}

async function requestPinned(url: URL, signal: AbortSignal): Promise<IncomingMessage> {
  const hostname = url.hostname.replace(/^\[|\]$/g, "");
  let addresses;
  try {
    addresses = await dnsPromises.lookup(hostname, { all: true, verbatim: true });
  } catch {
    throw new Error("URL RSS inválida ou não permitida.");
  }
  validateResolvedRssAddresses(addresses);

  // Pin the socket lookup to an already-validated answer. The original hostname
  // remains in the request URL, preserving the HTTP Host header and TLS SNI.
  const selected = addresses[0];
  const requestOptions: RequestOptions = {
    signal,
    headers: {
      "User-Agent": "InfoHub-Pipeline/1.0",
      Accept: "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
      "Accept-Encoding": "identity",
    },
    lookup: (_hostname, _options, callback) => callback(null, selected.address, selected.family),
  };

  const request = url.protocol === "https:" ? https.request : http.request;
  return new Promise((resolve, reject) => {
    const req = request(url, requestOptions, resolve);
    req.once("error", () => reject(new Error("Falha ao buscar a fonte RSS.")));
    req.end();
  });
}

export async function readLimitedRssBody(response: IncomingMessage, signal: AbortSignal): Promise<string> {
  const contentLength = Number(response.headers["content-length"]);
  if (Number.isFinite(contentLength) && contentLength > MAX_RESPONSE_BYTES) {
    response.destroy();
    throw new Error("Resposta RSS excede o limite permitido.");
  }

  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of response) {
    if (signal.aborted) throw new Error("Tempo limite excedido ao buscar a fonte RSS.");
    const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += bytes.byteLength;
    if (size > MAX_RESPONSE_BYTES) {
      response.destroy();
      throw new Error("Resposta RSS excede o limite permitido.");
    }
    chunks.push(bytes);
  }
  return Buffer.concat(chunks, size).toString("utf8");
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

    console.log(`Fonte: ${source.name}`);

    const items = await fetchRssSource(source);

    console.log(`  Itens coletados: ${items.length}`);

    results.push({
      source,
      items,
    });
  }

  return results;
}
