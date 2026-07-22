import { Link } from 'react-router-dom'
import type { Post } from '../utils/posts'
import { formatDate, resolveAssetPath } from '../utils/posts'
import { useI18n } from '../utils/i18n'

interface PostCardProps {
  post: Post
}

export default function PostCard({ post }: PostCardProps) {
  const { frontmatter, readingTime } = post
  const { language, t } = useI18n()

  return (
    <Link
      to={`/post/${frontmatter.slug}`}
      className="post-card animate-fade-in-up"
      id={`post-card-${frontmatter.slug}`}
    >
      {frontmatter.cover_image && (
        <div className="post-card-image-wrapper">
          <img
            className="post-card-image"
            src={resolveAssetPath(frontmatter.cover_image)}
            alt={frontmatter.title}
            loading="lazy"
          />
        </div>
      )}
      <div className="post-card-body">
        <h3 className="post-card-title">{frontmatter.title}</h3>
        <p className="post-card-excerpt">{frontmatter.excerpt}</p>

        <div className="post-card-meta">
          <span className="post-card-meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {readingTime} {t('post.reading_time')}
          </span>
          <span className="post-card-meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {formatDate(frontmatter.date, language)}
          </span>
        </div>

        <div className="tags">
          {frontmatter.tags?.slice(0, 3).map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  )
}
