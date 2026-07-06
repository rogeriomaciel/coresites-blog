import fs from 'node:fs'
import path from 'node:path'
import * as readline from 'node:readline/promises'
import matter from 'gray-matter'
import { stdin as input, stdout as output } from 'node:process'

const args = process.argv.slice(2)
const slugOrAll = args[0]
let network = 'linkedin' // default
let isBatch = false

if (args.includes('--network')) {
  const netIdx = args.indexOf('--network')
  if (args[netIdx + 1]) {
    network = args[netIdx + 1]
  }
}

if (args.includes('--batch')) {
  isBatch = true
}

if (!slugOrAll) {
  console.error('❌ Erro: Forneça o slug do post ou "all". Ex: bun run publish:social all [--batch] [--network linkedin]')
  process.exit(1)
}

const WEBHOOK_URL = process.env.N8N_WEBHOOK_URL
const SITE_URL = process.env.VITE_SITE_URL || 'http://localhost:5173'

if (!WEBHOOK_URL) {
  console.error('❌ Erro: N8N_WEBHOOK_URL não encontrado no .env')
  process.exit(1)
}

async function processPost(slug: string, postPath: string) {
  console.log(`\n📄 Lendo o post ${slug}...`)
  const raw = fs.readFileSync(postPath, 'utf-8')
  
  const parsed = matter(raw)
  const data = parsed.data

  const publishedNetworks: string[] = Array.isArray(data.social_published) 
    ? data.social_published 
    : []

  if (publishedNetworks.includes(network)) {
    if (isBatch || slugOrAll === 'all') {
      console.log(`⏩ Ignorando '${slug}' (já publicado em ${network}).`)
      return
    } else {
      const rl = readline.createInterface({ input, output })
      console.log(`\n⚠️  ATENÇÃO: Este artigo já está marcado como publicado na rede: ${network.toUpperCase()}`)
      const answer = await rl.question(`Deseja disparar a publicação novamente? (s/N): `)
      rl.close()

      if (answer.toLowerCase() !== 's') {
        console.log('Operação cancelada pelo usuário.')
        return
      }
    }
  }

  const payload = {
    title: data.title || slug,
    slug: slug,
    url: `${SITE_URL}/post/${slug}`,
    excerpt: data.excerpt || '',
    category: data.category || '',
    cover_image: data.cover_image || '',
    cover_image_url: data.cover_image ? `${SITE_URL}${data.cover_image.replace(/\.svg$/, '.png')}` : '',
    content: parsed.content.substring(0, 1500) + '...'
  }

  console.log(`🚀 Enviando post "${payload.title}" para o Webhook do n8n (Rede: ${network})...`)

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

    console.log(`✅ Sucesso! O n8n recebeu o post.`)

    if (!publishedNetworks.includes(network)) {
      publishedNetworks.push(network)
      parsed.data.social_published = publishedNetworks
      
      const updatedMarkdown = matter.stringify(parsed.content, parsed.data)
      fs.writeFileSync(postPath, updatedMarkdown, 'utf-8')
      console.log(`📝 Arquivo Markdown atualizado: '${network}' adicionado em social_published.`)
    }

  } catch (error) {
    console.error(`❌ Erro ao chamar o webhook para '${slug}':`, error instanceof Error ? error.message : error)
  }
}

async function run() {
  const rootDir = path.join(process.cwd(), '..', 'content', 'posts')
  const coreDir = path.join(process.cwd(), 'content', 'posts')
  
  const postsDir = fs.existsSync(rootDir) ? rootDir : (fs.existsSync(coreDir) ? coreDir : '')
  
  if (!postsDir) {
    console.error(`❌ Erro: Diretório de posts não encontrado.`)
    process.exit(1)
  }

  if (slugOrAll === 'all') {
    const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'))
    console.log(`🔍 Iniciando varredura em ${files.length} posts para a rede: ${network}...`)
    
    for (const file of files) {
      const slug = file.replace(/\.md$/, '')
      const postPath = path.join(postsDir, file)
      await processPost(slug, postPath)
    }
    console.log(`\n🎉 Varredura de publicação finalizada!`)
  } else {
    const postPath = path.join(postsDir, `${slugOrAll}.md`)
    if (!fs.existsSync(postPath)) {
      console.error(`❌ Erro: Post não encontrado para o slug "${slugOrAll}"`)
      process.exit(1)
    }
    await processPost(slugOrAll, postPath)
  }
}

run()
