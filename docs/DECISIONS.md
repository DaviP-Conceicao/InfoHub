# InfoHub — Decisões Técnicas

## Objetivo

Este documento registra decisões técnicas e de processo relevantes tomadas durante o desenvolvimento do InfoHub.

O objetivo é explicar não apenas o que foi implementado, mas também os critérios utilizados para estruturar o projeto e controlar riscos.

---

## 1. Next.js como base da aplicação

### Decisão

Utilizar Next.js como framework principal.

### Contexto

O projeto precisava reunir:

- páginas públicas;
- APIs;
- SEO;
- acesso server-side;
- integração com banco;
- estrutura organizada para evolução futura.

### Resultado

A aplicação foi estruturada utilizando Next.js, React e TypeScript.

---

## 2. TypeScript

### Decisão

Utilizar TypeScript como linguagem principal da aplicação.

### Motivo

O projeto possui diferentes camadas e estruturas de dados que se beneficiam de tipagem explícita.

A verificação de tipos também foi incorporada ao processo de validação:

```bash
npm run typecheck
```

---

## 3. Banco relacional

### Decisão

Utilizar MySQL/MariaDB para persistência.

### Motivo

O modelo de conteúdo possui relacionamentos claros entre:

- categorias;
- conteúdos;
- fontes;
- tags;
- aliases;
- relacionamentos entre conteúdo e tags.

Um banco relacional permite representar essas relações explicitamente.

---

## 4. Consultas parametrizadas

### Decisão

Utilizar consultas SQL parametrizadas.

### Motivo

Entradas provenientes de usuários e sistemas externos não devem ser concatenadas diretamente em consultas SQL.

A parametrização reduz a superfície de risco relacionada a SQL injection.

---

## 5. Separação entre ingestão e publicação

### Decisão

Utilizar chaves diferentes para:

- `INGESTION_API_KEY`
- `PUBLISH_API_KEY`

### Motivo

Ingestão e publicação representam operações com diferentes níveis de impacto.

Separar as credenciais permite manter limites de autorização distintos.

A existência de uma credencial de ingestão não deve automaticamente conceder acesso à operação de publicação.

---

## 6. Conteúdo externo como não confiável

### Decisão

Tratar fontes RSS e conteúdo externo como dados não confiáveis.

### Motivo

Uma fonte externa pode:

- mudar de conteúdo;
- responder com dados inesperados;
- redirecionar requisições;
- retornar endereços perigosos;
- enviar respostas excessivamente grandes.

Por isso, a coleta foi implementada com validações explícitas.

---

## 7. Proteção contra SSRF

### Decisão

Bloquear destinos locais, privados, reservados e outros destinos considerados inadequados para acesso pelo coletor RSS.

### Controles

A implementação valida:

- esquema;
- credenciais incorporadas na URL;
- endereço IP;
- resolução DNS;
- redirects.

Destinos como loopback, redes privadas, link-local, multicast e endpoints de metadata são rejeitados.

---

## 8. Proteção contra DNS rebinding

### Decisão

Não confiar somente na resolução inicial do hostname.

### Contexto

Uma validação de DNS pode ser insuficiente se a biblioteca HTTP realizar outra resolução durante a conexão.

### Implementação

O cliente RSS:

- resolve o hostname;
- verifica todos os endereços retornados;
- rejeita endereços não permitidos;
- utiliza um endereço previamente validado para a conexão;
- mantém o hostname necessário para a requisição HTTP.

Essa decisão foi adotada após uma revisão específica de segurança.

---

## 9. Validação de redirects

### Decisão

Não seguir redirects cegamente.

### Motivo

Uma URL inicialmente segura pode redirecionar para um destino não permitido.

Por isso, cada destino de redirect é validado novamente antes da requisição.

---

## 10. Limite de resposta RSS

### Decisão

Limitar respostas RSS a:

**2 MiB**

### Motivo

Uma fonte externa não deve conseguir fornecer uma resposta arbitrariamente grande ao coletor.

O limite é aplicado considerando também os bytes efetivamente recebidos durante o streaming.

---

## 11. Pipeline em etapas

### Decisão

Separar o processamento em etapas explícitas:

