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

function cleanText(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Remove markdown links
    .replace(/[*_#`~>]/g, "") // Remove formatting
    .replace(/\s+/g, " ")
    .trim();
}

interface ParsedSection {
  title: string;
  paragraphs: string[];
  bullets: string[];
}

function parseMarkdownSections(body: string): ParsedSection[] {
  const lines = body.split("\n");
  const sections: ParsedSection[] = [];
  let currentSection: ParsedSection = { title: "", paragraphs: [], bullets: [] };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("## ") || trimmed.startsWith("### ")) {
      const titleClean = cleanText(trimmed);
      // Skip generic FAQ or recommendation sections
      if (
        titleClean.toLowerCase().includes("faq") ||
        titleClean.toLowerCase().includes("perguntas frequentes") ||
        titleClean.toLowerCase().includes("leituras recomendadas")
      ) {
        continue;
      }
      if (currentSection.title || currentSection.paragraphs.length > 0 || currentSection.bullets.length > 0) {
        sections.push(currentSection);
      }
      currentSection = { title: titleClean, paragraphs: [], bullets: [] };
    } else if (
      trimmed.startsWith("- ") ||
      trimmed.startsWith("* ") ||
      /^\d+\.\s/.test(trimmed)
    ) {
      const bClean = cleanText(trimmed);
      if (bClean.length > 10) {
        currentSection.bullets.push(bClean);
      }
    } else if (
      trimmed.length > 25 &&
      !trimmed.startsWith("<") &&
      !trimmed.startsWith("![") &&
      !trimmed.startsWith("---")
    ) {
      currentSection.paragraphs.push(cleanText(trimmed));
    }
  }

  if (currentSection.title || currentSection.paragraphs.length > 0 || currentSection.bullets.length > 0) {
    sections.push(currentSection);
  }

  return sections;
}

