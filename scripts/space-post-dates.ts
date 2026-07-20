import fs from 'node:fs'
import path from 'node:path'

const postsDir = path.join(process.cwd(), '..', 'content', 'posts')
const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'))

// Ordenar os arquivos para manter uma ordem coerente
files.sort()

// Início em 10 de Maio de 2026
let currentDate = new Date('2026-05-10')

files.forEach((file, index) => {
  const filePath = path.join(postsDir, file)
  let content = fs.readFileSync(filePath, 'utf-8')
  
  // Formatar data como YYYY-MM-DD
  const dateStr = currentDate.toISOString().split('T')[0]
  
  // Substituir a linha de data (lidando com aspas simples, duplas ou sem aspas)
  content = content.replace(/date:\s*['"]?\d{4}-\d{2}-\d{2}['"]?/, `date: '${dateStr}'`)
  
  fs.writeFileSync(filePath, content, 'utf-8')
  console.log(`Updated ${file} -> date: '${dateStr}'`)
  
  // Avançar 4 dias para o próximo post
  currentDate.setDate(currentDate.getDate() + 4)
})

console.log('✅ Distribuição de datas dos posts finalizada!')
