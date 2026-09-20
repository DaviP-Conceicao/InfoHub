function parsePositiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) {
    return fallback;
  }

  return value.toLowerCase() === "true";
}

const defaultRssUrl =
  "https://feeds.bbci.co.uk/portuguese/rss.xml";

export const pipelineConfig = {
  rssUrls: (
    process.env.PIPELINE_RSS_URLS ??
    defaultRssUrl
  )
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean),

  requestTimeoutMs: parsePositiveInteger(
    process.env.PIPELINE_REQUEST_TIMEOUT_MS,
    15_000
  ),

  maxItemsPerSource: parsePositiveInteger(
    process.env.PIPELINE_MAX_ITEMS,
    25
  ),

  dryRun: parseBoolean(
    process.env.PIPELINE_DRY_RUN,
    true
  ),

  bronzeDir:
    process.env.PIPELINE_BRONZE_DIR ??
    "scripts/pipeline/bronze/data",

  silverDir:
    process.env.PIPELINE_SILVER_DIR ??
    "scripts/pipeline/silver/data",
};

if (pipelineConfig.rssUrls.length === 0) {
  throw new Error("PIPELINE_RSS_URLS não contém nenhuma fonte válida.");
}
