import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import matter from "gray-matter";

function loadEnv(): Record<string, string> {
  const envVars: Record<string, string> = {};
  const rootEnvPath = path.resolve(process.cwd(), "..", ".env");
  const localEnvPath = path.resolve(process.cwd(), ".env");

  const envPath = fs.existsSync(rootEnvPath)
    ? rootEnvPath
    : fs.existsSync(localEnvPath)
      ? localEnvPath
      : null;

  if (envPath) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx !== -1) {
        const key = trimmed.substring(0, eqIdx).trim();
        let val = trimmed.substring(eqIdx + 1).trim();
        if (
          (val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))
        ) {
          val = val.substring(1, val.length - 1);
        }
        envVars[key] = val;
        process.env[key] = val;
      }
    }
  }
  return envVars;
}

function runCmd(cmd: string, cwd = process.cwd()): string {
  try {
    return execSync(cmd, { cwd, encoding: "utf-8", stdio: "inherit" }) || "";
  } catch (err) {
    console.error(`❌ Erro ao executar comando: ${cmd}`);
    throw err;
  }
}

async function publishSocialMediaForPosts() {
  console.log("\n📱 5. Verificando artigos para publicação nas Redes Sociais (Instagram, Facebook e LinkedIn)...");

  const postsDir = path.resolve(process.cwd(), "content", "posts", "pt");
  if (!fs.existsSync(postsDir)) {
    console.log("ℹ️ Pasta de posts pt/ não encontrada. Pulando redes sociais.");
    return;
  }

  const files = fs.readdirSync(postsDir).filter((f) => f.endsWith(".md"));
  let publishedCount = 0;

  for (const file of files) {
    const filePath = path.join(postsDir, file);
    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = matter(raw);
    const data = parsed.data;
    const publishedNetworks: string[] = Array.isArray(data.social_published)
      ? data.social_published
      : [];

    const slug = file.replace(/\.md$/, "");

    const needsInstagram = !publishedNetworks.includes("instagram");
    const needsFacebook = !publishedNetworks.includes("facebook");
    const needsLinkedin = !publishedNetworks.includes("linkedin");

    if (needsInstagram || needsFacebook || needsLinkedin) {
      console.log(`\n==================================================================`);
      console.log(` 📣 Disparando Redes Sociais para o Artigo: "${data.title || slug}"`);
      console.log(`==================================================================`);

      // 1. Instagram (1 Carrossel 4:5 + 1 Reels 9:16 com Voz ElevenLabs)
      if (needsInstagram) {
        console.log(`\n📸 [INSTAGRAM] Disparando 1 Carrossel + 1 Reels via Meta Graph API...`);
        try {
          const igScript = path.resolve(
            process.cwd(),
            ".agents",
            "skills",
            "publish-instagram",
            "scripts",
            "publish_post_to_instagram.ts"
          );
          runCmd(`bun run "${igScript}" "content/posts/pt/${file}" --publish`);
        } catch (igErr) {
          console.error("❌ Erro na publicação do Instagram:", igErr instanceof Error ? igErr.message : igErr);
        }
      }

      // 2. Facebook (via n8n Webhook)
      if (needsFacebook) {
        console.log(`\n📘 [FACEBOOK] Disparando Webhook do n8n...`);
        try {
          runCmd(`bun run scripts/trigger-n8n.ts "pt/${slug}" --network facebook --batch`);
        } catch (fbErr) {
          console.error("❌ Erro na publicação do Facebook:", fbErr instanceof Error ? fbErr.message : fbErr);
        }
      }

      // 3. LinkedIn (via n8n Webhook)
      if (needsLinkedin) {
        console.log(`\n💼 [LINKEDIN] Disparando Webhook do n8n...`);
        try {
          runCmd(`bun run scripts/trigger-n8n.ts "pt/${slug}" --network linkedin --batch`);
        } catch (liErr) {
          console.error("❌ Erro na publicação do LinkedIn:", liErr instanceof Error ? liErr.message : liErr);
        }
      }

      publishedCount++;
    }
  }

  if (publishedCount === 0) {
    console.log("✨ Todos os artigos já foram publicados no Instagram, Facebook e LinkedIn!");
  }
}

