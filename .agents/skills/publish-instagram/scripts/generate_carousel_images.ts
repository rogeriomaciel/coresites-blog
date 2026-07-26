import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { SlideData } from "./repurpose_blog_to_instagram";

function wrapText(text: string, maxCharsPerLine: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    if ((currentLine + word).length > maxCharsPerLine) {
      if (currentLine) lines.push(currentLine.trim());
      currentLine = word + " ";
    } else {
      currentLine += word + " ";
    }
  }
  if (currentLine) lines.push(currentLine.trim());
  return lines;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function renderSlideSvg(slide: SlideData, width = 1080, height = 1350): Promise<Buffer> {
  const titleLines = wrapText(slide.title, 24);
  const subtitleLines = slide.subtitle ? wrapText(slide.subtitle, 42) : [];

  let contentY = 320;

  // Title render
  let titleSvg = "";
  const titleLineHeight = 68;
  for (const line of titleLines.slice(0, 4)) {
    titleSvg += `<text x="90" y="${contentY}" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="52" fill="#ffffff" letter-spacing="-0.5px">${escapeXml(line)}</text>\n`;
    contentY += titleLineHeight;
  }

  contentY += 20;

  // Subtitle render
  let subtitleSvg = "";
  const subLineHeight = 42;
  for (const line of subtitleLines.slice(0, 3)) {
    subtitleSvg += `<text x="90" y="${contentY}" font-family="system-ui, -apple-system, sans-serif" font-weight="400" font-size="28" fill="#94a3b8">${escapeXml(line)}</text>\n`;
    contentY += subLineHeight;
  }

  contentY += 40;

  // Bullets render (if any)
  let bulletsSvg = "";
  if (slide.bullets && slide.bullets.length > 0) {
    for (const b of slide.bullets.slice(0, 4)) {
      const bLines = wrapText(b, 38);
      
      // Icon badge
      bulletsSvg += `
        <g transform="translate(90, ${contentY - 24})">
          <circle cx="16" cy="16" r="16" fill="url(#blueGrad)" />
          <path d="M10 16 L14 20 L22 12" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        </g>
      `;

      let bTextY = contentY;
      for (const line of bLines.slice(0, 2)) {
        bulletsSvg += `<text x="140" y="${bTextY}" font-family="system-ui, -apple-system, sans-serif" font-weight="500" font-size="28" fill="#f1f5f9">${escapeXml(line)}</text>\n`;
        bTextY += 36;
      }

      contentY += Math.max(65, bLines.length * 36 + 20);
    }
  }

  // Highlight Box (if any)
  let highlightSvg = "";
  if (slide.highlightText) {
    highlightSvg = `
      <g transform="translate(90, ${contentY + 10})">
        <rect x="0" y="0" width="900" height="90" rx="18" fill="url(#cyanGrad)" opacity="0.15" stroke="#00f2fe" stroke-width="1.5"/>
        <text x="30" y="55" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="28" fill="#00f2fe">${escapeXml(slide.highlightText)}</text>
      </g>
    `;
  }

  // CTA Text (if any)
  let ctaSvg = "";
  if (slide.ctaText) {
    const ctaLines = slide.ctaText.split("\n");
    let ctaY = 1040;
    ctaSvg += `<g transform="translate(90, 1000)">`;
    ctaSvg += `<rect x="0" y="0" width="900" height="150" rx="24" fill="#1e293b" stroke="#334155" stroke-width="2"/>`;
    let lineOffsetY = 45;
    for (const line of ctaLines) {
      ctaSvg += `<text x="40" y="${lineOffsetY}" font-family="system-ui, -apple-system, sans-serif" font-weight="600" font-size="28" fill="#38bdf8">${escapeXml(line)}</text>`;
      lineOffsetY += 38;
    }
    ctaSvg += `</g>`;
  }

  const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#090d16" />
          <stop offset="50%" stop-color="#0f172a" />
          <stop offset="100%" stop-color="#020617" />
        </linearGradient>
        <linearGradient id="blueGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#3b82f6" />
          <stop offset="100%" stop-color="#8b5cf6" />
        </linearGradient>
        <linearGradient id="cyanGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#00f2fe" />
          <stop offset="100%" stop-color="#4facfe" />
        </linearGradient>
        <linearGradient id="cardGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1e293b" stop-opacity="0.8" />
          <stop offset="100%" stop-color="#0f172a" stop-opacity="0.9" />
        </linearGradient>
      </defs>

      <!-- Background -->
      <rect width="${width}" height="${height}" fill="url(#bgGrad)" />

      <!-- Glowing Header Orb -->
      <circle cx="950" cy="150" r="250" fill="#3b82f6" opacity="0.15" filter="blur(60px)" />
      <circle cx="100" cy="1200" r="250" fill="#8b5cf6" opacity="0.15" filter="blur(60px)" />

      <!-- Top Header Tag -->
      <rect x="90" y="110" width="340" height="42" rx="10" fill="url(#blueGrad)" opacity="0.2" stroke="#3b82f6" stroke-width="1"/>
      <text x="110" y="138" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="18" fill="#60a5fa" letter-spacing="1px">${escapeXml(slide.tag)}</text>

      <!-- Slide Indicator -->
      <text x="940" y="138" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="20" fill="#64748b">${slide.slideNumber} / ${slide.totalSlides}</text>

      <!-- Main Title & Subtitle -->
      ${titleSvg}
      ${subtitleSvg}

      <!-- Bullets & Highlights -->
      ${bulletsSvg}
      ${highlightSvg}

      <!-- CTA Box -->
      ${ctaSvg}

      <!-- Bottom Branding Bar -->
      <line x1="90" y1="1230" x2="990" y2="1230" stroke="#334155" stroke-width="1.5" />
      <text x="90" y="1270" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="22" fill="#38bdf8">CoreAuto CRM</text>
      <text x="250" y="1270" font-family="system-ui, -apple-system, sans-serif" font-weight="400" font-size="20" fill="#64748b">• Inteligência Artificial para Oficinas</text>
      <text x="990" y="1270" font-family="system-ui, -apple-system, sans-serif" font-weight="500" font-size="20" fill="#94a3b8" text-anchor="end">coreautocrm.com.br</text>
    </svg>
  `;

  return sharp(Buffer.from(svg)).png().toBuffer();
}

export async function generateCarouselImagesForSlug(slug: string) {
  const postDir = path.resolve(process.cwd(), "instagram_posts", slug);
  const slidesJsonPath = path.join(postDir, "slides_data.json");

  if (!fs.existsSync(slidesJsonPath)) {
    console.error(`❌ Erro: ${slidesJsonPath} não foi encontrado. Execute o repurposing primeiro!`);
    process.exit(1);
  }

  const slidesData: SlideData[] = JSON.parse(fs.readFileSync(slidesJsonPath, "utf-8"));
  console.log(`🎨 Renderizando ${slidesData.length} slides em PNG (1080x1350px 4:5)...`);

  const generatedFiles: string[] = [];

  // Generate Carousel Slides
  for (const slide of slidesData) {
    const pngBuffer = await renderSlideSvg(slide, 1080, 1350);
    const outPath = path.join(postDir, `slide_${slide.slideNumber}.png`);
    fs.writeFileSync(outPath, pngBuffer);
    generatedFiles.push(outPath);
    console.log(`  ✅ Slide ${slide.slideNumber}/${slide.totalSlides} gerado: ${outPath}`);
  }

  // Also generate single post card (using Slide 1 design with higher contrast)
  const singlePostSlide: SlideData = { ...slidesData[0], tag: "ARTIGO NO BLOG • COREAUTO CRM" };
  const singlePngBuffer = await renderSlideSvg(singlePostSlide, 1080, 1350);
  const singleOutPath = path.join(postDir, `single_post.png`);
  fs.writeFileSync(singleOutPath, singlePngBuffer);
  generatedFiles.push(singleOutPath);
  console.log(`  🖼️ Single Post Card gerado: ${singleOutPath}\n`);

  return generatedFiles;
}

// CLI Execution
if (process.argv[1]?.includes("generate_carousel_images")) {
  const targetSlug = process.argv[2] || "recuperar-orcamentos-parados-whatsapp-oficina";
  generateCarouselImagesForSlug(targetSlug);
}
