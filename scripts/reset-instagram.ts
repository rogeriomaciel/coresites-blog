import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const rootDir = path.resolve(process.cwd(), "content", "posts", "pt");
const coreDir = path.resolve(process.cwd(), "core", "content", "posts", "pt");

const targetDir = fs.existsSync(rootDir) ? rootDir : coreDir;
const files = fs.readdirSync(targetDir).filter((f) => f.endsWith(".md"));

let count = 0;
for (const file of files) {
  if (file === "fim-papelzinho-ia-oficinas.md") continue;
  const filePath = path.join(targetDir, file);
  const content = fs.readFileSync(filePath, "utf-8");
  const parsed = matter(content);

  if (Array.isArray(parsed.data.social_published)) {
    if (parsed.data.social_published.includes("instagram")) {
      parsed.data.social_published = parsed.data.social_published.filter(
        (n) => n !== "instagram"
      );
      const updated = matter.stringify(parsed.content, parsed.data, {
        lineWidth: -1,
      } as any);
      fs.writeFileSync(filePath, updated, "utf-8");
      count++;
    }
  }
}

console.log(`✅ Status do Instagram resetado para ${count} artigos! Mantido publicado apenas o post de teste 'fim-papelzinho-ia-oficinas.md'.`);
