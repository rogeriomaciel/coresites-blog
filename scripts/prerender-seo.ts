import fs from 'node:fs'
import path from 'node:path'

// Função idêntica à do core/src/utils/posts.ts para parsear o frontmatter de forma robusta
function parseFrontmatter(rawContent: string) {
  const match = rawContent.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) return null

  const yaml = match[1]
  const body = match[2]
  const data: Record<string, any> = {}

  const lines = yaml.split('\n')
  let currentKey: string | null = null

  for (const line of lines) {
    if (line.trim() === '' || line.trim().startsWith('#')) continue

    // Se a linha começa com espaço, é continuação da chave anterior
    if (line.match(/^\s+/) && currentKey) {
      const trimmed = line.trim()
      if (trimmed.startsWith('- ')) {
        if (!Array.isArray(data[currentKey])) {
          data[currentKey] = []
        }
        data[currentKey].push(trimmed.slice(2).trim().replace(/^["']|["']$/g, ''))
      } else {
        // Multiline string (como >- ou |)
        if (data[currentKey] === '>-' || data[currentKey] === '|' || data[currentKey] === '') {
          data[currentKey] = trimmed
        } else {
          data[currentKey] += ' ' + trimmed
        }
      }
      continue
    }

    const colonIdx = line.indexOf(':')
    if (colonIdx === -1) continue

    const key = line.slice(0, colonIdx).trim()
    let value = line.slice(colonIdx + 1).trim()
    
    currentKey = key

    if (value.startsWith('[') && value.endsWith(']')) {
      try {
        data[key] = JSON.parse(value.replace(/'/g, '"'))
      } catch {
        data[key] = value.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, ''))
      }
    } else if (value === 'true') {
      data[key] = true
    } else if (value === 'false') {
      data[key] = false
    } else if (value === '') {
      data[key] = '' // Preparar para multiline ou array
    } else {
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      data[key] = value
    }
  }

  // Limpar possíveis marcas do YAML que restaram se não houver linhas extras
  for (const k of Object.keys(data)) {
    if (data[k] === '>-' || data[k] === '|') {
      data[k] = ''
    }
  }

  return { data, body }
}

// Parser simples de Markdown para HTML básico (parágrafos, títulos, listas)
function simpleMarkdownToHtml(markdown: string): string {
  let html = markdown
    // Remover comentários do markdown
    .replace(/<!--[\s\S]*?-->/g, '')
    // Cabeçalhos
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Negrito e Itálico
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Código em bloco simples
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    // Código em linha
    .replace(/`(.*?)`/g, '<code>$1</code>')
    // Links
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
    // Listas
    .replace(/^\s*-\s+(.*$)/gim, '<li>$1</li>')
    .replace(/^\s*\*\s+(.*$)/gim, '<li>$1</li>');

  // Envolver as tags <li> em <ul> se necessário
  html = html.split('\n').map(line => {
    if (line.trim().startsWith('<li>') && !line.trim().endsWith('</li>')) {
      return line + '</li>';
    }
    return line;
  }).join('\n');

  // Transformar quebras de linha duplas em parágrafos, exceto se já forem blocos HTML
  const paragraphs = html.split(/\n{2,}/);
  const formattedParagraphs = paragraphs.map(p => {
    const trimmed = p.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('<h') || trimmed.startsWith('<pre') || trimmed.startsWith('<li') || trimmed.startsWith('<ul') || trimmed.startsWith('<a')) {
      return trimmed;
    }
    return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`;
  });

  return formattedParagraphs.join('\n');
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
  const SITE_NAME = env.VITE_SITE_NAME || 'CoreAuto'
  const SITE_DESCRIPTION = env.VITE_SITE_DESCRIPTION || 'Artigos sobre tecnologia, IA, automação e desenvolvimento no setor automotivo.'

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
  
  const files: Array<{ filePath: string; slug: string; lang: string }> = []
  const subdirs = ['pt', 'en']
  for (const sub of subdirs) {
    const dir = path.join(postsDir, sub)
    if (!fs.existsSync(dir)) continue
    const dirFiles = fs.readdirSync(dir).filter(f => f.endsWith('.md'))
    for (const file of dirFiles) {
      files.push({
        filePath: path.join(dir, file),
        slug: file.replace('.md', ''),
        lang: sub
      })
    }
  }

  // Agrupar posts pelo slug para evitar conflito de arquivos de saída (priorizando 'pt' como padrão)
  const groupedFiles: Record<string, { filePath: string; slug: string; lang: string }> = {}
  for (const file of files) {
    if (!groupedFiles[file.slug] || file.lang === 'pt') {
      groupedFiles[file.slug] = file
    }
  }

  console.log(`[Prerender] Iniciando injeção de SEO estático para ${Object.keys(groupedFiles).length} artigos...`)

  // Coleta dados dos posts para renderizar a Home estaticamente
  const postsMetadata: Array<{ slug: string; title: string; excerpt: string; date: string; category: string }> = []

  for (const fileObj of Object.values(groupedFiles)) {
    const slug = fileObj.slug
    const content = fs.readFileSync(fileObj.filePath, 'utf-8')
    const parsed = parseFrontmatter(content)

    if (!parsed) continue
    const { data, body } = parsed

    const rawTitle = data.meta_title || data.title || slug
    const pageTitle = rawTitle.length > 50 ? rawTitle : `${rawTitle} | ${SITE_NAME}`
    const pageDescription = data.meta_description || data.excerpt
    const postDate = data.date || ''
    const postCategory = data.category || 'Geral'
    
    if (fileObj.lang === 'pt') {
      postsMetadata.push({
        slug,
        title: data.title,
        excerpt: data.excerpt || '',
        date: postDate,
        category: postCategory
      })
    }

    // Tratando a extensão da imagem de capa (se for svg, o OG image vai usar png)
    let imageUrl = ''
    if (data.cover_image) {
      imageUrl = `${SITE_URL}${data.cover_image.replace(/\.svg$/, '.png')}`
    }

    // Gerar o HTML do corpo do post de maneira estática
    const articleHtml = `
      <article class="post-detail-container" style="max-width: 800px; margin: 40px auto; padding: 20px;">
        <header class="post-header">
          <span class="post-category" style="color: #2f80ed; font-weight: 600; text-transform: uppercase;">${postCategory}</span>
          <h1 class="post-title" style="font-size: 2.5rem; margin-top: 10px; margin-bottom: 20px;">${data.title}</h1>
          <div class="post-meta" style="color: #8da3b8; font-size: 0.9rem; margin-bottom: 30px;">
            <span>Publicado em ${postDate}</span>
          </div>
        </header>
        ${data.cover_image ? `<img src="${data.cover_image}" alt="${data.title}" style="width: 100%; border-radius: 8px; margin-bottom: 30px;" />` : ''}
        <div class="post-content" style="line-height: 1.8; font-size: 1.1rem; color: #e6ecf3;">
          ${simpleMarkdownToHtml(body)}
        </div>
      </article>
    `

    // Criar as tags estáticas para injetar no head
    const canonicalUrl = `${SITE_URL}/post/${slug}/`
    const seoTags = `
    <title>${pageTitle}</title>
    <meta name="description" content="${pageDescription}" />
    <link rel="canonical" href="${canonicalUrl}" />
    <meta property="og:title" content="${pageTitle}" />
    <meta property="og:description" content="${pageDescription}" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:site_name" content="${SITE_NAME}" />
    ${imageUrl ? `<meta property="og:image" content="${imageUrl}" />` : ''}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${pageTitle}" />
    <meta name="twitter:description" content="${pageDescription}" />
    ${imageUrl ? `<meta property="og:image" content="${imageUrl}" />` : ''}
    `

    // Substituir a tag title padrão pelas novas tags geradas no head
    let newHtml = baseHtml.replace(/<title>.*?<\/title>/i, seoTags)
    
    // Injetar o conteúdo HTML dentro da div #root para os crawlers de IA lerem sem rodar JS
    newHtml = newHtml.replace('<div id="root"></div>', `<div id="root">${articleHtml}</div>`)

    // Criar a pasta do post dentro do dist
    const postDistDir = path.join(process.cwd(), 'dist', 'post', slug)
    if (!fs.existsSync(postDistDir)) {
      fs.mkdirSync(postDistDir, { recursive: true })
    }

    fs.writeFileSync(path.join(postDistDir, 'index.html'), newHtml)
  }

  // Ordenar posts pela data
  postsMetadata.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Gerar HTML estático para a Home (listagem de posts)
  const homePostsHtml = postsMetadata.map(p => `
    <article class="post-card" style="margin-bottom: 40px; padding: 20px; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px;">
      <span style="color: #2f80ed; font-size: 0.85rem; font-weight: bold; text-transform: uppercase;">${p.category}</span>
      <h2 style="font-size: 1.8rem; margin: 10px 0;"><a href="/post/${p.slug}" style="color: #e6ecf3; text-decoration: none;">${p.title}</a></h2>
      <p style="color: #8da3b8; line-height: 1.6;">${p.excerpt}</p>
      <div style="font-size: 0.85rem; color: #4d6a82; margin-top: 15px;">Publicado em ${p.date}</div>
    </article>
  `).join('\n')

  const homeHtmlContent = `
    <div class="home-container" style="max-width: 900px; margin: 40px auto; padding: 20px;">
      <header style="text-align: center; margin-bottom: 50px;">
        <h1 style="font-size: 3rem;">${SITE_NAME} Blog</h1>
        <p style="color: #8da3b8; font-size: 1.2rem;">${SITE_DESCRIPTION}</p>
      </header>
      <main class="posts-list">
        ${homePostsHtml}
      </main>
    </div>
  `

  const homeSeoTags = `
  <title>${SITE_NAME} | Blog Oficial de IA e Gestão para Oficinas Mecânicas</title>
  <meta name="description" content="${SITE_DESCRIPTION}" />
  <meta name="keywords" content="oficina mecanica, crm oficina mecanica, ia para oficina, automacao whatsapp oficina, gestao de oficina" />
  <link rel="canonical" href="${SITE_URL}/" />
  <meta name="robots" content="index, follow" />
  <meta property="og:title" content="${SITE_NAME} | Blog Oficial" />
  <meta property="og:description" content="${SITE_DESCRIPTION}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${SITE_URL}/" />
  <meta property="og:image" content="${SITE_URL}/test-og.png" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${SITE_NAME} | Blog Oficial" />
  <meta name="twitter:description" content="${SITE_DESCRIPTION}" />
  <meta name="twitter:image" content="${SITE_URL}/test-og.png" />
  `

  let finalHomeHtml = baseHtml.replace(/<title>.*?<\/title>/i, homeSeoTags)
  finalHomeHtml = finalHomeHtml.replace('<div id="root"></div>', `<div id="root">${homeHtmlContent}</div>`)

  fs.writeFileSync(distHtmlPath, finalHomeHtml)

  // Coletar todas as categorias únicas e pré-renderizar suas páginas
  const categories = Array.from(new Set(postsMetadata.map(p => p.category.toLowerCase())))
  for (const cat of categories) {
    const catPosts = postsMetadata.filter(p => p.category.toLowerCase() === cat)
    const catTitle = `${cat.charAt(0).toUpperCase() + cat.slice(1)} | ${SITE_NAME}`
    const catDesc = `Artigos e conteúdos sobre ${cat} no blog oficial da ${SITE_NAME}.`
    const catUrl = `${SITE_URL}/categoria/${encodeURIComponent(cat)}/`

    const catPostsHtml = catPosts.map(p => `
      <article class="post-card" style="margin-bottom: 40px; padding: 20px; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px;">
        <span style="color: #2f80ed; font-size: 0.85rem; font-weight: bold; text-transform: uppercase;">${p.category}</span>
        <h2 style="font-size: 1.8rem; margin: 10px 0;"><a href="/post/${p.slug}/" style="color: #e6ecf3; text-decoration: none;">${p.title}</a></h2>
        <p style="color: #8da3b8; line-height: 1.6;">${p.excerpt}</p>
        <div style="font-size: 0.85rem; color: #4d6a82; margin-top: 15px;">Publicado em ${p.date}</div>
      </article>
    `).join('\n')

    const catHtmlContent = `
      <div class="category-container" style="max-width: 900px; margin: 40px auto; padding: 20px;">
        <header style="text-align: center; margin-bottom: 50px;">
          <h1 style="font-size: 2.5rem; text-transform: capitalize;">Categoria: ${cat}</h1>
          <p style="color: #8da3b8; font-size: 1.1rem;">${catDesc}</p>
        </header>
        <main class="posts-list">
          ${catPostsHtml}
        </main>
      </div>
    `

    const catSeoTags = `
    <title>${catTitle}</title>
    <meta name="description" content="${catDesc}" />
    <link rel="canonical" href="${catUrl}" />
    <meta name="robots" content="index, follow" />
    <meta property="og:title" content="${catTitle}" />
    <meta property="og:description" content="${catDesc}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${catUrl}" />
    `

    let catHtml = baseHtml.replace(/<title>.*?<\/title>/i, catSeoTags)
    catHtml = catHtml.replace('<div id="root"></div>', `<div id="root">${catHtmlContent}</div>`)

    const catDistDir = path.join(process.cwd(), 'dist', 'categoria', encodeURIComponent(cat))
    if (!fs.existsSync(catDistDir)) {
      fs.mkdirSync(catDistDir, { recursive: true })
    }
    fs.writeFileSync(path.join(catDistDir, 'index.html'), catHtml)
  }

  console.log(`✅ [Prerender] SEO e conteúdo estático injetados para a Home, ${categories.length} Categorias e ${files.length} artigos!`)
}

prerenderSEO()