async function deploy() {
  console.log("==================================================================");
  console.log(" 🚀 CORESITES BLOG — DEPLOY & MULTI-CHANNEL PUBLISH ENGINE (BUN)");
  console.log("==================================================================");

  const env = loadEnv();
  const vpsIp = env.DEPLOY_VPS_IP;
  const user = env.DEPLOY_USER || "root";
  const password = env.DEPLOY_USERPASSWORD || "";
  const remotePath = env.DEPLOY_PATH || "/var/www/blog";

  if (!vpsIp) {
    console.error("❌ Erro: DEPLOY_VPS_IP não está configurado no .env");
    process.exit(1);
  }

  // 1. Versionamento Git e Criação de Branch/PR
  console.log("\n📝 1. Verificando controle de versão Git...");
  try {
    const gitStatus = execSync("git status --porcelain", { encoding: "utf-8" }).trim();
    if (gitStatus) {
      const now = new Date();
      const timestamp = now
        .toISOString()
        .replace(/[-T:]/g, "")
        .substring(0, 14);
      const branchName = `publish-${timestamp}`;

      console.log(`📌 Alterações encontradas. Criando branch: ${branchName}...`);
      execSync(`git checkout -b ${branchName}`, { stdio: "inherit" });
      execSync("git add -A", { stdio: "inherit" });
      execSync('git commit -m "publish: atualização de conteúdo e build estático"', {
        stdio: "inherit",
      });

      console.log(`🚀 Fazendo push da branch ${branchName} para a origin...`);
      execSync(`git push -u origin ${branchName}`, { stdio: "inherit" });

      try {
        console.log("📄 Criando Pull Request no GitHub...");
        execSync(
          `gh pr create --title "Publish: atualização de conteúdo" --body "Automated MR gerado pelo CI/CD em TypeScript/Bun."`,
          { stdio: "inherit" }
        );
      } catch (ghErr) {
        console.warn("⚠️ GitHub CLI (gh) não configurado ou PR já existente. Prosseguindo...");
      }
    } else {
      console.log("ℹ️ Nenhuma alteração pendente no Git. Pulando etapa de branch.");
    }
  } catch (err) {
    console.warn("⚠️ Aviso durante verificação Git:", err instanceof Error ? err.message : err);
  }

  // 2. Compilação do Projeto (Build Estático)
  console.log("\n📦 2. Compilando o blog com Bun (`bun run build`)...");
  runCmd("bun run build");

  const distDir = path.resolve(process.cwd(), "dist");
  if (!fs.existsSync(distDir)) {
    console.error("❌ Erro: A pasta dist/ não foi gerada no build!");
    process.exit(1);
  }

  // 3. Geração do Sitemap.xml
  console.log("\n🗺️ 3. Gerando sitemap.xml...");
  try {
    runCmd("bun run generate-sitemap");
  } catch (err) {
    console.warn("⚠️ Aviso ao gerar sitemap:", err);
  }

  // 4. Upload para a VPS Nginx via SSH / Rsync
  console.log(`\n🚀 4. Enviando arquivos buildados para a VPS (${vpsIp}:${remotePath})...`);
  const rsyncCmd = password
    ? `sshpass -p "${password}" rsync -avz --delete -e "ssh -o StrictHostKeyChecking=no" dist/ ${user}@${vpsIp}:${remotePath}/`
    : `rsync -avz --delete -e "ssh -o StrictHostKeyChecking=no" dist/ ${user}@${vpsIp}:${remotePath}/`;

  try {
    execSync(rsyncCmd, { stdio: "inherit" });
    console.log("✅ Build enviado com sucesso para o servidor de produção!");
  } catch (err) {
    console.error("❌ Erro ao enviar arquivos para a VPS via rsync:", err);
    process.exit(1);
  }

  // 5. Publicação Automática Multi-Canal (Instagram Carrossel + Facebook + LinkedIn)
  await publishSocialMediaForPosts();

  console.log("\n==================================================================");
  console.log(" 🎉 DEPLOY DO BLOG E PUBLICAÇÃO NAS REDES SOCIAIS FINALIZADOS!");
  console.log("==================================================================");
}

deploy().catch(console.error);
