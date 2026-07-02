import { useState, useEffect, useCallback } from 'react'

/**
 * Reading progress bar that shows scroll position on article pages.
 */
export default function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    if (docHeight > 0) {
      setProgress(Math.min((scrollTop / docHeight) * 100, 100))
    }
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  return (
    <div
      className="reading-progress"
      style={{ width: `${progress}%` }}
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Progresso de leitura"
    />
  )
}
