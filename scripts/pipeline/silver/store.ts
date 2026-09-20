import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { SilverItem } from "../types";
import { pipelineConfig } from "../config";

export async function storeSilver(
  batchId: string,
  items: SilverItem[]
): Promise<string> {
  const directory = join(
    pipelineConfig.silverDir,
    batchId
  );

  await mkdir(directory, {
    recursive: true,
  });

  const filePath = join(
    directory,
    "items.json"
  );

  await writeFile(
    filePath,
    JSON.stringify(
      {
        batchId,
        processedAt: new Date().toISOString(),
        items,
      },
      null,
      2
    ),
    "utf8"
  );

  return filePath;
}
