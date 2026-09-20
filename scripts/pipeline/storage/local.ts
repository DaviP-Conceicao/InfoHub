import {
  mkdir,
  writeFile,
} from "node:fs/promises";
import { join } from "node:path";

import type {
  BronzeBatch,
  PipelineSource,
  RawSourceItem,
  RejectedItem,
  SilverItem,
  QualityReport,
  PipelineStorage,
} from "../types";

import { pipelineConfig } from "../config";

async function ensureDirectory(
  directory: string
): Promise<void> {
  await mkdir(directory, {
    recursive: true,
  });
}

async function writeJson(
  filePath: string,
  value: unknown
): Promise<void> {
  await writeFile(
    filePath,
    JSON.stringify(value, null, 2),
    "utf8"
  );
}

export const localPipelineStorage: PipelineStorage = {
  async storeBronze(
    batchId: string,
    source: PipelineSource,
    items: RawSourceItem[]
  ): Promise<string> {
    const directory = join(
      pipelineConfig.bronzeDir,
      batchId
    );

    await ensureDirectory(directory);

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

    await writeJson(filePath, batch);

    return filePath;
  },

  async storeSilver(
    batchId: string,
    items: SilverItem[]
  ): Promise<string> {
    const directory = join(
      pipelineConfig.silverDir,
      batchId
    );

    await ensureDirectory(directory);

    const filePath = join(
      directory,
      "items.json"
    );

    await writeJson(filePath, {
      batchId,
      processedAt: new Date().toISOString(),
      items,
    });

    return filePath;
  },

  async storeQuarantine(
    batchId: string,
    items: RejectedItem[]
  ): Promise<string> {
    const directory = join(
      pipelineConfig.silverDir,
      batchId
    );

    await ensureDirectory(directory);

    const filePath = join(
      directory,
      "quarantine.json"
    );

    await writeJson(filePath, {
      batchId,
      quarantinedAt: new Date().toISOString(),
      count: items.length,
      items,
    });

    return filePath;
  },

  async storeQualityReport(
    batchId: string,
    report: QualityReport
  ): Promise<string> {
    const directory = join(
      pipelineConfig.silverDir,
      batchId
    );

    await ensureDirectory(directory);

    const filePath = join(
      directory,
      "quality-report.json"
    );

    await writeJson(filePath, report);

    return filePath;
  },
};
