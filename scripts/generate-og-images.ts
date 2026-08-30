import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import matter from 'gray-matter'

const POST_IMAGES_DIR_CORE = path.join(process.cwd(), 'public', 'images', 'posts')
const POST_IMAGES_DIR_ROOT = path.join(process.cwd(), '..', 'public', 'images', 'posts')

function wrapText(text: string, maxChars: number) {
  const words = text.split(' ')
  const lines = []
  let currentLine = ''
  for (const word of words) {
    if ((currentLine + word).length > maxChars) {
      if (currentLine) lines.push(currentLine.trim())
      currentLine = word + ' '
    } else {
      currentLine += word + ' '
    }
  }
  if (currentLine) lines.push(currentLine.trim())
  return lines
}

function findPostFrontmatter(filename: string) {
  const slug = filename.replace(/(\.svg|-base\.png|-og\.png|-sq\.png|\.png)$/, '')
  const searchPaths = [
    path.join(process.cwd(), '..', 'content', 'posts', `${slug}.md`),
    path.join(process.cwd(), 'content', 'posts', `${slug}.md`),
    path.join(process.cwd(), '..', 'content', 'posts', 'pt', `${slug}.md`),
    path.join(process.cwd(), 'content', 'posts', 'pt', `${slug}.md`),
    path.join(process.cwd(), '..', 'content', 'posts', 'en', `${slug}.md`),
    path.join(process.cwd(), 'content', 'posts', 'en', `${slug}.md`),
  ]

  let postPath = ''
  for (const p of searchPaths) {
    if (fs.existsSync(p)) {
      postPath = p
      break
    }
  }
  
  if (!postPath) return null

  try {
    const raw = fs.readFileSync(postPath, 'utf-8')
    const parsed = matter(raw)
    return {
      title: parsed.data.title || slug,
      excerpt: parsed.data.excerpt || parsed.data.meta_description || ''
    }
  } catch {
    return null
  }
}

async function renderImageWithOverlay(basePath: string, outPath: string, width: number, height: number, frontmatter: any, maxCharsTitle: number, maxCharsExcerpt: number) {
  try {
    const baseImage = await sharp(basePath, { density: 300 })
      .resize(width, height, { 
        fit: 'cover',
        background: { r: 0, g: 0, b: 0, alpha: 1 } 
      })
      .toBuffer()

    if (frontmatter) {
      const titleLines = wrapText(frontmatter.title, maxCharsTitle)
      const excerptLines = wrapText(frontmatter.excerpt, maxCharsExcerpt).slice(0, 3)

      const titleLineHeight = 64
      const excerptLineHeight = 40
      
      const totalExcerptHeight = excerptLines.length * excerptLineHeight
      const excerptStartY = height - (width === 1080 ? 50 : 40) - totalExcerptHeight

      const totalTitleHeight = titleLines.length * titleLineHeight
      const titleStartY = excerptStartY - totalTitleHeight - 30

      let textSvg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="black" stop-opacity="0.0"/>
            <stop offset="${width === 1080 ? '40%' : '20%'}" stop-color="black" stop-opacity="0.3"/>
            <stop offset="${width === 1080 ? '70%' : '55%'}" stop-color="black" stop-opacity="0.85"/>
            <stop offset="100%" stop-color="black" stop-opacity="0.98"/>
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="${width}" height="${height}" fill="url(#grad)" />
      `
      
      let currY = titleStartY
      for (const line of titleLines) {
        textSvg += `\n<text x="60" y="${currY}" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="52" fill="#ffffff">${line}</text>`
        currY += titleLineHeight
      }

      currY = excerptStartY
      for (const line of excerptLines) {
        textSvg += `\n<text x="60" y="${currY}" font-family="system-ui, -apple-system, sans-serif" font-weight="400" font-size="28" fill="#e2e8f0">${line}</text>`
        currY += excerptLineHeight
      }

      textSvg += `\n</svg>`

      await sharp(baseImage)
        .composite([{ input: Buffer.from(textSvg), blend: 'over' }])
        .png()
        .toFile(outPath)
    } else {
      await sharp(baseImage).png().toFile(outPath)
    }
  } catch (err) {
    console.error(`❌ Erro ao renderizar ${outPath}:`, err)
  }
}

async function generatePngFromSvg() {
  const dirs = [POST_IMAGES_DIR_CORE, POST_IMAGES_DIR_ROOT]

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue

    const allFiles = fs.readdirSync(dir)

    // 1. Identificar fotos base (limpas, sem overlay)
    for (const f of allFiles) {
      if (f.endsWith('.png') && !f.endsWith('-base.png') && !f.endsWith('-sq.png') && !f.endsWith('-og.png')) {
        const baseName = f.replace(/\.png$/, '-base.png')
        const basePath = path.join(dir, baseName)
        const currentPath = path.join(dir, f)

        // Se a versão -base.png ainda não existir, preservamos a foto limpa em -base.png
        if (!fs.existsSync(basePath)) {
          console.log(`[OG Images] Preservando foto limpa base: ${baseName}`)
          fs.copyFileSync(currentPath, basePath)
        }
      }
    }

    const files = fs.readdirSync(dir)
    const baseFiles = files.filter(f => f.endsWith('.svg') || (f.endsWith('-base.png') && !f.endsWith('-sq.png') && !f.endsWith('-og.png')))

    if (baseFiles.length > 0) {
      console.log(`[OG Images] Encontrados ${baseFiles.length} arquivos base em ${dir}. Gerando versões com overlay para Redes Sociais (-og.png e -sq.png)...`)

      for (const file of baseFiles) {
        const baseImagePath = path.join(dir, file)
        const slug = file.replace(/(\.svg|-base\.png)$/, '')

        // Garante que slug.png (foto limpa do post no blog) venha de slug-base.png
        const cleanBlogPath = path.join(dir, `${slug}.png`)
        if (fs.existsSync(baseImagePath) && file.endsWith('-base.png')) {
          fs.copyFileSync(baseImagePath, cleanBlogPath)
        }

        // Caminhos de saída com overlay para redes sociais
        const pngOgPath = path.join(dir, `${slug}-og.png`)
        const pngSquarePath = path.join(dir, `${slug}-sq.png`)

        const srcStat = fs.statSync(baseImagePath)
        const needsOg = !fs.existsSync(pngOgPath) || fs.statSync(pngOgPath).mtimeMs < srcStat.mtimeMs
        const needsSquare = !fs.existsSync(pngSquarePath) || fs.statSync(pngSquarePath).mtimeMs < srcStat.mtimeMs

        if (!needsOg && !needsSquare) {
          continue
        }

        const frontmatter = findPostFrontmatter(file)
        
        if (needsOg) {
          await renderImageWithOverlay(baseImagePath, pngOgPath, 1200, 630, frontmatter, 32, 68)
        }
        
        if (needsSquare) {
          await renderImageWithOverlay(baseImagePath, pngSquarePath, 1080, 1080, frontmatter, 28, 60)
        }

        console.log(`✅ Geradas versões com overlay (-og.png e -sq.png) para: ${slug}`)
      }
    }
  }

  console.log('[OG Images] Conversão concluída!')
}

generatePngFromSvg()
