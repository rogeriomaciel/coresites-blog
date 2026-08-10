import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execSync } from "node:child_process";
import matter from "gray-matter";
import { downloadTtsAudio } from "./tts_helper";

export interface VeoReelsPipelineOptions {
  markdownPath: string;
  watermarkLogoPath?: string;
  bgMusicPath?: string;
  bgMusicVolume?: number;
}

function cleanText(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_#`~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseMarkdownPost(filePath: string) {
  const content = fs.readFileSync(filePath, "utf-8");
  const parsed = matter(content);

  let title = parsed.data.title || path.basename(filePath, ".md");
  if (typeof title === "string") {
    title = title.replace(/^>-|\s+/g, " ").trim();
  }

  const excerpt =
    parsed.data.excerpt ||
    parsed.data.meta_description ||
    "Descubra como otimizar sua oficina mecânica com inteligência artificial.";
  const slug = parsed.data.slug || path.basename(filePath, ".md");

  const lines = parsed.content.split("\n");
  const paragraphs: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (
      trimmed.length > 35 &&
      !trimmed.startsWith("#") &&
      !trimmed.startsWith("<") &&
      !trimmed.startsWith("![") &&
      !trimmed.startsWith(">")
    ) {
      paragraphs.push(cleanText(trimmed));
    }
  }

  return { title, slug, excerpt, paragraphs, rawContent: content };
}

function getAudioDuration(audioPath: string): number {
  try {
    const cmd = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${audioPath}"`;
    const stdout = execSync(cmd, { encoding: "utf-8" }).trim();
    const duration = parseFloat(stdout);
    if (!isNaN(duration) && duration > 0) return duration;
  } catch (err) {
    console.warn("⚠️ Não foi possível medir áudio com ffprobe.");
  }
  return 27.5;
}

function splitIntoShortChunks(text: string, maxWordsPerChunk = 8): string[] {
  const words = text.split(" ");
  const chunks: string[] = [];
  let currentChunk: string[] = [];

  for (const word of words) {
    currentChunk.push(word);
    if (currentChunk.length >= maxWordsPerChunk || word.endsWith(".") || word.endsWith("!") || word.endsWith("?")) {
      chunks.push(currentChunk.join(" "));
      currentChunk = [];
    }
  }
  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(" "));
  }
  return chunks;
}

function wrapTextForAss(text: string, maxCharsPerLine = 26): string {
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

  const limitedLines = lines.slice(0, 3);
  return limitedLines.join("\\N");
}

function createAssSubtitleFile(
  assPath: string,
  totalDuration: number,
  subtitleItems: { start: number; end: number; text: string }[]
) {
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const cs = Math.floor((seconds % 1) * 100);
    const pad = (n: number, z = 2) => String(n).padStart(z, "0");
    return `${hrs}:${pad(mins)}:${pad(secs)}.${pad(cs)}`;
  };

  let assContent = `[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,54,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,1,0,0,0,100,100,0,0,1,3,2,2,80,80,260,1
Style: Highlight,Arial,58,&H0000FFFF,&H000000FF,&H00000000,&H80000000,1,0,0,0,100,100,0,0,1,3,2,2,80,80,260,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  for (const sub of subtitleItems) {
    const isCta = sub.text.toLowerCase().includes("comente") || sub.text.toLowerCase().includes("link");
    const styleName = isCta ? "Highlight" : "Default";
    const formattedText = wrapTextForAss(sub.text, 26);
    assContent += `Dialogue: 0,${formatTime(sub.start)},${formatTime(sub.end)},${styleName},,0,0,0,,${formattedText}\n`;
  }

  fs.writeFileSync(assPath, assContent, "utf-8");
  console.log(` ✅ Legendas no rodapé (max 2-3 linhas) geradas em: ${assPath}`);
}

async function getAccessToken(keyFilePath: string) {
  const keyContent = JSON.parse(fs.readFileSync(keyFilePath, "utf-8"));
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claimSet = {
    iss: keyContent.client_email,
    scope: "https://www.googleapis.com/auth/cloud-platform",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const enc = (obj: object) =>
    Buffer.from(JSON.stringify(obj)).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

  const unsignedToken = `${enc(header)}.${enc(claimSet)}`;
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(unsignedToken);
  const signature = signer
    .sign(keyContent.private_key, "base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${unsignedToken}.${signature}`,
    }),
  });

  const data = (await response.json()) as any;
  return { accessToken: data.access_token, projectId: keyContent.project_id };
}

