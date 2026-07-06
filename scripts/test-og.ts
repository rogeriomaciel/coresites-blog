import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import matter from 'gray-matter'

const postSlug = 'por-que-crms-oficina-falham'

async function runTest() {
  const rootPostPath = path.join(process.cwd(), '..', 'content', 'posts', `${postSlug}.md`)
  const corePostPath = path.join(process.cwd(), 'content', 'posts', `${postSlug}.md`)
  const postPath = fs.existsSync(rootPostPath) ? rootPostPath : corePostPath

  if (!fs.existsSync(postPath)) {
    console.error('Post não encontrado:', postPath)
    return
  }

  const raw = fs.readFileSync(postPath, 'utf-8')
  const parsed = matter(raw)
  const title = parsed.data.title || 'Sem título'
  const excerpt = parsed.data.excerpt || ''
  const coverImage = parsed.data.cover_image

  if (!coverImage) {
    console.error('Sem cover_image no frontmatter')
    return
  }

  const svgFilename = path.basename(coverImage)
  const rootImgPath = path.join(process.cwd(), '..', 'public', 'images', 'posts', svgFilename)
  const coreImgPath = path.join(process.cwd(), 'public', 'images', 'posts', svgFilename)
  const imgPath = fs.existsSync(rootImgPath) ? rootImgPath : coreImgPath

  if (!fs.existsSync(imgPath)) {
    console.error('SVG não encontrado:', imgPath)
    return
  }

  // Função simples para quebrar linhas
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

  // Reduzimos o limite de caracteres por linha para evitar transbordo horizontal (Width 1200 - margins)
  const titleLines = wrapText(title, 32) 
  const excerptLines = wrapText(excerpt, 68).slice(0, 3) // Permite até 3 linhas no resumo
  
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

  const outPath = path.join(process.cwd(), 'test-og3.png')

  try {
    const baseImage = await sharp(imgPath, { density: 300 })
      .resize(1200, 630, { 
        fit: 'cover',
        background: { r: 0, g: 0, b: 0, alpha: 1 } 
      })
      .toBuffer()

    await sharp(baseImage)
      .composite([{ input: Buffer.from(textSvg), blend: 'over' }])
      .png()
      .toFile(outPath)

    console.log(`✅ Teste 3 concluído! Salvo em: ${outPath}`)
  } catch (err) {
    console.error('❌ Erro:', err)
  }
}

runTest()
