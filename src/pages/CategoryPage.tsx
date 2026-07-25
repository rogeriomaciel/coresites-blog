import { useParams, Link } from 'react-router-dom'
import { useMemo } from 'react'
import SEOHead from '../components/SEOHead'
import PostCard from '../components/PostCard'
import PromoBanner from '../components/PromoBanner'
import CategoryPills from '../components/CategoryPills'
import InteractiveCalculator from '../components/InteractiveCalculator'
import { getPostsByCategory, getAllCategories, resolveAssetPath, formatDate } from '../utils/posts'
import { useI18n } from '../utils/i18n'

export default function CategoryPage() {
  const { category } = useParams<{ category: string }>()
  const { language, t } = useI18n()
  const decodedCategory = decodeURIComponent(category || '')

  const posts = useMemo(
    () => getPostsByCategory(decodedCategory, language),
    [decodedCategory, language]
  )

  const categories = useMemo(() => getAllCategories(language), [language])

  const displayName =
    decodedCategory.charAt(0).toUpperCase() + decodedCategory.slice(1)

  const getCategoryIcon = (cat: string) => {
    const name = cat.toLowerCase()
    if (name.includes('venda') || name.includes('whatsapp')) return '📱'
    if (name.includes('gest') || name.includes('produtiv')) return '⚙️'
    if (name.includes('ia') || name.includes('automat')) return '🤖'
    if (name.includes('diagn') || name.includes('operac')) return '🚗'
    return '📋'
  }

  const getCategoryDescription = (cat: string) => {
    const name = cat.toLowerCase()
    if (name.includes('venda') || name.includes('whatsapp')) {
      return 'Estratégias validadas e automações no WhatsApp para estancar o abandono de orçamentos e aumentar o fechamento de serviços na sua oficina.'
    }
    if (name.includes('gest') || name.includes('produtiv')) {
      return 'Métodos de gestão operacional, metas para mecânicos e controle de pátio para acabar com o caos e maximizar o lucro da sua empresa.'
    }
    if (name.includes('ia') || name.includes('automat')) {
      return 'Como utilizar Inteligência Artificial na prática para automatizar o atendimento, cobrança e relatórios diários da oficina sem complicações.'
    }
    if (name.includes('diagn') || name.includes('operac')) {
      return 'Procedimentos técnicos, comando de voz nos boxes e otimização do fluxo de veículos para zerar o tempo do elevador parado.'
    }
    return 'Artigos técnicos e estratégicos reunidos para alavancar a gestão e os resultados da sua oficina mecânica.'
  }

  // Divisão editorial da Categoria (igual à Home Principal)
  const heroFeaturedPost = posts.length > 0 ? posts[0] : undefined
  const heroSubPosts = posts.length > 1 ? posts.slice(1, 4) : []
  const remainingPosts = posts.length > 4 ? posts.slice(4) : []

  return (
    <>
      <SEOHead
        title={`${displayName} — ${t('category.seo_title')}`}
        description={t('category.seo_desc', { name: displayName })}
      />

      {/* Hero da Categoria — Estilo Portal / Mini Home */}
      <section className="blog-hero" id="category-hero">
        <div className="blog-hero-ambient" aria-hidden="true" />

        <div className="container">
          {/* Breadcrumbs */}
          <nav className="breadcrumbs" aria-label="Breadcrumb" style={{ marginBottom: '1.25rem' }}>
            <a href="https://coreautocrm.com.br" target="_blank" rel="noopener noreferrer">
              Site CoreAutoCRM ↗
            </a>
            <span className="separator">/</span>
            <Link to="/">Blog</Link>
            <span className="separator">/</span>
            <span>{displayName}</span>
          </nav>

          <div className="blog-hero-top">
            <div className="blog-hero-badge">
              <span className="blog-hero-dot" />
              PORTAL TEMÁTICO DA OFICINA
            </div>

            <h1 className="blog-hero-title">
              {getCategoryIcon(displayName)} <span className="blog-hero-gradient">{displayName}</span>
            </h1>

            <p className="blog-hero-subtitle">
              {getCategoryDescription(displayName)}
            </p>

            <div className="quicktag-label" style={{ marginTop: '0.25rem', color: 'var(--neon)' }}>
              📚 {posts.length} {posts.length === 1 ? 'artigo especializado publicado' : 'artigos especializados publicados'}
            </div>
          </div>

          {/* Showcase da Categoria (1 Destaque + 3 Subdestacados laterais) */}
          {heroFeaturedPost && (
            <div className="blog-hero-showcase">
              {/* Card Destaque Principal da Categoria */}
              <Link
                to={`/post/${heroFeaturedPost.frontmatter.slug}`}
                className="blog-main-featured-card"
              >
                {heroFeaturedPost.frontmatter.cover_image && (
                  <div className="blog-main-featured-img-wrapper">
                    <img
                      src={resolveAssetPath(heroFeaturedPost.frontmatter.cover_image)}
                      alt={heroFeaturedPost.frontmatter.title}
                      className="blog-main-featured-img"
                    />
                    <span className="blog-hero-badge-tag">⭐ DESTAQUE DA CATEGORIA</span>
                  </div>
                )}
                <div className="blog-main-featured-body">
                  <div className="blog-main-featured-meta">
                    <span className="tag tag-category">
                      {heroFeaturedPost.frontmatter.category}
                    </span>
                    <span>⏱️ {heroFeaturedPost.readingTime} min de leitura</span>
                    <span>• {formatDate(heroFeaturedPost.frontmatter.date, language)}</span>
                  </div>
                  <h2>{heroFeaturedPost.frontmatter.title}</h2>
                  <p>{heroFeaturedPost.frontmatter.excerpt}</p>
                  <div className="blog-main-featured-footer">
                    <span>Ler artigo completo ➔</span>
                  </div>
                </div>
              </Link>

              {/* Subposts Laterais da Categoria */}
              {heroSubPosts.length > 0 ? (
                <div className="cat-subposts-list" style={{ height: '100%', justifyContent: 'space-between' }}>
                  <div className="blog-trending-header" style={{ marginBottom: '4px' }}>
                    <span>📌 MAIS RECOMENDADOS EM {displayName.toUpperCase()}</span>
                  </div>
                  {heroSubPosts.map((post) => (
                    <Link
                      key={post.frontmatter.slug}
                      to={`/post/${post.frontmatter.slug}`}
                      className="cat-subpost-card"
                    >
                      {post.frontmatter.cover_image && (
                        <img
                          src={resolveAssetPath(post.frontmatter.cover_image)}
                          alt={post.frontmatter.title}
                          className="cat-subpost-thumb"
                        />
                      )}
                      <div className="cat-subpost-content">
                        <h4 className="cat-subpost-title">{post.frontmatter.title}</h4>
                        <div className="cat-subpost-meta">
                          <span>⏱️ {post.readingTime} {t('post.reading_time')}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </section>

      <div className="container">
        {/* Navegação entre Categorias */}
        <CategoryPills categories={categories} activeCategory={decodedCategory} />

        {/* Demais Artigos da Categoria */}
        {remainingPosts.length > 0 && (
          <section className="category-section" id="more-category-posts">
            <h2 className="section-heading" style={{ marginBottom: '1.5rem' }}>
              Outros Artigos sobre {displayName}
            </h2>
            <div className="posts-grid">
              {remainingPosts.map((post) => (
                <PostCard key={post.frontmatter.slug} post={post} />
              ))}
            </div>
          </section>
        )}

        {/* Simulador de Prejuízos */}
        <InteractiveCalculator />

        <div style={{ marginTop: '2rem' }}>
          <PromoBanner />
        </div>
      </div>
    </>
  )
}
