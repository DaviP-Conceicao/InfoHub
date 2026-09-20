import {
  readFile,
  writeFile,
  mkdir,
} from "node:fs/promises";
import { dirname } from "node:path";

import { pipelineConfig } from "../config";

const indexPath =
  `${pipelineConfig.silverDir}/processed-fingerprints.json`;

async function load(): Promise<Set<string>> {
  try {
    const content = await readFile(
      indexPath,
      "utf8"
    );

    return new Set(
      JSON.parse(content) as string[]
    );
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return new Set();
    }

    throw error;
  }
}

async function save(
  fingerprints: Set<string>
): Promise<void> {
  await mkdir(
    dirname(indexPath),
    { recursive: true }
  );

  await writeFile(
    indexPath,
    JSON.stringify(
      [...fingerprints].sort(),
      null,
      2
    ),
    "utf8"
  );
}

export async function filterNewFingerprints(
  fingerprints: string[]
): Promise<{
  newFingerprints: Set<string>;
  duplicates: Set<string>;
}> {
  const processed = await load();
  const newFingerprints = new Set<string>();
  const duplicates = new Set<string>();

  for (const fingerprint of fingerprints) {
    if (
      processed.has(fingerprint) ||
      newFingerprints.has(fingerprint)
    ) {
      duplicates.add(fingerprint);
    } else {
      newFingerprints.add(fingerprint);
    }
  }

  return {
    newFingerprints,
    duplicates,
  };
}

export async function markProcessed(
  fingerprints: Iterable<string>
): Promise<void> {
  const processed = await load();

  for (const fingerprint of fingerprints) {
    processed.add(fingerprint);
  }

  await save(processed);
}
