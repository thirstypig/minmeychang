import { describe, expect, it } from 'vitest'
import {
  archive,
  archivePageCategories,
  buildArchiveSections,
  categoryPages,
  itemsForCategory,
  recentlyAdded,
} from '../../src/data/archive'
import { confirmedFacts } from '../../src/data/facts'

// The archive's Buddha's Light section became the Hsi Lai Temple & Buddha's
// Light page on 2026-11-23 (James): all 10 photos.
describe('the Hsi Lai Temple & Buddha\'s Light page data', () => {
  const temple = itemsForCategory('buddhist')

  it('holds all 10 photos of the former archive section', () => {
    expect(temple).toHaveLength(10)
    expect(categoryPages.buddhist).toBe('temple')
  })

  it('leaves the archive page with three sections and 112 items', () => {
    expect(archivePageCategories).toEqual(['family', 'community', 'travel'])
    expect(buildArchiveSections().flatMap((s) => s.items)).toHaveLength(112)
  })

  it("the archive's recently-added row never shows one of them", () => {
    const ids = new Set(temple.map((i) => i.id))
    const newest = archive.map((i) => (ids.has(i.id) ? { ...i, added: '2999-01-01' } : i))
    for (const item of recentlyAdded(newest)) expect(ids.has(item.id), item.id).toBe(false)
  })

  it('records her Hsi Lai membership in the wording James approved, at the family tier', () => {
    const fact = confirmedFacts.find((f) => f.id === 'hsi-lai-member')
    expect(fact?.en).toBe('A member of Hsi Lai Temple in Hacienda Heights, where she volunteers.')
    expect(fact?.zhHant).toBe('她是位於哈仙達崗的西來寺信眾，並在寺中擔任志工。')
    expect(fact?.status).toBe('family')
  })
})
