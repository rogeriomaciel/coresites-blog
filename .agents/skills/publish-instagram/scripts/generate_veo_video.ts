import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

export interface VeoGenerationConfig {
  prompt: string;
  outputPath: string;
  projectId?: string;
  location?: string;
  durationSeconds?: number;
  aspectRatio?: "16:9" | "9:16" | "1:1";
  gcsBucket?: string;
}

async function getAccessTokenFromServiceAccount(keyFilePath: string): Promise<{ accessToken: string; projectId: string }> {
  if (!fs.existsSync(keyFilePath)) {
    throw new Error(`Arquivo de chave JSON não encontrado em: ${keyFilePath}`);
  }

  const keyContent = JSON.parse(fs.readFileSync(keyFilePath, "utf-8"));
  const clientEmail = keyContent.client_email;
  const privateKey = keyContent.private_key;
  const projectId = keyContent.project_id;

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claimSet = {
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/cloud-platform",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const encodeBase64Url = (obj: object) =>
    Buffer.from(JSON.stringify(obj))
      .toString("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

  const unsignedToken = `${encodeBase64Url(header)}.${encodeBase64Url(claimSet)}`;

  const signer = crypto.createSign("RSA-SHA256");
  signer.update(unsignedToken);
  const signature = signer
    .sign(privateKey, "base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  const jwtToken = `${unsignedToken}.${signature}`;

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwtToken,
    }),
  });

  const data = (await response.json()) as any;
  return {
    accessToken: data.access_token,
    projectId: projectId,
  };
}

// =============================================================================
// ⛔ GERAÇÃO DE VÍDEO COM VERTEX AI (GOOGLE VEO 2.0) — DESATIVADA E TRAVADA
// Motivo: custo elevado da API Vertex AI / Veo 2.0.
// NÃO remova este bloco sem revisão e autorização explícita do responsável.
// Data de bloqueio: 2026-07-28
// =============================================================================
export async function generateVideoWithGoogleVeo(
  _config: VeoGenerationConfig
): Promise<string> {
  throw new Error(
    "[BLOQUEADO] Geração de vídeo via Google Veo 2.0 / Vertex AI está DESATIVADA.\n" +
    "Motivo: custo elevado da API Vertex AI.\n" +
    "Para reativar, restaure a implementação original em generate_veo_video.ts."
  );
}

// ⛔ CLI DESATIVADO — Vertex AI / Veo 2.0 está bloqueado por custo.
// if (import.meta.url === `file://${process.argv[1]}`) { ... }
