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

function findPostFrontmatter(svgFilename: string) {
  const slug = svgFilename.replace(/\.svg$/, '')
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
      excerpt: parsed.data.excerpt || ''
    }
  } catch {
    return null
  }
}

async function renderImage(svgPath: string, outPath: string, width: number, height: number, frontmatter: any, maxCharsTitle: number, maxCharsExcerpt: number) {
  try {
    const baseImage = await sharp(svgPath, { density: 300 })
      .resize(width, height, { 
        fit: 'cover',
        background: { r: 0, g: 0, b: 0, alpha: 1 } 
      })
      .toBuffer()

    if (frontmatter) {
      const titleLines = wrapText(frontmatter.title, maxCharsTitle)
      const excerptLines = wrapText(frontmatter.excerpt, maxCharsExcerpt).slice(0, 3)

      const titleLineHeight = width === 1080 ? 64 : 64
      const excerptLineHeight = width === 1080 ? 40 : 40
      
      const totalExcerptHeight = excerptLines.length * excerptLineHeight
      const excerptStartY = height - (width === 1080 ? 50 : 30) - totalExcerptHeight

      const totalTitleHeight = titleLines.length * titleLineHeight
      const titleStartY = excerptStartY - totalTitleHeight - 30

      let textSvg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="black" stop-opacity="0.0"/>
            <stop offset="${width === 1080 ? '50%' : '25%'}" stop-color="black" stop-opacity="${width === 1080 ? '0.1' : '0.2'}"/>
            <stop offset="${width === 1080 ? '75%' : '60%'}" stop-color="black" stop-opacity="0.75"/>
            <stop offset="100%" stop-color="black" stop-opacity="0.95"/>
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="${width}" height="${height}" fill="url(#grad)" />
      `
      
      let currY = titleStartY
      for (const line of titleLines) {
        textSvg += `\n<text x="60" y="${currY}" font-family="sans-serif" font-weight="bold" font-size="52" fill="#ffffff">${line}</text>`
        currY += titleLineHeight
      }

      currY = excerptStartY
      for (const line of excerptLines) {
        textSvg += `\n<text x="60" y="${currY}" font-family="sans-serif" font-size="28" fill="#e0e0e0">${line}</text>`
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

    const files = fs.readdirSync(dir)
    const svgFiles = files.filter(f => f.endsWith('.svg'))

    if (svgFiles.length > 0) {
      console.log(`[OG Images] Encontrados ${svgFiles.length} arquivos .svg em ${dir}. Iniciando conversão dupla (Wide e Square)...`)

      for (const file of svgFiles) {
        const svgPath = path.join(dir, file)
        
        // Caminhos de saída
        const pngWidePath = path.join(dir, file.replace(/\.svg$/, '.png'))
        const pngSquarePath = path.join(dir, file.replace(/\.svg$/, '-sq.png'))

        const frontmatter = findPostFrontmatter(file)
        
        // Renderiza formato OG Wide (1200x630)
        await renderImage(svgPath, pngWidePath, 1200, 630, frontmatter, 32, 68)
        
        // Renderiza formato IG Square (1080x1080)
        await renderImage(svgPath, pngSquarePath, 1080, 1080, frontmatter, 28, 60)

        console.log(`✅ Dupla versão gerada para: ${file}`)
      }
    }
  }

  console.log('[OG Images] Conversão concluída!')
}

generatePngFromSvg()
