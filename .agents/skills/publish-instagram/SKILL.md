---
name: publish-instagram
description: Super Agente de Instagram para Repurposing de artigos do blog em 2 Formatos Profissionais (1 Carrossel Educativo 4:5 e 1 Reels de Vídeo 9:16 com Locução ElevenLabs). ⚠️ GERAÇÃO DE VÍDEO VIA GOOGLE VEO 2.0 / VERTEX AI ESTÁ DESATIVADA (custo elevado). Use o pipeline com fundo estático.
tools:
  - bun
  - ffmpeg
---

# Super Agente Instagram: Repurposing & Publicação Automática (1 Carrossel + 1 Reels)

> [!CAUTION]
> **Google Veo 2.0 / Vertex AI DESATIVADO** — A geração de vídeo via Vertex AI foi **bloqueada permanentemente** por custo elevado (2026-07-28).
> O Reels é gerado com **fundo estático** (cor sólida dark). NÃO tente usar ou restaurar o `generate_veo_reels.ts` ou `generate_veo_video.ts` para chamadas Vertex sem autorização explícita.

Este agente é responsável por ler os artigos do blog (`content/posts/pt/`), extrair os melhores insights e publicar **estritamente 2 formatos de alto impacto no Instagram**:

1. 🎠 **1 Carrossel Educativo (Slides 4:5 - 1080x1350px)** com design premium Dark Mode no padrão do CoreAuto CRM e chamada para comentários.
2. 🎥 **1 Vídeo de Reels (Vertical 9:16 - 1080x1920px)** com **locução persuasiva ElevenLabs**, **legendas animadas estilo Reels** queimadas via FFmpeg, e **fundo dark estático** (sem Vertex AI).

---

## 🎯 Regras de Ouro para o Reels (ElevenLabs + Fundo Estático)

1. **Roteiro de Narração Pain-First (Dor → Agitação → Custo → Solução → CTA)**:
   - **Hook (0-3s)**: Pergunta sobre dinheiro perdido ou dor específica do dono de oficina. O CoreAutoCRM **não aparece no hook**. Ex: *"Você já calculou quanto sua oficina perde por semana com isso?"*
   - **Agitação da Dor (3-12s)**: Mostra o problema em detalhes com impacto financeiro.
   - **Custo da Inércia (12-18s)**: Mostra o que acontece se não resolver.
   - **Solução como Consequência (18-22s)**: O CoreAutoCRM aparece como ferramenta natural da solução.
   - **CTA (22-27s)**: Instagram: *"Acessa o link na bio."* YouTube: *"Assiste até o fim e se inscreve."*

2. **Vídeo de Fundo**: Fundo dark estático (`color=c=0x070a12`). ~~Google Veo 2.0 desativado por custo.~~

3. **Legendas Sincronizadas da Fala**: A legenda exibida na tela DEVE ser a transcripção exata da fala, dividida em frases curtas (estilo Reels/TikTok).

4. **Marca d’Água e Trilha Sonora**: Logo discreta no canto superior direito + música de fundo ~10% de volume.


---

## 🚀 Como Executar o Fluxo Completo

Para publicar automaticamente 1 Carrossel e 1 Reels (+ Shorts do YouTube) de qualquer artigo do blog:

> [!WARNING]
> NÃO execute `generate_veo_reels.ts` diretamente — o CLI está desativado (Vertex AI bloqueado).
> Use o pipeline de repurposing + video padrão:

```bash
# Gerar conteúdo (carrossel + reels com fundo estático)
bun run core/.agents/skills/publish-instagram/scripts/repurpose_blog_to_instagram.ts content/posts/pt/nome-do-artigo.md
bun run core/.agents/skills/publish-instagram/scripts/generate_reels_video.ts {slug}
```

---

## 🎬 YouTube Shorts — Reaproveitamento Automático

O vídeo gerado para o Reels do Instagram é **exportado automaticamente para YouTube Shorts** sem nenhum passo adicional. O formato 9:16 (1080x1920px) é idêntico ao exigido pelo YouTube Shorts.

### O que é gerado automaticamente:
- **`youtube_shorts/{slug}/shorts_video.mp4`** — o mesmo arquivo de vídeo do Reels
- **`youtube_shorts/{slug}/caption_shorts.txt`** — legenda com CTA adaptado para YouTube ("assiste até o fim" / "se inscreve") e hashtags otimizadas para Shorts

### Diferenças Instagram vs YouTube Shorts:
| Aspecto | Instagram Reels | YouTube Shorts |
|---|---|---|
| Arquivo de vídeo | idêntico | idêntico |
| Legendas no vídeo | queimadas via FFmpeg | queimadas via FFmpeg |
| CTA na narração | "link na bio" | "se inscreve / assiste até o fim" |
| Legenda do post | `caption_reels.txt` | `caption_shorts.txt` |
| Hashtags | foco em redes sociais | foco em #Shorts + nicho |
| Publicação | automática via Meta API | manual no YouTube Studio (por enquanto) |

> **Observação:** A publicação no YouTube ainda é manual — basta pegar o arquivo `shorts_video.mp4` e a `caption_shorts.txt` e fazer upload no YouTube Studio. A API do YouTube requer OAuth interativo, que não é compatível com publicação automática por servidor.


## 📁 Estrutura da Pasta de Saída

Cada post gera os artefatos na pasta `instagram_posts/{slug}/`:

```
instagram_posts/{slug}/
├── 🎠 caption_carousel.txt    # Legenda para o Carrossel
├── 🎠 slides_data.json        # Estrutura lógica dos slides
├── 🖼️ slide_1.png ... 5.png   # Imagens em 4:5 (1080x1350px)
├── 🎥 caption_reels.txt       # Legenda para o Reels
├── 🎤 reels_narration.mp3     # Narração persuasiva ElevenLabs
└── 🎥 reels_video.mp4         # Vídeo compilado final com legendas MP4 (fundo estático)
```

> **Nota:** O arquivo `veo_background.mp4` não é mais gerado. O fundo do Reels é uma cor sólida dark (`#070a12`) com legendas e marca d’água sobrepostas.
