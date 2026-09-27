# InfoHub Architecture

## Estado

O InfoHub está congelado como projeto de portfólio.

Este documento descreve a arquitetura efetivamente implementada na versão
final do projeto.

## Stack

- Next.js 16
- React 19
- TypeScript
- MySQL/MariaDB
- Railway
- Git/GitHub
- GitHub Actions

## Camadas da aplicação

### Web

A camada web contém:

- páginas públicas;
- categorias;
- busca;
- detalhes de conteúdo;
- metadados SEO;
- robots;
- sitemap.

### API

A aplicação possui APIs versionadas para:

- categorias;
- conteúdos;
- ingestão;
- publicação;
- health check.

As operações de ingestão e publicação são protegidas.

A ingestão e a publicação utilizam credenciais separadas.

### Banco de dados

O banco relacional contém estruturas para:

- categorias;
- conteúdos;
- fontes;
- tags;
- aliases;
- relacionamentos entre conteúdos e tags.

O acesso ao banco utiliza consultas parametrizadas.

### Pipeline de ingestão

O pipeline processa fontes externas em etapas:

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
    ↓
artefatos locais
```

O conteúdo externo é tratado como não confiável.

#### Bronze

A camada Bronze representa os dados coletados da fonte antes das etapas
posteriores de normalização.

Seu objetivo é preservar uma representação inicial dos dados recebidos.

#### Silver

A camada Silver contém dados após normalização e tratamento inicial.

A separação entre Bronze e Silver facilita:

- depuração;
- análise;
- reprocessamento;
- validação.

#### Quality

A etapa de quality verifica se os dados processados atendem aos critérios
esperados pelo pipeline.

Itens que não atendem aos critérios não devem ser tratados automaticamente
como conteúdo válido.

#### Quarantine

Dados rejeitados podem ser preservados em quarantine.

Isso permite:

- investigação;
- diagnóstico;
- recuperação;
- análise de falhas.

#### Deduplicação

O pipeline utiliza fingerprints persistentes para identificar itens já
processados.

Isso reduz processamento repetido e duplicação.

#### Dry-run

O pipeline possui dry-run como comportamento padrão.

No dry-run:

- fontes podem ser coletadas;
- dados podem ser normalizados;
- validações podem ser executadas;
- testes podem observar o comportamento;

sem gravar os artefatos persistentes do pipeline.

#### Publicação

A publicação não está conectada automaticamente ao pipeline RSS.

A API de publicação possui proteção própria.

Essa separação evita transformar automaticamente qualquer dado coletado em
conteúdo publicado.

## Segurança arquitetural

A arquitetura considera fontes externas como não confiáveis.

O cliente RSS implementa:

- validação de esquema;
- rejeição de credenciais incorporadas;
- validação DNS;
- bloqueio de destinos locais e privados;
- proteção contra SSRF;
- proteção contra DNS rebinding;
- validação de redirects;
- limite de tamanho de resposta.

As respostas RSS são limitadas a 2 MiB durante o streaming.

## CI

O repositório possui GitHub Actions para validação automatizada.

O fluxo principal é:

```text
checkout
    ↓
Node.js 22
    ↓
npm ci
    ↓
npm run check
    ↓
npm run build
```

## Ambiente local e produção

O desenvolvimento local e a produção são tratados como ambientes separados.

O código-fonte não contém credenciais reais.

Arquivos de ambiente locais são ignorados pelo Git.

Operações de produção exigem autorização humana.

## Princípios utilizados

- acesso server-side ao banco quando apropriado;
- consultas parametrizadas;
- validação explícita nas fronteiras da aplicação;
- conteúdo externo tratado como não confiável;
- dry-run antes de efeitos persistentes;
- deduplicação persistente;
- quarantine recuperável;
- mudanças pequenas e revisáveis;
- checkpoints Git;
- validação automatizada;
- cautela adicional para operações de produção.

## Escopo encerrado

A arquitetura implementada não inclui:

- agente operacional autônomo;
- publicação automática completa;
- monetização;
- analytics próprio;
- revenue tracking;
- notificações financeiras;
- desenvolvimento autônomo contínuo.

Esses componentes foram considerados durante o desenvolvimento, mas não fazem
parte da arquitetura final.

## Documentação relacionada

- [docs/PROJECT-STATUS.md](PROJECT-STATUS.md)
- [docs/DEVELOPMENT-JOURNAL.md](DEVELOPMENT-JOURNAL.md)
- [docs/DECISIONS.md](DECISIONS.md)
- [docs/SECURITY.md](SECURITY.md)
