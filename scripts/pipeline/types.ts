export type PipelineSource = {
  id: string;
  name: string;
  url: string;
  type: "rss";
};

export type RawSourceItem = {
  sourceId: string;
  sourceName: string;
  sourceUrl: string;
  fetchedAt: string;
  externalId: string;
  title: string;
  url: string;
  publishedAt: string | null;
  description: string | null;
};

export type BronzeBatch = {
  batchId: string;
  fetchedAt: string;
  source: PipelineSource;
  items: RawSourceItem[];
};

export type SilverItem = {
  sourceId: string;
  sourceName: string;
  sourceUrl: string;
  externalId: string;
  title: string;
  url: string;
  publishedAt: string | null;
  summary: string;
  normalizedTitle: string;
  fingerprint: string;
};

export type QualityIssue = {
  code:
    | "EMPTY_TITLE"
    | "INVALID_URL"
    | "DUPLICATE"
    | "INVALID_SOURCE"
    | "INVALID_DATE";
  message: string;
  item: SilverItem;
};

export type QualityResult = {
  valid: SilverItem[];
  rejected: Array<{
    item: SilverItem;
    issues: QualityIssue[];
  }>;
};

export type PipelineResult = {
  batchId: string;
  fetched: number;
  normalized: number;
  valid: number;
  rejected: number;
  duplicates: number;
};
