import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

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

export function uploadAssetsToVps(slug: string) {
  const env = loadEnv();
  const vpsIp = env.DEPLOY_VPS_IP;
  const user = env.DEPLOY_USER;
  const password = env.DEPLOY_USERPASSWORD;
  const remotePath = env.DEPLOY_PATH || "/home/rogeriomaciel/coreautoblog";

  if (!vpsIp || !user || !password) {
    console.log("⚠️ Credenciais SSH para VPS não encontradas no .env. Pulando upload remoto por SSH.");
    return;
  }

  console.log(`📡 Sincronizando mídias do post '${slug}' com a VPS em https://blog.coreautocrm.com.br...`);
  const localDir = path.resolve(process.cwd(), "public", "instagram_posts");

  const cmd = `sshpass -p "${password}" ssh -o StrictHostKeyChecking=no ${user}@${vpsIp} "mkdir -p ${remotePath}/instagram_posts" && sshpass -p "${password}" rsync -avz -e "ssh -o StrictHostKeyChecking=no" "${localDir}/" ${user}@${vpsIp}:${remotePath}/instagram_posts/`;

  try {
    execSync(cmd, { stdio: "ignore" });
    console.log("  ✅ Mídias sincronizadas no servidor remoto de produção!");
  } catch (err) {
    console.warn("⚠️ Aviso ao sincronizar mídias via SSH:", err instanceof Error ? err.message : err);
  }
}

async function apiPost(url: string, params: Record<string, string>): Promise<any> {
  const body = new URLSearchParams(params);
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const data = await res.json() as any;
  if (!res.ok || data.error) {
    throw new Error(data.error?.message || JSON.stringify(data));
  }
  return data;
}

async function apiGet(url: string): Promise<any> {
  const res = await fetch(url);
  const data = await res.json() as any;
  if (!res.ok || data.error) {
    throw new Error(data.error?.message || JSON.stringify(data));
  }
  return data;
}

async function waitForContainerReady(creationId: string, accessToken: string, maxAttempts = 15): Promise<boolean> {
  console.log(`  ⏳ Aguardando processamento da mídia pela Meta (Container ID: ${creationId})...`);
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    await new Promise((r) => setTimeout(r, 4000));
    const statusUrl = `https://graph.facebook.com/v19.0/${creationId}?fields=status_code,status&access_token=${accessToken}`;
    try {
      const res = await apiGet(statusUrl);
      const code = res.status_code || res.status;
      console.log(`     📌 Status (${attempt}/${maxAttempts}): ${code}`);

      if (code === "FINISHED") {
        return true;
      } else if (code === "ERROR" || code === "EXPIRED") {
        throw new Error(`Processamento do container falhou com status: ${code}`);
      }
    } catch (err) {
      console.warn(`     ⚠️ Tentativa ${attempt}: aguardando processamento da Meta...`);
    }
  }
  return false;
}

