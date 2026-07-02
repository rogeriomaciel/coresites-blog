export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer" id="main-footer">
      <div className="footer-inner">
        <p className="footer-text">
          &copy; {year} CoreSites. Todos os direitos reservados.
        </p>
        <div className="footer-links">
          <a
            href="https://github.com/rogeriomaciel"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          <a
            href="https://linkedin.com/in/"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  )
}
