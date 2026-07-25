---
name: write-article
description: >
  Cria um novo artigo para o blog. O agente gera o conteúdo completo em Markdown
  com frontmatter de SEO, otimização avançada para GEO (Generative Engine Optimization),
  AEO (Answer Engine Optimization) e estrutura pronta para citação em ChatGPT, Perplexity, Claude e Google Featured Snippets.
---

# Write Article Skill (SEO + GEO + AEO Supercharged)

Esta skill instrui o agente a criar um novo artigo de blog completo, otimizado para **SEO**, **GEO (Generative Engine Optimization)** e **AEO (Answer Engine Optimization)**, e salvá-lo como arquivo Markdown no repositório.

---

## 🎯 Requisitos de SEO, GEO e AEO

### 1. AEO (Answer Engine Optimization)
Para garantir que o artigo seja citado como fonte primária em IAs como ChatGPT, Perplexity, SearchGPT e Claude:
- **Direct Answer Block (Resposta Direta / Snippet):** Os primeiros 2 parágrafos após a introdução devem conter uma definição precisa e direta (40-60 palavras) em resposta ao problema principal do artigo.
- **FAQ Section com Schema.org:** Todo artigo DEVE incluir uma seção `## Perguntas Frequentes (FAQ)` no final com 3 a 5 perguntas reais em formato `### Pergunta?` seguido da resposta clara.
- **Tabelas Comparativas e Listas Numeradas:** IAs priorizam dados tabulares e passos numéricos sequenciais.

### 2. Formato e Frontmatter
**REQUISITO DE SEO CRÍTICO**: Sempre defina os campos `title`, `excerpt`, `meta_title` e `meta_description` como strings de linha única envoltas por aspas simples (`'`).

```yaml
---
title: 'Título do artigo focado em conversão e busca'
slug: 'titulo-do-artigo-em-kebab-case'
date: 'YYYY-MM-DD'
author: 'Rogério Maciel'
excerpt: 'Resumo de 1-2 linhas para exibir na listagem'
meta_title: 'Título SEO | CoreAutoCRM Blog'
meta_description: 'Descrição de até 160 caracteres para o Google, Perplexity e redes sociais'
keywords: ['palavra1', 'palavra2', 'palavra3', 'AEO', 'oficina mecanica']
category: 'Gestão & IA'
tags: ['IA', 'WhatsApp', 'Oficina Mecânica', 'AEO']
cover_image: '/images/posts/nome-do-artigo.svg'
published: true
faq:
  - question: 'Como a IA ajuda no atendimento da oficina?'
    answer: 'A IA automatiza o envio de orçamentos, faz follow-up no WhatsApp e diagnostica pendências sem sobrecarregar a equipe.'
---
```

---

## 📐 Regras Estruturais do Conteúdo

1. **Título Principal (H1):** Focado no benefício real para o dono de oficina mecânica.
2. **Featured Snippet Box (Primeiros Parágrafos):**
   ```markdown
   > **Resumo Rápido:** A automação de orçamentos via WhatsApp reduz o tempo de resposta da oficina mecânica de 4 horas para menos de 2 minutos, aumentando a taxa de aprovação em até 40%.
   ```
3. **Subtítulos H2/H3 em tom conversacional e acionável.**
4. **Links Internos Cruzados (Interlinking):** Todo novo artigo deve citar ao menos 2 outros artigos relevantes do blog utilizando o caminho relativo ou a URL do post.
5. **Seção FAQ (Schema.org ready):**
   ```markdown
   ## Perguntas Frequentes sobre [Tema]

   ### 1. Quanto tempo leva para implementar?
   A implementação do CoreAutoCRM leva menos de 24 horas...
   ```

---

## 💾 Local do Arquivo (Headless Architecture)

- **Projeto Cliente (Pai):** Salvar em `content/posts/pt/{slug}.md` e imagens em `public/images/posts/`.
- **Se operando a partir do core:** Salvar em `../content/posts/pt/{slug}.md`.
