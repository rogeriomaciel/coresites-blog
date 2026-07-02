import { Helmet } from 'react-helmet-async'
import type { PostFrontmatter } from '../utils/posts'
import {
  generateArticleJsonLd,
  generateBreadcrumbJsonLd,
  generateWebSiteJsonLd,
  buildOgTags,
  buildTwitterTags,
} from '../utils/seo'

interface SEOHeadProps {
  /** Page-level SEO (no post) */
  title?: string
  description?: string
  /** Post-level SEO */
  post?: PostFrontmatter
  readingTime?: number
  /** Breadcrumb items */
  breadcrumbs?: { name: string; url: string }[]
  /** Whether this is the homepage */
  isHome?: boolean
}

export default function SEOHead({
  title,
  description,
  post,
  readingTime,
  breadcrumbs,
  isHome,
}: SEOHeadProps) {
  const siteName = import.meta.env.VITE_SITE_NAME || 'CoreSites Blog'
  const siteDescription =
    import.meta.env.VITE_SITE_DESCRIPTION ||
    'Blog de tecnologia, IA e automação'

  const pageTitle = post
    ? post.meta_title || post.title
    : title
      ? `${title} | ${siteName}`
      : siteName

  const pageDescription = post
    ? post.meta_description || post.excerpt
    : description || siteDescription

  const ogTags = post ? buildOgTags(post) : null
  const twitterTags = post ? buildTwitterTags(post) : null

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      {post?.keywords && (
        <meta name="keywords" content={post.keywords.join(', ')} />
      )}
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={
        post
          ? `${import.meta.env.VITE_SITE_URL || ''}/post/${post.slug}`
          : import.meta.env.VITE_SITE_URL || ''
      } />

      {/* Open Graph */}
      {ogTags &&
        Object.entries(ogTags).map(
          ([key, value]) =>
            value && <meta key={key} property={key} content={value} />
        )}
      {!ogTags && (
        <>
          <meta property="og:title" content={pageTitle} />
          <meta property="og:description" content={pageDescription} />
          <meta property="og:type" content="website" />
          <meta property="og:site_name" content={siteName} />
          <meta property="og:locale" content="pt_BR" />
        </>
      )}

      {/* Twitter Cards */}
      {twitterTags &&
        Object.entries(twitterTags).map(
          ([key, value]) =>
            value && <meta key={key} name={key} content={value} />
        )}

      {/* JSON-LD Structured Data */}
      {post && readingTime && (
        <script type="application/ld+json">
          {generateArticleJsonLd(post, readingTime)}
        </script>
      )}
      {breadcrumbs && (
        <script type="application/ld+json">
          {generateBreadcrumbJsonLd(breadcrumbs)}
        </script>
      )}
      {isHome && (
        <script type="application/ld+json">
          {generateWebSiteJsonLd()}
        </script>
      )}
    </Helmet>
  )
}
