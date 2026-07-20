---
name: write-article
description: >
  Cria um novo artigo para o blog. Use esta skill quando o usuário pedir para
  "escrever um artigo", "criar um post", "produzir conteúdo" ou termos equivalentes.
  O agente deve gerar o conteúdo completo em Markdown com frontmatter de SEO otimizado
  para GEO (Generative Engine Optimization).
---

# Write Article Skill

Esta skill instrui o agente a criar um novo artigo de blog completo, otimizado para SEO e GEO (Generative Engine Optimization), e salvá-lo como arquivo Markdown no repositório.

## Quando Usar Esta Skill

Use quando o usuário pedir para:
- "escrever um artigo sobre X"
- "criar um post sobre Y"
- "produzir conteúdo sobre Z"
- "novo artigo"

## Formato e Local do Arquivo (Headless Architecture)

**ATENÇÃO (CRÍTICO)**: O projeto `core` é estritamente **READ-ONLY**. TODAS as alterações de código, estilização e criação de novos artigos DEVEM ser feitas no projeto cliente (o projeto pai que utiliza o core), e NUNCA dentro da pasta `core`.

Antes de salvar qualquer conteúdo, garanta que você está operando no projeto cliente:
1. Se você estiver operando dentro de um diretório `core/`, você DEVE salvar os artigos em `../content/posts/` e as imagens em `../public/images/posts/` (ou seja, no projeto pai).
2. Se você estiver na raiz do projeto Cliente, salve em `content/posts/` e `public/images/posts/`.
3. É expressamente PROIBIDO salvar, editar ou comitar qualquer artigo, imagem ou configuração específica do cliente dentro da pasta interna `core/`. O `core` mantém apenas a estrutura base.

Cada artigo deve ser um arquivo `.md` com o nome igual ao slug.

### Estrutura Obrigatória do Frontmatter

**REQUISITO DE SEO CRÍTICO**: Sempre defina os campos `title`, `excerpt`, `meta_title` e `meta_description` como strings de linha única envoltas por aspas simples (`'`). NUNCA utilize ou permita a formatação com indicadores de bloco dobrado (`>-` ou block scalars), pois as quebras de linha introduzidas por esses blocos quebram a renderização correta de tags de metadados HTML de SEO.

```yaml
---
title: "Título do artigo focado em conversão"
slug: "titulo-do-artigo-em-kebab-case"
date: "YYYY-MM-DD"
author: "Rogério Maciel"
excerpt: "Resumo de 1-2 linhas para exibir na listagem"
meta_title: "Título SEO | CoreSites Blog"
meta_description: "Descrição de até 160 caracteres para o Google e redes sociais"
keywords: ["palavra1", "palavra2", "palavra3"]
category: "Categoria Principal"
tags: ["tag1", "tag2", "tag3"]
cover_image: "/images/posts/nome-do-artigo.svg"
published: true
---
```

## Regras de Conteúdo (Otimização GEO/AIO)

O conteúdo DEVE seguir estas regras para maximizar citações por IAs:

1. **Resposta direta no primeiro parágrafo** — Nunca enrole. A resposta principal vem logo após o título.
2. **Títulos em formato de pergunta ou conversacional** — Ex: "## Como resolver X?" em vez de "## Resolução de X"
3. **Listas e tabelas** — Use bullet points, tabelas comparativas e code blocks sempre que possível. IAs adoram conteúdo estruturado.
4. **Informação de ganho** — Inclua dados únicos, experiências reais, cenários específicos que outros sites não têm.
5. **Linguagem natural** — Escreva como se estivesse explicando para um colega dev, sem linguagem excessivamente formal.
6. **Sem enrolação** — Cada parágrafo deve agregar valor. Remova frases de preenchimento.

## Cover Image

Após criar o artigo, use a ferramenta `generate_image` nativa do Antigravity para gerar uma imagem hiper-realista, altamente detalhada, com iluminação profissional, sobre o tema do post. Salve a imagem resultante como PNG no diretório `public/images/posts/` com o sufixo `-base.png` (ex: `slug-do-artigo-base.png`).

- NÃO inclua pedidos de texto na imagem (o título será renderizado em HTML/OG automaticamente).
- Mantenha a temática alinhada com as cores e assuntos da CoreAutoCRM (ex: oficinas mecânicas modernas, tecnologia, painéis digitais, etc).

## Passos para o Agente

1. **Receber o tema** do usuário
2. **Gerar o slug** a partir do título (kebab-case, sem acentos)
3. **Gerar o frontmatter** completo com SEO
4. **Escrever o conteúdo** em Markdown seguindo as regras GEO
5. **Criar a cover image** (base.png via `generate_image`) em `public/images/posts/`
6. **Salvar o arquivo** verificando se está rodando no cliente (`../content/posts/{slug}.md`) ou no core (`content/posts/{slug}.md`)
7. **Informar o usuário** que o artigo foi criado e perguntar se quer revisá-lo

## Categorias Disponíveis

- Desenvolvimento
- IA
- Automação
- DevOps
- Segurança
- Performance

Novas categorias podem ser criadas conforme necessário.
