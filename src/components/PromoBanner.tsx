/**
 * PromoBanner — Card de destaque CTA para a oferta promocional do CoreAutoCRM.
 * Ocupa a largura total do grid (equivalente a 3 cards), exibido ao final
 * de todas as páginas do blog para converter leitores em leads.
 */

export default function PromoBanner() {
  return (
    <section className="promo-banner" id="promo-banner">
      <a
        href="https://coreautocrm.com.br/oferta-promocional/"
        target="_blank"
        rel="noopener noreferrer"
        className="promo-banner-link"
        aria-label="Conheça a oferta promocional do CoreAutoCRM"
      >
        {/* Glow decorations */}
        <div className="promo-banner-glow promo-banner-glow--left" aria-hidden="true" />
        <div className="promo-banner-glow promo-banner-glow--right" aria-hidden="true" />

        <div className="promo-banner-content">
          {/* Badge */}
          <div className="promo-banner-badge">
            <span className="promo-banner-badge-dot" aria-hidden="true" />
            Oferta Especial de Lançamento
          </div>

          {/* Headline */}
          <h2 className="promo-banner-title">
            Sua oficina perde{' '}
            <span className="promo-banner-highlight">R$ 200 mil por ano</span>{' '}
            em orçamentos sem resposta.
          </h2>

          {/* Subtitle */}
          <p className="promo-banner-subtitle">
            Recupere até R$ 12.000/mês com follow-up inteligente pelo WhatsApp,
            comando de voz para o mecânico e painel TV para o pátio.
            Setup completo em 48h.
          </p>

          {/* Features row */}
          <div className="promo-banner-features">
            <div className="promo-banner-feature">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 19v3" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <rect x="9" y="2" width="6" height="13" rx="3" />
              </svg>
              <span>Comando por Voz</span>
            </div>
            <div className="promo-banner-feature">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect width="20" height="14" x="2" y="3" rx="2" />
                <line x1="8" x2="16" y1="21" y2="21" />
                <line x1="12" x2="12" y1="17" y2="21" />
              </svg>
              <span>Painel TV Pátio</span>
            </div>
            <div className="promo-banner-feature">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719" />
              </svg>
              <span>Follow-up WhatsApp</span>
            </div>
          </div>

          {/* CTA button */}
          <div className="promo-banner-cta">
            <span className="promo-banner-cta-text">Quero Recuperar Meu Faturamento</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </div>

          {/* Trust badges */}
          <div className="promo-banner-trust">
            <span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              Funciona com seu sistema atual
            </span>
            <span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              Garantia 30 dias
            </span>
            <span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              Setup em 48h
            </span>
          </div>
        </div>
      </a>
    </section>
  )
}
