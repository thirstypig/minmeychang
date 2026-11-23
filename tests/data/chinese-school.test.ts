import { describe, expect, it } from 'vitest'
import {
  alsoShownOn,
  archive,
  archivePageCategories,
  buildArchiveSections,
  categoryPages,
  itemsForCategory,
  itemsForPage,
  recentlyAdded,
} from '../../src/data/archive'

// James moved the whole "The Arcadia Chinese School" archive section to its own
// page on 2026-11-23. The items stay in archive.ts (the admin editor still
// edits them); the archive page leaves the category out.
describe('the Arcadia Chinese School page data', () => {
  const school = itemsForCategory('chinese-school')

  it('holds the 19 items of the former archive section and the four James added', () => {
    expect(school).toHaveLength(23)
    expect(school.filter((i) => i.kind === 'photo')).toHaveLength(16)
    expect(school.filter((i) => i.kind === 'document')).toHaveLength(7)
    // Moved from the archive to the school on 2026-11-23 (James).
    for (const id of ['parade-red-shirts-flags', 'signing-ceremony-desk', 'office-desk-mosaic-jacket', 'alaska-museum-diorama']) {
      expect(school.map((i) => i.id), id).toContain(id)
    }
  })

  it('also shows the Lunar New Year 福 photo, which stays on the Calligraphy page', () => {
    expect(alsoShownOn['chinese-school']).toEqual(['calligraphy'])
    expect(itemsForPage('chinese-school').map((i) => i.id)).toContain('calligraphy')
    expect(itemsForPage('calligraphy').map((i) => i.id)).toContain('calligraphy')
  })

  it('keeps the archive array grouped: every school entry sits in one contiguous block', () => {
    const idx = archive.map((i, n) => (i.category === 'chinese-school' ? n : -1)).filter((n) => n >= 0)
    expect(idx[idx.length - 1]! - idx[0]! + 1).toBe(idx.length)
  })

  it('maps the school category to its route', () => {
    expect(categoryPages['chinese-school']).toBe('school')
  })

  it('is not an archive-page section', () => {
    expect(archivePageCategories).not.toContain('chinese-school')
    expect(buildArchiveSections().map((s) => s.category)).not.toContain('chinese-school')
  })

  it("the archive's recently-added row never shows a school item", () => {
    const ids = new Set(school.map((i) => i.id))
    const withSchoolNewest = archive.map((i) => (ids.has(i.id) ? { ...i, added: '2999-01-01' } : i))
    for (const item of recentlyAdded(withSchoolNewest)) expect(ids.has(item.id), item.id).toBe(false)
  })
})
