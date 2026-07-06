import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const postsDir = path.join(process.cwd(), '..', 'content', 'posts')
const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'))

for (const file of files) {
  const filePath = path.join(postsDir, file)
  const content = fs.readFileSync(filePath, 'utf-8')
  const parsed = matter(content)
  
  if (parsed.data.social_published) {
    delete parsed.data.social_published; // Remove a marcação
    fs.writeFileSync(filePath, matter.stringify(parsed.content, parsed.data))
    console.log(`Desmarcado ${file} para ser republicado.`)
  }
}
