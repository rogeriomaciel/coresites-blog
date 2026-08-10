import fs from "node:fs";
import path from "node:path";
import https from "node:https";

function loadEnv(): Record<string, string> {
  const envVars: Record<string, string> = {};
  const cwd = process.cwd();
  const envPaths = [
    path.join(cwd, ".env"),
    path.join(cwd, "core", ".env"),
    path.join(cwd, "..", ".env"),
  ];

  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
          const [key, ...rest] = trimmed.split("=");
          const val = rest.join("=").trim().replace(/^['"]|['"]$/g, "");
          if (!envVars[key.trim()]) {
            envVars[key.trim()] = val;
          }
        }
      }
    }
  }

  return envVars;
}

// ElevenLabs API integration for ultra-realistic human voices
async function generateElevenLabsAudio(text: string, outputPath: string, apiKey: string, voiceId?: string): Promise<boolean> {
  // Voice ID default: 'pNInz6ovD84HqWXCXYlh' (Adam - Deep/Professional) or user provided
  const targetVoiceId = voiceId || process.env.ELEVENLABS_VOICE_ID || "pNInz6ovD84HqWXCXYlh";
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${targetVoiceId}`;

  const payload = JSON.stringify({
    text: text,
    model_id: "eleven_multilingual_v2",
    voice_settings: {
      stability: 0.5,
      similarity_boost: 0.75,
      style: 0.0,
      use_speaker_boost: true
    }
  });

  console.log(`🎙️ Gerando locução humana ultra-realista via ElevenLabs (Voice ID: ${targetVoiceId})...`);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey
      },
      body: payload
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`❌ Erro ElevenLabs API (${response.status}): ${errText}`);
      return false;
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(outputPath, audioBuffer);
    console.log(`✨ Áudio da ElevenLabs salvo com sucesso em: ${outputPath}`);
    return true;
  } catch (err) {
    console.error("❌ Erro ao conectar com ElevenLabs:", err);
    return false;
  }
}

// Fallback Google TTS
async function generateGoogleTtsAudio(text: string, outputPath: string, lang = "pt-BR"): Promise<void> {
  const cleanStr = text.replace(/[*_#`~]/g, "").trim();
  const chunks: string[] = [];
  const sentences = cleanStr.match(/[^.!?]+[.!?]+/g) || [cleanStr];

  for (const s of sentences) {
    let current = s.trim();
    while (current.length > 0) {
      if (current.length <= 150) {
        chunks.push(current);
        break;
      }
      const spaceIdx = current.lastIndexOf(" ", 150);
      const splitAt = spaceIdx > 0 ? spaceIdx : 150;
      chunks.push(current.substring(0, splitAt).trim());
      current = current.substring(splitAt).trim();
    }
  }

  const buffers: Buffer[] = [];

  for (const chunk of chunks) {
    if (!chunk) continue;
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=${lang}&client=tw-ob`;

    const chunkBuffer = await new Promise<Buffer>((resolve, reject) => {
      https.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
        if (res.statusCode !== 200) {
          return reject(new Error(`TTS status ${res.statusCode}`));
        }
        const data: Uint8Array[] = [];
        res.on("data", (c) => data.push(c));
        res.on("end", () => resolve(Buffer.concat(data)));
        res.on("error", reject);
      }).on("error", reject);
    });

    buffers.push(chunkBuffer);
    await new Promise((r) => setTimeout(r, 100));
  }

  fs.writeFileSync(outputPath, Buffer.concat(buffers));
  console.log(`🎙️ Áudio de narração TTS fallback salvo em: ${outputPath}`);
}

export async function downloadTtsAudio(text: string, outputPath: string, lang = "pt-BR"): Promise<void> {
  const env = loadEnv();
  const elevenKey = env.ELEVENLABS_API_KEY || process.env.ELEVENLABS_API_KEY;
  const elevenVoice = env.ELEVENLABS_VOICE_ID || process.env.ELEVENLABS_VOICE_ID;

  if (elevenKey) {
    const success = await generateElevenLabsAudio(text, outputPath, elevenKey, elevenVoice);
    if (success) return;
    console.log("⚠️ Fallback para o motor de áudio padrão...");
  }

  await generateGoogleTtsAudio(text, outputPath, lang);
}
