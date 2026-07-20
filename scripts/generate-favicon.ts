/**
 * Script temporário para gerar favicon.ico a partir do logo PNG.
 * Gera múltiplos tamanhos (16x16, 32x32, 48x48) num único .ico
 */
import sharp from 'sharp'
import { writeFileSync } from 'fs'

const INPUT = 'public/logo-coreauto.png'
const OUTPUT_ICO = 'public/favicon.ico'
const OUTPUT_PNG_32 = 'public/favicon-32x32.png'
const OUTPUT_PNG_16 = 'public/favicon-16x16.png'
const OUTPUT_APPLE = 'public/apple-touch-icon.png'

// Generate PNG favicons
await sharp(INPUT).resize(32, 32).png().toFile(OUTPUT_PNG_32)
await sharp(INPUT).resize(16, 16).png().toFile(OUTPUT_PNG_16)
await sharp(INPUT).resize(180, 180).png().toFile(OUTPUT_APPLE)

// Generate ICO (contains 16x16, 32x32, 48x48)
const sizes = [16, 32, 48]
const images = await Promise.all(
  sizes.map(size => sharp(INPUT).resize(size, size).png().toBuffer())
)

// ICO file format: header + directory entries + image data
function buildIco(pngBuffers: Buffer[], iconSizes: number[]): Buffer {
  const numImages = pngBuffers.length
  const headerSize = 6
  const dirEntrySize = 16
  const dirSize = dirEntrySize * numImages
  const dataOffset = headerSize + dirSize

  // Calculate offsets
  let currentOffset = dataOffset
  const offsets: number[] = []
  for (const buf of pngBuffers) {
    offsets.push(currentOffset)
    currentOffset += buf.length
  }

  const totalSize = currentOffset
  const result = Buffer.alloc(totalSize)

  // ICO Header
  result.writeUInt16LE(0, 0)      // Reserved
  result.writeUInt16LE(1, 2)      // Type: 1 = ICO
  result.writeUInt16LE(numImages, 4)  // Number of images

  // Directory entries
  for (let i = 0; i < numImages; i++) {
    const offset = headerSize + i * dirEntrySize
    const size = iconSizes[i]
    result.writeUInt8(size < 256 ? size : 0, offset)     // Width
    result.writeUInt8(size < 256 ? size : 0, offset + 1)  // Height
    result.writeUInt8(0, offset + 2)   // Color palette
    result.writeUInt8(0, offset + 3)   // Reserved
    result.writeUInt16LE(1, offset + 4)  // Color planes
    result.writeUInt16LE(32, offset + 6) // Bits per pixel
    result.writeUInt32LE(pngBuffers[i].length, offset + 8) // Size of image data
    result.writeUInt32LE(offsets[i], offset + 12) // Offset to image data
  }

  // Image data
  for (let i = 0; i < numImages; i++) {
    pngBuffers[i].copy(result, offsets[i])
  }

  return result
}

const icoBuffer = buildIco(images as Buffer[], sizes)
writeFileSync(OUTPUT_ICO, icoBuffer)

console.log('✅ favicon.ico gerado (16x16, 32x32, 48x48)')
console.log('✅ favicon-32x32.png gerado')
console.log('✅ favicon-16x16.png gerado')
console.log('✅ apple-touch-icon.png gerado (180x180)')
