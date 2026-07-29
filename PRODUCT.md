# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Donos e gerentes de pequenas e médias empresas brasileiras que **ainda não usam CRM** — pessoas que gerenciam clientes em planilhas, WhatsApp ou de memória, e que sentem que estão perdendo negócios por falta de organização. Tomam decisões sozinhos ou com times pequenos. Buscam soluções práticas, sem burocracia corporativa.

## Product Purpose

O **CoreAutoCRM** é um sistema de gestão de clientes (CRM) nativamente integrado com Inteligência Artificial — não como um recurso adicional, mas como o mecanismo central. A IA faz o trabalho que em qualquer outro sistema exigiria configuração manual, follow-ups perdidos ou análises separadas. O blog existe para atrair tráfego orgânico (SEO/GEO) e converter visitantes em leads do CoreAutoCRM, educando PMEs sobre automação, CRM e IA aplicada ao dia a dia empresarial.

## Positioning

CoreAutoCRM é o único CRM AI-Native para PMEs brasileiras: a inteligência artificial não é uma integração opcional — é o que move o sistema. Isso significa recursos que nenhum outro sistema de gestão oferece nativamente, como automações que aprendem, sugerem e agem sem precisar de configuração técnica.

## Operating Context

- Leitores chegam via busca orgânica (Google, AI Overviews, Perplexity) buscando soluções para problemas específicos de gestão e vendas
- Blog bilíngue (PT/BR primário, EN secundário)
- Pipeline completo de publicação: geração de artigos por IA → SEO/OG automático → deploy via rsync → distribuição social automática (Instagram, LinkedIn, Facebook) via n8n
- Stack: Vite + React + TypeScript, hospedado em VPS própria

## Capabilities and Constraints

- Blog headless com geração estática de páginas (prerender para SEO)
- Sistema de categorias com artigos em markdown (frontmatter)
- Troca de idioma PT/EN em runtime
- OG images geradas estaticamente por script (Sharp)
- Não usa banco de dados — conteúdo versionado em Git
- Calculadoras interativas embutidas em posts como ferramentas de conversão
- Widget de produto sticky em posts (link para o sistema principal)

## Brand Commitments

- Nome do produto: **CoreAutoCRM** (não separar em "Core Auto CRM")
- Domínio principal do produto: `coreautocrm.com.br`
- Logo: `/logo-coreauto-horizontal.png`
- Idioma primário: Português do Brasil
- Tom de voz: direto, prático, sem jargão desnecessário — fala como um parceiro de negócios experiente, não como um manual técnico

## Evidence on Hand

- Código-fonte completo do blog (Vite + React)
- Posts existentes em `/content/` (em markdown com frontmatter)
- Sistema de automação de publicação operacional
- Paleta atual centrada em `#08131d` (dark navy) como cor de fundo base

## Product Principles

1. **IA como mecanismo, não como feature** — tudo que o produto faz é potencializado por inteligência artificial de forma nativa, invisível e contínua
2. **PME primeiro** — simplicidade e resultados rápidos valem mais que completude enterprise; a complexidade fica escondida
3. **Orgânico com propósito** — cada artigo existe para responder uma dúvida real de um dono de empresa e guiá-lo naturalmente em direção ao produto
4. **Brasileiro de verdade** — linguagem, exemplos, contexto e urgência são do mercado brasileiro, não traduções de conteúdo americano
5. **Distribuição automatizada** — o blog é parte de uma máquina de conteúdo: escrever uma vez, distribuir em múltiplos canais sem esforço manual

## Accessibility & Inclusion

- Suporte a PT/BR e EN nativos
- Markup semântico exigido para SEO/prerender funcionar corretamente
- Nenhum requisito de acessibilidade especial definido além do padrão WCAG AA