export async function publishFormatToInstagram(
  slug: string,
  format: "single" | "carousel" | "reels",
  publishToApi = true
) {
  const postDir = path.resolve(process.cwd(), "instagram_posts", slug);
  if (!fs.existsSync(postDir)) {
    console.error(`❌ Diretório do post não encontrado: ${postDir}`);
    process.exit(1);
  }

  const env = loadEnv();
  const igAccountId = env.INSTAGRAM_ACCOUNT_ID || process.env.INSTAGRAM_ACCOUNT_ID;
  const accessToken = env.INSTAGRAM_ACCESS_TOKEN || process.env.INSTAGRAM_ACCESS_TOKEN;
  const siteUrl = env.VITE_SITE_URL || "https://blog.coreautocrm.com.br";

  const captionFile = path.join(postDir, `caption_${format}.txt`);
  const caption = fs.existsSync(captionFile)
    ? fs.readFileSync(captionFile, "utf-8")
    : "🤖 Postagem automática do CoreAuto CRM";

  console.log("\n==================================================================");
  console.log(` 📸 META GRAPH API PUBLISHER DIRECT - FORMATO: ${format.toUpperCase()}`);
  console.log("==================================================================");

  if (!igAccountId || !accessToken) {
    console.log("⚠️ Credenciais (INSTAGRAM_ACCOUNT_ID e INSTAGRAM_ACCESS_TOKEN) não encontradas no .env.");
    console.log("ℹ️ Execução em modo prévia cancelada por falta de tokens.");
    return;
  }

  // Sync media files to production server
  uploadAssetsToVps(slug);

  const containerEndpoint = `https://graph.facebook.com/v19.0/${igAccountId}/media`;
  const publishEndpoint = `https://graph.facebook.com/v19.0/${igAccountId}/media_publish`;

  try {
    let creationId = "";

    if (format === "single") {
      const imageUrl = `${siteUrl}/instagram_posts/${slug}/single_post.png?v=${Date.now()}`;
      console.log(`🖼️ Criando container para imagem única (${imageUrl})...`);

      const res = await apiPost(containerEndpoint, {
        image_url: imageUrl,
        caption: caption,
        access_token: accessToken,
      });

      creationId = res.id;
      console.log(`  ✅ Container de Imagem Criado! ID: ${creationId}`);

    } else if (format === "carousel") {
      const slideFiles = fs.readdirSync(postDir).filter((f) => f.startsWith("slide_") && f.endsWith(".png")).sort();
      console.log(`🎠 Criando ${slideFiles.length} containers de slides do carrossel...`);

      const childIds: string[] = [];
      for (const file of slideFiles) {
        const slideUrl = `${siteUrl}/instagram_posts/${slug}/${file}?v=${Date.now()}`;
        console.log(`   ├── Uploading slide: ${file}...`);
        const itemRes = await apiPost(containerEndpoint, {
          image_url: slideUrl,
          is_carousel_item: "true",
          access_token: accessToken,
        });
        childIds.push(itemRes.id);
        await new Promise((r) => setTimeout(r, 1000));
      }

      console.log(`🎠 Criando container pai do carrossel com ${childIds.length} slides...`);
      const carouselRes = await apiPost(containerEndpoint, {
        media_type: "CAROUSEL",
        children: childIds.join(","),
        caption: caption,
        access_token: accessToken,
      });

      creationId = carouselRes.id;
      console.log(`  ✅ Container pai do carrossel criado! ID: ${creationId}`);

    } else if (format === "reels") {
      const videoUrl = `${siteUrl}/instagram_posts/${slug}/reels_video.mp4?v=${Date.now()}`;
      console.log(`🎥 Criando container de Reels (${videoUrl})...`);

      const reelRes = await apiPost(containerEndpoint, {
        media_type: "REELS",
        video_url: videoUrl,
        caption: caption,
        access_token: accessToken,
      });

      creationId = reelRes.id;
      console.log(`  ✅ Container de Reels criado! ID: ${creationId}`);
    }

    // Step 2: Poll Container Status until Meta finishes processing
    if (creationId) {
      await waitForContainerReady(creationId, accessToken);
    }

    // Step 3: Publish Container
    if (publishToApi && creationId) {
      console.log(`🚀 Publicando post no perfil do Instagram (Creation ID: ${creationId})...`);
      const pubRes = await apiPost(publishEndpoint, {
        creation_id: creationId,
        access_token: accessToken,
      });

      console.log(`==================================================================`);
      console.log(` 🎉 POST PUBLICADO COM SUCESSO NO PERFIL REAL DO INSTAGRAM!`);
      console.log(` 📌 Meta Media ID: ${pubRes.id}`);
      console.log(` 📱 Formato: ${format.toUpperCase()}`);
      console.log(`==================================================================\n`);
      return pubRes.id;
    }
  } catch (err) {
    console.error(`❌ Erro ao publicar via Meta Graph API (${format.toUpperCase()}):`, err instanceof Error ? err.message : err);
  }
}

async function main() {
  const args = process.argv.slice(2);
  let slug = "fim-papelzinho-ia-oficinas";
  let format: "single" | "carousel" | "reels" = "single";
  let publish = true;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--slug" && args[i + 1]) {
      slug = args[i + 1];
      i++;
    } else if (args[i] === "--format" && args[i + 1]) {
      format = args[i + 1] as any;
      i++;
    } else if (args[i] === "--publish") {
      publish = true;
    }
  }

  await publishFormatToInstagram(slug, format, publish);
}

if (process.argv[1]?.includes("instagram_publisher")) {
  main();
}
