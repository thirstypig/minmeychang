/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config'

// getViteConfig gives tests the same resolution and plugin setup the site build
// uses, so `import.meta.glob` in src/data/facts.ts behaves identically under
// test and at build time. A plain vitest config would resolve that glob
// differently and the pending-facts loader would silently return nothing.
//
// The triple-slash reference above is load-bearing: Astro's InlineConfig type
// has no `test` property of its own, so without pulling in Vitest's module
// augmentation `astro check` rejects this file.
export default getViteConfig({
  test: {
    include: ['tests/**/*.test.ts'],
  },
})
