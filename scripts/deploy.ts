import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

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
    console.log(`📄 Carregando arquivo de ambiente: ${envPath}`);
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

async function deploy() {
  console.log("==================================================================");
  console.log(" 🚀 CORESITES BLOG — DEPLOY & PUBLISH ENGINE (TYPESCRIPT / BUN)");
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

  console.log("\n==================================================================");
  console.log(" 🎉 DEPLOY DO BLOG CONCLUÍDO COM SUCESSO EM PRODUÇÃO!");
  console.log("==================================================================");
}

deploy().catch(console.error);
