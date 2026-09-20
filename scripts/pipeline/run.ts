import { randomUUID } from "node:crypto";

import {
  fetchConfiguredRssSources,
} from "./sources/rss";

import {
  normalizeItems,
} from "./silver/normalize";

import {
  runQualityChecks,
} from "./quality/check";

import {
  buildQualityReport,
} from "./quality/report";

import {
  localPipelineStorage,
} from "./storage/local";

import { pipelineConfig } from "./config";

import {
  filterNewFingerprints,
  markProcessed,
} from "./dedup/store";

async function main() {
  const batchId =
    new Date()
      .toISOString()
      .replace(/[:.]/g, "-") +
    "-" +
    randomUUID().slice(0, 8);

  console.log("");
  console.log("========================================");
  console.log("INFOHUB — PIPELINE V2.1");
  console.log("========================================");
  console.log(`Batch: ${batchId}`);
  console.log(`Dry-run: ${pipelineConfig.dryRun}`);
  console.log("");

  const sources =
    await fetchConfiguredRssSources();

  let totalFetched = 0;
  let totalNormalized = 0;
  let totalValid = 0;
  let totalRejected = 0;
  let totalDuplicates = 0;

  for (const { source, items } of sources) {
    totalFetched += items.length;

    if (!pipelineConfig.dryRun) {
      const bronzePath =
        await localPipelineStorage.storeBronze(
          batchId,
          source,
          items
        );

      console.log(
        `Bronze: ${bronzePath}`
      );
    }

    const normalized =
      normalizeItems(items);

    totalNormalized += normalized.length;

    const persistentDedup =
      await filterNewFingerprints(
        normalized.map(
          (item) => item.fingerprint
        )
      );

    const persistentDuplicateFingerprints =
      persistentDedup.duplicates;

    const candidates =
      normalized.filter(
        (item) =>
          !persistentDuplicateFingerprints.has(
            item.fingerprint
          )
      );

    const quality =
      runQualityChecks(candidates);

    totalValid += quality.valid.length;
    totalRejected +=
      quality.rejected.length;

    const batchDuplicateCount =
      quality.rejected.filter(
        ({ issues }) =>
          issues.some(
            (issue) =>
              issue.code === "DUPLICATE"
          )
      ).length;

    const duplicateCount =
      persistentDuplicateFingerprints.size +
      batchDuplicateCount;

    totalDuplicates += duplicateCount;

    const report =
      buildQualityReport(
        batchId,
        items.length,
        normalized.length,
        quality
      );

    if (!pipelineConfig.dryRun) {
      const silverPath =
        await localPipelineStorage.storeSilver(
          batchId,
          quality.valid
        );

      const quarantinePath =
        await localPipelineStorage.storeQuarantine(
          batchId,
          quality.rejected
        );

      const reportPath =
        await localPipelineStorage.storeQualityReport(
          batchId,
          report
        );

      await markProcessed(
        quality.valid.map(
          (item) => item.fingerprint
        )
      );

      console.log(
        `Silver: ${silverPath}`
      );

      console.log(
        `Quarantine: ${quarantinePath}`
      );

      console.log(
        `Quality: ${reportPath}`
      );
    }

    console.log(
      `  Válidos: ${quality.valid.length}`
    );

    console.log(
      `  Rejeitados: ${quality.rejected.length}`
    );

    console.log(
      `  Duplicados: ${duplicateCount}`
    );
  }

  console.log("");
  console.log("========================================");
  console.log("RESUMO");
  console.log("========================================");
  console.log(`Coletados:     ${totalFetched}`);
  console.log(`Normalizados:  ${totalNormalized}`);
  console.log(`Válidos:       ${totalValid}`);
  console.log(`Rejeitados:    ${totalRejected}`);
  console.log(`Duplicados:    ${totalDuplicates}`);
  console.log("");

  if (pipelineConfig.dryRun) {
    console.log(
      "DRY-RUN ativo: nenhum conteúdo foi enviado para a API."
    );
  } else {
    console.log(
      "Modo real: publicação ainda não faz parte deste estágio."
    );
  }

  console.log("");
}

main().catch((error: unknown) => {
  console.error("");
  console.error("PIPELINE ERROR");

  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(error);
  }

  process.exitCode = 1;
});
