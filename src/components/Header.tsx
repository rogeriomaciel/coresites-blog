import { Link, useLocation } from 'react-router-dom'
import { useState, useCallback } from 'react'
import { getAllCategories } from '../utils/posts'
import { useI18n } from '../utils/i18n'

export default function Header() {
  const location = useLocation()
  const { language, setLanguage, t } = useI18n()
  const categories = getAllCategories(language)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (searchQuery.trim()) {
        window.location.href = `/?q=${encodeURIComponent(searchQuery.trim())}`
      }
    },
    [searchQuery]
  )

  return (
    <header className="header" id="main-header">
      <div className="header-inner">
        <Link to="/" className="header-logo" id="header-logo">
          <img
            src="/logo-coreauto-horizontal.png"
            alt={import.meta.env.VITE_SITE_NAME || 'CoreAuto Blog'}
            className="header-logo-image"
          />
        </Link>

        <nav className="header-nav" id="main-nav">
          <Link
            to="/"
            className={location.pathname === '/' ? 'active' : ''}
          >
            Home
          </Link>
          {categories.slice(0, 5).map((cat) => (
            <Link
              key={cat}
              to={`/categoria/${encodeURIComponent(cat.toLowerCase())}`}
              className={
                location.pathname ===
                `/categoria/${cat.toLowerCase()}`
                  ? 'active'
                  : ''
              }
            >
              {cat}
            </Link>
          ))}
        </nav>

        <div className="search-wrapper">
          <form onSubmit={handleSearchSubmit}>
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="search-input"
              id="search-input"
              placeholder={t('search.placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label={t('search.placeholder')}
            />
          </form>
        </div>

        <div className="language-switcher">
          <button
            onClick={() => setLanguage('pt')}
            className={`lang-btn ${language === 'pt' ? 'active' : ''}`}
            type="button"
            aria-label="Português"
          >
            PT
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`lang-btn ${language === 'en' ? 'active' : ''}`}
            type="button"
            aria-label="English"
          >
            EN
          </button>
        </div>

        <button
          className="mobile-nav-toggle"
          id="mobile-nav-toggle"
          onClick={() => setSearchOpen(!searchOpen)}
          aria-label="Abrir menu de navegação"
          type="button"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>
    </header>
  )
}
