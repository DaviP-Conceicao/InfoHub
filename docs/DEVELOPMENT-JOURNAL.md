# InfoHub — Diário de Desenvolvimento

## Objetivo deste documento

Este documento registra, em nível técnico, a evolução do InfoHub durante seu desenvolvimento.

O objetivo é preservar as principais etapas, decisões, problemas encontrados, correções realizadas e práticas utilizadas durante a construção do projeto.

O projeto foi desenvolvido com forte utilização de ferramentas de inteligência artificial, mas as alterações foram submetidas a validação humana, testes, revisão de código, revisão de diff e checkpoints Git.

---

## 1. Início e fundação do projeto

O InfoHub foi desenvolvido como uma plataforma para coletar, organizar, validar e publicar conteúdo estruturado.

A fundação inicial foi construída utilizando:

- Next.js;
- React;
- TypeScript;
- MySQL/MariaDB;
- Git;
- GitHub;
- Railway.

A aplicação foi estruturada com separação entre:

- interface pública;
- APIs;
- acesso ao banco;
- lógica de conteúdo;
- categorias;
- ingestão;
- pipeline de processamento.

Desde o início, o projeto buscou manter o acesso ao banco no lado do servidor e utilizar consultas parametrizadas.

---

## 2. Estrutura de dados

Foi criado um modelo relacional para representar o conteúdo da plataforma.

O schema inclui:

- `categories`;
- `contents`;
- `sources`;
- `tags`;
- `content_tags`;
- `aliases`.

Os conteúdos possuem:

- categoria;
- título;
- slug;
- resumo;
- conteúdo;
- dados estruturados;
- status editorial;
- timestamps.

Os conteúdos podem possuir fontes relacionadas, permitindo registrar a origem das informações utilizadas.

---

## 3. Aplicação web

A aplicação passou a disponibilizar páginas públicas para:

- conteúdos;
- categorias;
- busca;
- navegação;
- mecanismos básicos de SEO.

Também foram implementados:

- sitemap;
- robots;
- metadados de páginas;
- rotas públicas de conteúdo.

A aplicação utiliza APIs versionadas para separar a camada pública de consulta das operações protegidas.

---

## 4. APIs

Foram implementadas APIs para diferentes operações do sistema.

Entre elas:

- consulta de categorias;
- consulta de conteúdos;
- consulta de conteúdo por slug;
- ingestão de conteúdo;
- publicação de conteúdo;
- health check.

As operações sensíveis receberam proteção por chaves de API.

A ingestão utiliza uma chave própria e a publicação utiliza uma chave separada.

Essa separação evita que uma credencial destinada à ingestão seja automaticamente suficiente para executar operações de publicação.

---

## 5. Pipeline de conteúdo

Uma das etapas mais importantes do projeto foi a criação de um pipeline para processamento de fontes externas.

O fluxo foi organizado em etapas:

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

A separação em etapas permitiu tornar o processamento mais observável e facilitar a identificação de problemas.

O pipeline também passou a utilizar deduplicação persistente para evitar o processamento repetido de itens já conhecidos.

---

## 6. Dry-run

Foi implementado um modo dry-run para permitir a execução do pipeline sem efeitos persistentes.

Nesse modo:

- fontes podem ser coletadas;
- dados podem ser processados;
- validações podem ser executadas;
- testes podem verificar o comportamento;

sem gravar os artefatos persistentes do pipeline.

O dry-run foi utilizado como mecanismo de segurança durante o desenvolvimento e exploração do pipeline.

A publicação automática também não faz parte do pipeline RSS final.

---

## 7. Quality e quarantine

O pipeline passou a possuir uma etapa explícita de controle de qualidade.

Itens considerados inadequados podem ser direcionados para quarantine em vez de serem tratados como conteúdo válido.

Essa separação permite preservar os dados rejeitados para análise posterior.

A quarantine também evita que um problema de qualidade seja automaticamente convertido em conteúdo publicado.

---

## 8. Testes

Foram criados testes automatizados para partes importantes do pipeline.

Entre as validações realizadas estão:

- funcionamento do pipeline;
- modo dry-run;
- comportamento do cliente RSS;
- validação de URLs;
- comportamento diante de destinos inválidos;
- redirects;
- respostas maiores que o limite permitido;
- diferentes situações de resolução DNS.

Também foram utilizadas verificações gerais do projeto:

```bash
npm run lint
npm run typecheck
npm test
npm run check
npm run build
git diff --check
```

---

## 9. CI/CD

Foi criada uma rotina de verificação utilizando GitHub Actions.

O workflow executa:

```text
checkout
   ↓
Node.js
   ↓
npm ci
   ↓
npm run check
   ↓
npm run build
```

O objetivo é verificar automaticamente o estado do projeto em alterações enviadas ao repositório e em pull requests.

O CI funciona como uma camada adicional de validação além das verificações locais.

---

## 10. Revisões de segurança

Durante o desenvolvimento foram identificados riscos relacionados ao consumo de conteúdo externo.

Como fontes RSS são externas e não confiáveis, o acesso passou por uma revisão específica de segurança.

