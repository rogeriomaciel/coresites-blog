import fs from "node:fs";
import path from "node:path";
import { repurposePostToInstagram } from "./repurpose_blog_to_instagram";
import { generateCarouselImagesForSlug } from "./generate_carousel_images";
import { runVeoReelsPipeline } from "./generate_veo_reels";
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
  const target = args[0] || "content/posts/pt/como-usar-ia-na-minha-oficina.md";
  const publishFlag = args.includes("--publish");

  console.log("==================================================================");
  console.log(" 🚀 SUPER AGENTE INSTAGRAM - VEO 2.0 + ELEVENLABS + CARROSSEL");
  console.log("==================================================================");
  console.log(`📌 Post-alvo: ${target}`);
  console.log(`📡 Modo de publicação: 1 CARROSSEL (4:5) + 1 REELS COM VEO 2.0 (9:16)\n`);

  // Step 1: Repurposing
  console.log("👉 ETAPA 1/4: Repurposing do Artigo para Legendas e Roteiros...");
  const { slug, outDir } = repurposePostToInstagram(target);

  // Step 2: Render Carousel Slides
  console.log("👉 ETAPA 2/4: Renderizando Slides do Carrossel (4:5)...");
  const carouselFiles = await generateCarouselImagesForSlug(slug);

  // Step 3: Render Reels Video MP4 (Google Veo 2.0 + ElevenLabs + Spoken Subtitles 72pt + Outro Signature)
  console.log("👉 ETAPA 3/4: Renderizando Vídeo Reels 9:16 (Google Veo 2.0 + ElevenLabs + Legendas + Outro)...");
  await runVeoReelsPipeline({ markdownPath: target });

  // Step 4: Synchronize assets to public web directory
  const publicOutDir = path.resolve(process.cwd(), "public", "instagram_posts", slug);
  console.log(`\n📁 Sincronizando mídias geradas para pasta pública: ${publicOutDir}...`);
  copyDirectory(outDir, publicOutDir);
  console.log("  ✅ Mídias sincronizadas com o diretório público estático!\n");

  // Step 5: Publish if --publish flag is present
  if (publishFlag) {
    console.log("👉 ETAPA 4/4: Disparando Publicação Real na Meta Graph API (1 Carrossel + 1 Reels)...");
    
    console.log("\n🎠 1/2: Publicando Carrossel de Slides (4:5)...");
    await publishFormatToInstagram(slug, "carousel", true);

    console.log("\n🎥 2/2: Publicando Vídeo de Reels (9:16 com Veo 2.0 + ElevenLabs)...");
    await publishFormatToInstagram(slug, "reels", true);
  } else {
    console.log("ℹ️ Modo apenas geração local concluído (passe '--publish' para disparar na Meta Graph API).");
  }

  console.log("==================================================================");
  console.log(" 🎉 PROCESSAMENTO DO INSTAGRAM CONCLUÍDO COM SUCESSO!");
  console.log("==================================================================");
}

main().catch(console.error);
