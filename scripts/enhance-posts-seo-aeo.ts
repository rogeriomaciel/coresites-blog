import fs from "node:fs";
import path from "node:path";

const POSTS_DIRS = [
  path.resolve(__dirname, "../../content/posts/pt"),
  path.resolve(__dirname, "../../content/posts/en")
];

function processPost(filePath: string) {
  const isPt = filePath.includes("/pt/");
  const content = fs.readFileSync(filePath, "utf-8");

  // Check if post already enhanced
  if (content.includes("### Perguntas Frequentes") || content.includes("### Frequently Asked Questions") || content.includes("AEO_ENHANCED: true")) {
    return false;
  }

  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return false;

  const yamlStr = match[1];
  const body = content.replace(match[0], "").trim();

  // Extract title and excerpt
  const titleMatch = yamlStr.match(/title:\s*['"]?([^'\n]+)['"]?/);
  const excerptMatch = yamlStr.match(/excerpt:\s*['"]?([^'\n]+)['"]?/);
  const slugMatch = yamlStr.match(/slug:\s*['"]?([^'\n]+)['"]?/);

  const title = titleMatch ? titleMatch[1] : "Oficina Mecânica com IA";
  const excerpt = excerptMatch ? excerptMatch[1] : "Como automatizar e otimizar a gestão da oficina mecânica.";
  const slug = slugMatch ? slugMatch[1] : "";

  // 1. Direct Answer Snippet Block
  const snippetBlockPt = `\n\n> **Resumo Rápido (AEO):** ${excerpt} O CoreAutoCRM automatiza processos de atendimento no WhatsApp, reduz o tempo de resposta e acelera a aprovação de orçamentos para donos de oficinas mecânicas.\n\n`;
  const snippetBlockEn = `\n\n> **Quick Summary (AEO):** ${excerpt} CoreAutoCRM automates WhatsApp service processes, reduces response time, and speeds up quote approvals for auto repair shop owners.\n\n`;

  const snippetBlock = isPt ? snippetBlockPt : snippetBlockEn;

  // Insert snippet block after first paragraph
  const paragraphs = body.split("\n\n");
  let newBody = "";
  if (paragraphs.length > 1) {
    newBody = paragraphs[0] + snippetBlock + paragraphs.slice(1).join("\n\n");
  } else {
    newBody = snippetBlock + body;
  }

  // 2. Internal Linking Block
  const internalLinksPt = `\n\n### 🔗 Leituras Recomendadas no Blog:\n- 🚀 [Como Recuperar Orçamentos Parados no WhatsApp da Oficina](/posts/pt/recuperar-orcamentos-parados-whatsapp-oficina)\n- 📊 [Relatório Diário Automatizado com IA para Dono de Oficina](/posts/pt/relatorio-diario-dono-oficina-mecanica-ia)\n- 📑 [Importação Automática de Orçamentos em PDF](/posts/pt/importar-orcamento-pdf-oficina-mecanica)\n`;
  const internalLinksEn = `\n\n### 🔗 Recommended Reading on the Blog:\n- 🚀 [How to Recover Stalled Quotes on Auto Repair WhatsApp](/posts/en/recuperar-orcamentos-parados-whatsapp-oficina)\n- 📊 [Automated Daily AI Report for Auto Repair Shop Owners](/posts/en/relatorio-diario-dono-oficina-mecanica-ia)\n- 📑 [Automatic PDF Quote Import for Auto Shops](/posts/en/importar-orcamento-pdf-oficina-mecanica)\n`;

  // 3. FAQ Section for AEO & Schema
  const faqPt = `\n\n## Perguntas Frequentes (FAQ)

### 1. O que é a tecnologia de IA aplicada a oficinas mecânicas?
Trata-se da utilização de inteligência artificial e automação conversacional via WhatsApp para gerenciar orçamentos, agendamentos, diagnóstico por voz e acompanhamento de veículos sem exigir digitação manual em ERPs pesados.

### 2. Como o CoreAutoCRM aumenta a aprovação de orçamentos?
Ao enviar notificações automáticas e estruturadas diretamente no WhatsApp do cliente no momento exato da inspeção, a oficina reduz o tempo de espera do cliente de horas para minutos, aumentando drasticamente a taxa de conversão.

### 3. Preciso trocar o ERP atual da minha oficina para usar essas soluções?
Não! O CoreAutoCRM opera de forma integrada e conversacional, servindo como camada inteligente de atendimento e gestão que roda direto no celular da sua equipe.
`;

  const faqEn = `\n\n## Frequently Asked Questions (FAQ)

### 1. What is AI technology applied to auto repair shops?
It refers to using artificial intelligence and conversational automation via WhatsApp to manage quotes, appointments, voice diagnostics, and vehicle status updates without tedious manual ERP data entry.

### 2. How does CoreAutoCRM increase quote approval rates?
By sending automated and structured notifications directly to the customer's WhatsApp at the exact moment of inspection, reducing wait times from hours to minutes and boosting conversion rates.

### 3. Do I need to replace my shop's current ERP?
No! CoreAutoCRM operates seamlessly as a conversational management layer on WhatsApp, making your existing team workflows AI-native without software friction.
`;

  const faqBlock = isPt ? faqPt : faqEn;
  const internalLinks = isPt ? internalLinksPt : internalLinksEn;

  // Append internal links and FAQ
  newBody += internalLinks + faqBlock;

  // Add AEO_ENHANCED tag to frontmatter
  const newYamlStr = yamlStr + "\naeo_enhanced: true";
  const finalContent = `---\n${newYamlStr}\n---\n\n${newBody}`;

  fs.writeFileSync(filePath, finalContent, "utf-8");
  return true;
}

function main() {
  console.log("==================================================");
  console.log(" 🚀 AUDITORIA & ENHANCEMENT EM LOTE (SEO + AEO + FAQ)");
  console.log("==================================================");

  let updatedCount = 0;

  for (const dirPath of POSTS_DIRS) {
    if (!fs.existsSync(dirPath)) continue;
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
      if (file.endsWith(".md")) {
        const fullPath = path.join(dirPath, file);
        const updated = processPost(fullPath);
        if (updated) {
          console.log(`✅ Post Aprimorado: ${file}`);
          updatedCount++;
        }
      }
    }
  }

  console.log(`\n🎉 Processamento concluído! Total de ${updatedCount} artigos atualizados com AEO, Snippets e FAQs.`);
}

main();
