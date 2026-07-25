import fs from "node:fs";
import path from "node:path";

function extractFrontmatter(content: string) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return { attributes: {}, body: content };

  const yamlStr = match[1];
  const body = content.replace(match[0], "").trim();
  const attributes: Record<string, string> = {};

  for (const line of yamlStr.split("\n")) {
    const parts = line.split(":");
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join(":").trim().replace(/^['"]|['"]$/g, "");
      attributes[key] = val;
    }
  }

  return { attributes, body };
}

function cleanMarkdownText(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Remove links
    .replace(/[*_#`~]/g, "") // Remove bold, italic, headers
    .replace(/\s+/g, " ")
    .trim();
}

export function repurposePostToInstagram(filePath: string) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Arquivo não encontrado: ${filePath}`);
    process.exit(1);
  }

  const rawContent = fs.readFileSync(filePath, "utf-8");
  const { attributes, body } = extractFrontmatter(rawContent);

  const title = attributes.title || "Como Escalar sua Oficina Mecânica com IA";
  const excerpt = attributes.excerpt || attributes.meta_description || "Descubra como aumentar o faturamento e recuperar tempo na sua oficina.";

  // Extract H2/H3 headings and key bullet points
  const lines = body.split("\n");
  const keyPoints: string[] = [];

  for (const line of lines) {
    if (line.startsWith("## ") || line.startsWith("### ")) {
      const cleanH = cleanMarkdownText(line);
      if (cleanH.length > 5 && keyPoints.length < 4) {
        keyPoints.push(cleanH);
      }
    } else if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
      const cleanB = cleanMarkdownText(line);
      if (cleanB.length > 15 && keyPoints.length < 5) {
        keyPoints.push(cleanB);
      }
    }
  }

  if (keyPoints.length === 0) {
    keyPoints.push("Elimine a papelada e os orçamentos parados no WhatsApp");
    keyPoints.push("Automatize o follow-up de clientes sem contratar mais equipe");
    keyPoints.push("Aumente a taxa de aprovação de serviços em até 40%");
  }

  // 1. Generate Caption (Hook -> Context -> Value -> CTA -> Hashtags)
  const hook = `🔥 ${title.toUpperCase()}`;
  const context = `Dono de oficina: você ainda perde horas do seu dia apagando incêndios e acompanhando orçamentos no WhatsApp? 🛠️⚡`;
  
  const valueSection = keyPoints.map((pt, idx) => `👉 ${pt}`).join("\n");

  const cta = `💡 Quer ver como implementar isso na prática na sua oficina?\n👉 Leia o artigo completo no nosso blog! Link na bio 🔗 ou comente "OFICINA" que te enviamos no direct!`;

  const hashtags = `#oficinamecanica #gestaoautomotiva #coreautocrm #oficinas #mecanicos #atendimentowhatsapp #iaautomoção #mecanicaautomotiva`;

  const fullCaption = `${hook}\n\n${context}\n\n📌 CONFIRA OS PONTOS PRINCIPAIS:\n${valueSection}\n\n${cta}\n\n${hashtags}`;

  // 2. Generate Carousel Slides Roteiro
  const slides = `
# 🎠 ROTEIRO DE CARROSSEL INSTAGRAM (5 SLIDES)
**Baseado no artigo:** ${title}

---
### SLIDE 1 (CAPA)
- **Título principal:** ${title}
- **Subtítulo:** ${excerpt.slice(0, 80)}...
- **Callout visual:** Arraste para o lado ➡️

---
### SLIDE 2 (O PROBLEMA DA OFICINA)
- **Cabeçalho:** O Gargalo Invisível
- **Texto:** ${context}

---
### SLIDE 3 (A SOLUÇÃO PRÁTICA)
- **Cabeçalho:** Como resolver na sua oficina:
${keyPoints.slice(0, 2).map((p) => `- ✅ ${p}`).join("\n")}

---
### SLIDE 4 (IMPACTO & RESULTADO)
- **Cabeçalho:** O resultado no final do mês:
${keyPoints.slice(2, 4).map((p) => `- 🚀 ${p}`).join("\n")}
- Mais tempo livre para a gestão e maior faturamento diário!

---
### SLIDE 5 (CHAMADA PARA AÇÃO / CTA)
- **Título:** Gostou dessa dica? 🎯
- **Texto:** Acesse o artigo completo no blog do CoreAutoCRM!
- **Ícone:** Salve este post 📌 | Compartilhe 🚀 | Link na Bio 🔗
`;

  // Output directory
  const outDir = path.dirname(filePath);
  const baseName = path.basename(filePath, ".md");
  const captionPath = path.join(outDir, `${baseName}_instagram_caption.txt`);
  const slidesPath = path.join(outDir, `${baseName}_instagram_carousel.md`);

  fs.writeFileSync(captionPath, fullCaption, "utf-8");
  fs.writeFileSync(slidesPath, slides, "utf-8");

  console.log("==================================================");
  console.log(" 🎉 SUPER AGENTE INSTAGRAM - REPURPOSING CONCLUÍDO!");
  console.log("==================================================");
  console.log(`📄 Legenda salva em: ${captionPath}`);
  console.log(`🎠 Roteiro do Carrossel salvo em: ${slidesPath}\n`);
  console.log("--- PRÉVIA DA LEGENDA DA POSTAGEM ---");
  console.log(fullCaption);
  console.log("--------------------------------------------------");
}

// CLI Execution
const targetFile = process.argv[2];
if (targetFile) {
  repurposePostToInstagram(targetFile);
}
