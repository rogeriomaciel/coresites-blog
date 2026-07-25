import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useI18n } from '../utils/i18n'

export default function Header() {
  const location = useLocation()
  const { language, setLanguage } = useI18n()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="header" id="main-header">
      <div className="header-inner">
        {/* Logo */}
        <Link to="/" className="header-logo" id="header-logo">
          <img
            src="/logo-coreauto-horizontal.png"
            alt="CoreAutoCRM"
            className="header-logo-image"
          />
        </Link>

        {/* Clean Navigation */}
        <nav className={`header-nav ${mobileOpen ? 'open' : ''}`} id="main-nav">
          <Link
            to="/"
            className={location.pathname === '/' ? 'active' : ''}
            onClick={() => setMobileOpen(false)}
          >
            Blog Home
          </Link>

          <a
            href="https://coreautocrm.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="header-nav-cta"
          >
            <span>Conhecer o Sistema</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        </nav>

        {/* Right Controls: Lang Switcher & Mobile Menu */}
        <div className="header-controls">
          {/* Lang Switcher */}
          <div className="lang-switcher" id="lang-switcher">
            <button
              type="button"
              className={`lang-btn ${language === 'pt' ? 'active' : ''}`}
              onClick={() => setLanguage('pt')}
            >
              PT
            </button>
            <button
              type="button"
              className={`lang-btn ${language === 'en' ? 'active' : ''}`}
              onClick={() => setLanguage('en')}
            >
              EN
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Abrir menu"
            id="mobile-menu-btn"
          >
            <span className="hamburger-line" />
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </button>
        </div>
      </div>
    </header>
  )
}
