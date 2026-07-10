import { useParams, Link } from 'react-router-dom'
import { useMemo } from 'react'
import SEOHead from '../components/SEOHead'
import PostCard from '../components/PostCard'
import PromoBanner from '../components/PromoBanner'
import { getPostsByCategory } from '../utils/posts'

export default function CategoryPage() {
  const { category } = useParams<{ category: string }>()
  const decodedCategory = decodeURIComponent(category || '')

  const posts = useMemo(
    () => getPostsByCategory(decodedCategory),
    [decodedCategory]
  )

  // Capitalize first letter for display
  const displayName =
    decodedCategory.charAt(0).toUpperCase() + decodedCategory.slice(1)

  return (
    <>
      <SEOHead
        title={`${displayName} — Artigos`}
        description={`Artigos sobre ${displayName}. Conteúdo técnico e prático.`}
      />

      <section className="hero" style={{ paddingBottom: '1.5rem' }}>
        <div className="container">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span className="separator">/</span>
            <span>{displayName}</span>
          </nav>
          <h1 className="hero-title">{displayName}</h1>
          <p className="hero-subtitle">
            {posts.length} {posts.length === 1 ? 'artigo' : 'artigos'} nesta
            categoria
          </p>
        </div>
      </section>

      <div className="container">
        {posts.length > 0 ? (
          <div className="posts-grid" id="category-posts-grid">
            {posts.map((post) => (
              <PostCard key={post.frontmatter.slug} post={post} />
            ))}
            <PromoBanner />
          </div>
        ) : (
          <div className="empty-state" id="category-empty">
            <h3>Nenhum artigo nesta categoria</h3>
            <p>Volte em breve, novos artigos estão a caminho!</p>
            <Link to="/" className="btn-primary" style={{ marginTop: '1rem' }}>
              Voltar ao início
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
