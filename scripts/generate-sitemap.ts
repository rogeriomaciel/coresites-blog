/**
 * Sitemap Generator
 * Reads all markdown posts from content/posts/ and generates a sitemap.xml
 * Run: bun run generate-sitemap
 */

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const SITE_URL = process.env.VITE_SITE_URL || 'https://blog.example.com'

// Suporte a Submódulos: busca a pasta content do cliente primeiro, senão usa a interna
const internalContentDir = path.resolve(import.meta.dirname, '../content/posts')
const externalContentDir = path.resolve(import.meta.dirname, '../../content/posts')
const CONTENT_DIR = fs.existsSync(externalContentDir) ? externalContentDir : internalContentDir

const OUTPUT_PATH = path.resolve(import.meta.dirname, '../dist/sitemap.xml')

interface PostMeta {
  slug: string
  date: string
  published: boolean
  title: string
}

function getPostsMeta(): PostMeta[] {
  if (!fs.existsSync(CONTENT_DIR)) {
    return []
  }

  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.md'))
  const posts: PostMeta[] = []

  for (const file of files) {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf-8')
    const { data } = matter(raw)
    if (data.published !== false) {
      posts.push({
        slug: data.slug || path.basename(file, '.md'),
        date: data.date || new Date().toISOString(),
        published: data.published !== false,
        title: data.title || path.basename(file, '.md'),
      })
    }
  }

  return posts
}

function generateSitemap(): void {
  const posts = getPostsMeta()

  const urls = [
    // Home page
    `  <url>
    <loc>${SITE_URL}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`,
    // Individual posts
    ...posts.map(
      (post) => `  <url>
    <loc>${SITE_URL}/post/${post.slug}</loc>
    <lastmod>${new Date(post.date).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    ),
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`

  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_PATH)
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  fs.writeFileSync(OUTPUT_PATH, xml, 'utf-8')
  console.log(`✅ Sitemap gerado: ${OUTPUT_PATH}`)
  console.log(`   ${posts.length} artigos indexados.`)
}

function generateRobotsTxt(): void {
  const robotsPath = path.resolve(import.meta.dirname, '../dist/robots.txt')
  const content = `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`
  fs.writeFileSync(robotsPath, content, 'utf-8')
  console.log(`✅ robots.txt gerado: ${robotsPath}`)
}

function generateLlmsTxt(posts: PostMeta[]): void {
  const llmsPath = path.resolve(import.meta.dirname, '../dist/llms.txt')
  const postLines = posts.map(p => `- [${p.title}](${SITE_URL}/post/${p.slug})`).join('\n')
  const content = `# CoreSites Blog

> Blog desenvolvido com React e Vite.

## Resumo
Este blog contém artigos, dicas e notícias.

## Detalhes
- Frontend: React, Vite, Tailwind CSS
- URL Principal: ${SITE_URL}

## Artigos Disponíveis
${postLines}
`
  fs.writeFileSync(llmsPath, content, 'utf-8')
  console.log(`✅ llms.txt gerado: ${llmsPath}`)
}

generateSitemap()
const allPosts = getPostsMeta()
generateRobotsTxt()
generateLlmsTxt(allPosts)
