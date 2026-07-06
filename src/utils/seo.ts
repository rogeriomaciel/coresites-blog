import type { PostFrontmatter } from './posts'

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://blog.example.com'
const SITE_NAME = import.meta.env.VITE_SITE_NAME || 'CoreSites Blog'

/**
 * Generate JSON-LD Article structured data for a blog post.
 * This helps Google and AI engines understand the content.
 */
export function generateArticleJsonLd(
  post: PostFrontmatter,
  readingTime: number
): string {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.meta_description || post.excerpt,
    image: post.cover_image
      ? `${SITE_URL}${post.cover_image.replace(/\.svg$/, '.png')}`
      : undefined,
    datePublished: new Date(post.date).toISOString(),
    dateModified: new Date(post.date).toISOString(),
    author: {
      '@type': 'Person',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/favicon.svg`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/post/${post.slug}`,
    },
    keywords: (post.keywords ?? []).join(', '),
    wordCount: undefined as number | undefined,
    timeRequired: `PT${readingTime}M`,
    articleSection: post.category,
  }

  return JSON.stringify(jsonLd)
}

/**
 * Generate JSON-LD BreadcrumbList for navigation context.
 */
export function generateBreadcrumbJsonLd(
  items: { name: string; url: string }[]
): string {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  }

  return JSON.stringify(jsonLd)
}

/**
 * Generate JSON-LD WebSite for sitelinks searchbox in Google.
 */
export function generateWebSiteJsonLd(): string {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
  }

  return JSON.stringify(jsonLd)
}

/**
 * Build Open Graph meta tags object.
 */
export function buildOgTags(post: PostFrontmatter) {
  return {
    'og:title': post.meta_title || post.title,
    'og:description': post.meta_description || post.excerpt,
    'og:type': 'article',
    'og:url': `${SITE_URL}/post/${post.slug}`,
    'og:image': post.cover_image
      ? `${SITE_URL}${post.cover_image.replace(/\.svg$/, '.png')}`
      : undefined,
    'og:site_name': SITE_NAME,
    'og:locale': 'pt_BR',
    'article:published_time': new Date(post.date).toISOString(),
    'article:author': post.author,
    'article:section': post.category,
    'article:tag': (post.tags ?? []).join(', '),
  }
}

/**
 * Build Twitter Card meta tags object.
 */
export function buildTwitterTags(post: PostFrontmatter) {
  return {
    'twitter:card': 'summary_large_image',
    'twitter:title': post.meta_title || post.title,
    'twitter:description': post.meta_description || post.excerpt,
    'twitter:image': post.cover_image
      ? `${SITE_URL}${post.cover_image.replace(/\.svg$/, '.png')}`
      : undefined,
  }
}

/**
 * Generate JSON-LD FAQPage structured data from markdown content.
 * Extracts headers ending with '?' and the subsequent paragraph.
 */
export function generateFAQJsonLd(content: string): string | null {
  // Regex matches '## ' or '### ' followed by text ending with '?'
  // Then captures the paragraph(s) until the next header or EOF
  const faqRegex = /^#{2,3}\s+(.+?\?)\s*\n+([^#]+)/gm
  const faqs: { question: string; answer: string }[] = []
  
  let match;
  while ((match = faqRegex.exec(content)) !== null) {
    const question = match[1].trim()
    const answer = match[2].trim()
    if (question && answer) {
      faqs.push({ question, answer })
    }
  }

  if (faqs.length === 0) return null

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  return JSON.stringify(jsonLd)
}
