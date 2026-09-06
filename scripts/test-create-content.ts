import { createContent } from "../lib/contents";

async function main() {
  const id = await createContent({
    categoryId: 3,
    title: "Conteúdo de teste do pipeline",
    slug: "teste-pipeline-infohub",
    summary: "Conteúdo criado para testar a camada de ingestão do InfoHub.",
    content:
      "Este é um conteúdo de teste criado pelo primeiro estágio do pipeline de ingestão.",
    data: {
      test: true,
      source: "manual",
    },
  });

  console.log(`Conteúdo criado com ID: ${id}`);
}

main().catch((error) => {
  console.error("Erro ao criar conteúdo:", error);
  process.exit(1);
});