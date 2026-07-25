---
name: publish-instagram
description: Super Agente de Instagram para repurposing de artigos do blog em posts de Instagram (Legendas com Hook/CTA/Hashtags, Roteiros de Carrossel) e integracao direta com a Instagram Graph API para agendamento e publicacao automatica.
tools:
  - bun
  - python3
---

# Super Agente Instagram: Repurposing & Publicação Automática

Este agente é responsável por ler os artigos em Markdown do blog (`content/posts/pt/`), extrair os melhores insights e transformar o conteúdo em posts engajantes para o Instagram (Carrosséis, Imagens, Reels), permitindo a publicação automática via Instagram Graph API.

---

## 🚀 Como Utilizar Este Agente

### 1. Repurposing de Artigo para Instagram (Geração de Legenda + Carrossel)
Para transformar um artigo em post do Instagram:
```bash
bun run core/.agents/skills/publish-instagram/scripts/repurpose_blog_to_instagram.ts content/posts/pt/recuperar-orcamentos-parados-whatsapp-oficina.md
```
Este script extrai o artigo e gera:
- **Legenda Visualmente Otimizada** (Hook forte, contexto, 3-5 pontos de valor, CTA claro e 5-8 hashtags ranqueáveis).
- **Roteiro de Carrossel de 5 a 7 Slides** (Slide 1: Capa Impactante, Slides 2-5: Conteúdo Prático, Slide Final: Chamada para Ação).

---

### 2. Publicação e Agendamento via API (`instagram_publisher.py`)
Para publicar ou agendar via Instagram Graph API (utilizando credenciais salvas no `.env`):
```bash
python3 core/.agents/skills/publish-instagram/scripts/instagram_publisher.py --caption-file output_instagram.txt --image-url https://seu-dominio.com.br/og-image.png --publish
```

---

## 📋 Estrutura da Legenda do Instagram (Fórmula de Alta Conversão)

1. **Hook (Gancho de Retenção - Linha 1):** Uma frase marcante com emoji para fazer o usuário parar o scroll.
2. **Contexto:** 1 a 2 frases curtas sobre a dor/desafio do dono de oficina.
3. **Pontos de Valor (O Ouro):** 3 a 5 tópicos em marcadores/bullet-points com emojis informativos.
4. **Chamada para Ação (CTA):** Convite explícito ("Comente 'IA' para receber o link", "Clique no link da bio para ler o guia completo no blog").
5. **Bloco de Hashtags:** 5 a 8 hashtags altamente relevantes do nicho automotivo/IA (`#oficinamecanica #gestaoautomotiva #coreautocrm #oficinaia #atendimentowhatsapp`).

---

## 🎨 Estrutura Recomendada para Carrossel de 5 Slides

- **Slide 1 (Capa):** Título chamativo + Subtítulo curto + Elemento visual de destaque.
- **Slide 2 (O Problema):** A dor atual da oficina (ex: orçamentos esquecidos no WhatsApp).
- **Slide 3 (A Virada de Chave):** A solução prática (ex: follow-up automático com IA).
- **Slide 4 (O Resultado):** O impacto real no faturamento/tempo livre do dono.
- **Slide 5 (Encerramento/CTA):** "Salve este post para consultar depois e leia o artigo completo no link da bio!"
