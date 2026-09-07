export {};
const BASE_URL =
  process.env.INFOHUB_BASE_URL ??
  "http://localhost:3000";

const ingestionKey = process.env.INGESTION_API_KEY;
const publishKey = process.env.PUBLISH_API_KEY;

if (!ingestionKey) {
  throw new Error("INGESTION_API_KEY não configurada.");
}

if (!publishKey) {
  throw new Error("PUBLISH_API_KEY não configurada.");
}

const slug = `teste-publicacao-${Date.now()}`;

async function request(
  url: string,
  options: RequestInit = {}
) {
  return fetch(url, options);
}

async function assertStatus(
  response: Response,
  expected: number,
  label: string
) {
  if (response.status !== expected) {
    const body = await response.text();
    throw new Error(
      `${label}: esperado ${expected}, recebido ${response.status}. Body: ${body}`
    );
  }

  console.log(`✓ ${label}`);
}

async function main() {
  console.log("===== TESTE DE PUBLICAÇÃO =====");

  const createResponse = await request(
    `${BASE_URL}/api/v1/contents`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ingestionKey}`,
      },
      body: JSON.stringify({
        categoryId: 3,
        title: "Teste fluxo de publicação",
        slug,
        content: "Conteúdo temporário para teste de publicação.",
        status: "published",
      }),
    }
  );

  await assertStatus(
    createResponse,
    201,
    "criação do conteúdo"
  );

  const unauthorizedResponse = await request(
    `${BASE_URL}/api/v1/contents/${slug}/publish`,
    {
      method: "POST",
    }
  );

  await assertStatus(
    unauthorizedResponse,
    401,
    "publicação sem chave"
  );

  const ingestionPublishResponse = await request(
    `${BASE_URL}/api/v1/contents/${slug}/publish`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ingestionKey}`,
      },
    }
  );

  await assertStatus(
    ingestionPublishResponse,
    401,
    "publicação usando somente INGESTION_API_KEY"
  );

  const publishResponse = await request(
    `${BASE_URL}/api/v1/contents/${slug}/publish`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${publishKey}`,
      },
    }
  );

  await assertStatus(
    publishResponse,
    200,
    "publicação com PUBLISH_API_KEY"
  );

  const publicResponse = await request(
    `${BASE_URL}/api/v1/contents/${slug}`
  );

  await assertStatus(
    publicResponse,
    200,
    "conteúdo publicado acessível publicamente"
  );

  console.log("✓ fluxo completo draft → published");

  console.log("");
  console.log(`Slug criado pelo teste: ${slug}`);
  console.log("Remova o registro de teste do banco após a execução.");
}

main().catch((error) => {
  console.error("✗ TESTE FALHOU");
  console.error(error);
  process.exit(1);
});
