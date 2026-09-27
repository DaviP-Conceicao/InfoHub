# InfoHub — Escopo e Roadmap Encerrado

## Estado

O InfoHub está **congelado como projeto de portfólio**.

Este documento registra o que foi implementado e quais ideias foram consideradas
durante o desenvolvimento, mas não fazem parte do escopo ativo da versão final.

---

## Etapa 1 — Fundação

- [x] Aplicação Next.js
- [x] React
- [x] TypeScript
- [x] Banco MySQL/MariaDB
- [x] Deploy de produção
- [x] Categorias
- [x] Páginas públicas de conteúdo
- [x] Busca
- [x] SEO básico
- [x] Sitemap
- [x] Robots
- [x] API de conteúdo
- [x] API protegida de ingestão
- [x] API protegida de publicação
- [x] Bronze/Silver
- [x] Quality checks
- [x] Quarantine
- [x] Deduplicação persistente

## Etapa 2 — Qualidade e segurança

- [x] Instruções de desenvolvimento
- [x] Documentação de arquitetura
- [x] Documentação de segurança
- [x] Validações locais determinísticas
- [x] GitHub Actions
- [x] Testes automatizados do pipeline
- [x] Build automatizado
- [x] Validação de URLs RSS
- [x] Proteção contra SSRF
- [x] Validação DNS
- [x] Proteção contra DNS rebinding
- [x] Validação de redirects
- [x] Limite de 2 MiB para respostas RSS
- [x] Dry-run não persistente
- [x] Checkpoints Git

## Etapa 3 — Pipeline de conteúdo

- [x] Coleta RSS
- [x] Bronze
- [x] Normalização
- [x] Silver
- [x] Quality gate
- [x] Quarantine
- [x] Deduplicação
- [x] Artefatos locais

## Etapa 4 — Documentação e encerramento

- [x] Status final do projeto
- [x] Diário de desenvolvimento
- [x] Registro de decisões técnicas
- [x] Documentação de arquitetura
- [x] Documentação de segurança
- [x] Registro do escopo não implementado
- [x] Histórico Git preservado
- [x] Repositório sincronizado com GitHub

---

## Ideias consideradas, mas não implementadas

As funcionalidades abaixo foram consideradas durante o desenvolvimento, mas não
fazem parte da versão final.

### Automação de conteúdo

- [ ] múltiplas fontes externas em operação contínua;
- [ ] configuração dinâmica de fontes;
- [ ] geração automática de candidatos;
- [ ] normalização assistida por IA;
- [ ] categorização assistida por IA;
- [ ] ingestão agendada;
- [ ] publicação automática completa.

### Agente operacional

- [ ] agente operacional autônomo;
- [ ] monitoramento automático do pipeline;
- [ ] monitoramento automático de qualidade;
- [ ] relatórios operacionais automáticos;
- [ ] manutenção autônoma.

### Analytics

- [ ] analytics próprio;
- [ ] métricas de tráfego;
- [ ] métricas de desempenho de conteúdo.

### Monetização

- [ ] monetização;
- [ ] tracking próprio de afiliados;
- [ ] controle de conversões;
- [ ] revenue tracking;
- [ ] notificações financeiras;
- [ ] monitoramento de custos financeiros.

### Autonomia de desenvolvimento

- [ ] workflows autônomos de desenvolvimento;
- [ ] revisão de código totalmente automatizada;
- [ ] manutenção automática;
- [ ] alterações autônomas em produção.

Esses itens são registros de possibilidades consideradas e não devem ser
interpretados como funcionalidades existentes ou como compromissos de
desenvolvimento futuro.

---

## Regra de segurança

Durante o desenvolvimento, automação foi tratada como mecanismo para aumentar
a confiabilidade e reduzir trabalho repetitivo.

Operações irreversíveis, sensíveis à segurança, relacionadas à produção ou
financeiras devem permanecer sujeitas à autorização humana.

---

## Encerramento

O roadmap do InfoHub está encerrado.

A partir deste ponto, o projeto é mantido como:

> **estudo de caso técnico de desenvolvimento de software assistido por IA.**

Novas funcionalidades não fazem parte do objetivo desta versão.

Alterações futuras, caso ocorram, devem ser tratadas como um novo ciclo de
desenvolvimento e documentadas separadamente.
