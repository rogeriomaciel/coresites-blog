import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export interface SlideData {
  slideNumber: number;
  totalSlides: number;
  tag: string;
  title: string;
  subtitle?: string;
  bullets?: string[];
  ctaText?: string;
  highlightText?: string;
}

export interface ReelsSection {
  step: number;
  title: string;
  voiceover: string;
  onScreenText: string;
  durationSeconds: number;
}

export interface ReelsData {
  title: string;
  totalDurationSeconds: number;
  voice: string;
  sections: ReelsSection[];
}

function extractFrontmatter(content: string) {
  const parsed = matter(content);
  let title = parsed.data.title || "";
  if (typeof title === "string") {
    title = title.replace(/^>-|\s+/g, " ").trim();
  }
  const attributes: Record<string, any> = {
    ...parsed.data,
    title: title || parsed.data.title,
  };
  return { attributes, body: parsed.content };
}

function cleanText(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Remove markdown links
    .replace(/[*_#`~]/g, "") // Remove formatting
    .replace(/\s+/g, " ")
    .trim();
}

export function repurposePostToInstagram(filePath: string) {
  const absolutePath = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(absolutePath)) {
    console.error(`❌ Arquivo não encontrado: ${absolutePath}`);
    process.exit(1);
  }

  const rawContent = fs.readFileSync(absolutePath, "utf-8");
  const { attributes, body } = extractFrontmatter(rawContent);

  const title = attributes.title || "Como Escalar sua Oficina Mecânica com IA";
  const excerpt =
    attributes.excerpt ||
    attributes.meta_description ||
    "Descubra como aumentar o faturamento e recuperar tempo na sua oficina com automação conversacional.";
  const slug = attributes.slug || path.basename(filePath, ".md");

  // Extract headings and bullet points dynamically from post content
  const lines = body.split("\n");
  const headings: string[] = [];
  const bulletPoints: string[] = [];
  const paragraphs: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("## ") || trimmed.startsWith("### ")) {
      const cleanH = cleanText(trimmed);
      if (
        cleanH.length > 5 &&
        !cleanH.toLowerCase().includes("faq") &&
        !cleanH.toLowerCase().includes("perguntas")
      ) {
        headings.push(cleanH);
      }
    } else if (
      trimmed.startsWith("1. ") ||
      trimmed.startsWith("2. ") ||
      trimmed.startsWith("3. ") ||
      trimmed.startsWith("- ") ||
      trimmed.startsWith("* ")
    ) {
      const cleanB = cleanText(trimmed);
      if (cleanB.length > 15) {
        bulletPoints.push(cleanB);
      }
    } else if (trimmed.length > 40 && !trimmed.startsWith("<") && !trimmed.startsWith("![")) {
      paragraphs.push(cleanText(trimmed));
    }
  }

  const mainHeading1 = headings[0] || "O Desafio da Gestão na Oficina";
  const mainHeading2 = headings[1] || "A Transformação com Inteligência Artificial";
  const mainHeading3 = headings[2] || "Resultados Práticos no Faturamento";

  const b1 = bulletPoints[0] || paragraphs[0] || "Processos manuais consomem tempo precioso da equipe";
  const b2 = bulletPoints[1] || paragraphs[1] || "A IA automatiza tarefas repetitivas com precisão";
  const b3 = bulletPoints[2] || paragraphs[2] || "Sua oficina atende com excelência 24h por dia no WhatsApp";

  // --- FORMATO 1: LEGENDA POST SIMPLES (Single Image) ---
  const captionSingle = `🔥 ${title.toUpperCase()}

Dono de oficina mecânica: você quer elevar a gestão da sua loja para o próximo nível? 🛠️⚡

📌 DESTAQUES DESTE ARTIGO:
👉 ${mainHeading1}
👉 ${mainHeading2}
👉 ${mainHeading3}

💡 Quer ver a estratégia completa de como implementar isso na sua oficina?
🔗 Acesse o artigo completo no blog do CoreAuto CRM (Link na Bio ou acesse coreautocrm.com.br)!

#oficinamecanica #gestaoautomotiva #coreautocrm #oficinaia #atendimentowhatsapp #mecanicaautomotiva`;

  // --- FORMATO 2: ESTRUTURA E LEGENDA DO CARROSSEL (4:5) DEDICADA A ESTE POST ---
  const slidesData: SlideData[] = [
    {
      slideNumber: 1,
      totalSlides: 5,
      tag: "GUIA PRÁTICO • COREAUTO CRM",
      title: title,
      subtitle: excerpt,
      ctaText: "Deslize para ver a estratégia ➡️",
    },
    {
      slideNumber: 2,
      totalSlides: 5,
      tag: "1. O DESAFIO NA OFICINA",
      title: mainHeading1,
      subtitle: paragraphs[0] ? paragraphs[0].substring(0, 120) + "..." : excerpt,
      bullets: [b1, b2].slice(0, 2),
    },
    {
      slideNumber: 3,
      totalSlides: 5,
      tag: "2. A SOLUÇÃO INTELIGENTE",
      title: mainHeading2,
      subtitle: paragraphs[1] ? paragraphs[1].substring(0, 120) + "..." : "Veja como aplicar na prática:",
      bullets: [b3, bulletPoints[3] || "Atendimento rápido e padronizado"].slice(0, 2),
    },
    {
      slideNumber: 4,
      totalSlides: 5,
      tag: "3. O IMPACTO NO NEGÓCIO",
      title: mainHeading3,
      subtitle: "O que muda na rotina da sua oficina mecânica:",
      bullets: [
        "Economia imediata de tempo do dono e da recepção",
        "Atendimento personalizado via WhatsApp",
        "Aumento da taxa de fechamento de serviços",
      ],
      highlightText: "🚀 Mais faturamento sem precisar contratar mais funcionários!",
    },
    {
      slideNumber: 5,
      totalSlides: 5,
      tag: "PRÓXIMO PASSO",
      title: "Quer aplicar isso na sua oficina?",
      subtitle: `Leia o artigo completo "${title}" no nosso blog!`,
      ctaText: "📌 Salve este post\n🚀 Compartilhe com um amigo dono de oficina\n🔗 Link no perfil do Instagram",
    },
  ];

  const captionCarousel = `🎠 ${title.toUpperCase()} (Deslize para ver ➡️)

${excerpt}

No carrossel acima te mostramos como dominar essa estratégia na sua oficina mecânica com eficiência e automação.

📌 Resumo do Carrossel:
Slide 1: Capa
Slide 2: ${mainHeading1}
Slide 3: ${mainHeading2}
Slide 4: ${mainHeading3}
Slide 5: Como aplicar hoje mesmo!

💬 Comente "OFICINA" ou acesse o link na bio para ler o artigo completo no blog!

#carrosselinstagram #oficinamecanica #gestaoautomotiva #coreautocrm #automacao #iaautomoção`;

  // --- FORMATO 3: ROTEIRO E DADOS DO REELS PERSUASIVO DEDICADO A ESTE POST ESPECÍFICO (9:16) ---
  const firstPara = paragraphs[0] || "Muitas oficinas perdem clientes e tempo por falta de processos automatizados no WhatsApp.";
  const secondPara = paragraphs[1] || "A inteligência artificial do CoreAuto CRM resolve esse problema organizando o atendimento em tempo real.";

  const reelsData: ReelsData = {
    title: title,
    totalDurationSeconds: 28,
    voice: "pt-BR-AntonioNeural",
    sections: [
      {
        step: 1,
        title: "HOOK (0-5s)",
        voiceover: `Dono de oficina mecânica, você já parou pra pensar sobre ${title.toLowerCase()}? Se liga nisso!`,
        onScreenText: `⚠️ ATENÇÃO DONO DE OFICINA!\n${title}`,
        durationSeconds: 5,
      },
      {
        step: 2,
        title: "DOR / PROBLEMA (5-12s)",
        voiceover: cleanText(firstPara).substring(0, 180),
        onScreenText: `❌ O PROBLEMA:\n${mainHeading1}`,
        durationSeconds: 7,
      },
      {
        step: 3,
        title: "SOLUÇÃO PERSUASIVA (12-20s)",
        voiceover: cleanText(secondPara).substring(0, 180),
        onScreenText: `🧠 A SOLUÇÃO COM IA:\n${mainHeading2}`,
        durationSeconds: 8,
      },
      {
        step: 4,
        title: "CTA IMPERDÍVEL (20-28s)",
        voiceover: `Quer ver como aplicar essa transformação na sua oficina hoje mesmo? Comente a palavra OFICINA aqui embaixo ou acesse o link na bio pra ler o artigo completo no blog do CoreAuto CRM!`,
        onScreenText: `🚀 QUER APLICAR NA SUA OFICINA?\nComente "OFICINA" ou acesse a bio! 🔗`,
        durationSeconds: 8,
      },
    ],
  };

  const captionReels = `🎥 ${title.toUpperCase()} (Assista até o final! ⚡)

${excerpt}

💡 No vídeo te explicamos exatamente como essa estratégia funciona na prática para oficinas mecânicas.

👇 Comente "OFICINA" ou clique no link na bio para ler o artigo completo no blog!

#reelsinstagram #oficinamecanica #gestaoautomotiva #coreautocrm #oficinaia #tecnologiaautomotiva`;

  // Write generated output files
  const outDir = path.resolve(process.cwd(), "instagram_posts", slug);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(path.join(outDir, "caption_single.txt"), captionSingle, "utf-8");
  fs.writeFileSync(path.join(outDir, "slides_data.json"), JSON.stringify(slidesData, null, 2), "utf-8");
  fs.writeFileSync(path.join(outDir, "caption_carousel.txt"), captionCarousel, "utf-8");
  fs.writeFileSync(path.join(outDir, "reels_data.json"), JSON.stringify(reelsData, null, 2), "utf-8");
  fs.writeFileSync(path.join(outDir, "caption_reels.txt"), captionReels, "utf-8");

  console.log(`✅ Repurposing dinâmico concluído para '${slug}'! Conteúdos salvos em: ${outDir}`);

  return { slug, outDir };
}

// CLI Direct Execution
if (process.argv[1]?.includes("repurpose_blog_to_instagram")) {
  const targetFile = process.argv[2] || "content/posts/pt/recuperar-orcamentos-parados-whatsapp-oficina.md";
  repurposePostToInstagram(targetFile);
}
