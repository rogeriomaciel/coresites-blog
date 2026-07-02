# CoreSites Blog - Arquitetura e Histórico

Este documento registra a arquitetura do projeto e o histórico das principais atividades e refatorações realizadas.

## 1. Visão Geral do Projeto

O **CoreSites Blog** é uma plataforma focada em **GEO (Generative Engine Optimization)** e SEO tradicional. A arquitetura foi desenhada para ser uma verdadeira "Fábrica Autônoma de Mídia", utilizando uma abordagem de **GitOps de Conteúdo**.

### Filosofia da Arquitetura
- **Zero Banco de Dados em Produção**: Todo o conteúdo é armazenado em arquivos estáticos (Markdown) dentro do repositório (`content/posts/`).
- **Performance e Segurança Máxima**: Sem painéis de controle expostos (como wp-admin) e sem requisições pesadas a banco de dados. O projeto serve HTML/JS puro hospedado através de um servidor Nginx.
- **Automação e Integração (CI/CD)**: Agentes de IA (via skills do Antigravity) geram e revisam o conteúdo. Após a aprovação, o commit no repositório aciona um pipeline (via GitHub Actions) que compila o site em React/Vite e entrega a versão mais recente em produção.
- **Omnicanalidade**: O projeto é a base para ramificação do conteúdo gerado para outras plataformas de vídeo e imagem (YouTube, Instagram, TikTok) futuramente via APIs externas (ElevenLabs, Meta, etc.).

## 2. Stack Tecnológica

- **Frontend**: React 19, TypeScript
- **Build & Dev Server**: Vite
- **Gerenciador de Pacotes**: Bun
- **Roteamento**: react-router-dom
- **Qualidade de Código**: oxlint
- **Processamento de Markdown**: gray-matter (frontmatter), marked (parser), dompurify (sanitização)
- **SEO/GEO**: react-helmet-async (gestão dinâmica do `<head>` com suporte para Schema Markup / JSON-LD)

## 3. Histórico de Desenvolvimento e Refatorações

Abaixo está o registro das últimas ações realizadas no código (A partir de Julho/2026):

### 3.1. Padronização de Imports (Remoção do Alias `@/`)
- Os caminhos de importação baseados no alias `@/` foram convertidos em massa para **caminhos relativos** em toda a base de código (`src/pages`, `src/components`, `src/App.tsx`).
- **Motivo**: Simplificação na resolução de caminhos por ferramentas externas e linting sem dependência forçada da configuração do `tsconfig.json`/`vite.config.ts`.

### 3.2. Troca do Gerenciador de Pacotes
- O padrão de build e gerenciamento do projeto migrou oficialmente do `npm` para o **`bun`**. 
- Os scripts locais (`bun run build`, `bun run dev`) foram validados para operarem de forma nativa e otimizada.

### 3.3. Correção de Erros de Build
- Identificado e corrigido um erro lançado pelo compilador TypeScript durante o comando `bun run build`.
- **Arquivo modificado**: `src/components/ShareButtons.tsx`
- **Ação**: O componente possuía um import obsoleto do `Link` do `react-router-dom` que não estava sendo utilizado, travando a compilação. A importação foi removida e o build completou com sucesso.

---
*Documentação gerada pelo agente Antigravity com base no alinhamento de GitOps de Conteúdo.*
