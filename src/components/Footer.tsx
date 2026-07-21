import { useI18n } from '../utils/i18n'

export default function Footer() {
  const { t } = useI18n()
  const year = new Date().getFullYear()

  return (
    <footer className="footer" id="main-footer">
      <div className="footer-inner">
        <div className="footer-text">
          <img
            src="/logo-coreauto-horizontal.png"
            alt="CoreAutoCRM - Sistema de Gestão para Oficinas Mecânicas"
            className="footer-logo-image"
          />
          <span>&copy; {year} {import.meta.env.VITE_COPYRIGHT_TEXT || t('footer.rights')}</span>
        </div>
        <div className="footer-links">
          {import.meta.env.VITE_SOCIAL_GITHUB && (
            <a
              href={import.meta.env.VITE_SOCIAL_GITHUB}
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          )}
          {import.meta.env.VITE_SOCIAL_LINKEDIN && (
            <a
              href={import.meta.env.VITE_SOCIAL_LINKEDIN}
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
          )}
        </div>
      </div>
    </footer>
  )
}
