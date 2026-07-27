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

export async function generateVideoWithGoogleVeo(config: VeoGenerationConfig): Promise<string> {
  const credentialsPath =
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    path.join(process.cwd(), "security/gen-lang-client-0596096564-1926acacbda4.json");

  const { accessToken, projectId: defaultProjectId } = await getAccessTokenFromServiceAccount(credentialsPath);
  const projectId = config.projectId || process.env.GCP_PROJECT_ID || defaultProjectId;
  const location = config.location || process.env.GCP_LOCATION || "us-central1";

  console.log(`🚀 Iniciando solicitação de vídeo ao Google Veo 2.0 (Vertex AI)...`);
  console.log(` 🎬 Prompt: "${config.prompt}"`);

  const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/veo-2.0-generate-001:predictLongRunning`;

  const parameters: any = {
    aspectRatio: config.aspectRatio || "9:16",
    durationSeconds: config.durationSeconds || 5,
    sampleCount: 1,
  };

  if (config.gcsBucket) {
    parameters.outputGcsUri = `gs://${config.gcsBucket}/veo_outputs/`;
  }

  const payload = {
    instances: [
      {
        prompt: config.prompt,
      },
    ],
    parameters,
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Erro ao iniciar geração de vídeo no Veo (${response.status}): ${errText}`);
  }

  const initialResult = (await response.json()) as any;
  console.log(`✅ Operação iniciada no Google Cloud! ID: ${initialResult.name}`);
  return initialResult.name;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  generateVideoWithGoogleVeo({
    prompt: "Cinematic 4k video of an auto mechanic repairing a car in a modern shop",
    outputPath: "instagram_posts/test_veo_real.mp4",
  })
    .then((res) => console.log(`\n🎉 Operação criada com sucesso no Google Veo!`))
    .catch((err) => console.error("\n❌ Erro:", err.message));
}
