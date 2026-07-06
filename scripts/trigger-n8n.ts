import fs from 'node:fs'
import path from 'node:path'

// Assume that the user passes the post slug as the first argument
const slug = process.argv[2]

if (!slug) {
  console.error('❌ Erro: Forneça o slug do post. Ex: bun run publish:social meu-post')
  process.exit(1)
}

const WEBHOOK_URL = process.env.N8N_WEBHOOK_URL
const SITE_URL = process.env.VITE_SITE_URL || 'http://localhost:5173'

if (!WEBHOOK_URL) {
  console.error('❌ Erro: N8N_WEBHOOK_URL não encontrado no .env')
  process.exit(1)
}

async function triggerWebhook() {
  // Caminho do post (assume content/posts no root project ou core)
  const rootPostPath = path.join(process.cwd(), '..', 'content', 'posts', `${slug}.md`)
  const corePostPath = path.join(process.cwd(), 'content', 'posts', `${slug}.md`)
  
  let postPath = ''
  if (fs.existsSync(rootPostPath)) postPath = rootPostPath
  else if (fs.existsSync(corePostPath)) postPath = corePostPath
  else {
    console.error(`❌ Erro: Post não encontrado para o slug "${slug}"`)
    process.exit(1)
  }

  console.log(`📄 Lendo o post ${slug}...`)
  const raw = fs.readFileSync(postPath, 'utf-8')
  
  // Extração básica do Frontmatter e conteúdo usando Regex (similar ao parser atual)
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) {
    console.error('❌ Erro: Formato Markdown inválido (Frontmatter ausente)')
    process.exit(1)
  }

  const yaml = match[1]
  const content = match[2]
  const data: Record<string, string> = {}
  
  yaml.split('\n').forEach((line: string) => {
    const colonIdx = line.indexOf(':')
    if (colonIdx !== -1) {
      const key = line.slice(0, colonIdx).trim()
      let value = line.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, '')
      data[key] = value
    }
  })

  const payload = {
    title: data.title || slug,
    slug: slug,
    url: `${SITE_URL}/post/${slug}`,
    excerpt: data.excerpt || '',
    category: data.category || '',
    cover_image: data.cover_image || '',
    content: content.substring(0, 1500) + '...' // Enviar um resumo para não estourar payload
  }

  console.log(`🚀 Enviando post "${payload.title}" para o Webhook do n8n...`)

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`Status ${response.status}`)
    }

    console.log(`✅ Sucesso! O n8n recebeu o post e começou a gerar os conteúdos sociais.`)

  } catch (error) {
    console.error('❌ Erro ao chamar o webhook:', error instanceof Error ? error.message : error)
  }
}

triggerWebhook()
