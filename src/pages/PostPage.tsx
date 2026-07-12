import { useParams, Link } from 'react-router-dom'
import { useMemo, useEffect } from 'react'
import SEOHead from '../components/SEOHead'
import ArticleRenderer from '../components/ArticleRenderer'
import ReadingProgress from '../components/ReadingProgress'
import ShareButtons from '../components/ShareButtons'
import PostCard from '../components/PostCard'
import PromoBanner from '../components/PromoBanner'
import { getPostBySlug, getRelatedPosts, formatDate, resolveAssetPath } from '../utils/posts'
import { useI18n } from '../utils/i18n'

export default function PostPage() {
  const { slug } = useParams<{ slug: string }>()
  const { language, t } = useI18n()

  const post = useMemo(
    () => (slug ? getPostBySlug(slug, language) : undefined),
    [slug, language]
  )

  const related = useMemo(
    () => (slug ? getRelatedPosts(slug, 3) : []),
    [slug]
  )

  // Scroll to top on navigation
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  if (!post) {
    return (
      <div className="not-found" id="post-not-found">
        <h1>404</h1>
        <p>{t('post.not_found')}</p>
        <Link to="/" className="btn-primary">
          {t('post.back_home')}
        </Link>
      </div>
    )
  }

  const { frontmatter, content, readingTime } = post

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    {
      name: frontmatter.category,
      url: `/categoria/${encodeURIComponent(frontmatter.category.toLowerCase())}`,
    },
    { name: frontmatter.title, url: `/post/${frontmatter.slug}` },
  ]

  const authorInitials = frontmatter.author
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <>
      <ReadingProgress />
      <SEOHead
        post={frontmatter}
        readingTime={readingTime}
        breadcrumbs={breadcrumbs}
        content={content}
      />

      <article className="article-page animate-fade-in" id="article-page">
        {/* Hero Image */}
        {frontmatter.cover_image && (
          <div className="container">
            <img
              className="article-hero-image"
              src={resolveAssetPath(frontmatter.cover_image)}
              alt={frontmatter.title}
            />
          </div>
        )}

        {/* Article Header */}
        <header className="article-header">
          {/* Breadcrumbs */}
          <nav className="breadcrumbs" id="article-breadcrumbs" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span className="separator">/</span>
            <Link
              to={`/categoria/${encodeURIComponent(frontmatter.category.toLowerCase())}`}
            >
              {frontmatter.category}
            </Link>
            <span className="separator">/</span>
            <span>{frontmatter.title}</span>
          </nav>

          <h1>{frontmatter.title}</h1>

          <div className="article-meta" id="article-meta">
            {/* Author */}
            <div className="article-author">
              <div className="article-author-avatar">{authorInitials}</div>
              <span>{frontmatter.author}</span>
            </div>

            {/* Date */}
            <div className="article-meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>{formatDate(frontmatter.date, language)}</span>
            </div>

            {/* Reading Time */}
            <div className="article-meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>{readingTime} {t('post.reading_time')}</span>
            </div>

            {/* Category */}
            <Link
              to={`/categoria/${encodeURIComponent(frontmatter.category.toLowerCase())}`}
              className="tag tag-category"
            >
              {frontmatter.category}
            </Link>
          </div>
        </header>

        {/* Article Content */}
        <ArticleRenderer content={content} />

        {/* Tags */}
        <div className="content-container" style={{ marginBottom: '2rem' }}>
          <div className="tags">
            {frontmatter.tags?.map((tag) => (
              <span key={tag} className="tag">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Share Buttons */}
        <ShareButtons
          title={frontmatter.title}
          url={`/post/${frontmatter.slug}`}
        />
      </article>

      {/* Related Articles */}
      {related.length > 0 && (
        <section className="related-section" id="related-articles">
          <h3 className="section-heading">{t('post.related')}</h3>
          <div className="posts-grid">
            {related.map((relPost) => (
              <PostCard key={relPost.frontmatter.slug} post={relPost} />
            ))}
          </div>
        </section>
      )}

      {/* Promo CTA Banner */}
      <div className="container" style={{ paddingBottom: 0 }}>
        <PromoBanner />
      </div>
    </>
  )
}
