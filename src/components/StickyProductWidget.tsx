export default function StickyProductWidget() {
  return (
    <aside className="sticky-product-widget" id="sticky-product-widget">
      <div className="product-widget-inner">
        <div className="product-widget-badge">
          <span className="product-widget-pulse" />
          SISTEMA PARA OFICINAS
        </div>

        <h4 className="product-widget-title">
          Organize o pátio e feche mais orçamentos sem complicação
        </h4>

        <p className="product-widget-desc">
          Chega de perder tempo apagando incêndio no balcão. O CoreAutoCRM cuida dos orçamentos, carros no pátio e metas dos mecânicos.
        </p>

        <ul className="product-widget-list">
          <li>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>WhatsApp que cobra orçamentos sozinho</span>
          </li>
          <li>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Comando de voz para o mecânico no box</span>
          </li>
          <li>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Painel TV para organizar carros no pátio</span>
          </li>
          <li>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Importação de orçamento PDF em 10 segundos</span>
          </li>
        </ul>

        <div className="product-widget-actions">
          <a
            href="https://coreautocrm.com.br/oferta-promocional/"
            target="_blank"
            rel="noopener noreferrer"
            className="product-widget-btn"
          >
            <span>Ver Demonstração do Sistema ↗</span>
          </a>

          <span className="product-widget-trust">
            ✓ Setup fácil em 48h • Funciona na sua oficina
          </span>
        </div>
      </div>
    </aside>
  )
}
