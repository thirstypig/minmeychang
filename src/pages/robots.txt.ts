import type { APIRoute } from 'astro'

// robots.txt is generated rather than a static file in public/, so it can never
// disagree with the `noindex` meta tags. A static robots.txt inviting crawlers
// while every page says noindex — or the reverse — is a classic way to end up
// with a site that is half-indexed and impossible to reason about.
//
// Both are driven by the same ALLOW_INDEXING flag.

const allowIndexing = process.env.ALLOW_INDEXING === 'true'

export const GET: APIRoute = ({ site }) => {
  const sitemapUrl = site ? new URL('sitemap-index.xml', site).href : ''

  const body = allowIndexing
    ? `User-agent: *
Allow: /

# The share-card source page. Not a destination.
Disallow: /og-card

Sitemap: ${sitemapUrl}
`
    : `# Indexing is disabled for this deployment.
# Set ALLOW_INDEXING=true in .github/workflows/deploy.yml to open the site.
User-agent: *
Disallow: /
`

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
