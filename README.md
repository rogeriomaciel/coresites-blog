# CoreSites — Módulo Core (Headless AIO)

Este é o submódulo `core` do ecossistema CoreSites/CoreAutoCRM. Ele foi projetado para atuar como o **motor central** (ReadOnly) de todos os projetos de front-end (Blogs, Portfólios, Landing Pages), fornecendo os scripts de automação, pipelines de CI/CD, injeção de SEO e as **Agentic Skills** que dão superpoderes de Inteligência Artificial ao fluxo de trabalho.

> **⚠️ AVISO IMPORTANTE**
> A pasta `core` é estritamente **READ-ONLY** nos projetos clientes. Todas as postagens, imagens e configurações locais de clientes devem ser feitas na raiz do projeto pai, NUNCA dentro desta pasta.

---

## 📚 Documentação Detalhada

Para facilitar a manutenção e o entendimento da arquitetura robusta deste core, a documentação foi dividida por áreas de especialidade. 

Consulte os arquivos abaixo na pasta `docs/` para se aprofundar em cada pilar do sistema:

### 1. 🏗️ Arquitetura e Frontend
[📄 Leia: docs/architecture.md](file:///rogerio/core/coreautocrm-blog/core/docs/architecture.md)
Entenda o modelo Headless, a stack (Vite + React + TS), os processos de geração de imagens OpenGraph (OG) estáticas e como a injeção profunda de SEO (Prerender) é feita na compilação.

### 2. 🤖 IA e Agentic Skills
[📄 Leia: docs/agentic-skills.md](file:///rogerio/core/coreautocrm-blog/core/docs/agentic-skills.md)
Veja como as habilidades dos agentes autônomos operam. Detalhes sobre as skills de análise de tráfego com GA4, geração de artigos otimizados para GEO e publicação automatizada.

### 3. 🚀 Deploy e CI/CD Local
[📄 Leia: docs/ci-cd-publish.md](file:///rogerio/core/coreautocrm-blog/core/docs/ci-cd-publish.md)
Guia definitivo sobre o script de publicação (`deploy-local.sh`). Entenda como o Git versiona as filiais automaticamente, como o build é isolado e como o `rsync` envia apenas a pasta `dist/` para a VPS. (Inclui as variáveis `.env` necessárias).

### 4. 📱 Automação de Redes Sociais
[📄 Leia: docs/social-automation.md](file:///rogerio/core/coreautocrm-blog/core/docs/social-automation.md)
Descubra a engenharia por trás do script `trigger-n8n.ts`. Aprenda como o core impede publicações duplicadas, faz tracking em markdown e dispara webhooks em batch para LinkedIn, Facebook e Instagram.
