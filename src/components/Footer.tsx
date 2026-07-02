export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer" id="main-footer">
      <div className="footer-inner">
        <p className="footer-text">
          &copy; {year} {import.meta.env.VITE_SITE_NAME || 'CoreSites'}. Todos os direitos reservados.
        </p>
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
