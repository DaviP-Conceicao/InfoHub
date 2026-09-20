import type {
  RawSourceItem,
  SilverItem,
} from "../types";

function normalizeText(value: string): string {
  return value
    .normalize("NFKC")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeTitle(value: string): string {
  return normalizeText(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function normalizeSummary(
  value: string | null
): string {
  return normalizeText(
    value
      ?.replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim() ?? ""
  ).slice(0, 500);
}

function normalizeUrl(value: string): string {
  try {
    const url = new URL(value);

    url.hash = "";

    return url.toString();
  } catch {
    return value.trim();
  }
}

function fingerprint(
  title: string,
  url: string
): string {
  return `${normalizeTitle(title)}|${normalizeUrl(url)}`;
}

export function normalizeItem(
  item: RawSourceItem
): SilverItem {
  const title = normalizeText(item.title);
  const url = normalizeUrl(item.url);

  return {
    sourceId: item.sourceId,
    sourceName: normalizeText(item.sourceName),
    sourceUrl: normalizeUrl(item.sourceUrl),
    externalId: normalizeText(item.externalId),
    title,
    url,
    publishedAt: item.publishedAt
      ? normalizeText(item.publishedAt)
      : null,
    summary: normalizeSummary(item.description),
    normalizedTitle: normalizeTitle(title),
    fingerprint: fingerprint(title, url),
  };
}

export function normalizeItems(
  items: RawSourceItem[]
): SilverItem[] {
  return items.map(normalizeItem);
}
