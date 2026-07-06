import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const postsDir = path.join(process.cwd(), '..', 'content', 'posts')
const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'))

for (const file of files) {
  const filePath = path.join(postsDir, file)
  const content = fs.readFileSync(filePath, 'utf-8')
  const parsed = matter(content)
  
  const networks = Array.isArray(parsed.data.social_published) ? parsed.data.social_published : []
  if (!networks.includes('linkedin')) {
    networks.push('linkedin')
    parsed.data.social_published = networks
    fs.writeFileSync(filePath, matter.stringify(parsed.content, parsed.data))
    console.log(`Marcado ${file} como publicado.`)
  }
}
