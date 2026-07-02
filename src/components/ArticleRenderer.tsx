import { useMemo } from 'react'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

interface ArticleRendererProps {
  content: string
}

/**
 * Renders Markdown content safely using marked + DOMPurify.
 * This prevents XSS while displaying rich formatted content.
 */
export default function ArticleRenderer({ content }: ArticleRendererProps) {
  const sanitizedHtml = useMemo(() => {
    const rawHtml = marked.parse(content, { async: false }) as string
    return DOMPurify.sanitize(rawHtml, {
      ADD_TAGS: ['iframe'],
      ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling'],
    })
  }, [content])

  return (
    <div
      className="article-content"
      // DOMPurify sanitizes the HTML before rendering, preventing XSS attacks
      // while allowing safe formatting from the Markdown source.
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  )
}
