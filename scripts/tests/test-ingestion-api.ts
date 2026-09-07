export {};
const BASE_URL = "http://localhost:3000/api/v1/contents";

const API_KEY = process.env.INGESTION_API_KEY;

if (!API_KEY) {
  throw new Error(
    "INGESTION_API_KEY não definida. Carregue .env.local antes de executar os testes."
  );
}

type TestCase = {
  name: string;
  request: RequestInit;
  expectedStatus: number;
  expectedError?: string;
};

async function runTest(test: TestCase) {
  const response = await fetch(BASE_URL, test.request);
  const body = await response.json();

  const statusOk = response.status === test.expectedStatus;

  const errorOk =
    test.expectedError === undefined ||
    body?.error === test.expectedError;

  if (!statusOk || !errorOk) {
    throw new Error(
      [
        `Teste: ${test.name}`,
        `Status esperado: ${test.expectedStatus}`,
        `Status recebido: ${response.status}`,
        `Resposta: ${JSON.stringify(body)}`,
      ].join("\n")
    );
  }

  console.log(`✓ ${test.name}`);
}

function jsonRequest(body: unknown): RequestInit {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(body),
  };
}

async function main() {
  const unique = Date.now();

  const tests: TestCase[] = [
    {
      name: "requisição sem autenticação",
      request: {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          categoryId: 3,
          title: `Teste sem autenticação ${unique}`,
          slug: `teste-sem-autenticacao-${unique}`,
          content: "Este conteúdo não deve ser criado.",
        }),
      },
      expectedStatus: 401,
      expectedError: "Não autorizado.",
    },

    {
      name: "criação válida com fontes",
      request: jsonRequest({
        categoryId: 3,
        title: `Teste automatizado ${unique}`,
        slug: `teste-automatizado-${unique}`,
        summary: "Teste automatizado da API.",
        content: "Conteúdo criado pela suíte de testes.",
        data: {
          automatedTest: true,
        },
        sources: [
          {
            name: "Fonte de teste",
            url: "https://example.com/",
            sourceType: "other",
            verifiedAt: "2026-09-07",
          },
        ],
      }),
      expectedStatus: 201,
    },

    {
      name: "criação válida sem fontes",
      request: jsonRequest({
        categoryId: 3,
        title: `Teste sem fontes ${unique}`,
        slug: `teste-sem-fontes-${unique}`,
        content: "Conteúdo sem fontes para testar a API.",
      }),
      expectedStatus: 201,
    },

    {
      name: "title acima do limite",
      request: jsonRequest({
        categoryId: 3,
        title: "T".repeat(201),
        slug: `teste-title-longo-${unique}`,
        content: "Conteúdo de teste.",
      }),
      expectedStatus: 400,
      expectedError:
        "title deve possuir no máximo 200 caracteres.",
    },

    {
      name: "slug acima do limite",
      request: jsonRequest({
        categoryId: 3,
        title: "Título válido",
        slug: "s".repeat(221),
        content: "Conteúdo de teste.",
      }),
      expectedStatus: 400,
      expectedError:
        "slug deve possuir no máximo 220 caracteres.",
    },

    {
      name: "summary acima do limite",
      request: jsonRequest({
        categoryId: 3,
        title: "Título válido",
        slug: `teste-summary-longo-${unique}`,
        summary: "S".repeat(501),
        content: "Conteúdo de teste.",
      }),
      expectedStatus: 400,
      expectedError:
        "summary deve possuir no máximo 500 caracteres.",
    },

    {
      name: "URL inválida",
      request: jsonRequest({
        categoryId: 3,
        title: "Título válido",
        slug: `teste-url-invalida-${unique}`,
        content: "Conteúdo de teste.",
        sources: [
          {
            name: "Fonte inválida",
            url: "isto-nao-e-uma-url",
          },
        ],
      }),
      expectedStatus: 400,
      expectedError:
        "A url da fonte deve ser uma URL válida.",
    },

    {
      name: "protocolo de URL proibido",
      request: jsonRequest({
        categoryId: 3,
        title: "Título válido",
        slug: `teste-protocolo-${unique}`,
        content: "Conteúdo de teste.",
        sources: [
          {
            name: "Fonte inválida",
            url: "ftp://example.com/arquivo",
          },
        ],
      }),
      expectedStatus: 400,
      expectedError:
        "A url da fonte deve utilizar http ou https.",
    },

    {
      name: "sourceType acima do limite",
      request: jsonRequest({
        categoryId: 3,
        title: "Título válido",
        slug: `teste-source-type-${unique}`,
        content: "Conteúdo de teste.",
        sources: [
          {
            name: "Fonte de teste",
            url: "https://example.com/",
            sourceType: "x".repeat(51),
          },
        ],
      }),
      expectedStatus: 400,
      expectedError:
        "sourceType deve possuir no máximo 50 caracteres.",
    },

    {
      name: "verifiedAt inválido",
      request: jsonRequest({
        categoryId: 3,
        title: "Título válido",
        slug: `teste-verified-at-${unique}`,
        content: "Conteúdo de teste.",
        sources: [
          {
            name: "Fonte de teste",
            url: "https://example.com/",
            verifiedAt: "07/09/2026",
          },
        ],
      }),
      expectedStatus: 400,
      expectedError:
        "verifiedAt deve estar no formato YYYY-MM-DD.",
    },

    {
      name: "categoryId inválido",
      request: jsonRequest({
        categoryId: 999999999,
        title: "Título válido",
        slug: `teste-categoria-invalida-${unique}`,
        content: "Conteúdo de teste.",
      }),
      expectedStatus: 400,
      expectedError:
        "categoryId não corresponde a uma categoria existente.",
    },

    {
      name: "tentativa de publicação direta",
      request: jsonRequest({
        categoryId: 3,
        title: `Tentativa de publicação ${unique}`,
        slug: `teste-publicacao-direta-${unique}`,
        content: "Este conteúdo deve continuar como draft.",
        status: "published",
      }),
      expectedStatus: 201,
    },
  ];

  for (const test of tests) {
    await runTest(test);
  }

  console.log(`\n${tests.length} testes concluídos com sucesso.`);
}

main().catch((error) => {
  console.error("\n✗ Suíte de testes falhou.");
  console.error(error);
  process.exit(1);
});
