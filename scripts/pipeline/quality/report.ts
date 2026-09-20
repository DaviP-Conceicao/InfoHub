import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type {
  QualityResult,
  PipelineResult,
} from "../types";
import { pipelineConfig } from "../config";

export async function storeQualityReport(
  batchId: string,
  result: QualityResult
): Promise<string> {
  const directory = join(
    pipelineConfig.silverDir,
    batchId
  );

  await mkdir(directory, {
    recursive: true,
  });

  const duplicates = result.rejected.filter(
    ({ issues }) =>
      issues.some(
        (issue) => issue.code === "DUPLICATE"
      )
  ).length;

  const report: PipelineResult = {
    batchId,
    fetched:
      result.valid.length +
      result.rejected.length,
    normalized:
      result.valid.length +
      result.rejected.length,
    valid: result.valid.length,
    rejected: result.rejected.length,
    duplicates,
  };

  const filePath = join(
    directory,
    "quality-report.json"
  );

  await writeFile(
    filePath,
    JSON.stringify(report, null, 2),
    "utf8"
  );

  return filePath;
}
