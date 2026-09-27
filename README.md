# InfoHub

InfoHub é uma plataforma pública para coletar, normalizar, validar, organizar e
publicar conteúdo estruturado.

O projeto foi desenvolvido como um estudo de caso de engenharia de software
assistida por IA, envolvendo arquitetura web, APIs, banco de dados, pipeline de
conteúdo externo, segurança, testes, CI/CD e documentação.

O desenvolvimento ativo foi encerrado e o projeto encontra-se congelado como
projeto de portfólio.

## Estado do projeto

**Status: congelado como projeto de portfólio.**

A versão final preserva a fundação técnica construída durante o desenvolvimento,
mas não representa uma plataforma comercial em operação contínua.

Não fazem parte da versão final:

- agente operacional autônomo;
- publicação automática completa;
- monetização;
- tracking próprio de afiliados;
- revenue tracking;
- notificações financeiras;
- analytics próprio;
- desenvolvimento autônomo contínuo.

Veja o estado detalhado em [docs/PROJECT-STATUS.md](docs/PROJECT-STATUS.md).

## Stack

- Next.js 16
- React 19
- TypeScript
- MySQL/MariaDB
- Git/GitHub
- Railway
- GitHub Actions

## Arquitetura resumida

A aplicação possui páginas públicas, APIs versionadas e acesso server-side ao
banco de dados.

A ingestão de fontes externas foi organizada em estágios explícitos:

```text
fonte RSS
    ↓
Bronze
    ↓
normalização
    ↓
Silver
    ↓
quality
    ↓
quarantine
    ↓
deduplicação
```

Bronze, Silver, quarantine e relatórios de quality são tratados como artefatos
locais.

A API de ingestão existente cria rascunhos e possui autenticação própria. A API
de publicação utiliza uma chave separada.

O pipeline RSS não realiza publicação automática.

## Funcionalidades implementadas

- páginas públicas de conteúdo;
- páginas por categoria;
- busca;
- SEO básico;
- sitemap;
- robots;
- API versionada;
- consulta pública de conteúdos;
- API protegida de ingestão;
- API protegida de publicação;
- banco de dados relacional;
- categorias;
- fontes;
- tags;
- aliases;
- pipeline RSS;
- Bronze e Silver;
- quality gate;
- quarantine;
- deduplicação persistente;
- dry-run;
- testes automatizados do pipeline;
- CI com GitHub Actions.

## Segurança

O projeto passou por revisões específicas de segurança.

Entre os controles implementados estão:

- consultas SQL parametrizadas;
- validação de entradas;
- autenticação nas operações protegidas;
- separação entre chaves de ingestão e publicação;
- tratamento de conteúdo externo como não confiável;
- proteção contra SSRF;
- validação de destinos DNS;
- proteção contra DNS rebinding;
- validação de redirects;
- bloqueio de destinos locais e privados;
- limite de 2 MiB para respostas RSS durante o streaming;
- quarantine para dados rejeitados;
- dry-run antes de efeitos persistentes.

A segurança do projeto não é apresentada como absoluta.

Mais detalhes estão em [docs/SECURITY.md](docs/SECURITY.md).

## Estrutura principal

```text
app/                    Páginas públicas e rotas de API do Next.js
lib/                    Acesso a dados e lógica compartilhada
database/               Schema SQL inicial
docs/                   Documentação do projeto
scripts/ingestion/      Cliente demonstrativo de ingestão
scripts/pipeline/       Pipeline RSS e testes isolados
scripts/tests/          Testes manuais de integração
.agents/skills/         Instruções locais para desenvolvimento
```

## Desenvolvimento local

Instale as dependências a partir do lockfile:

```bash
npm ci
```

Copie `.env.example` para `.env.local` e preencha somente valores do seu
ambiente local.

Nunca versione `.env.local`.

Prepare um banco local compatível com:

```text
database/001_initial_schema.sql
```

Para iniciar a aplicação:

```bash
npm run dev
```

Por padrão, a aplicação fica disponível em:

```text
http://localhost:3000
```

## Validações

Os principais comandos de validação são:

```bash
npm run lint
npm run typecheck
npm test
npm run check
npm run build
git diff --check
```

O comando `npm run check` executa:

```text
lint
  ↓
typecheck
  ↓
testes do pipeline
```

O CI do GitHub Actions executa `npm ci`, `npm run check` e `npm run build`.

Os testes automatizados não utilizam Railway, banco de produção ou credenciais
reais.

## Pipeline

Para executar manualmente o pipeline:

```bash
npm run pipeline:test
```

O dry-run é o comportamento padrão:

```text
PIPELINE_DRY_RUN=true
```

Nesse modo, o pipeline pode coletar e validar fontes, mas não grava os
artefatos persistentes do pipeline nem envia conteúdo para a API.

Com:

```text
PIPELINE_DRY_RUN=false
```

os artefatos e fingerprints válidos podem ser gravados nos diretórios locais
configurados.

Mesmo nesse modo, a publicação não faz parte do pipeline RSS.

## Variáveis de ambiente

Os nomes das variáveis utilizadas pelo projeto estão documentados em
`.env.example`.

As principais categorias são:

- `DATABASE_*`;
- `INGESTION_API_KEY`;
- `PUBLISH_API_KEY`;
- `INGESTION_*`;
- `INFOHUB_API_URL`;
- `PIPELINE_*`;
- `INFOHUB_BASE_URL`.

Os valores reais das credenciais devem permanecer fora do Git.

## Produção

Durante o desenvolvimento foi utilizado Railway para hospedagem da aplicação e
do banco de dados.

Produção deve ser tratada separadamente do ambiente local.

Scripts de teste, migrações, ingestão real e publicação não devem ser executados
contra produção sem autorização humana explícita.

O encerramento da infraestrutura de produção faz parte das etapas finais de
preservação do projeto e deve ocorrer somente após a realização dos backups e
verificações necessários.

## Documentação

Os principais documentos do projeto são:

- [Status Final](docs/PROJECT-STATUS.md)
- [Diário de Desenvolvimento](docs/DEVELOPMENT-JOURNAL.md)
- [Decisões Técnicas](docs/DECISIONS.md)
- [Arquitetura](docs/ARCHITECTURE.md)
- [Segurança](docs/SECURITY.md)
- [Roadmap e escopo encerrado](docs/ROADMAP.md)

## Desenvolvimento assistido por IA

Ferramentas de inteligência artificial foram utilizadas durante o
desenvolvimento para auxiliar em:

- implementação;
- análise;
- testes;
- documentação;
- revisão;
- investigação de problemas;
- segurança.

As alterações foram submetidas a validação humana, testes, revisão de diff e
checkpoints Git.

O desenvolvimento assistido por IA não substituiu a validação humana para
operações sensíveis.

## Resultado

O InfoHub representa um estudo de caso de desenvolvimento de software
assistido por IA envolvendo:

- arquitetura web;
- APIs;
- banco de dados;
- processamento de conteúdo externo;
- pipelines;
- segurança;
- testes;
- CI/CD;
- documentação;
- tomada de decisões técnicas.

O projeto está congelado nessa versão para preservação e apresentação como
portfólio.
