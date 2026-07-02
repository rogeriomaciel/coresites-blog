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

## Formato do Arquivo

Cada artigo deve ser salvo em `content/posts/` como um arquivo `.md` com o nome igual ao slug.

### Estrutura Obrigatória do Frontmatter

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

Após criar o artigo, crie também um arquivo SVG em `public/images/posts/` com o mesmo nome do slug. O SVG deve:
- Ter viewBox="0 0 1200 630" (proporção Open Graph)
- Usar fundo escuro (#0a0a12) com elementos visuais sutis
- Incluir o título do artigo em texto
- Usar a paleta de cores do blog (azul/ciano #0ea5e9, #06b6d4)

## Passos para o Agente

1. **Receber o tema** do usuário
2. **Gerar o slug** a partir do título (kebab-case, sem acentos)
3. **Gerar o frontmatter** completo com SEO
4. **Escrever o conteúdo** em Markdown seguindo as regras GEO
5. **Criar a cover image** SVG em `public/images/posts/`
6. **Salvar o arquivo** em `content/posts/{slug}.md`
7. **Informar o usuário** que o artigo foi criado e perguntar se quer revisá-lo

## Categorias Disponíveis

- Desenvolvimento
- IA
- Automação
- DevOps
- Segurança
- Performance

Novas categorias podem ser criadas conforme necessário.
