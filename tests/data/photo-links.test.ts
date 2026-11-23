import { describe, expect, it } from 'vitest'
import { archive } from '../../src/data/archive'
import { photoHomePath, photoShareBase, photoSharePath, sharedItems } from '../../src/data/photo-links'

// A shared photo link must be a real path, not /page#id: messaging apps drop
// the fragment when building a preview, so every photo previewed as the same
// generic site card. /photo/<id> pages carry that photo's own preview.

const byId = (id: string) => {
  const item = archive.find((i) => i.id === id)
  if (!item) throw new Error(`fixture missing: ${id}`)
  return item
}

describe('photo share links', () => {
  it('builds a /photo/<id> path per locale', () => {
    expect(photoSharePath('en', 'school-founding')).toBe('/photo/school-founding/')
    expect(photoSharePath('zh-hant', 'school-founding')).toBe('/zh-hant/photo/school-founding/')
  })

  it('gives the archive viewer the same link the page buttons send', () => {
    // Archive.astro composes base + id + '/' in the browser.
    for (const locale of ['en', 'zh-hant'] as const) {
      expect(photoShareBase(locale) + 'school-founding' + '/').toBe(photoSharePath(locale, 'school-founding'))
    }
  })

  it('forwards to the page of the item’s own category', () => {
    const school = archive.find((i) => i.category === 'chinese-school')!
    expect(photoHomePath('en', school)).toBe('/school')
    expect(photoHomePath('zh-hant', school)).toBe('/zh-hant/school')
  })

  it('forwards archive categories to the archive', () => {
    const family = archive.find((i) => i.category === 'family')!
    expect(photoHomePath('en', family)).toBe('/archive')
  })

  it('forwards a photo shown on two pages to its home page', () => {
    // Filed under Hsi Lai; also shown on Calligraphy (alsoShownOn).
    expect(photoHomePath('en', byId('chinese-new-year-2025'))).toBe('/hsi-lai')
  })

  it('covers every published item and nothing without an image', () => {
    expect(sharedItems.length).toBe(archive.filter((i) => i.asset).length)
    expect(sharedItems.every((i) => i.asset)).toBe(true)
  })
})
