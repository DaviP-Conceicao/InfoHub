import type {
  QualityReport,
  QualityResult,
} from "../types";

export function buildQualityReport(
  batchId: string,
  fetched: number,
  normalized: number,
  result: QualityResult
): QualityReport {
  const issuesByCode: Record<string, number> = {};

  for (const rejected of result.rejected) {
    for (const issue of rejected.issues) {
      issuesByCode[issue.code] =
        (issuesByCode[issue.code] ?? 0) + 1;
    }
  }

  const duplicates =
    issuesByCode.DUPLICATE ?? 0;

  return {
    batchId,
    processedAt: new Date().toISOString(),
    fetched,
    normalized,
    valid: result.valid.length,
    rejected: result.rejected.length,
    duplicates,
    issuesByCode,
  };
}
