import { Link } from 'react-router-dom'
import type { Post } from '../utils/posts'
import { resolveAssetPath, formatDate } from '../utils/posts'
import { useI18n } from '../utils/i18n'

interface CategorySectionProps {
  categoryName: string
  posts: Post[]
}

export default function CategorySection({ categoryName, posts }: CategorySectionProps) {
  const { language, t } = useI18n()

  if (!posts || posts.length === 0) return null

  const featuredPost = posts[0]
  const subPosts = posts.slice(1, 4)
  const catSlug = encodeURIComponent(categoryName.toLowerCase())

  const getCategoryIcon = (cat: string) => {
    const name = cat.toLowerCase()
    if (name.includes('venda') || name.includes('whatsapp')) return '📱'
    if (name.includes('gest') || name.includes('produtiv')) return '⚙️'
    if (name.includes('ia') || name.includes('automat')) return '🤖'
    if (name.includes('diagn') || name.includes('operac')) return '🚗'
    return '📋'
  }

  const hasSubposts = subPosts.length > 0

  return (
    <section className="category-section" id={`cat-section-${catSlug}`}>
      {/* Header da Categoria */}
      <div className="cat-section-header">
        <div className="cat-section-title-group">
          <span className="cat-section-icon">{getCategoryIcon(categoryName)}</span>
          <h2 className="cat-section-title">{categoryName}</h2>
          <span className="cat-section-count">
            ({posts.length} {posts.length === 1 ? 'artigo' : 'artigos'})
          </span>
        </div>

        <Link to={`/categoria/${catSlug}`} className="cat-section-link">
          <span>Ver todos os artigos de {categoryName}</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>
      </div>

      {/* Se tiver subposts, renderiza grade 2 colunas. Se tiver só 1 post, renderiza em largura total sem espaço em branco no lado */}
      {hasSubposts ? (
        <div className="cat-section-grid">
          {/* Post Destaque Esquerda */}
          {featuredPost && (
            <Link
              to={`/post/${featuredPost.frontmatter.slug}`}
              className="cat-featured-card"
            >
              {featuredPost.frontmatter.cover_image && (
                <div className="cat-featured-image-wrapper">
                  <img
                    src={resolveAssetPath(featuredPost.frontmatter.cover_image)}
                    alt={featuredPost.frontmatter.title}
                    className="cat-featured-image"
                  />
                  <span className="cat-featured-badge">DESTAQUE</span>
                </div>
              )}
              <div className="cat-featured-content">
                <div className="cat-featured-meta">
                  <span className="cat-featured-time">
                    ⏱️ {featuredPost.readingTime} {t('post.reading_time')}
                  </span>
                  <span className="cat-featured-date">
                    {formatDate(featuredPost.frontmatter.date, language)}
                  </span>
                </div>
                <h3 className="cat-featured-title">{featuredPost.frontmatter.title}</h3>
                <p className="cat-featured-excerpt">{featuredPost.frontmatter.excerpt}</p>
              </div>
            </Link>
          )}

          {/* Coluna Subdestacados Direita */}
          <div className="cat-subposts-list">
            {subPosts.map((subPost) => (
              <Link
                key={subPost.frontmatter.slug}
                to={`/post/${subPost.frontmatter.slug}`}
                className="cat-subpost-card"
              >
                {subPost.frontmatter.cover_image && (
                  <img
                    src={resolveAssetPath(subPost.frontmatter.cover_image)}
                    alt={subPost.frontmatter.title}
                    className="cat-subpost-thumb"
                  />
                )}
                <div className="cat-subpost-content">
                  <h4 className="cat-subpost-title">{subPost.frontmatter.title}</h4>
                  <div className="cat-subpost-meta">
                    <span>⏱️ {subPost.readingTime} {t('post.reading_time')}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        /* Caso a categoria tenha apenas 1 artigo: Exibe em Card Horizontal Full Width (sem espaço vazio do lado) */
        <div className="cat-single-post-wrapper">
          <Link
            to={`/post/${featuredPost.frontmatter.slug}`}
            className="cat-single-post-card"
          >
            {featuredPost.frontmatter.cover_image && (
              <div className="cat-single-post-img-wrapper">
                <img
                  src={resolveAssetPath(featuredPost.frontmatter.cover_image)}
                  alt={featuredPost.frontmatter.title}
                  className="cat-single-post-img"
                />
              </div>
            )}
            <div className="cat-single-post-content">
              <div className="cat-featured-meta">
                <span className="cat-featured-time">
                  ⏱️ {featuredPost.readingTime} {t('post.reading_time')}
                </span>
                <span className="cat-featured-date">
                  {formatDate(featuredPost.frontmatter.date, language)}
                </span>
              </div>
              <h3 className="cat-single-post-title">{featuredPost.frontmatter.title}</h3>
              <p className="cat-featured-excerpt">{featuredPost.frontmatter.excerpt}</p>
              <span className="cat-single-post-link">Ler artigo ➔</span>
            </div>
          </Link>
        </div>
      )}
    </section>
  )
}