// =============================================================================
// ⛔ GERAÇÃO DE VÍDEO COM VERTEX AI (GOOGLE VEO 2.0) — DESATIVADA E TRAVADA
// Motivo: custo elevado da API Vertex AI / Veo 2.0.
// NÃO remova este bloco sem revisão e autorização explícita do responsável.
// O pipeline continua funcional usando o fallback de fundo estático (cor sólida).
// Data de bloqueio: 2026-07-28
// =============================================================================
async function generateAndDownloadVeoVideo(
  _prompt: string,
  _outputPath: string,
  _durationSeconds = 8
): Promise<string> {
  throw new Error(
    "[BLOQUEADO] Geração de vídeo via Google Veo 2.0 / Vertex AI está DESATIVADA.\n" +
    "Motivo: custo elevado. O pipeline usará o fallback de fundo estático.\n" +
    "Para reativar, restaure a implementação original em generate_veo_reels.ts."
  );
}

export async function runVeoReelsPipeline(options: VeoReelsPipelineOptions) {
  const { title, slug, excerpt, paragraphs } = parseMarkdownPost(options.markdownPath);
  const outputDir = path.join(process.cwd(), `instagram_posts/${slug}`);
  const publicDir = path.join(process.cwd(), `public/instagram_posts/${slug}`);
  fs.mkdirSync(outputDir, { recursive: true });
  fs.mkdirSync(publicDir, { recursive: true });

  console.log(`\n==================================================`);
  console.log(`🎬 REELS GOOGLE VEO 2.0 (MULTI-CENA LONGA 16S + LEGENDAS)`);
  console.log(`📌 Post: "${title}"`);
  console.log(`==================================================\n`);

  // Build narration using PAIN-FIRST framework (Regra #0 do write-article):
  // Hook = dor/frustração do dono → Agitação → Custo da inércia → Solução → CTA
  // O CoreAutoCRM aparece como CONSEQUÊNCIA, nunca como abertura.
  const p1 = paragraphs[0] || excerpt;
  const p2 = paragraphs[1] || "Cada hora que passa sem resolver isso é receita que vai embora. E amanhã o ciclo se repete.";

  // Extract a pain-oriented hook from title (remove product mentions from opening)
  const painHook = title
    .replace(/CoreAutoCRM/gi, "automação")
    .replace(/IA\b/gi, "tecnologia")
    .replace(/Inteligência Artificial/gi, "tecnologia");

  const spokenPhrases = [
    `Você já parou pra calcular quanto dinheiro sua oficina perde por semana com isso? ${painHook}.`,
    p1,
    p2,
    "Enquanto você lê isso, tem carro parado no seu pátio esperando resposta. Isso tem solução.",
    "Assiste até o fim e descobre como resolver. Acessa o link na bio pro artigo completo!",
  ];

  const narrationScript = spokenPhrases.join(" ");

  const audioPath = path.join(outputDir, "reels_narration.mp3");
  if (fs.existsSync(audioPath)) {
    fs.unlinkSync(audioPath);
  }
  console.log(`🎙️ 1/3 - Gerando locução humana via ElevenLabs para este post...`);
  await downloadTtsAudio(narrationScript, audioPath);

  const audioDuration = getAudioDuration(audioPath);
  console.log(`⏱️ Duração exata da locução ElevenLabs: ${audioDuration.toFixed(2)}s`);

  // Break spoken phrases into short sub-phrase chunks (max 8 words)
  const allSubChunks: string[] = [];
  for (const phrase of spokenPhrases) {
    const chunks = splitIntoShortChunks(phrase, 8);
    allSubChunks.push(...chunks);
  }

  const totalChars = allSubChunks.reduce((sum, chunk) => sum + chunk.length, 0);

  let currentStart = 0.0;
  const subtitleItems = allSubChunks.map((chunk) => {
    const chunkDuration = (chunk.length / totalChars) * audioDuration;
    const start = currentStart;
    const end = Math.min(audioDuration, currentStart + chunkDuration);
    currentStart = end;
    return { start, end, text: chunk };
  });

  const assPath = path.join(outputDir, "subtitles.ass");
  createAssSubtitleFile(assPath, audioDuration, subtitleItems);

  // Generate 2 distinct Google Veo 2.0 8-second scenes for a total of 16s multi-scene background video
  const scene1Path = path.join(outputDir, "veo_scene1.mp4");
  const scene2Path = path.join(outputDir, "veo_scene2.mp4");
  const combinedVeoPath = path.join(outputDir, "veo_background.mp4");

  const prompt1 = `Cinematic 4K 9:16 vertical video of a thoughtful male auto repair shop manager sitting at an office desk with growth charts in a high-tech workshop, neon lighting, smooth camera movement`;
  const prompt2 = `Cinematic 4K 9:16 vertical video of a smiling successful mechanic shop owner standing in front of luxury sports cars on lifts holding a smartphone with approved work orders, cyan neon lighting, realistic movement`;

  if (!fs.existsSync(combinedVeoPath)) {
    console.log(`🎥 2/3 - Gerando 2 Cenas de 8 segundos no Google Veo 2.0 para eliminar loops (Total 16s)...`);
    try {
      if (!fs.existsSync(scene1Path)) {
        await generateAndDownloadVeoVideo(prompt1, scene1Path, 8);
      }
      if (!fs.existsSync(scene2Path)) {
        await generateAndDownloadVeoVideo(prompt2, scene2Path, 8);
      }

      // Concat Scene 1 + Scene 2 via FFmpeg into combinedVeoPath
      const concatList = path.join(outputDir, "veo_scenes_concat.txt");
      fs.writeFileSync(concatList, `file '${scene1Path}'\nfile '${scene2Path}'`, "utf-8");
      const concatCmd = `ffmpeg -y -f concat -safe 0 -i "${concatList}" -c:v libx264 -pix_fmt yuv420p -r 30 "${combinedVeoPath}"`;
      execSync(concatCmd, { stdio: "inherit" });
      console.log(`  ✅ Vídeo de fundo multi-cena (16s) gerado com sucesso!`);
    } catch (err: any) {
      console.warn("⚠️ Aviso no Veo 2.0 (usando fallback dinâmico):", err.message);
    }
  }

  // Paths
  const outroVideoPath = path.join(process.cwd(), "videos/final_coreautocrm.mp4");
  const finalVideoPath = path.join(outputDir, "reels_video.mp4");
  const veoFinalVideoPath = path.join(outputDir, "reels_veo_final.mp4");
  const publicVideoPath = path.join(publicDir, "reels_video.mp4");

  const logoPath = options.watermarkLogoPath || path.join(process.cwd(), "public/logo-coreauto-horizontal.png");
  const bgMusicPath = options.bgMusicPath || path.join(process.cwd(), "videos/Click_Magnet_Modern_Marketing_Groove.mp3");
  const bgMusicVolume = options.bgMusicVolume ?? 0.10;

  const hasLogo = fs.existsSync(logoPath);
  const hasBgMusic = fs.existsSync(bgMusicPath);

  let outroDuration = 0;
  if (fs.existsSync(outroVideoPath)) {
    outroDuration = getAudioDuration(outroVideoPath);
  }
  const totalDuration = audioDuration + outroDuration;

  console.log(`\n🎬 3/3 - Renderizando Reels final (${totalDuration.toFixed(2)}s)...`);
  if (hasLogo) console.log(` 🏷️ Marca d'água: ${path.basename(logoPath)}`);
  if (hasBgMusic) console.log(` 🎵 Trilha de Fundo: ${path.basename(bgMusicPath)} (Volume: ${bgMusicVolume})`);

  // Build Main Visual
  const filterParts: string[] = [];
  const inputArgs: string[] = [];

  if (fs.existsSync(combinedVeoPath)) {
    inputArgs.push(`-stream_loop -1 -i "${combinedVeoPath}"`);
  } else {
    inputArgs.push(`-f lavfi -i color=c=0x070a12:s=1080x1920:r=30`);
  }

  let currentInputIdx = 1;
  let logoInputIdx = -1;

  if (hasLogo) {
    logoInputIdx = currentInputIdx++;
    inputArgs.push(`-i "${logoPath}"`);
  }

  filterParts.push(`[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920[bg]`);
  let currentVideoPad = "bg";

  if (hasLogo) {
    filterParts.push(`[${logoInputIdx}:v]scale=200:-1[logo]`);
    filterParts.push(`[${currentVideoPad}][logo]overlay=x=main_w-overlay_w-50:y=60[bg_logo]`);
    currentVideoPad = "bg_logo";
  }

  filterParts.push(`[${currentVideoPad}]subtitles='${assPath.replace(/'/g, "'\\''")}'[v_main]`);

  const tempMainVisualPath = path.join(outputDir, "temp_main_visual.mp4");
  const ffmpegMainVisualCmd = [
    `ffmpeg -y`,
    ...inputArgs,
    `-filter_complex "${filterParts.join("; ")}"`,
    `-map "[v_main]"`,
    `-c:v libx264 -pix_fmt yuv420p -r 30 -t ${audioDuration.toFixed(2)}`,
    `"${tempMainVisualPath}"`,
  ].join(" ");

  execSync(ffmpegMainVisualCmd, { stdio: "inherit" });

  // Concat Visual
  const tempFullVisualPath = path.join(outputDir, "temp_full_visual.mp4");

  if (fs.existsSync(outroVideoPath)) {
    const tempOutroPath = path.join(outputDir, "temp_outro_scaled.mp4");
    const ffmpegOutroCmd = `ffmpeg -y -i "${outroVideoPath}" -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920" -r 30 -c:v libx264 -pix_fmt yuv420p -an "${tempOutroPath}"`;
    execSync(ffmpegOutroCmd, { stdio: "inherit" });

    const ffmpegConcatCmd = [
      `ffmpeg -y`,
      `-i "${tempMainVisualPath}"`,
      `-i "${tempOutroPath}"`,
      `-filter_complex "[0:v][1:v]concat=n=2:v=1:a=0[v]"`,
      `-map "[v]"`,
      `-c:v libx264 -pix_fmt yuv420p -r 30`,
      `"${tempFullVisualPath}"`,
    ].join(" ");

    execSync(ffmpegConcatCmd, { stdio: "inherit" });
    if (fs.existsSync(tempOutroPath)) fs.unlinkSync(tempOutroPath);
  } else {
    fs.renameSync(tempMainVisualPath, tempFullVisualPath);
  }
  if (fs.existsSync(tempMainVisualPath)) fs.unlinkSync(tempMainVisualPath);

  // Mix Audio
  const finalAudioArgs: string[] = [`-i "${tempFullVisualPath}"`, `-i "${audioPath}"`];
  const audioFilterParts: string[] = [];

  if (hasBgMusic) {
    finalAudioArgs.push(`-stream_loop -1 -i "${bgMusicPath}"`);
    const fadeStart = Math.max(0, totalDuration - 1.5).toFixed(2);
    audioFilterParts.push(`[1:a]apad=whole_dur=${totalDuration.toFixed(2)}[voice_padded]`);
    audioFilterParts.push(`[2:a]volume=${bgMusicVolume},afade=t=out:st=${fadeStart}:d=1.5[bg_music]`);
    audioFilterParts.push(`[voice_padded][bg_music]amix=inputs=2:duration=first[a_final]`);
  } else {
    audioFilterParts.push(`[1:a]apad=whole_dur=${totalDuration.toFixed(2)}[a_final]`);
  }

  const ffmpegFinalCmd = [
    `ffmpeg -y`,
    ...finalAudioArgs,
    `-filter_complex "${audioFilterParts.join("; ")}"`,
    `-map 0:v`,
    `-map "[a_final]"`,
    `-c:v copy`,
    `-c:a aac -b:a 192k -t ${totalDuration.toFixed(2)}`,
    `"${finalVideoPath}"`,
  ].join(" ");

  execSync(ffmpegFinalCmd, { stdio: "inherit" });

  fs.copyFileSync(finalVideoPath, veoFinalVideoPath);
  fs.copyFileSync(finalVideoPath, publicVideoPath);

  // 🏷️ YouTube Shorts Export (mesmo arquivo — formato 9:16 é idêntico)
  // Legenda, proporção e duração já são compatíveis com YouTube Shorts nativamente.
  const youtubeDir = path.join(process.cwd(), `youtube_shorts/${slug}`);
  fs.mkdirSync(youtubeDir, { recursive: true });
  const youtubeVideoPath = path.join(youtubeDir, "shorts_video.mp4");
  fs.copyFileSync(finalVideoPath, youtubeVideoPath);

  // Gerar legenda para YouTube Shorts (CTA diferente do Instagram)
  const youtubeCaptionPath = path.join(youtubeDir, "caption_shorts.txt");
  const youtubeCaption = `${title}\n\n${excerpt}\n\n⬇️ Assiste até o fim!\n\n#OficinaMecanica #GestaoOficina #CoreAutoCRM #AutomacaoOficina #Shorts`;
  fs.writeFileSync(youtubeCaptionPath, youtubeCaption, "utf-8");

  console.log(`\n🏷️ YouTube Shorts exportado automaticamente!`);
  console.log(`📁 Arquivo: ${youtubeVideoPath}`);
  console.log(`📝 Legenda: ${youtubeCaptionPath}\n`);

  console.log(`\n🎉 REELS GOOGLE VEO 2.0 MULTI-CENA LONGA (16S) FINALIZADO COM SUCESSO!`);
  console.log(`📁 Arquivo gerado: ${finalVideoPath}`);
  console.log(`🌐 Arquivo copiado para pasta pública: ${publicVideoPath}\n`);
}

// ⛔ CLI DESATIVADO — Vertex AI / Veo 2.0 está bloqueado por custo.
// A execução do pipeline continua disponível mas usará o fallback de fundo estático.
// if (import.meta.url === `file://${process.argv[1]}`) {
//   const postFile = process.argv[2] || "content/posts/pt/como-oficina-faturar-mais-tempo-livre.md";
//   runVeoReelsPipeline({ markdownPath: postFile }).catch(console.error);
// }
