import { useState, useId } from 'react'

export default function InteractiveCalculator() {
  const [weeklyBudgets, setWeeklyBudgets] = useState<number>(20)
  const [avgTicket, setAvgTicket] = useState<number>(750)
  const [noResponseRate, setNoResponseRate] = useState<number>(35)

  const weeklyBudgetsId = useId()
  const avgTicketId = useId()
  const noResponseRateId = useId()

  // Calculos
  const monthlyBudgets = weeklyBudgets * 4.33
  const lostBudgetsMonthly = Math.round(monthlyBudgets * (noResponseRate / 100))
  const monthlyLoss = lostBudgetsMonthly * avgTicket
  const yearlyLoss = monthlyLoss * 12
  const recoverableMonthly = Math.round(monthlyLoss * 0.45) // Estima recuperação de 45% com IA

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val)

  return (
    <div className="interactive-calc" id="interactive-calc">
      <div className="calc-header">
        <div className="calc-tag">🧮 CALCULADORA RÁPIDA DE OFICINA</div>
        <h3 className="calc-title">Quanto a sua oficina está perdendo em orçamentos sem resposta?</h3>
        <p className="calc-subtitle">
          Arraste as barras abaixo com o volume da sua oficina e veja o dinheiro que está ficando parado no WhatsApp.
        </p>
      </div>

      <div className="calc-body">
        <div className="calc-inputs">
          {/* Input 1 */}
          <div className="calc-field">
            <div className="calc-field-header">
              <label htmlFor={weeklyBudgetsId}>Orçamentos enviados por semana:</label>
              <span className="calc-field-value">{weeklyBudgets} carros / orçamentos</span>
            </div>
            <input
              id={weeklyBudgetsId}
              type="range"
              min="5"
              max="100"
              step="5"
              value={weeklyBudgets}
              onChange={(e) => setWeeklyBudgets(Number(e.target.value))}
              className="calc-range"
            />
          </div>

          {/* Input 2 */}
          <div className="calc-field">
            <div className="calc-field-header">
              <label htmlFor={avgTicketId}>Valor médio por orçamento (R$):</label>
              <span className="calc-field-value">{formatCurrency(avgTicket)}</span>
            </div>
            <input
              id={avgTicketId}
              type="range"
              min="250"
              max="3000"
              step="50"
              value={avgTicket}
              onChange={(e) => setAvgTicket(Number(e.target.value))}
              className="calc-range"
            />
          </div>

          {/* Input 3 */}
          <div className="calc-field">
            <div className="calc-field-header">
              <label htmlFor={noResponseRateId}>% de clientes que somem no WhatsApp:</label>
              <span className="calc-field-value">{noResponseRate}%</span>
            </div>
            <input
              id={noResponseRateId}
              type="range"
              min="15"
              max="70"
              step="5"
              value={noResponseRate}
              onChange={(e) => setNoResponseRate(Number(e.target.value))}
              className="calc-range"
            />
          </div>
        </div>

        {/* Results Box */}
        <div className="calc-results">
          <div className="calc-result-card calc-result-card--danger">
            <span className="calc-result-label">Dinheiro Perdido no Mês</span>
            <span className="calc-result-val">{formatCurrency(monthlyLoss)}</span>
            <span className="calc-result-sub">~{lostBudgetsMonthly} serviços não fechados por mês</span>
          </div>

          <div className="calc-result-card calc-result-card--year">
            <span className="calc-result-label">Prejuízo Estimado em 1 Ano</span>
            <span className="calc-result-val">{formatCurrency(yearlyLoss)}</span>
          </div>

          <div className="calc-result-card calc-result-card--success">
            <span className="calc-result-badge">⚡ RECUPERAÇÃO AUTOMÁTICA</span>
            <span className="calc-result-label">Faturamento Resgatado pelo CoreAutoCRM</span>
            <span className="calc-result-val calc-result-val--green">
              +{formatCurrency(recoverableMonthly)}/mês
            </span>
            <span className="calc-result-sub">com lembretes automáticos no WhatsApp</span>
          </div>
        </div>
      </div>

      <div className="calc-footer">
        <div className="calc-footer-info">
          💡 O CoreAutoCRM faz o acompanhamento dos orçamentos parados direto no WhatsApp sem você precisar cobrar manualmente.
        </div>
        <a
          href="https://coreautocrm.com.br/oferta-promocional/"
          target="_blank"
          rel="noopener noreferrer"
          className="calc-cta-btn"
        >
          <span>Ver como funciona na minha oficina</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </a>
      </div>
    </div>
  )
}
