import { randomUUID } from "node:crypto";
import {
  fetchConfiguredRssSources,
} from "./sources/rss";
import { storeBronze } from "./bronze/store";
import {
  normalizeItems,
} from "./silver/normalize";
import { storeSilver } from "./silver/store";
import {
  runQualityChecks,
} from "./quality/check";
import {
  storeQualityReport,
} from "./quality/report";
import { pipelineConfig } from "./config";

async function main() {
  const batchId = new Date()
    .toISOString()
    .replace(/[:.]/g, "-") +
    "-" +
    randomUUID().slice(0, 8);

  console.log("");
  console.log("========================================");
  console.log("INFOHUB — PIPELINE V2");
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

    const bronzePath =
      await storeBronze(
        batchId,
        source,
        items
      );

    console.log(`Bronze: ${bronzePath}`);

    const normalized =
      normalizeItems(items);

    totalNormalized += normalized.length;

    const quality =
      runQualityChecks(normalized);

    totalValid += quality.valid.length;
    totalRejected += quality.rejected.length;

    totalDuplicates +=
      quality.rejected.filter(
        ({ issues }) =>
          issues.some(
            (issue) =>
              issue.code === "DUPLICATE"
          )
      ).length;

    const silverPath =
      await storeSilver(
        batchId,
        quality.valid
      );

    const reportPath =
      await storeQualityReport(
        batchId,
        quality
      );

    console.log(`Silver: ${silverPath}`);
    console.log(`Quality: ${reportPath}`);
    console.log(
      `  Válidos: ${quality.valid.length}`
    );
    console.log(
      `  Rejeitados: ${quality.rejected.length}`
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
      "Modo de execução real: a publicação ainda não faz parte deste estágio."
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
