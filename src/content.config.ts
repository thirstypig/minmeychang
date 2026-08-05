import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

// Long-form prose is authored separately per locale rather than translated
// field-by-field. A life story does not survive being chopped into translation
// keys, and the Chinese version should read as though written in Chinese
// rather than rendered from English.
const story = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/story' }),
  schema: z.object({
    title: z.string(),
    locale: z.enum(['en', 'zh-hant']),
  }),
})

export const collections = { story }
