import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'

// SITE_URL is load-bearing well beyond the visible URL: it drives every
// canonical link, sitemap entry, hreflang alternate and JSON-LD @id.
// CI sets it explicitly; this default only affects local builds. Keep the two
// in sync or `npm run build` locally emits different canonical URLs than CI.
const SITE_URL = process.env.SITE_URL ?? 'https://minmeychang.com'

// Crawlers are blocked unless this is explicitly turned on. Do not enable
// until Min Mey Chang has reviewed every fact, photograph and her own name.
export const ALLOW_INDEXING = process.env.ALLOW_INDEXING === 'true'

export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'ignore',
  vite: {
    plugins: [tailwindcss()],
  },
})
