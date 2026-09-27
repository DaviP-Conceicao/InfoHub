# InfoHub Security

## Estado

O InfoHub está congelado como projeto de portfólio.

Este documento registra os principais controles de segurança implementados
durante o desenvolvimento.

A segurança do projeto não é apresentada como absoluta. Os controles descritos
representam as ameaças analisadas e as medidas implementadas.

## Objetivos

Proteger:

- credenciais;
- chaves de API;
- banco de dados;
- aplicação pública;
- endpoints de ingestão;
- fluxo de publicação;
- integrações externas;
- dados processados pelo pipeline.

Funcionalidades financeiras e de monetização não fazem parte da versão final do
projeto.

## Segredos

Segredos não devem ser armazenados no Git.

Arquivos locais de ambiente, incluindo:

```text
.env.local
.env.local.*
```

devem permanecer fora do repositório.

O projeto mantém `.env.example` apenas como referência para os nomes das
variáveis.

## Banco de dados

O acesso ao banco utiliza consultas parametrizadas.

Entradas externas não devem ser concatenadas diretamente em consultas SQL.

## Autenticação

As operações protegidas utilizam autenticação por chave.

A ingestão e a publicação utilizam chaves separadas:

```text
INGESTION_API_KEY
PUBLISH_API_KEY
```

A separação reduz o escopo de uma credencial comprometida.

## Conteúdo externo

Fontes RSS e qualquer conteúdo externo são tratados como não confiáveis.

O sistema não deve assumir que uma fonte externa é segura somente porque ela
está previamente configurada.

## Proteção contra SSRF

As URLs utilizadas pelo coletor RSS são validadas antes de serem acessadas.

São rejeitados:

- esquemas diferentes de HTTP/HTTPS;
- URLs com credenciais incorporadas;
- loopback;
- endereços privados;
- endereços reservados;
- link-local;
- multicast;
- destinos de metadata;
- outros destinos considerados não permitidos pelo validador.

## Validação DNS

A resolução DNS é verificada antes da conexão.

Todos os endereços retornados devem passar pela validação de segurança.

O cliente HTTP utiliza um endereço previamente validado para impedir que uma
segunda resolução possa substituir o destino validado.

## DNS rebinding

O projeto passou por uma revisão específica contra DNS rebinding.

O controle implementado evita depender exclusivamente da primeira resolução DNS.

O fluxo inclui:

- resolução do hostname;
- validação dos endereços retornados;
- seleção de endereço permitido;
- conexão utilizando o endereço validado;
- preservação do hostname necessário para a requisição HTTP.

## Redirects

Redirects não são considerados confiáveis.

O destino de cada redirect é resolvido e validado novamente antes de ser
acessado.

Isso impede que uma URL inicialmente permitida redirecione diretamente para um
destino bloqueado sem nova validação.

## Limite de resposta RSS

Respostas RSS possuem limite de:

**2 MiB**

O limite é aplicado durante o streaming.

O tamanho informado pelo servidor também é considerado quando disponível.

## Quarantine

Itens rejeitados pelo pipeline não são simplesmente tratados como conteúdo
válido.

A quarantine permite preservar dados rejeitados para investigação e diagnóstico.

## Dry-run

O pipeline utiliza dry-run como comportamento padrão.

Isso permite validar o fluxo sem produzir efeitos persistentes inesperados.

## Logs

Logs não devem expor:

- senhas;
- chaves de API;
- strings de conexão;
- credenciais;
- informações sensíveis desnecessárias.

As fontes externas são identificadas de maneira que evite expor dados
desnecessários, especialmente URLs completas quando isso não for necessário.

## Produção

Operações de produção exigem autorização humana.

Não devem ser executados contra produção sem autorização:

- testes;
- scripts experimentais;
- migrações;
- ingestão real;
- publicação;
- alterações destrutivas.

## Segurança no desenvolvimento assistido por IA

Ferramentas de IA podem auxiliar na implementação e revisão, mas não devem ser
tratadas como autoridade final para operações sensíveis.

Durante o desenvolvimento foram utilizados:

- revisão de diff;
- testes;
- checkpoints Git;
- validação local;
- revisão específica de segurança.

Agentes e automações não devem:

- imprimir segredos;
- commitar segredos;
- desabilitar controles de segurança para fazer testes passarem;
- apagar dados de produção para resolver problemas de desenvolvimento;
- alterar autenticação silenciosamente;
- alterar autorização silenciosamente;
- afirmar segurança absoluta.

## Incidentes de credenciais

Se uma credencial puder ter sido exposta:

- interromper sua propagação;
- não repetir o segredo;
- identificar a credencial afetada;
- realizar rotação;
- revisar onde ocorreu a exposição;
- remover cópias acidentais rastreadas pelo Git, quando necessário;
- verificar o repositório e a configuração de implantação.

## Estado de encerramento

O projeto foi congelado como estudo de caso técnico.

Os controles de segurança documentados representam o estado implementado na
versão final e não devem ser interpretados como garantia de segurança absoluta
ou como substituto de uma auditoria de segurança independente.
