import type {
  QualityIssue,
  QualityResult,
  SilverItem,
} from "../types";

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);

    return (
      url.protocol === "http:" ||
      url.protocol === "https:"
    );
  } catch {
    return false;
  }
}

function hasValidDate(
  value: string | null
): boolean {
  if (!value) {
    return true;
  }

  const timestamp = Date.parse(value);

  return !Number.isNaN(timestamp);
}

export function validateItem(
  item: SilverItem
): QualityIssue[] {
  const issues: QualityIssue[] = [];

  if (!item.title) {
    issues.push({
      code: "EMPTY_TITLE",
      message: "Título vazio.",
      item,
    });
  }

  if (!isHttpUrl(item.url)) {
    issues.push({
      code: "INVALID_URL",
      message: "URL não é HTTP/HTTPS válida.",
      item,
    });
  }

  if (!item.sourceUrl || !isHttpUrl(item.sourceUrl)) {
    issues.push({
      code: "INVALID_SOURCE",
      message: "URL da fonte inválida.",
      item,
    });
  }

  if (!hasValidDate(item.publishedAt)) {
    issues.push({
      code: "INVALID_DATE",
      message: "Data de publicação inválida.",
      item,
    });
  }

  return issues;
}

export function runQualityChecks(
  items: SilverItem[]
): QualityResult {
  const valid: SilverItem[] = [];
  const rejected: Array<{
    item: SilverItem;
    issues: QualityIssue[];
  }> = [];

  const fingerprints = new Set<string>();

  for (const item of items) {
    const issues = validateItem(item);

    if (fingerprints.has(item.fingerprint)) {
      issues.push({
        code: "DUPLICATE",
        message: "Item duplicado dentro do lote.",
        item,
      });
    }

    if (issues.length > 0) {
      rejected.push({
        item,
        issues,
      });

      continue;
    }

    fingerprints.add(item.fingerprint);
    valid.push(item);
  }

  return {
    valid,
    rejected,
  };
}