```text
fonte
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

### Motivo

A separação permite:

- identificar falhas;
- preservar dados intermediários;
- analisar rejeições;
- testar etapas individualmente;
- reduzir o acoplamento entre coleta e publicação.

---

## 12. Bronze e Silver

### Decisão

Manter distinção entre dados coletados e dados normalizados.

**Bronze**

Representa os dados recebidos da fonte antes das transformações posteriores.

**Silver**

Representa os dados após normalização e tratamento inicial.

Essa separação facilita análise, depuração e reprocessamento.

---

## 13. Quarantine

### Decisão

Não descartar silenciosamente itens que falham nas verificações de qualidade.

### Motivo

Um item rejeitado pode precisar ser analisado posteriormente.

A quarantine cria uma separação entre:

- dados aceitos

e

- dados rejeitados

preservando informações úteis para diagnóstico.

---

## 14. Deduplicação persistente

### Decisão

Utilizar fingerprints persistentes para identificar itens já processados.

### Motivo

Uma fonte RSS pode apresentar o mesmo item novamente.

A deduplicação reduz processamento repetido e evita duplicação desnecessária no pipeline.

---

## 15. Dry-run como padrão

### Decisão

Manter o pipeline em dry-run por padrão.

### Motivo

Durante desenvolvimento e investigação, uma execução deve permitir observar o comportamento sem produzir efeitos persistentes inesperados.

O modo dry-run permite testar coleta e validação sem gravar os artefatos persistentes do pipeline.

---

## 16. Publicação separada do pipeline RSS

### Decisão

Não conectar automaticamente a coleta RSS à publicação.

### Motivo

Coletar conteúdo e publicar conteúdo são operações diferentes.

Uma falha na coleta ou uma informação incorreta não deve resultar automaticamente em publicação.

A API de publicação possui proteção própria.

---

## 17. CI

### Decisão

Utilizar GitHub Actions para verificação automatizada.

### Processo

O CI executa:

```text
npm ci
    ↓
npm run check
    ↓
npm run build
```

### Motivo

As verificações não devem depender exclusivamente da execução manual no ambiente de desenvolvimento.

---

## 18. Validação local

### Decisão

Manter comandos de validação que não dependem da infraestrutura de produção.

Os principais são:

```bash
npm run lint
npm run typecheck
npm test
npm run check
npm run build
git diff --check
```

### Motivo

Isso permite verificar alterações sem utilizar Railway, credenciais reais ou o banco de produção.

---

## 19. Separação entre desenvolvimento e produção

### Decisão

Não utilizar produção como ambiente de testes.

### Regra

Testes, scripts de integração e experimentos devem utilizar ambientes locais ou ambientes explicitamente destinados a testes.

A produção exige autorização humana antes de operações sensíveis.

---

## 20. Credenciais fora do Git

### Decisão

Manter credenciais em arquivos de ambiente locais e configurações protegidas.

Arquivos como:

- `.env.local`
- `.env.local.*`

não fazem parte do repositório.

O repositório mantém somente o modelo de configuração:

- `.env.example`

sem valores secretos reais.

---

## 21. Git como mecanismo de checkpoint

### Decisão

Utilizar commits frequentes e pequenos.

### Motivo

O histórico permite:

- identificar mudanças;
- revisar alterações;
- recuperar estados anteriores;
- reduzir risco durante mudanças de segurança;
- separar etapas de desenvolvimento.

---

## 22. Desenvolvimento assistido por IA

### Decisão

Utilizar ferramentas de IA como apoio ao desenvolvimento, sem tratar a IA como autoridade final sobre alterações sensíveis.

### Aplicações

A IA foi utilizada para auxiliar em:

- implementação;
- análise;
- documentação;
- testes;
- revisão;
- investigação;
- segurança.

### Regra de processo

Alterações relevantes devem passar por:

```text
IA
 ↓
revisão humana
 ↓
validação
 ↓
teste
 ↓
checkpoint Git
```

Especialmente para mudanças relacionadas a segurança, banco, produção e autenticação.

---

## 23. Documentação como parte do projeto

### Decisão

Manter arquitetura, segurança, roadmap, status e decisões registradas no próprio repositório.

### Motivo

O código sozinho não registra todas as decisões e limitações do projeto.

A documentação preserva o contexto necessário para compreender o estado final.

---

## 24. Railway

### Decisão

Utilizar Railway durante o desenvolvimento para hospedagem da aplicação e banco.

### Motivo

O ambiente permitiu validar a aplicação fora do ambiente local e trabalhar com uma infraestrutura de produção separada.

A infraestrutura é tratada como componente independente do código-fonte.

---

## 25. Congelamento do projeto

### Decisão

Congelar o InfoHub como projeto de portfólio.

### Contexto

Após a implementação da fundação técnica, pipeline, APIs, segurança, testes, CI/CD e documentação, foi decidido encerrar o desenvolvimento ativo.

### Consequência

Novas funcionalidades comerciais ou operacionais não serão implementadas nesta versão.

O projeto passa a representar um estudo de caso técnico.

---

## 26. Funcionalidades deliberadamente não implementadas

Não fazem parte da versão final:

- agente operacional autônomo;
- publicação automática completa;
- monetização;
- tracking próprio de afiliados;
- revenue tracking;
- notificações financeiras;
- analytics próprio;
- desenvolvimento autônomo contínuo.

Esses itens não devem ser descritos como funcionalidades existentes.

---

## 27. Princípio de encerramento

O encerramento do projeto deve preservar:

- código;
- histórico Git;
- documentação;
- dados necessários ao estudo de caso;
- informações necessárias para reproduzir o contexto técnico.

A infraestrutura de produção deve ser encerrada somente depois que os dados e documentos necessários forem preservados.

---

## 28. Estado final

O InfoHub encontra-se congelado como projeto de portfólio.

Último checkpoint conhecido:

```text
811de60 docs: add final project status
```

O branch main está sincronizado com origin/main.

A partir deste ponto, alterações devem ser consideradas manutenção excepcional ou correção documental, e não continuação do desenvolvimento planejado originalmente.
