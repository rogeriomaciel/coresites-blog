export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer" id="main-footer">
      <div className="footer-inner">
        <div className="footer-text">
          <img
            src="/logo-coreauto-horizontal.png"
            alt={import.meta.env.VITE_SITE_NAME || 'CoreAuto'}
            className="footer-logo-image"
          />
          <span>&copy; {year} {import.meta.env.VITE_COPYRIGHT_TEXT || 'Todos os direitos reservados.'}</span>
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
