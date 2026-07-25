import { Link, useLocation } from 'react-router-dom'

interface CategoryPillsProps {
  categories: string[]
  activeCategory?: string
}

export default function CategoryPills({ categories, activeCategory }: CategoryPillsProps) {
  const location = useLocation()

  const getCategoryIcon = (cat: string) => {
    const name = cat.toLowerCase()
    if (name.includes('venda') || name.includes('whatsapp')) return '📱'
    if (name.includes('gest') || name.includes('produtiv')) return '⚙️'
    if (name.includes('ia') || name.includes('automat')) return '🤖'
    if (name.includes('diagn') || name.includes('operac')) return '🚗'
    return '📋'
  }

  return (
    <div className="category-pills-wrapper" id="category-pills">
      <div className="category-pills-label">FILTRAR POR TEMA:</div>
      <div className="category-pills-list">
        <Link
          to="/"
          className={`category-pill ${!activeCategory && location.pathname === '/' ? 'active' : ''}`}
        >
          <span className="category-pill-icon">🔥</span>
          <span>Todos os Artigos</span>
        </Link>

        {categories.map((cat) => {
          const catPath = `/categoria/${encodeURIComponent(cat.toLowerCase())}`
          const isActive =
            activeCategory?.toLowerCase() === cat.toLowerCase() ||
            location.pathname === catPath

          return (
            <Link
              key={cat}
              to={catPath}
              className={`category-pill ${isActive ? 'active' : ''}`}
            >
              <span className="category-pill-icon">{getCategoryIcon(cat)}</span>
              <span>{cat}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