export function repurposePostToInstagram(filePath: string) {
  const absolutePath = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(absolutePath)) {
    console.error(`❌ Arquivo não encontrado: ${absolutePath}`);
    process.exit(1);
  }

  const rawContent = fs.readFileSync(absolutePath, "utf-8");
  const parsedMatter = matter(rawContent);

  let title = parsedMatter.data.title || "";
  if (typeof title === "string") {
    title = title.replace(/^>-|\s+/g, " ").trim();
  }

  const excerpt =
    parsedMatter.data.excerpt ||
    parsedMatter.data.meta_description ||
    "Confira os principais aprendizados deste artigo do blog CoreAutoCRM.";
  const slug = parsedMatter.data.slug || path.basename(filePath, ".md");
  const category = (parsedMatter.data.category || "GESTÃO DE OFICINA").toUpperCase();

  const sections = parseMarkdownSections(parsedMatter.content);

  // Build slides content strictly based on the actual post sections
  const sec1 = sections[0] || {
    title: "O Problema Principal",
    paragraphs: [excerpt],
    bullets: ["Falta de acompanhamento estruturado", "Perda de oportunidades diárias"],
  };

  const sec2 = sections[1] || {
    title: "Como Resolver",
    paragraphs: [sections[0]?.paragraphs[1] || excerpt],
    bullets: sections[0]?.bullets.slice(2, 4) || ["Mudança de processo no atendimento", "Padronização das etapas"],
  };

  const sec3 = sections[2] || sections[sections.length - 1] || {
    title: "Impacto e Resultado",
    paragraphs: ["Aplicações práticas para sua oficina."],
    bullets: ["Maior previsibilidade de receita", "Retenção de clientes"],
  };

  // Helper to extract clean bullet points for a slide
  function getSlideBullets(sec: ParsedSection): string[] {
    if (sec.bullets.length >= 2) {
      return sec.bullets.slice(0, 2);
    }
    if (sec.bullets.length === 1) {
      const extra = sec.paragraphs[1] || sec.paragraphs[0] || "";
      return [sec.bullets[0], extra ? extra.substring(0, 70) + "..." : "Ação prática no pátio"];
    }
    const p0 = sec.paragraphs[0] || "";
    const p1 = sec.paragraphs[1] || "";
    return [
      p0 ? p0.substring(0, 70) + "..." : "Acompanhamento detalhado",
      p1 ? p1.substring(0, 70) + "..." : "Aplicação direta na rotina",
    ];
  }

  const slidesData: SlideData[] = [
    {
      slideNumber: 1,
      totalSlides: 5,
      tag: `${category} • COREAUTO CRM`,
      title: title,
      subtitle: excerpt,
      ctaText: "Deslize para ver os detalhes ➡️",
    },
    {
      slideNumber: 2,
      totalSlides: 5,
      tag: "1. O DIAGNÓSTICO",
      title: sec1.title || "O Diagnóstico Inicial",
      subtitle: sec1.paragraphs[0] ? sec1.paragraphs[0].substring(0, 110) + "..." : excerpt,
      bullets: getSlideBullets(sec1),
    },
    {
      slideNumber: 3,
      totalSlides: 5,
      tag: "2. A SOLUÇÃO PRÁTICA",
      title: sec2.title || "Passos para Solução",
      subtitle: sec2.paragraphs[0] ? sec2.paragraphs[0].substring(0, 110) + "..." : "Veja o método de aplicação:",
      bullets: getSlideBullets(sec2),
    },
    {
      slideNumber: 4,
      totalSlides: 5,
      tag: "3. O RESULTADO NA PRÁTICA",
      title: sec3.title || "O Impacto no Caixa",
      subtitle: sec3.paragraphs[0] ? sec3.paragraphs[0].substring(0, 110) + "..." : "Resultado garantido no pátio:",
      bullets: getSlideBullets(sec3),
      highlightText: sec3.paragraphs[1] ? `💡 ${sec3.paragraphs[1].substring(0, 80)}...` : undefined,
    },
    {
      slideNumber: 5,
      totalSlides: 5,
      tag: "ARTIGO COMPLETO",
      title: "Quer dominar essa estratégia?",
      subtitle: `Leia o artigo completo "${title}" no nosso blog!`,
      ctaText: "📌 Salve este post\n🚀 Compartilhe com um colega de oficina\n🔗 Link no perfil do Instagram",
    },
  ];

  const captionCarousel = `🎠 ${title.toUpperCase()} (Deslize para ver ➡️)

${excerpt}

📌 Tópicos principais abordados neste carrossel:
• ${sec1.title}
• ${sec2.title}
• ${sec3.title}

💬 Quer ler o artigo completo? Acesse o link na bio do nosso perfil ou acesse blog.coreautocrm.com.br!

#oficinamecanica #gestaoautomotiva #coreautocrm #${category.toLowerCase().replace(/\s+/g, "")} #donoDeOficina`;

  const captionSingle = `🔥 ${title.toUpperCase()}

${excerpt}

💡 Acesse o artigo completo no blog do CoreAuto CRM (link na bio)!

#oficinamecanica #gestaoautomotiva #coreautocrm`;

  const reelsData: ReelsData = {
    title: title,
    totalDurationSeconds: 28,
    voice: "pt-BR-AntonioNeural",
    sections: [
      {
        step: 1,
        title: "HOOK (0-5s)",
        voiceover: `Dono de oficina mecânica, atenção: ${title.toLowerCase()}. Se liga nisso!`,
        onScreenText: `⚠️ ATENÇÃO DONO DE OFICINA!\n${title}`,
        durationSeconds: 5,
      },
      {
        step: 2,
        title: "DOR / PROBLEMA (5-12s)",
        voiceover: (sec1.paragraphs[0] || excerpt).substring(0, 180),
        onScreenText: `❌ O PROBLEMA:\n${sec1.title}`,
        durationSeconds: 7,
      },
      {
        step: 3,
        title: "SOLUÇÃO PERSUASIVA (12-20s)",
        voiceover: (sec2.paragraphs[0] || excerpt).substring(0, 180),
        onScreenText: `🧠 A SOLUÇÃO:\n${sec2.title}`,
        durationSeconds: 8,
      },
      {
        step: 4,
        title: "CTA IMPERDÍVEL (20-28s)",
        voiceover: `Acesse o link na bio para ler o artigo completo "${title}" no blog do CoreAuto CRM!`,
        onScreenText: `🚀 LEIA O ARTIGO COMPLETO!\nAcesse o link na bio! 🔗`,
        durationSeconds: 8,
      },
    ],
  };

  const captionReels = `🎥 ${title.toUpperCase()} (Assista até o final! ⚡)

${excerpt}

👇 Acesse o link na bio para ler o artigo completo no blog!

#reelsinstagram #oficinamecanica #gestaoautomotiva #coreautocrm`;

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

if (process.argv[1]?.includes("repurpose_blog_to_instagram")) {
  const targetFile = process.argv[2] || "content/posts/pt/como-vender-mais-revisao-preventiva-oficina.md";
  repurposePostToInstagram(targetFile);
}
