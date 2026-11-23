import { describe, expect, it } from 'vitest'
import {
  archive,
  archivePageCategories,
  buildArchiveSections,
  categoryPages,
  itemsForCategory,
  recentlyAdded,
} from '../../src/data/archive'

// James moved the whole "The Arcadia Chinese School" archive section to its own
// page on 2026-11-23. The items stay in archive.ts (the admin editor still
// edits them); the archive page leaves the category out.
describe('the Arcadia Chinese School page data', () => {
  const school = itemsForCategory('chinese-school')

  it('holds all 19 items of the former archive section', () => {
    expect(school).toHaveLength(19)
    expect(school.filter((i) => i.kind === 'photo')).toHaveLength(12)
    expect(school.filter((i) => i.kind === 'document')).toHaveLength(7)
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
