---
name: publish-instagram
description: Super Agente de Instagram para Repurposing de artigos do blog em 2 Formatos Profissionais (1 Carrossel Educativo 4:5 e 1 Reels de Vídeo 9:16 com Locução ElevenLabs), além de integração direta com Meta Graph API.
tools:
  - bun
  - ffmpeg
---

# Super Agente Instagram: Repurposing & Publicação Automática (1 Carrossel + 1 Reels)

Este agente é responsável por ler os artigos do blog (`content/posts/pt/`), extrair os melhores insights e publicar **estritamente 2 formatos de alto impacto no Instagram**:

1. 🎠 **1 Carrossel Educativo (Slides 4:5 - 1080x1350px)** com design premium Dark Mode no padrão do CoreAuto CRM e chamada para comentários.
2. 🎥 **1 Vídeo de Reels (Vertical 9:16 - 1080x1920px)** com locução humana por IA (ElevenLabs) e legendas sincronizadas em MP4 via FFmpeg.

---

## 🚀 Como Executar o Fluxo Completo

Para publicar automaticamente 1 Carrossel e 1 Reels de qualquer artigo do blog:

```bash
bun run core/.agents/skills/publish-instagram/scripts/publish_post_to_instagram.ts content/posts/pt/recuperar-orcamentos-parados-whatsapp-oficina.md --publish
```

---

## 📁 Estrutura da Pasta de Saída

Cada post gera os artefatos na pasta `instagram_posts/{slug}/`:

```
instagram_posts/{slug}/
├── 🎠 caption_carousel.txt    # Legenda para o Carrossel
├── 🎠 slides_data.json        # Estrutura lógica dos slides
├── 🖼️ slide_1.png ... 5.png   # Imagens em 4:5 (1080x1350px)
├── 🎥 caption_reels.txt       # Legenda para o Reels
├── 🎙️ reels_audio.mp3         # Narração ElevenLabs
├── 🖼️ reels_frame_1...4.png   # Frames verticais 9:16
└── 🎥 reels_video.mp4         # Vídeo compilado MP4
```
