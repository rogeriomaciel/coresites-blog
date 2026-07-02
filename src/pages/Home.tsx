import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import SEOHead from '../components/SEOHead'
import PostCard from '../components/PostCard'
import { getAllPosts, getAllCategories, searchPosts } from '../utils/posts'

export default function Home() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''

  const posts = useMemo(
    () => (query ? searchPosts(query) : getAllPosts()),
    [query]
  )

  const categories = useMemo(() => getAllCategories(), [])

  const featuredPost = !query ? posts[0] : undefined
  const gridPosts = !query ? posts.slice(1) : posts

  const siteName = import.meta.env.VITE_SITE_NAME || 'CoreSites Blog'
  const siteDescription = import.meta.env.VITE_SITE_DESCRIPTION || 'Artigos sobre tecnologia, IA, automação e desenvolvimento. Conteúdo prático para resolver problemas reais.'
  
  const nameParts = siteName.split(' ')
  const firstWord = nameParts[0]
  const restOfName = nameParts.slice(1).join(' ')

  return (
    <>
      <SEOHead isHome={!query} title={query ? `Busca: ${query}` : undefined} />

      <section className="hero">
        <div className="container">
          <h1 className="hero-title">
            <span className="gradient-text">{firstWord}</span> {restOfName}
          </h1>
          <p className="hero-subtitle">
            {siteDescription}
          </p>
        </div>
      </section>

      <div className="container">
        {/* Category filters */}
        <div className="category-filters" id="category-filters">
          <Link
            to="/"
            className={`category-pill ${!query ? 'active' : ''}`}
          >
            Todos
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat}
              to={`/categoria/${encodeURIComponent(cat.toLowerCase())}`}
              className="category-pill"
            >
              {cat}
            </Link>
          ))}
        </div>

        {/* Search result indicator */}
        {query && (
          <div className="section-heading" id="search-results-heading">
            Resultados para &ldquo;{query}&rdquo;
            <Link to="/" style={{ marginLeft: 'auto', fontSize: '0.85rem' }}>
              Limpar busca
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
                src={featuredPost.frontmatter.cover_image}
                alt={featuredPost.frontmatter.title}
              />
            )}
            <div className="featured-card-overlay">
              <div className="tags" style={{ marginBottom: '0.75rem' }}>
                <span className="tag tag-category">
                  {featuredPost.frontmatter.category}
                </span>
                <span className="tag">
                  {featuredPost.readingTime} min de leitura
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
                Artigos Recentes
              </h2>
            )}
            <div className="posts-grid" id="posts-grid">
              {gridPosts.map((post) => (
                <PostCard key={post.frontmatter.slug} post={post} />
              ))}
            </div>
          </>
        ) : (
          <div className="empty-state" id="empty-state">
            <h3>Nenhum artigo encontrado</h3>
            <p>
              {query
                ? 'Tente buscar com outros termos.'
                : 'Os artigos aparecerão aqui quando forem publicados.'}
            </p>
          </div>
        )}
      </div>
    </>
  )
}
