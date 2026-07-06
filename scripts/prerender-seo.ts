import fs from 'node:fs'
import path from 'node:path'

// Função para parsear o frontmatter simples
function parseFrontmatter(rawContent: string) {
  const match = rawContent.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) return null

  const yaml = match[1]
  const data: Record<string, string> = {}
  
  yaml.split('\n').forEach((line: string) => {
    const colonIdx = line.indexOf(':')
    if (colonIdx !== -1) {
      const key = line.slice(0, colonIdx).trim()
      let value = line.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, '')
      data[key] = value
    }
  })
  
  return data
}

function loadEnv() {
  const envPath = path.join(process.cwd(), '..', '.env')
  const envCorePath = path.join(process.cwd(), '.env')
  
  const envFile = fs.existsSync(envPath) ? envPath : (fs.existsSync(envCorePath) ? envCorePath : null)
  const env: Record<string, string> = {}

  if (envFile) {
    const content = fs.readFileSync(envFile, 'utf-8')
    content.split('\n').forEach(line => {
      const [key, ...val] = line.split('=')
      if (key && val.length > 0) {
        let cleanVal = val.join('=').trim()
        cleanVal = cleanVal.replace(/^["']|["']$/g, '')
        env[key.trim()] = cleanVal
      }
    })
  }
  return env
}

async function prerenderSEO() {
  const env = loadEnv()
  const SITE_URL = env.VITE_SITE_URL || 'https://blog.coreautocrm.com.br'
  const SITE_NAME = env.VITE_SITE_NAME || 'CoreSites Blog'

  const rootPostsDir = path.join(process.cwd(), '..', 'content', 'posts')
  const corePostsDir = path.join(process.cwd(), 'content', 'posts')
  const postsDir = fs.existsSync(rootPostsDir) ? rootPostsDir : (fs.existsSync(corePostsDir) ? corePostsDir : null)

  if (!postsDir) {
    console.error('❌ Diretório de posts não encontrado para prerender.')
    return
  }

  const distHtmlPath = path.join(process.cwd(), 'dist', 'index.html')
  if (!fs.existsSync(distHtmlPath)) {
    console.error('❌ dist/index.html não encontrado. Rode o vite build primeiro.')
    return
  }

  const baseHtml = fs.readFileSync(distHtmlPath, 'utf-8')
  const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'))

  console.log(`[Prerender] Iniciando injeção de SEO estático para ${files.length} artigos...`)

  for (const file of files) {
    const slug = file.replace('.md', '')
    const content = fs.readFileSync(path.join(postsDir, file), 'utf-8')
    const data = parseFrontmatter(content)

    if (!data) continue

    const pageTitle = data.meta_title || data.title
    const pageDescription = data.meta_description || data.excerpt
    
    // Tratando a extensão da imagem de capa (se for svg, o OG image vai usar png)
    let imageUrl = ''
    if (data.cover_image) {
      imageUrl = `${SITE_URL}${data.cover_image.replace(/\.svg$/, '.png')}`
    }

    // Criar as tags estáticas para injetar no head
    const seoTags = `
    <title>${pageTitle}</title>
    <meta name="description" content="${pageDescription}" />
    <meta property="og:title" content="${pageTitle}" />
    <meta property="og:description" content="${pageDescription}" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${SITE_URL}/post/${slug}" />
    <meta property="og:site_name" content="${SITE_NAME}" />
    ${imageUrl ? `<meta property="og:image" content="${imageUrl}" />` : ''}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${pageTitle}" />
    <meta name="twitter:description" content="${pageDescription}" />
    ${imageUrl ? `<meta name="twitter:image" content="${imageUrl}" />` : ''}
    `

    // Substituir a tag title padrão pelas novas tags geradas
    const newHtml = baseHtml.replace(/<title>.*?<\/title>/i, seoTags)

    // Criar a pasta do post dentro do dist
    const postDistDir = path.join(process.cwd(), 'dist', 'post', slug)
    if (!fs.existsSync(postDistDir)) {
      fs.mkdirSync(postDistDir, { recursive: true })
    }

    fs.writeFileSync(path.join(postDistDir, 'index.html'), newHtml)
  }

  console.log(`✅ [Prerender] SEO estático gerado para os artigos em dist/post/!`)
}

prerenderSEO()
