import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import Layout from './components/Layout'
import Home from './pages/Home'
import PostPage from './pages/PostPage'
import CategoryPage from './pages/CategoryPage'
import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div className="not-found">
      <h1>404</h1>
      <p>Página não encontrada.</p>
      <Link to="/" className="btn-primary">
        Voltar ao início
      </Link>
    </div>
  )
}

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/post/:slug" element={<PostPage />} />
            <Route path="/categoria/:category" element={<CategoryPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  )
}
