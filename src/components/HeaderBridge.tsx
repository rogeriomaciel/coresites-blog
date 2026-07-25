import { useState } from 'react'

export default function HeaderBridge() {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className="header-bridge" id="header-bridge">
      <div className="header-bridge-inner">
        <div className="header-bridge-left">
          <span className="header-bridge-badge">SISTEMA COM IA</span>
          <span className="header-bridge-text">
            Conheça o CoreAutoCRM para Oficinas Mecânicas
          </span>
        </div>

        <div className="header-bridge-right">
          <a
            href="https://coreautocrm.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="header-bridge-link"
          >
            <span>Acessar Site Principal</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>

          <button
            onClick={() => setDismissed(true)}
            className="header-bridge-close"
            aria-label="Fechar barra de aviso"
            type="button"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  )
}
