import { describe, expect, it } from 'vitest'
import {
  archive,
  archiveCategoryOrder,
  buildArchiveSections,
  type ArchiveItem,
} from '../../src/data/archive'

// Minimal fixtures let these tests assert on the grouping *behavior* —
// category order, decade dedup/sort, empty-category exclusion — without
// depending on the real archive's current content, which changes often.
const item = (overrides: Partial<ArchiveItem>): ArchiveItem => ({
  id: 'x',
  kind: 'photo',
  category: 'family',
  decade: 1980,
  en: 'en',
  zhHant: 'zh',
  ...overrides,
})

describe('buildArchiveSections', () => {
  it('groups items under their category', () => {
    const sections = buildArchiveSections([
      item({ id: 'a', category: 'family' }),
      item({ id: 'b', category: 'travel' }),
      item({ id: 'c', category: 'family' }),
    ])

    const family = sections.find((s) => s.category === 'family')
    const travel = sections.find((s) => s.category === 'travel')

    expect(family?.items.map((i) => i.id)).toEqual(['a', 'c'])
    expect(travel?.items.map((i) => i.id)).toEqual(['b'])
  })

  it('excludes categories with zero items rather than rendering an empty section', () => {
    const sections = buildArchiveSections([item({ id: 'a', category: 'family' })])
    const categoriesPresent = sections.map((s) => s.category)

    expect(categoriesPresent).toEqual(['family'])
    expect(categoriesPresent).not.toContain('travel')
    expect(categoriesPresent).not.toContain('buddhist')
  })

  it('orders sections by archiveCategoryOrder, not by input or insertion order', () => {
    // Deliberately fed in reverse-of-canonical order.
    const reversed = [...archiveCategoryOrder].reverse()
    const items = reversed.map((category, i) => item({ id: `i${i}`, category }))

    const sections = buildArchiveSections(items)

    expect(sections.map((s) => s.category)).toEqual(
      archiveCategoryOrder.filter((c) => reversed.includes(c))
    )
  })

  it('deduplicates and sorts decades within a section, oldest first', () => {
    const sections = buildArchiveSections([
      item({ id: 'a', category: 'family', decade: 2000 }),
      item({ id: 'b', category: 'family', decade: 1970 }),
      item({ id: 'c', category: 'family', decade: 2000 }), // duplicate decade
      item({ id: 'd', category: 'family', decade: 1990 }),
    ])

    expect(sections[0].decades).toEqual([1970, 1990, 2000])
  })

  it('every item in the real archive appears in exactly one section, under its own category', () => {
    const sections = buildArchiveSections()
    const seen = new Map<string, string>()

    for (const section of sections) {
      for (const it of section.items) {
        expect(seen.has(it.id), `'${it.id}' appeared in more than one section`).toBe(false)
        seen.set(it.id, section.category)
        expect(it.category).toBe(section.category)
      }
    }

    expect(seen.size).toBe(archive.length)
  })

  it('defaults to the real archive when called with no argument', () => {
    expect(buildArchiveSections()).toEqual(buildArchiveSections(archive))
  })
})
