import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import Layout from './components/Layout'
import Home from './pages/Home'
import PostPage from './pages/PostPage'
import CategoryPage from './pages/CategoryPage'
import { Link } from 'react-router-dom'
import { LanguageProvider, useI18n } from './utils/i18n'

function NotFound() {
  const { t } = useI18n()
  return (
    <div className="not-found">
      <h1>{t('404.title')}</h1>
      <p>{t('404.message')}</p>
      <Link to="/" className="btn-primary">
        {t('404.button')}
      </Link>
    </div>
  )
}

export default function App() {
  const basePath = import.meta.env.VITE_BASE_PATH || '/'
  
  // Theming Dinâmico via CSS Variables
  if (import.meta.env.VITE_COLOR_H) document.documentElement.style.setProperty('--accent-h', import.meta.env.VITE_COLOR_H)
  if (import.meta.env.VITE_COLOR_S) document.documentElement.style.setProperty('--accent-s', import.meta.env.VITE_COLOR_S)
  if (import.meta.env.VITE_COLOR_L) document.documentElement.style.setProperty('--accent-l', import.meta.env.VITE_COLOR_L)

  return (
    <HelmetProvider>
      <LanguageProvider>
        <BrowserRouter basename={basePath}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/post/:slug" element={<PostPage />} />
              <Route path="/categoria/:category" element={<CategoryPage />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </HelmetProvider>
  )
}
