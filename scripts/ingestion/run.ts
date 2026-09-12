import { ingestionConfig } from "./config";
import { sendCandidate } from "./api";
import { validateCandidate } from "./validate";
import type { IngestionCandidate } from "./types";

const candidate: IngestionCandidate = {
  categoryId: 3,
  title: "Exemplo de candidato de ingestão",
  slug: "exemplo-candidato-ingestao",
  summary:
    "Candidato usado para validar o pipeline de ingestão do InfoHub.",
  content:
    "Este conteúdo é apenas um teste técnico do pipeline de ingestão. Não representa conteúdo editorial definitivo.",
  sources: [
    {
      name: "InfoHub",
      url: "https://example.com",
      sourceType: "test",
    },
  ],
};

async function main() {
  console.log("===== INFOHUB INGESTION V1 =====");
  console.log(`API: ${ingestionConfig.apiUrl}`);
  console.log(`Dry-run: ${ingestionConfig.dryRun}`);
  console.log(`Max candidates: ${ingestionConfig.maxCandidates}`);

  const errors = validateCandidate(candidate);

  if (errors.length > 0) {
    console.error("Candidato inválido:");

    for (const error of errors) {
      console.error(`- ${error}`);
    }

    process.exitCode = 1;
    return;
  }

  console.log();
  console.log("Candidato validado:");
  console.log(`Título: ${candidate.title}`);
  console.log(`Categoria ID: ${candidate.categoryId}`);
  console.log(`Fontes: ${candidate.sources.length}`);

  if (ingestionConfig.dryRun) {
    console.log();
    console.log("DRY-RUN ativo.");
    console.log("Nenhuma requisição foi enviada para a API.");
    return;
  }

  await sendCandidate(candidate);

  console.log();
  console.log("Candidato enviado para o InfoHub.");
  console.log("O endpoint de ingestão deve mantê-lo como DRAFT.");
}

main().catch((error) => {
  console.error();
  console.error("Falha na ingestão:");

  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error("Erro desconhecido.");
  }

  process.exitCode = 1;
});
