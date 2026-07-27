---
name: publish-instagram
description: Super Agente de Instagram para Repurposing de artigos do blog em 2 Formatos Profissionais (1 Carrossel Educativo 4:5 e 1 Reels de Vídeo 9:16 com Locução ElevenLabs), além de integração direta com Meta Graph API.
tools:
  - bun
  - ffmpeg
---

# Super Agente Instagram: Repurposing & Publicação Automática (1 Carrossel + 1 Reels com Google Veo 2.0)

Este agente é responsável por ler os artigos do blog (`content/posts/pt/`), extrair os melhores insights e publicar **estritamente 2 formatos de alto impacto no Instagram**:

1. 🎠 **1 Carrossel Educativo (Slides 4:5 - 1080x1350px)** com design premium Dark Mode no padrão do CoreAuto CRM e chamada para comentários.
2. 🎥 **1 Vídeo de Reels (Vertical 9:16 - 1080x1920px)** alimentado por **Google Veo 2.0** para o fundo cinematográfico em movimento, **locução persuasiva ElevenLabs** com gatilhos de vendas/CTA final, e **legendas animadas estilo Reels** queimadas via FFmpeg.

---

## 🎯 Regras de Ouro para o Reels (Google Veo 2.0 + ElevenLabs)

1. **Roteiro de Narração Pain-First (Dor → Agitação → Custo → Solução → CTA)**:
   - **Hook (0-3s)**: Pergunta sobre dinheiro perdido ou dor específica do dono de oficina. O CoreAutoCRM **não aparece no hook**. Ex: *"Você já calculou quanto sua oficina perde por semana com isso?"*
   - **Agitação da Dor (3-12s)**: Mostra o problema em detalhes com impacto financeiro (custo de rampa parada, orçamentos perdidos, equipe parada).
   - **Custo da Inércia (12-18s)**: Mostra o que acontece se não resolver. Ex: *"Enquanto você lê isso, tem carro parado no pátio esperando resposta."*
   - **Solução como Consequência (18-22s)**: O CoreAutoCRM aparece como ferramenta natural da solução — não como o personagem principal.
   - **CTA (22-27s)**: Instagram: *"Acessa o link na bio."* YouTube: *"Assiste até o fim e se inscreve."*

2. **Vídeo de Fundo Cinematográfico (Google Veo 2.0)**:
   - Utilizar prompts em inglês ultra-detalhados no modelo `veo-2.0-generate-001` no formato 9:16 (vertical).
   - Foco em cenas realistas de oficina mecânica moderna, iluminação cinematográfica e movimento suave.

3. **Legendas Sincronizadas da Fala (Closed Captions / Transcrição do Áudio)**:
   - **MANDATÓRIO**: A legenda exibida na tela DEVE ser a **transcrição exata da fala do locutor em tempo real**, dividida em frases curtas ou blocos de palavras (estilo Reels/TikTok). NÃO usar apenas título fixo do post.
   - Posicionamento central inferior (área segura do Instagram Reels) com estilo legível (fonte em destaque com fundo semi-transparente ou traço).
   - Destaque visual em palavras-chave importantes (ex: "WhatsApp", "IA", "CoreAutoCRM", "Orçamento", "Comente IA").

4. **Marca d'Água Discreta e Trilha Sonora de Fundo**:
   - **Logo**: Marca d'água discreta posicionada no canto superior direito (`logo-coreauto-horizontal.png`).
   - **Música de Fundo**: Trilha sonora mixada suavemente (~10% de volume) com o áudio `Click_Magnet_Modern_Marketing_Groove.mp3`, garantindo nitidez total na voz da ElevenLabs.


---

## 🚀 Como Executar o Fluxo Completo

Para publicar automaticamente 1 Carrossel e 1 Reels (+ Shorts do YouTube) de qualquer artigo do blog:

```bash
bun run core/.agents/skills/publish-instagram/scripts/generate_veo_reels.ts content/posts/pt/nome-do-artigo.md
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
├── 🎙️ reels_narration.mp3     # Narração persuasiva ElevenLabs
├── 🎥 veo_background.mp4      # Vídeo 4K em movimento (Google Veo 2.0)
└── 🎥 reels_veo_final.mp4     # Vídeo compilado final com legendas MP4
```

