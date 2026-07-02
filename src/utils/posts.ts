
/**
 * Resolves an asset path based on the Vite BASE_URL configuration.
 * This ensures images work correctly even when the site is deployed to a subpath.
 */
export const resolveAssetPath = (path?: string | null): string => {
  if (!path) return ''
  if (path.startsWith('http') || path.startsWith('data:')) return path
  
  const base = import.meta.env.BASE_URL || '/'
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  return base.endsWith('/') ? `${base}${cleanPath}` : `${base}/${cleanPath}`
}

export interface PostFrontmatter {
  title: string
  slug: string
  date: string
  author: string
  excerpt: string
  meta_title: string
  meta_description: string
  keywords: string[]
  category: string
  tags: string[]
  cover_image: string
  published: boolean
}

export interface Post {
  frontmatter: PostFrontmatter
  content: string
  readingTime: number
}

/**
 * Calculate estimated reading time in minutes.
 */
function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200
  const words = text.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / wordsPerMinute))
}

/**
 * Load all markdown posts from content/posts/ at build time.
 * Searches both the internal template directory and the external client directory (if used as a submodule).
 */
const postFilesRaw = import.meta.glob(
  [
    '../../content/posts/*.md',
    '../../../content/posts/*.md'
  ],
  {
    query: '?raw',
    eager: true,
    import: 'default',
  }
) as Record<string, string>

// Se houver posts do cliente (../../../), ignoramos totalmente os posts internos do Core (../../)
const allPaths = Object.keys(postFilesRaw)
const hasClientPosts = allPaths.some(path => path.startsWith('../../../content/posts'))

const postFiles = hasClientPosts
  ? Object.fromEntries(Object.entries(postFilesRaw).filter(([path]) => path.startsWith('../../../content/posts')))
  : postFilesRaw

/**
 * Parse a raw markdown string into a Post object.
 * We use a custom parser instead of gray-matter to avoid Vite browser-compatibility issues (Buffer/js-yaml).
 */
function parsePost(raw: string): Post {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  
  let data: Record<string, any> = {}
  let content = raw

  if (match) {
    const yaml = match[1]
    content = match[2]

    const lines = yaml.split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue

      const colonIdx = trimmed.indexOf(':')
      if (colonIdx === -1) continue

      const key = trimmed.slice(0, colonIdx).trim()
      let value = trimmed.slice(colonIdx + 1).trim()

      if (value.startsWith('[') && value.endsWith(']')) {
        try {
          data[key as keyof PostFrontmatter] = JSON.parse(value.replace(/'/g, '"'))
        } catch {
          data[key as keyof PostFrontmatter] = value.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, '')) as any
        }
      } else if (value === 'true') {
        data[key as keyof PostFrontmatter] = true as any
      } else if (value === 'false') {
        data[key as keyof PostFrontmatter] = false as any
      } else {
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1)
        }
        data[key as keyof PostFrontmatter] = value as any
      }
    }
  }

  const frontmatter = data as PostFrontmatter

  return {
    frontmatter,
    content,
    readingTime: calculateReadingTime(content),
  }
}

/**
 * Get all published posts, sorted by date (newest first).
 */
export function getAllPosts(): Post[] {
  const posts: Post[] = []

  for (const raw of Object.values(postFiles)) {
    const post = parsePost(raw)
    if (post.frontmatter.published !== false) {
      posts.push(post)
    }
  }

  posts.sort((a, b) => {
    const dateA = new Date(a.frontmatter.date).getTime()
    const dateB = new Date(b.frontmatter.date).getTime()
    return dateB - dateA
  })

  return posts
}

/**
 * Get a single post by slug.
 */
export function getPostBySlug(slug: string): Post | undefined {
  const allPosts = getAllPosts()
  return allPosts.find((p) => p.frontmatter.slug === slug)
}

/**
 * Get all unique categories.
 */
export function getAllCategories(): string[] {
  const posts = getAllPosts()
  const categories = new Set<string>()
  for (const post of posts) {
    if (post.frontmatter.category) {
      categories.add(post.frontmatter.category)
    }
  }
  return Array.from(categories).sort()
}

/**
 * Get all unique tags.
 */
export function getAllTags(): string[] {
  const posts = getAllPosts()
  const tags = new Set<string>()
  for (const post of posts) {
    for (const tag of post.frontmatter.tags ?? []) {
      tags.add(tag)
    }
  }
  return Array.from(tags).sort()
}

/**
 * Get posts by category.
 */
export function getPostsByCategory(category: string): Post[] {
  return getAllPosts().filter(
    (p) => p.frontmatter.category.toLowerCase() === category.toLowerCase()
  )
}

/**
 * Search posts by title, excerpt, tags, and category.
 */
export function searchPosts(query: string): Post[] {
  const q = query.toLowerCase().trim()
  if (!q) return getAllPosts()

  return getAllPosts().filter((post) => {
    const { title, excerpt, tags, category, keywords } = post.frontmatter
    const searchable = [
      title,
      excerpt,
      category,
      ...(tags ?? []),
      ...(keywords ?? []),
    ]
      .join(' ')
      .toLowerCase()
    return searchable.includes(q)
  })
}

/**
 * Get related posts (same category or shared tags, excluding current).
 */
export function getRelatedPosts(currentSlug: string, limit = 3): Post[] {
  const current = getPostBySlug(currentSlug)
  if (!current) return []

  const allPosts = getAllPosts().filter(
    (p) => p.frontmatter.slug !== currentSlug
  )
  const currentTags = new Set(current.frontmatter.tags ?? [])

  const scored = allPosts.map((post) => {
    let score = 0
    if (post.frontmatter.category === current.frontmatter.category) score += 2
    for (const tag of post.frontmatter.tags ?? []) {
      if (currentTags.has(tag)) score += 1
    }
    return { post, score }
  })

  scored.sort((a, b) => b.score - a.score)

  return scored.slice(0, limit).map((s) => s.post)
}

/**
 * Format a date string to pt-BR locale.
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
