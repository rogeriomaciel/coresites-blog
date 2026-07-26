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
    title: title || parsed.data.title
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

  // Extract key points
  const lines = body.split("\n");
  const keyPoints: string[] = [];

  for (const line of lines) {
    if (line.startsWith("## ") || line.startsWith("### ")) {
      const cleanH = cleanText(line);
      if (cleanH.length > 5 && !cleanH.toLowerCase().includes("faq") && !cleanH.toLowerCase().includes("perguntas") && keyPoints.length < 5) {
        keyPoints.push(cleanH);
      }
    } else if (line.trim().startsWith("1. ") || line.trim().startsWith("2. ") || line.trim().startsWith("3. ") || line.trim().startsWith("- ")) {
      const cleanB = cleanText(line);
      if (cleanB.length > 15 && keyPoints.length < 6) {
        keyPoints.push(cleanB);
      }
    }
  }

  if (keyPoints.length < 3) {
    keyPoints.push("Elimine orçamentos parados no WhatsApp sem fazer spam");
    keyPoints.push("Automatize o follow-up individual com IA conversacional");
    keyPoints.push("Aumente a aprovação de serviços em até 40%");
  }

  // --- FORMATO 1: LEGENDA POST SIMPLES (Single Image) ---
  const captionSingle = `🔥 ${title.toUpperCase()}

Dono de oficina: você ainda perde orçamentos no limbo do WhatsApp ou queima o chip da sua loja com disparos em massa? 🛠️⚡

📌 PONTOS CHAVE DO ARTIGO:
${keyPoints.slice(0, 3).map((p) => `👉 ${p}`).join("\n")}

💡 Quer ver a estratégia completa de como implementar isso na sua oficina?
🔗 Acesse o artigo completo no blog do CoreAuto CRM (Link na Bio ou acesse coreautocrm.com.br)!

#oficinamecanica #gestaoautomotiva #coreautocrm #oficinaia #atendimentowhatsapp #mecanicos #mecanicaautomotiva`;

  // --- FORMATO 2: ESTRUTURA E LEGENDA DO CARROSSEL (4:5) ---
  const slidesData: SlideData[] = [
    {
      slideNumber: 1,
      totalSlides: 5,
      tag: "GUIA PRÁTICO • COREAUTO CRM",
      title: title,
      subtitle: excerpt,
      ctaText: "Deslize para ver o passo a passo ➡️",
    },
    {
      slideNumber: 2,
      totalSlides: 5,
      tag: "O GARGALO DA OFICINA",
      title: "O Custo Invisível dos Orçamentos Parados",
      subtitle: "Mensagens genéricas em lote queimam seu número. Deixar orçamentos esquecidos é rasgar dinheiro.",
      bullets: [
        "Disparos em massa geram bloqueios e 1% de conversão",
        "Recepção atarefada não tem tempo de cobrar clientes antigos",
        "Falta de acompanhamento faz o cliente fechar no concorrente",
      ],
    },
    {
      slideNumber: 3,
      totalSlides: 5,
      tag: "A SOLUÇÃO COM IA",
      title: "Resgate Inteligente & Personalizado",
      subtitle: "Como a inteligência artificial recupera orçamentos com elegância:",
      bullets: keyPoints.slice(0, 3).map((kp) => kp),
    },
    {
      slideNumber: 4,
      totalSlides: 5,
      tag: "RESULTADOS REAIS",
      title: "Impacto no Faturamento da Oficina",
      subtitle: "O que muda na rotina do dono de oficina:",
      bullets: [
        "Aumento imediato na taxa de aprovação de serviços",
        "Atendimento exclusivo e humanizado via WhatsApp",
        "Controle total de aprovação com a equipe de recepção",
      ],
      highlightText: "🚀 Mais faturamento sem precisar contratar mais funcionários!",
    },
    {
      slideNumber: 5,
      totalSlides: 5,
      tag: "PRÓXIMO PASSO",
      title: "Quer automatizar sua oficina de verdade?",
      subtitle: "Leia o artigo completo e veja como aplicar hoje mesmo no seu negócio.",
      ctaText: "📌 Salve este post\n🚀 Compartilhe com um amigo dono de oficina\n🔗 Link no perfil do Instagram",
    },
  ];

  const captionCarousel = `🎠 ${title.toUpperCase()} (Deslize para ver ➡️)

Você já parou para calcular quanto dinheiro sua oficina perde por mês com orçamentos que nunca são respondidos? 💸

No carrossel acima te mostramos como usar a IA para resgatar clientes parados no WhatsApp sem fazer spam e sem estressar sua equipe.

📌 Resumo do Carrossel:
Slide 1: Capa
Slide 2: O gargalo silencioso no WhatsApp
Slide 3: O fluxo de resgate inteligente com IA
Slide 4: O resultado no faturamento
Slide 5: Chamada para ação!

💬 Comente "OFICINA" ou acesse o link na bio para ler o guia completo no blog!

#carrosselinstagram #oficinamecanica #gestaoautomotiva #coreautocrm #automacao #iaautomoção`;

  // --- FORMATO 3: ROTEIRO E DADOS DO REELS PERSUASIVO (9:16) ---
  const reelsData: ReelsData = {
    title: title,
    totalDurationSeconds: 25,
    voice: "pt-BR-AntonioNeural",
    sections: [
      {
        step: 1,
        title: "HOOK (0-4s)",
        voiceover: "Se você é dono de oficina mecânica, pare de jogar dinheiro fora mandando spam no WhatsApp!",
        onScreenText: "⚠️ PARALISA TUDO!\nSua oficina perde dinheiro no WhatsApp?",
        durationSeconds: 4,
      },
      {
        step: 2,
        title: "DOR / PROBLEMA (4-10s)",
        voiceover: "Disparar a mesma mensagem genérica pra dois mil clientes só serve pra queimar seu número e irritar o cliente.",
        onScreenText: "❌ Disparo em massa = Bloqueio de chip e 0% de vendas.",
        durationSeconds: 6,
      },
      {
        step: 3,
        title: "SOLUÇÃO PERSUASIVA (10-18s)",
        voiceover: "Com o CoreAuto CRM, a IA lê o histórico da conversa e gera um acompanhamento sutil e hiper-personalizado pra cada orçamento parado.",
        onScreenText: "🧠 IA lê a conversa e resgata o orçamento certo no momento exato!",
        durationSeconds: 8,
      },
      {
        step: 4,
        title: "CTA IMPERDÍVEL (18-25s)",
        voiceover: "Aumente a aprovação de serviços na sua oficina ainda essa semana! Comente OFICINA aqui embaixo pra ler o guia completo no blog!",
        onScreenText: "🚀 Quer testar na sua oficina?\nComente 'OFICINA' ou clique no link da bio! 🔗",
        durationSeconds: 7,
      },
    ],
  };

  const captionReels = `🎥 ${title.toUpperCase()} (Assista até o final! ⚡)

Seu WhatsApp é uma mina de ouro de orçamentos parados, mas você só precisa da estratégia certa pra recuperar esse faturamento.

💡 No vídeo te mostramos como a Inteligência Artificial do CoreAuto CRM reativa clientes sumidos com mensagens 100% personalizadas e humanas.

👇 Comente "OFICINA" ou clique no link na bio para ler o artigo completo no blog!

#reelsinstagram #oficinamecanica #gestaoautomotiva #coreautocrm #mecanica #vendaswhatsapp #donooficina`;

  // Output folder inside instagram_posts/<slug>
  const outDir = path.resolve(process.cwd(), "instagram_posts", slug);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // Save files
  fs.writeFileSync(path.join(outDir, "caption_single.txt"), captionSingle, "utf-8");
  fs.writeFileSync(path.join(outDir, "caption_carousel.txt"), captionCarousel, "utf-8");
  fs.writeFileSync(path.join(outDir, "caption_reels.txt"), captionReels, "utf-8");
  fs.writeFileSync(path.join(outDir, "slides_data.json"), JSON.stringify(slidesData, null, 2), "utf-8");
  fs.writeFileSync(path.join(outDir, "reels_data.json"), JSON.stringify(reelsData, null, 2), "utf-8");

  console.log("==================================================");
  console.log(" 🎉 REPURPOSING DE BLOG PARA INSTAGRAM CONCLUÍDO!");
  console.log("==================================================");
  console.log(`📁 Arquivos salvos em: ${outDir}`);
  console.log(` ├── 📄 caption_single.txt (Post de Imagem Simples)`);
  console.log(` ├── 🎠 caption_carousel.txt & slides_data.json (Carrossel 4:5)`);
  console.log(` └── 🎥 caption_reels.txt & reels_data.json (Reels 9:16)`);
  console.log("--------------------------------------------------\n");

  return { slug, outDir, slidesData, reelsData };
}

// CLI Execution
if (process.argv[1]?.includes("repurpose_blog_to_instagram")) {
  const targetFile = process.argv[2] || "content/posts/pt/recuperar-orcamentos-parados-whatsapp-oficina.md";
  repurposePostToInstagram(targetFile);
}
