import fs from "node:fs";
import path from "node:path";
import { repurposePostToInstagram } from "./repurpose_blog_to_instagram";
import { generateCarouselImagesForSlug } from "./generate_carousel_images";
import { generateReelsVideoForSlug } from "./generate_reels_video";
import { publishFormatToInstagram } from "./instagram_publisher";

function copyDirectory(src: string, dest: string) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const target = args[0] || "content/posts/pt/recuperar-orcamentos-parados-whatsapp-oficina.md";
  const publishFlag = args.includes("--publish") || true;

  console.log("==================================================================");
  console.log(" 🚀 SUPER AGENTE INSTAGRAM - PUBLICAÇÃO PADRÃO (1 CARROSSEL + 1 REELS)");
  console.log("==================================================================");
  console.log(`📌 Post-alvo: ${target}`);
  console.log(`📡 Modo de publicação: DISPARAR 1 CARROSSEL + 1 REELS VIA META GRAPH API\n`);

  // Step 1: Repurposing
  console.log("👉 ETAPA 1/4: Repurposing do Artigo para Legendas e Roteiros...");
  const { slug, outDir } = repurposePostToInstagram(target);

  // Step 2: Render Carousel Slides
  console.log("👉 ETAPA 2/4: Renderizando Slides do Carrossel (4:5)...");
  const carouselFiles = await generateCarouselImagesForSlug(slug);

  // Step 3: Render Reels Video MP4 with ElevenLabs voiceover
  console.log("👉 ETAPA 3/4: Renderizando Vídeo de Reels 9:16 com Locução ElevenLabs...");
  const videoPath = await generateReelsVideoForSlug(slug);

  // Step 4: Synchronize assets to public web directory
  const publicOutDir = path.resolve(process.cwd(), "public", "instagram_posts", slug);
  console.log(`\n📁 Sincronizando mídias geradas para pasta pública: ${publicOutDir}...`);
  copyDirectory(outDir, publicOutDir);
  console.log("  ✅ Mídias estáticas sincronizadas com a web estática!\n");

  // Step 5: Publish exactly 2 Formats (1 Carousel + 1 Reels)
  console.log("👉 ETAPA 4/4: Disparando Publicação Real na Meta Graph API (1 Carrossel + 1 Reels)...");
  
  console.log("\n🎠 1/2: Publicando Carrossel de Slides (4:5)...");
  await publishFormatToInstagram(slug, "carousel", publishFlag);

  console.log("\n🎥 2/2: Publicando Vídeo de Reels (9:16 com voz ElevenLabs)...");
  await publishFormatToInstagram(slug, "reels", publishFlag);

  console.log("==================================================================");
  console.log(" 🎉 PUBLICAÇÃO PADRÃO DO INSTAGRAM FINALIZADA COM SUCESSO!");
  console.log(" 📌 Formatos Publicados: 1 Carrossel (4:5) + 1 Reels Vídeo (9:16)");
  console.log("==================================================================");
}

main().catch(console.error);
