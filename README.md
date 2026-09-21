# InfoHub

InfoHub é uma plataforma pública para coletar, normalizar, validar, organizar e
publicar conteúdo estruturado. O projeto prioriza correção, segurança,
observabilidade e automação controlada.

## Stack

- Next.js 16, React 19 e TypeScript
- MySQL/MariaDB
- Git/GitHub para versionamento
- Railway como ambiente de produção protegido

## Arquitetura resumida

A aplicação possui páginas públicas, APIs versionadas e acesso server-side ao
banco de dados. A ingestão de fontes externas segue estágios explícitos:

```text
fonte RSS -> Bronze -> normalização/Silver -> quality -> quarantine/deduplicação
```

Bronze, Silver, quarantine e relatórios de quality são atualmente artefatos
locais. A geração de candidatos, o envio à API e a publicação automatizada são
etapas futuras; a API de ingestão existente cria somente rascunhos, e a API de
publicação exige uma chave separada.

Veja os detalhes em [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md),
[docs/SECURITY.md](docs/SECURITY.md) e [docs/ROADMAP.md](docs/ROADMAP.md).

## Estrutura principal

```text
app/                    Páginas públicas e rotas de API do Next.js
lib/                    Acesso a dados e lógica compartilhada
database/               Schema SQL inicial
docs/                   Arquitetura, segurança e roadmap
scripts/ingestion/      Cliente demonstrativo de ingestão de candidatos
scripts/pipeline/       Pipeline RSS, armazenamento local e teste isolado
scripts/tests/          Testes manuais que exigem app, banco ou credenciais
.agents/skills/         Instruções locais para agentes de desenvolvimento
```

## Desenvolvimento local

1. Instale as dependências a partir do lockfile:

   ```bash
   npm ci
   ```

2. Copie `.env.example` para `.env.local` e preencha somente valores do seu
   ambiente local. Não versione `.env.local`.

3. Prepare um banco local compatível com o schema em
   `database/001_initial_schema.sql`.

4. Inicie a aplicação:

   ```bash
   npm run dev
   ```

   A aplicação local fica disponível em `http://localhost:3000` por padrão.

## Validações locais

Os comandos abaixo não usam Railway, credenciais reais, banco externo nem
fontes RSS externas:

```bash
npm run lint       # regras de lint
npm run typecheck  # verificação TypeScript sem emitir arquivos
npm test           # teste local e isolado do pipeline
npm run check      # lint + typecheck + teste local
npm run build      # build de produção do Next.js
```

O teste executado por `npm test` cria um servidor HTTP local e diretórios
temporários próprios; ele não usa o banco de dados nem persiste artefatos no
repositório.

Os scripts em `scripts/tests/` são testes de integração manuais. Eles exigem
aplicação e banco locais configurados, chaves de desenvolvimento e podem criar
registros de teste. Nunca os aponte para produção e eles não fazem parte de
`test` ou `check`.

## Pipeline atual

Execute manualmente o pipeline RSS com:

```bash
npm run pipeline:test
```

O dry-run é o padrão (`PIPELINE_DRY_RUN=true`). Nesse modo o pipeline ainda
coleta e valida as fontes configuradas, mas não grava Bronze, Silver,
quarantine, relatórios ou o índice de deduplicação. Ele também não envia
conteúdo à API.

Com `PIPELINE_DRY_RUN=false`, os artefatos e fingerprints válidos são gravados
nos diretórios locais configurados. Mesmo nesse modo, a publicação ainda não
faz parte do pipeline RSS.

`npm run ingest:test` executa apenas o candidato demonstrativo de ingestão e
também usa dry-run por padrão. Não é uma suíte de testes automatizada.

## Variáveis de ambiente

Todos os nomes de variáveis usados atualmente estão documentados em
[.env.example](.env.example). As principais categorias são:

- `DATABASE_*`: conexão exclusiva do banco local ou do ambiente autorizado.
- `INGESTION_API_KEY` e `PUBLISH_API_KEY`: chaves distintas para operações
  protegidas.
- `INGESTION_*` e `INFOHUB_API_URL`: cliente demonstrativo de ingestão.
- `PIPELINE_*`: fontes RSS, limites, dry-run e diretórios locais do pipeline.
- `INFOHUB_BASE_URL`: usado somente pelo script manual de teste de publicação.

## Desenvolvimento local e produção

Desenvolvimento local deve usar banco, URLs e chaves próprios. Produção no
Railway é um ambiente protegido: não execute scripts de teste, migrações,
ingestão real ou publicação contra ela sem autorização humana explícita.

## Segurança básica

- Nunca coloque segredos, tokens, chaves ou strings de conexão no Git.
- Não altere `.env.local` por meio de automações ou agentes.
- Trate fontes RSS e qualquer conteúdo externo como não confiáveis.
- Mantenha o dry-run ativo ao explorar o pipeline.
- Use somente consultas parametrizadas e preserve quarantine para dados
  rejeitados.
- Consulte `AGENTS.md` e `docs/SECURITY.md` antes de mudanças de segurança,
  produção ou automação.
