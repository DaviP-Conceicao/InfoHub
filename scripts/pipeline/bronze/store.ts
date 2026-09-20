import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type {
  BronzeBatch,
  PipelineSource,
  RawSourceItem,
} from "../types";
import { pipelineConfig } from "../config";

export async function storeBronze(
  batchId: string,
  source: PipelineSource,
  items: RawSourceItem[]
): Promise<string> {
  const directory = join(
    pipelineConfig.bronzeDir,
    batchId
  );

  await mkdir(directory, {
    recursive: true,
  });

  const batch: BronzeBatch = {
    batchId,
    fetchedAt: new Date().toISOString(),
    source,
    items,
  };

  const filePath = join(
    directory,
    `${source.id}.json`
  );

  await writeFile(
    filePath,
    JSON.stringify(batch, null, 2),
    "utf8"
  );

  return filePath;
}
