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

// Encontra o markdown baseado no nome da imagem
function findPostFrontmatter(svgFilename: string) {
  const slug = svgFilename.replace(/\.svg$/, '')
  const rootPostPath = path.join(process.cwd(), '..', 'content', 'posts', `${slug}.md`)
  const corePostPath = path.join(process.cwd(), 'content', 'posts', `${slug}.md`)
  
  const postPath = fs.existsSync(rootPostPath) ? rootPostPath : (fs.existsSync(corePostPath) ? corePostPath : '')
  
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

async function generatePngFromSvg() {
  const dirs = [POST_IMAGES_DIR_CORE, POST_IMAGES_DIR_ROOT]

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      continue
    }

    const files = fs.readdirSync(dir)
    const svgFiles = files.filter(f => f.endsWith('.svg'))

    if (svgFiles.length > 0) {
      console.log(`[OG Images] Encontrados ${svgFiles.length} arquivos .svg em ${dir}. Iniciando conversão com tipografia injetada...`)

      for (const file of svgFiles) {
        const svgPath = path.join(dir, file)
        const pngFilename = file.replace(/\.svg$/, '.png')
        const pngPath = path.join(dir, pngFilename)

        try {
          const baseImage = await sharp(svgPath, { density: 300 })
            .resize(1200, 630, { 
              fit: 'cover',
              background: { r: 0, g: 0, b: 0, alpha: 1 } 
            })
            .toBuffer()

          const frontmatter = findPostFrontmatter(file)
          
          if (frontmatter) {
            const titleLines = wrapText(frontmatter.title, 32)
            const excerptLines = wrapText(frontmatter.excerpt, 68).slice(0, 3)

            const titleLineHeight = 64
            const excerptLineHeight = 40
            
            const totalExcerptHeight = excerptLines.length * excerptLineHeight
            const excerptStartY = 600 - totalExcerptHeight

            const totalTitleHeight = titleLines.length * titleLineHeight
            const titleStartY = excerptStartY - totalTitleHeight - 30

            let textSvg = `
            <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="black" stop-opacity="0.0"/>
                  <stop offset="25%" stop-color="black" stop-opacity="0.2"/>
                  <stop offset="60%" stop-color="black" stop-opacity="0.75"/>
                  <stop offset="100%" stop-color="black" stop-opacity="0.95"/>
                </linearGradient>
              </defs>
              <rect x="0" y="0" width="1200" height="630" fill="url(#grad)" />
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
              .toFile(pngPath)

          } else {
            // Fallback: se não encontrar o post, apenas gera a imagem sem texto
            await sharp(baseImage).png().toFile(pngPath)
          }

          console.log(`✅ Convertido e injetado: ${file} -> ${pngFilename}`)
        } catch (err) {
          console.error(`❌ Erro ao converter ${file}:`, err)
        }
      }
    }
  }

  console.log('[OG Images] Conversão concluída!')
}

generatePngFromSvg()