Foram implementados controles contra SSRF.

Entre eles:

- aceitação somente de HTTP e HTTPS;
- rejeição de URLs com credenciais incorporadas;
- bloqueio de destinos locais;
- bloqueio de destinos privados;
- bloqueio de loopback;
- bloqueio de link-local;
- bloqueio de multicast;
- bloqueio de destinos de metadata;
- validação dos endereços retornados pelo DNS.

---

## 11. DNS rebinding

Durante uma revisão posterior foi identificada uma possibilidade de DNS rebinding.

A validação inicial do DNS, isoladamente, não era suficiente se a conexão HTTP pudesse realizar uma nova resolução posteriormente.

A implementação foi endurecida para:

- resolver o hostname;
- validar todos os endereços retornados;
- selecionar um endereço validado;
- realizar a conexão utilizando o endereço validado;
- preservar o hostname necessário para o comportamento HTTP.

Também foi adicionada validação para redirects.

Cada destino de redirect passa novamente pelas mesmas verificações de segurança.

---

## 12. Limite de resposta RSS

Também foi implementado um limite de tamanho para respostas RSS.

O limite definido é de:

**2 MiB**

A validação considera tanto o tamanho informado pelo servidor quanto o tamanho efetivamente recebido durante o streaming.

Isso reduz o risco de uma fonte externa tentar provocar consumo excessivo de memória ou processamento por meio de uma resposta inesperadamente grande.

---

## 13. Problemas de ambiente

Durante o desenvolvimento foram encontrados problemas relacionados a diferenças entre ambientes e execução de ferramentas.

Esses problemas levaram à necessidade de separar claramente:

- validações locais;
- testes de integração;
- produção;
- credenciais;
- banco de dados;
- artefatos temporários.

O projeto passou a documentar explicitamente quais comandos podem ser executados localmente e quais operações exigem ambiente e autorização específicos.

---

## 14. Desenvolvimento assistido por IA

Ferramentas de inteligência artificial foram utilizadas durante diferentes fases do projeto.

A IA auxiliou em:

- implementação;
- análise;
- documentação;
- testes;
- revisão;
- investigação de problemas;
- identificação de riscos;
- elaboração de correções.

Entretanto, o desenvolvimento não foi tratado como execução automática sem supervisão.

As alterações foram submetidas a:

- validação local;
- revisão de diff;
- testes;
- checkpoints Git;
- revisão de segurança;
- confirmação humana antes de alterações sensíveis.

Essa abordagem foi especialmente importante para mudanças envolvendo:

- segurança;
- APIs;
- banco de dados;
- infraestrutura;
- credenciais;
- processamento de conteúdo externo.

---

## 15. Checkpoints Git

O histórico Git foi utilizado como mecanismo de segurança durante o desenvolvimento.

As mudanças foram organizadas em commits pequenos e descritivos.

Entre os checkpoints relevantes estão:

```text
1f85bcf ci: add GitHub Actions verification
02e5e58 fix: make root layout typecheck independent
697bca3 fix: harden RSS fetching against SSRF
3cacf8e fix: harden RSS fetching against DNS rebinding
811de60 docs: add final project status
```

Esses checkpoints permitem identificar a evolução da fundação técnica e recuperar estados anteriores quando necessário.

---

## 16. Infraestrutura

Durante o desenvolvimento foi utilizado Railway para hospedar:

- aplicação;
- banco de dados.

A infraestrutura de produção foi mantida separada das credenciais locais e do código-fonte.

As operações sobre produção foram tratadas com cautela, especialmente aquelas relacionadas ao banco e à publicação.

O encerramento da infraestrutura não faz parte do desenvolvimento da aplicação e deve ocorrer somente após a preservação dos dados e da documentação necessários.

---

## 17. Encerramento do desenvolvimento

Após a implementação da fundação técnica, das APIs, do pipeline, dos testes, das proteções de segurança e da documentação, foi tomada a decisão de congelar o InfoHub como projeto de portfólio.

O desenvolvimento de novas funcionalidades não continuará nesta versão.

O projeto não foi transformado em uma plataforma comercial.

Também não foram implementados:

- agente operacional autônomo;
- monetização;
- tracking próprio de afiliados;
- revenue tracking;
- notificações financeiras;
- desenvolvimento autônomo contínuo;
- publicação automática completa sem revisão.

---

## 18. Estado final

O resultado final é uma plataforma funcional acompanhada de uma fundação técnica documentada.

O projeto demonstra a integração de:

- desenvolvimento web;
- APIs;
- banco de dados;
- processamento de conteúdo externo;
- pipelines;
- validação;
- segurança;
- testes;
- CI/CD;
- Git;
- desenvolvimento assistido por IA.

O InfoHub permanece congelado como estudo de caso técnico.

---

## 19. Último checkpoint

Último commit registrado:

```text
811de60 docs: add final project status
```

O branch main está sincronizado com origin/main.

O encerramento da infraestrutura e as etapas finais de preservação do projeto serão realizados separadamente da evolução do código.
