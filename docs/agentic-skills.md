# Inteligência Artificial e Agentic Skills

O coração automatizado deste projeto não está apenas em scripts convencionais, mas sim nas **Skills de Agentes Autônomos**.
As skills residem no diretório `core/.agents/skills/` e ditam como IAs (como o Antigravity IDE) devem operar na base de código.

## Lista de Skills Atuais

### 1. `write-article`
- **Função:** Ensina a IA a escrever artigos no formato correto para a arquitetura Headless.
- **Regras Rígidas:** 
  - O Frontmatter do Markdown exige aspas simples em campos de SEO (`title`, `excerpt`, `meta_title`).
  - O arquivo deve ser sempre salvo na raiz do projeto pai (`content/posts/`), nunca dentro do `core/`.
  - A formatação de texto deve seguir as regras de **GEO (Generative Engine Optimization)** (Listas, linguagem direta, tabelas).

### 2. `analyze-traffic`
- **Função:** Uma skill analítica que cruza os dados do Google Analytics 4 (GA4) e propõe insights de conteúdo.
- **Funcionamento Tático:** O agente lê esta skill e sabe que deve acionar o script `./scripts/fetch_ga4.js`. 
- **Script (fetch_ga4.js):** Utiliza a SDK `@google-analytics/data` para conectar-se ao GA4 via Service Account JSON, obtendo os artigos mais lidos e as fontes de tráfego. Com base nesses dados absolutos, o LLM sugere as próximas pautas do blog.

### 3. `analytics` e `analytics-product`
- **Função:** Skills globais (herdadas/importadas) que dão capacidades expandidas aos agentes para analisar funis, eventos de Mixpanel ou PostHog.
- **Uso:** Acionadas por prompts abertos pedindo por "auditoria geral" ou "análise de engajamento do produto".

### 4. `publish-blog` e `commit-push`
- **Função:** Skills de ciclo de vida de código (CI/CD).
- **Funcionamento Tático:** Orientam a IA a acionar os scripts bash de deploy do projeto, ensinando-a que não deve commitar alterações de conteúdo diretamente na branch de produção sem passar pelos scripts padronizados de build e MR.
