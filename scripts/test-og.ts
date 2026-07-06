import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import matter from 'gray-matter'

const postSlug = 'por-que-crms-oficina-falham'

async function runTest() {
  const rootPostPath = path.join(process.cwd(), '..', 'content', 'posts', `${postSlug}.md`)
  const corePostPath = path.join(process.cwd(), 'content', 'posts', `${postSlug}.md`)
  const postPath = fs.existsSync(rootPostPath) ? rootPostPath : corePostPath

  const raw = fs.readFileSync(postPath, 'utf-8')
  const parsed = matter(raw)
  const title = parsed.data.title || 'Sem título'
  const excerpt = parsed.data.excerpt || ''
  const coverImage = parsed.data.cover_image

  const svgFilename = path.basename(coverImage)
  const rootImgPath = path.join(process.cwd(), '..', 'public', 'images', 'posts', svgFilename)
  const coreImgPath = path.join(process.cwd(), 'public', 'images', 'posts', svgFilename)
  const imgPath = fs.existsSync(rootImgPath) ? rootImgPath : coreImgPath

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

  // ==== TESTE FORMATO QUADRADO (1080x1080) PARA INSTAGRAM ====
  const WIDTH = 1080
  const HEIGHT = 1080

  const titleLines = wrapText(title, 28) // 1080px = max ~28 chars na fonte 52
  const excerptLines = wrapText(excerpt, 60).slice(0, 3) 
  
  const titleLineHeight = 64
  const excerptLineHeight = 40
  
  const totalExcerptHeight = excerptLines.length * excerptLineHeight
  const excerptStartY = HEIGHT - 50 - totalExcerptHeight // Margem de 50px do fundo

  const totalTitleHeight = titleLines.length * titleLineHeight
  const titleStartY = excerptStartY - totalTitleHeight - 30 // 30px de distância do excerpt

  let textSvg = `
  <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="black" stop-opacity="0.0"/>
        <stop offset="50%" stop-color="black" stop-opacity="0.1"/>
        <stop offset="75%" stop-color="black" stop-opacity="0.75"/>
        <stop offset="100%" stop-color="black" stop-opacity="0.95"/>
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="${WIDTH}" height="${HEIGHT}" fill="url(#grad)" />
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

  const outPath = path.join(process.cwd(), 'test-og-square.png')

  try {
    // Rendereiza nativamente a partir do SVG base num viewport quadrado
    const baseImage = await sharp(imgPath, { density: 300 })
      .resize(WIDTH, HEIGHT, { 
        fit: 'cover',
        background: { r: 0, g: 0, b: 0, alpha: 1 } 
      })
      .toBuffer()

    await sharp(baseImage)
      .composite([{ input: Buffer.from(textSvg), blend: 'over' }])
      .png()
      .toFile(outPath)

    console.log(`✅ Teste Square (1080x1080) concluído! Salvo em: ${outPath}`)
  } catch (err) {
    console.error('❌ Erro:', err)
  }
}

runTest()
