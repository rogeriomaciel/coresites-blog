import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import SEOHead from '../components/SEOHead'
import PostCard from '../components/PostCard'
import PromoBanner from '../components/PromoBanner'
import { getAllPosts, searchPosts, resolveAssetPath } from '../utils/posts'
import { useI18n } from '../utils/i18n'

export default function Home() {
  const [searchParams] = useSearchParams()
  const { language, t } = useI18n()
  const query = searchParams.get('q') || ''

  const posts = useMemo(
    () => (query ? searchPosts(query, language) : getAllPosts(language)),
    [query, language]
  )

  const featuredPost = !query ? posts[0] : undefined
  const gridPosts = !query ? posts.slice(1) : posts

  const siteDescription = import.meta.env.VITE_SITE_DESCRIPTION || 'Artigos sobre tecnologia, IA, automação e desenvolvimento. Conteúdo prático para resolver problemas reais.'

  return (
    <>
      <SEOHead isHome={!query} title={query ? `Busca: ${query}` : undefined} />

      <section className="hero">
        <div className="container">
          <h1 className="hero-title">
            <img
              src="/logo-coreauto-horizontal.png"
              alt={import.meta.env.VITE_SITE_NAME || 'CoreAuto'}
              className="hero-logo-image"
            />
          </h1>
          <p className="hero-subtitle">
            {siteDescription}
          </p>
        </div>
      </section>

      <div className="container">
        {/* Search result indicator */}
        {query && (
          <div className="section-heading" id="search-results-heading">
            {t('search.results')} &ldquo;{query}&rdquo;
            <Link to="/" style={{ marginLeft: 'auto', fontSize: '0.85rem' }}>
              {t('search.clear')}
            </Link>
          </div>
        )}

        {/* Featured post (only on home without search) */}
        {featuredPost && (
          <Link
            to={`/post/${featuredPost.frontmatter.slug}`}
            className="featured-card animate-fade-in"
            id="featured-post"
          >
            {featuredPost.frontmatter.cover_image && (
              <img
                className="featured-card-image"
                src={resolveAssetPath(featuredPost.frontmatter.cover_image)}
                alt={featuredPost.frontmatter.title}
              />
            )}
            <div className="featured-card-overlay">
              <div className="tags" style={{ marginBottom: '0.75rem' }}>
                <span className="tag tag-category">
                  {featuredPost.frontmatter.category}
                </span>
                <span className="tag">
                  {featuredPost.readingTime} {t('post.reading_time')}
                </span>
              </div>
              <h2>{featuredPost.frontmatter.title}</h2>
              <p>{featuredPost.frontmatter.excerpt}</p>
            </div>
          </Link>
        )}

        {/* Posts grid */}
        {gridPosts.length > 0 ? (
          <>
            {!query && (
              <h2 className="section-heading" id="latest-posts-heading">
                {t('post.recent')}
              </h2>
            )}
            <div className="posts-grid" id="posts-grid">
              {gridPosts.map((post) => (
                <PostCard key={post.frontmatter.slug} post={post} />
              ))}
              <PromoBanner />
            </div>
          </>
        ) : (
          <div className="empty-state" id="empty-state">
            <h3>{t('search.empty')}</h3>
            <p>
              {query
                ? t('search.empty_sub')
                : t('search.empty_none')}
            </p>
          </div>
        )}
      </div>
    </>
  )
}
