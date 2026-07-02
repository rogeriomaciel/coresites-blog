import { Link, useLocation } from 'react-router-dom'
import { useState, useCallback } from 'react'
import { getAllCategories } from '../utils/posts'

export default function Header() {
  const location = useLocation()
  const categories = getAllCategories()
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
          {import.meta.env.VITE_LOGO_URL ? (
            <img src={import.meta.env.VITE_LOGO_URL} alt={import.meta.env.VITE_SITE_NAME || 'Blog'} style={{ height: '28px', borderRadius: '4px' }} />
          ) : (
            <span className="header-logo-icon">{import.meta.env.VITE_LOGO_TEXT || 'C'}</span>
          )}
          <span>{import.meta.env.VITE_SITE_NAME || 'CoreSites Blog'}</span>
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
              placeholder="Buscar artigos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Buscar artigos"
            />
          </form>
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
