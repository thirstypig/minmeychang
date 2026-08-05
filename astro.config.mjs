import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'
import sitemap from '@astrojs/sitemap'

// SITE_URL is load-bearing well beyond the visible URL: it drives every
// canonical link, sitemap entry, hreflang alternate and JSON-LD @id.
// CI sets it explicitly; this default only affects local builds. Keep the two
// in sync or `npm run build` locally emits different canonical URLs than CI.
const SITE_URL = process.env.SITE_URL ?? 'https://minmeychang.com'

export const ALLOW_INDEXING = process.env.ALLOW_INDEXING === 'true'

export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'ignore',

  integrations: [
    sitemap({
      // og-card exists only as the source for public/og.png. It is not a page
      // anyone should land on, and a sitemap entry would invite exactly that.
      filter: (page) => !page.includes('/og-card'),

      // Tells search engines the two locales are translations of one another
      // rather than duplicate content competing for the same queries.
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en',
          'zh-hant': 'zh-Hant',
        },
      },
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },
})
