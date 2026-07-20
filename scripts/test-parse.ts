import fs from 'node:fs'
import path from 'node:path'

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

const files = [
  'por-que-crms-oficina-falham.md',
  'fim-papelzinho-ia-oficinas.md',
  'abandono-erp-migracao-whatsapp.md'
]

for (const file of files) {
  const filePath = path.join(process.cwd(), '..', 'content', 'posts', file)
  if (fs.existsSync(filePath)) {
    const raw = fs.readFileSync(filePath, 'utf-8')
    console.log(`=== ${file} ===`)
    const parsed = parseFrontmatter(raw)
    console.log(parsed ? parsed.data : null)
  } else {
    console.log(`File not found: ${filePath}`)
  }
}
