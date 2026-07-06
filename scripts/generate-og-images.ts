import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const POST_IMAGES_DIR_CORE = path.join(process.cwd(), 'public', 'images', 'posts')
const POST_IMAGES_DIR_ROOT = path.join(process.cwd(), '..', 'public', 'images', 'posts')

async function generatePngFromSvg() {
  const dirs = [POST_IMAGES_DIR_CORE, POST_IMAGES_DIR_ROOT]

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      continue
    }

    const files = fs.readdirSync(dir)
    const svgFiles = files.filter(f => f.endsWith('.svg'))

    if (svgFiles.length > 0) {
      console.log(`[OG Images] Encontrados ${svgFiles.length} arquivos .svg em ${dir}. Iniciando conversão...`)

      for (const file of svgFiles) {
        const svgPath = path.join(dir, file)
        const pngFilename = file.replace(/\.svg$/, '.png')
        const pngPath = path.join(dir, pngFilename)

        try {
          await sharp(svgPath, { density: 300 })
            .resize(1200, 630, { 
              fit: 'contain',
              background: { r: 255, g: 255, b: 255, alpha: 1 } 
            })
            .png()
            .toFile(pngPath)

          console.log(`✅ Convertido: ${file} -> ${pngFilename}`)
        } catch (err) {
          console.error(`❌ Erro ao converter ${file}:`, err)
        }
      }
    }
  }

  console.log('[OG Images] Conversão concluída!')
}

generatePngFromSvg()
