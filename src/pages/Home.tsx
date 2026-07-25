import { useMemo, useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import SEOHead from '../components/SEOHead'
import PostCard from '../components/PostCard'
import PromoBanner from '../components/PromoBanner'
import CategoryPills from '../components/CategoryPills'
import CategorySection from '../components/CategorySection'
import InteractiveCalculator from '../components/InteractiveCalculator'
import { getAllPosts, searchPosts, getAllCategories, getPostsByCategory, resolveAssetPath } from '../utils/posts'
import { useI18n } from '../utils/i18n'

export default function Home() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { language, t } = useI18n()
  const query = searchParams.get('q') || ''
  const [heroSearch, setHeroSearch] = useState('')

  const allPosts = useMemo(
    () => (query ? searchPosts(query, language) : getAllPosts(language)),
    [query, language]
  )

  const categories = useMemo(() => getAllCategories(language), [language])

  // Artigo principal de destaque do Hero
  const heroFeaturedPost = !query ? allPosts[0] : undefined

  // 1 post de cada uma das outras categorias para a coluna lateral do Hero (1 por categoria)
  const heroCategoryPosts = useMemo(() => {
    if (query || !heroFeaturedPost) return []
    const featuredCat = heroFeaturedPost.frontmatter.category
    const otherCats = categories.filter((c) => c !== featuredCat)
    
    const result: typeof allPosts = []
    otherCats.forEach((cat) => {
      const catPosts = getPostsByCategory(cat, language)
      if (catPosts.length > 0) {
        result.push(catPosts[0])
      }
    })
    return result.slice(0, 3) // Exibe até 3 categorias diferentes
  }, [query, heroFeaturedPost, categories, language])

  // Slugs exibidos no Hero para evitar duplicação nas seções abaixo
  const featuredSlugs = useMemo(() => {
    const slugs = new Set<string>()
    if (heroFeaturedPost) slugs.add(heroFeaturedPost.frontmatter.slug)
    heroCategoryPosts.forEach((p) => slugs.add(p.frontmatter.slug))
    return slugs
  }, [heroFeaturedPost, heroCategoryPosts])

  // Mapeamento das categorias sem posts duplicados
  const categoryPostsMap = useMemo(() => {
    if (query) return []
    return categories.map((cat) => {
      const catPosts = getPostsByCategory(cat, language)
      const uniqueCatPosts = catPosts.filter((p) => !featuredSlugs.has(p.frontmatter.slug))
      return {
        categoryName: cat,
        posts: uniqueCatPosts.length > 0 ? uniqueCatPosts : catPosts,
      }
    }).filter((group) => group.posts.length > 0)
  }, [query, categories, language, featuredSlugs])

  const handleHeroSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (heroSearch.trim()) {
      navigate(`/?q=${encodeURIComponent(heroSearch.trim())}`)
    }
  }

  return (
    <>
      <SEOHead isHome={!query} title={query ? `Busca: ${query}` : undefined} />

      {/* Hero do Blog — Com a Busca Elegante no Centro */}
      <section className="blog-hero" id="blog-hero">
        <div className="blog-hero-ambient" aria-hidden="true" />

        <div className="container">
          <div className="blog-hero-top">
            <div className="blog-hero-badge">
              <span className="blog-hero-dot" />
              PORTAL DE INTELIGÊNCIA & GESTÃO DA OFICINA MECÂNICA
            </div>

            <h1 className="blog-hero-title">
              O Maior Acervo de Gestão Prática e IA para{' '}
              <span className="blog-hero-gradient">Oficinas Mecânicas</span>
            </h1>

            <p className="blog-hero-subtitle">
              Guias passo a passo, estratégias testadas e soluções reais para estancar perdas no WhatsApp, organizar o pátio e aumentar seu faturamento.
            </p>

            {/* Barra de Busca Integrada no Hero (Elegante e Centralizada) */}
            <form onSubmit={handleHeroSearchSubmit} className="blog-hero-search">
              <svg className="blog-hero-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className="blog-hero-search-input"
                placeholder="O que você quer resolver na sua oficina hoje? (ex: WhatsApp, Orçamentos, PDF)"
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
              />
              <button type="submit" className="blog-hero-search-btn">
                Buscar Artigos
              </button>
            </form>

            {/* Tags rápidas de pesquisa */}
            <div className="blog-hero-quicktags">
              <span className="quicktag-label">TEMAS POPULARES:</span>
              <button type="button" onClick={() => navigate('/?q=WhatsApp')} className="quicktag-pill">#WhatsApp</button>
              <button type="button" onClick={() => navigate('/?q=Elevador')} className="quicktag-pill">#ElevadorParado</button>
              <button type="button" onClick={() => navigate('/?q=Metas')} className="quicktag-pill">#MetasMecânicos</button>
              <button type="button" onClick={() => navigate('/?q=PDF')} className="quicktag-pill">#PDFOrçamento</button>
            </div>
          </div>

          {/* Destaques do Hero: Main Featured + 1 Post por Categoria no Lado com estilo cat-subpost */}
          {!query && heroFeaturedPost && (
            <div className="blog-hero-showcase">
              {/* Card Destaque Principal Esquerda */}
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
                    <span className="blog-hero-badge-tag">⭐ DESTAQUE DA SEMANA</span>
                  </div>
                )}
                <div className="blog-main-featured-body">
                  <div className="blog-main-featured-meta">
                    <span className="tag tag-category">
                      {heroFeaturedPost.frontmatter.category}
                    </span>
                    <span>⏱️ {heroFeaturedPost.readingTime} min de leitura</span>
                  </div>
                  <h2>{heroFeaturedPost.frontmatter.title}</h2>
                  <p>{heroFeaturedPost.frontmatter.excerpt}</p>
                  <div className="blog-main-featured-footer">
                    <span>Ler artigo completo ➔</span>
                  </div>
                </div>
              </Link>

              {/* Coluna Direita: 1 Post por Categoria no estilo cat-subpost-card */}
              <div className="cat-subposts-list" style={{ height: '100%', justifyContent: 'space-between' }}>
                <div className="blog-trending-header" style={{ marginBottom: '4px' }}>
                  <span>📌 DESTAQUES POR CATEGORIA</span>
                </div>
                {heroCategoryPosts.map((post) => (
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
                      <span className="cat-subpost-meta" style={{ color: 'var(--neon)', fontWeight: 700 }}>
                        {post.frontmatter.category}
                      </span>
                      <h4 className="cat-subpost-title">{post.frontmatter.title}</h4>
                      <div className="cat-subpost-meta">
                        <span>⏱️ {post.readingTime} {t('post.reading_time')}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="container">
        {/* Navegação por Pílulas de Categoria */}
        <CategoryPills categories={categories} />

        {/* MODO BUSCA */}
        {query ? (
          <>
            <div className="section-heading" id="search-results-heading">
              {t('search.results')} &ldquo;{query}&rdquo;
              <Link to="/" style={{ marginLeft: 'auto', fontSize: '0.85rem' }}>
                {t('search.clear')}
              </Link>
            </div>

            {allPosts.length > 0 ? (
              <div className="posts-grid">
                {allPosts.map((post) => (
                  <PostCard key={post.frontmatter.slug} post={post} />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <h3>{t('search.empty')}</h3>
                <p>{t('search.empty_sub')}</p>
              </div>
            )}
          </>
        ) : (
          /* Modo Editorial por Categoria */
          <>
            {categoryPostsMap.map((group, index) => (
              <div key={group.categoryName}>
                <CategorySection
                  categoryName={group.categoryName}
                  posts={group.posts}
                />

                {/* Calculadora Interativa entre Categorias */}
                {index === 0 && <InteractiveCalculator />}
              </div>
            ))}

            <PromoBanner />
          </>
        )}
      </div>
    </>
  )
}
