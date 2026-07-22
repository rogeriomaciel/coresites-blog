---
name: request-indexing
description: >
  Notifica o Google Search Console (Google Indexing API) e o IndexNow (Bing) para forçar a reindexação imediata de todos os artigos do blog.
  Use quando o usuário pedir para "forçar reindexação", "indexar no google", "enviar pro search console" ou termos equivalentes.
---

# Request Indexing Skill

Esta skill permite ao agente notificar em tempo real as APIs de indexação do Google (Google Indexing API) e do IndexNow (Bing, Yahoo, etc.), enviando as URLs atualizadas do `sitemap.xml` para a fila prioritária do Googlebot.

## Quando Usar Esta Skill
Use quando o usuário solicitar:
- "forçar indexação no google"
- "aviso o google search console"
- "reindexar todos os posts"
- "enviar sitemap pro google"

## Requisito Prévio (Search Console)
O e-mail da Service Account (`leitor-ga4-autocrm@gen-lang-client-0596096564.iam.gserviceaccount.com`) deve estar adicionado como **Proprietário (Owner)** na propriedade do domínio no Google Search Console.

## Como Executar
1. Garanta que o build foi realizado (`bun run build`).
2. Execute o comando:
```bash
bun run scripts/notify-google-indexing.ts
```
3. Verifique o relatório no terminal com o total de URLs submetidas ao Google e ao IndexNow.
