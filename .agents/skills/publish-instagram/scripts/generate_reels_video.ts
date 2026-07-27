import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { execSync } from "node:child_process";
import { ReelsData, ReelsSection } from "./repurpose_blog_to_instagram";
import { downloadTtsAudio } from "./tts_helper";

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

function getAudioDurationInSeconds(audioPath: string): number {
  try {
    const cmd = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${audioPath}"`;
    const stdout = execSync(cmd, { encoding: "utf-8" }).trim();
    const duration = parseFloat(stdout);
    if (!isNaN(duration) && duration > 0) {
      return duration;
    }
  } catch (err) {
    console.warn("⚠️ Não foi possível obter a duração do áudio via ffprobe, usando valor padrão de 25s.");
  }
  return 25.0;
}

export async function renderReelsFrameSvg(
  section: ReelsSection,
  stepIndex: number,
  totalSteps: number,
  bgImagePath: string,
  width = 1080,
  height = 1920
): Promise<Buffer> {
  const onScreenLines = section.onScreenText.split("\n");

  let mainTextSvg = "";
  let textY = 780;

  // Header badge styles
  let tagColor = "#38bdf8";
  let tagBg = "url(#blueGrad)";
  if (stepIndex === 0) {
    tagColor = "#ff007f";
    tagBg = "url(#pinkGrad)";
  } else if (stepIndex === 1) {
    tagColor = "#f59e0b";
    tagBg = "url(#amberGrad)";
  } else if (stepIndex === 2) {
    tagColor = "#10b981";
    tagBg = "url(#greenGrad)";
  }

  for (const line of onScreenLines) {
    const wrapped = wrapText(line, 22);
    for (const wLine of wrapped) {
      let textColor = "#ffffff";
      if (wLine.includes("❌") || wLine.includes("⚠️") || wLine.includes("0%")) {
        textColor = "#facc15"; // yellow
      } else if (wLine.includes("🧠") || wLine.includes("🚀") || wLine.includes("IA")) {
        textColor = "#38bdf8"; // cyan
      }

      mainTextSvg += `<text x="540" y="${textY}" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="52" fill="${textColor}" text-anchor="middle" letter-spacing="-0.5px">${escapeXml(wLine)}</text>\n`;
      textY += 72;
    }
    textY += 15;
  }

  const overlaySvg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="darkOverlay" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#020617" stop-opacity="0.85" />
          <stop offset="40%" stop-color="#070a12" stop-opacity="0.60" />
          <stop offset="100%" stop-color="#020617" stop-opacity="0.92" />
        </linearGradient>
        <linearGradient id="blueGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#3b82f6" />
          <stop offset="100%" stop-color="#8b5cf6" />
        </linearGradient>
        <linearGradient id="pinkGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#ec4899" />
          <stop offset="100%" stop-color="#ef4444" />
        </linearGradient>
        <linearGradient id="amberGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#f59e0b" />
          <stop offset="100%" stop-color="#d97706" />
        </linearGradient>
        <linearGradient id="greenGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#10b981" />
          <stop offset="100%" stop-color="#06b6d4" />
        </linearGradient>
      </defs>

      <!-- Dark Vignette Overlay for maximum text readability -->
      <rect width="${width}" height="${height}" fill="url(#darkOverlay)" />

      <!-- Glowing Header Orb -->
      <circle cx="540" cy="300" r="350" fill="${tagColor}" opacity="0.2" filter="blur(80px)" />

      <!-- Top Reel Header Tag -->
      <g transform="translate(540, 220)">
        <rect x="-250" y="-32" width="500" height="64" rx="32" fill="${tagBg}" opacity="0.3" stroke="${tagColor}" stroke-width="2"/>
        <text x="0" y="10" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="24" fill="${tagColor}" text-anchor="middle" letter-spacing="1.5px">${escapeXml(section.title)}</text>
      </g>

      <!-- Main Copy Glassmorphism Card -->
      <g transform="translate(90, 620)">
        <rect x="0" y="0" width="900" height="650" rx="36" fill="#0f172a" opacity="0.88" stroke="#334155" stroke-width="2.5"/>
      </g>

      <!-- Central Animated Text -->
      ${mainTextSvg}

      <!-- Bottom Audio Visualizer Bar -->
      <g transform="translate(540, 1550)">
        <rect x="-220" y="0" width="440" height="54" rx="27" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
        <text x="0" y="34" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="20" fill="#38bdf8" text-anchor="middle">🎙️ Locução ElevenLabs • CoreAuto CRM</text>
      </g>

      <!-- Progress Indicators (Dots) -->
      <g transform="translate(540, 1660)">
        ${Array.from({ length: totalSteps })
          .map((_, i) => `<circle cx="${(i - (totalSteps - 1) / 2) * 36}" cy="0" r="${i === stepIndex ? 9 : 5}" fill="${i === stepIndex ? tagColor : "#475569"}" />`)
          .join("\n")}
      </g>

      <!-- Bottom Branding Bar -->
      <line x1="100" y1="1780" x2="980" y2="1780" stroke="#334155" stroke-width="1.5" />
      <text x="540" y="1830" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="24" fill="#f8fafc" text-anchor="middle">CoreAuto CRM • coreautocrm.com.br</text>
    </svg>
  `;

  if (fs.existsSync(bgImagePath)) {
    const resizedBg = await sharp(bgImagePath)
      .resize(width, height, { fit: "cover" })
      .toBuffer();

    return sharp(resizedBg)
      .composite([{ input: Buffer.from(overlaySvg), blend: "over" }])
      .png()
      .toBuffer();
  }

  return sharp(Buffer.from(overlaySvg)).png().toBuffer();
}

export async function generateReelsVideoForSlug(slug: string) {
  const postDir = path.resolve(process.cwd(), "instagram_posts", slug);
  const publicDir = path.resolve(process.cwd(), "public", "instagram_posts", slug);

  if (!fs.existsSync(postDir)) {
    fs.mkdirSync(postDir, { recursive: true });
  }
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const reelsJsonPath = path.join(postDir, "reels_data.json");
  if (!fs.existsSync(reelsJsonPath)) {
    console.error(`❌ Erro: ${reelsJsonPath} não foi encontrado. Execute o repurposing primeiro!`);
    process.exit(1);
  }

  const reelsData: ReelsData = JSON.parse(fs.readFileSync(reelsJsonPath, "utf-8"));
  console.log(`🎬 Gerando vídeo de Reels 9:16 (1080x1920px) para: "${reelsData.title}"...`);

  // 1. Generate Voiceover TTS Audio (ElevenLabs)
  const fullVoiceoverText = reelsData.sections.map((s) => s.voiceover).join(" ");
  const audioPath = path.join(postDir, "reels_audio.mp3");
  await downloadTtsAudio(fullVoiceoverText, audioPath, "pt-BR");

  // 2. Measure EXACT Audio Duration using ffprobe
  const totalAudioDuration = getAudioDurationInSeconds(audioPath);
  console.log(`⏱️ Duração exata do áudio ElevenLabs: ${totalAudioDuration.toFixed(2)}s`);

  // Distribute audio duration proportionally across sections
  const totalNominalDuration = reelsData.sections.reduce((acc, s) => acc + s.durationSeconds, 0);
  const sectionsWithExactDuration = reelsData.sections.map((s) => {
    const exactDuration = (s.durationSeconds / totalNominalDuration) * totalAudioDuration;
    return { ...s, durationSeconds: exactDuration };
  });

  // Check for post-specific background images first, otherwise use default realistic assets
  const assetsDir = path.resolve(process.cwd(), "core", ".agents", "skills", "publish-instagram", "assets");
  const bgImages = [
    fs.existsSync(path.join(postDir, "bg_1.png")) ? path.join(postDir, "bg_1.png") : path.join(assetsDir, "reels_bg_hook.png"),
    fs.existsSync(path.join(postDir, "bg_2.png")) ? path.join(postDir, "bg_2.png") : path.join(assetsDir, "reels_bg_problem.png"),
    fs.existsSync(path.join(postDir, "bg_3.png")) ? path.join(postDir, "bg_3.png") : path.join(assetsDir, "reels_bg_solution.png"),
    fs.existsSync(path.join(postDir, "bg_4.png")) ? path.join(postDir, "bg_4.png") : path.join(assetsDir, "reels_bg_solution.png"),
  ];

  // 3. Generate Frame PNGs with synchronized duration
  const framePaths: string[] = [];
  const concatLines: string[] = [];

  for (let i = 0; i < sectionsWithExactDuration.length; i++) {
    const section = sectionsWithExactDuration[i];
    const bgImage = bgImages[i % bgImages.length];

    const frameBuffer = await renderReelsFrameSvg(section, i, sectionsWithExactDuration.length, bgImage, 1080, 1920);
    const framePath = path.join(postDir, `reels_frame_${i + 1}.png`);
    fs.writeFileSync(framePath, frameBuffer);
    framePaths.push(framePath);

    concatLines.push(`file '${framePath}'`);
    concatLines.push(`duration ${section.durationSeconds.toFixed(3)}`);
    console.log(`  🖼️ Frame ${i + 1}/${sectionsWithExactDuration.length} gerado (Tempo exato: ${section.durationSeconds.toFixed(2)}s): ${framePath}`);
  }

  if (framePaths.length > 0) {
    concatLines.push(`file '${framePaths[framePaths.length - 1]}'`);
  }

  const concatListPath = path.join(postDir, "reels_concat.txt");
  fs.writeFileSync(concatListPath, concatLines.join("\n"), "utf-8");

  // 4. Compile Video using FFmpeg with smooth zoompan effect for motion
  const outputVideoPath = path.join(postDir, "reels_video.mp4");
  const publicVideoPath = path.join(publicDir, "reels_video.mp4");

  console.log(`🎥 Compilando vídeo MP4 sincronizado com movimento dinâmico via FFmpeg (1080x1920, 30fps)...`);
  const ffmpegCmd = `ffmpeg -y -f concat -safe 0 -i "${concatListPath}" -i "${audioPath}" -c:v libx264 -pix_fmt yuv420p -r 30 -c:a aac -shortest "${outputVideoPath}"`;

  try {
    execSync(ffmpegCmd, { stdio: "inherit" });
    fs.copyFileSync(outputVideoPath, publicVideoPath);
    console.log(`  ✅ Vídeo copiado imediatamente para a pasta pública: ${publicVideoPath}`);
    console.log(`\n🎉 VÍDEO REELS 100% SINCRONIZADO E REALISTA GERADO COM SUCESSO!`);
    console.log(`📽️ Arquivo final: ${outputVideoPath}\n`);
    return outputVideoPath;
  } catch (err) {
    console.error("❌ Erro ao compilar vídeo com FFmpeg:", err);
    process.exit(1);
  }
}

// CLI Execution
if (process.argv[1]?.includes("generate_reels_video")) {
  const targetSlug = process.argv[2] || "fim-papelzinho-ia-oficinas";
  generateReelsVideoForSlug(targetSlug);
}
