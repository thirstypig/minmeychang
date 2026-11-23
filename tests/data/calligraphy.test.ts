import { describe, expect, it } from 'vitest'
import {
  archive,
  buildArchiveSections,
  calligraphyItems,
  recentlyAdded,
} from '../../src/data/archive'
import { confirmedFacts } from '../../src/data/facts'

// The five photographs James moved from the archive to the Calligraphy page on
// 2026-11-22. They stay in archive.ts (so the local admin editor still edits
// them) under the 'calligraphy' category, which the archive page leaves out.
const MOVED = [
  'calligraphy-red-blazer',
  'calligraphy-costume-party',
  'calligraphy',
  'calligraphy-exhibition',
  'art-exhibition-with-friend',
]

const APPROVED_EN =
  'Each Lunar New Year she volunteers her calligraphy. At the invitation of the Huntington Library in San Marino, the Los Angeles County Arboretum in Arcadia and Hsi Lai Temple in Hacienda Heights, she goes and writes calligraphy in front of visitors and gives the pieces to them.'

describe('calligraphy page data', () => {
  it('holds exactly the five moved photographs', () => {
    expect(new Set(calligraphyItems.map((i) => i.id))).toEqual(new Set(MOVED))
    expect(calligraphyItems).toHaveLength(MOVED.length)
  })

  it('every calligraphy item has an image and a caption', () => {
    for (const item of calligraphyItems) {
      expect(item.asset, item.id).toBeTruthy()
      expect(item.caption?.en, item.id).toBeTruthy()
      expect(item.caption?.zhHant, item.id).toBeTruthy()
    }
  })

  it('no archive section shows a moved photograph', () => {
    const shown = buildArchiveSections().flatMap((s) => s.items.map((i) => i.id))
    for (const id of MOVED) expect(shown, id).not.toContain(id)
  })

  it("the archive's recently-added row never shows a moved photograph", () => {
    const withMovedNewest = archive.map((i) =>
      MOVED.includes(i.id) ? { ...i, added: '2999-01-01' } : i,
    )
    const recent = recentlyAdded(withMovedNewest).map((i) => i.id)
    for (const id of MOVED) expect(recent, id).not.toContain(id)
  })

  it('the calligraphy fact carries the wording James approved, at the family tier', () => {
    const fact = confirmedFacts.find((f) => f.id === 'calligraphy')
    expect(fact?.en).toBe(APPROVED_EN)
    expect(fact?.status).toBe('family')
    expect(fact?.note ?? '').not.toMatch(/no photograph/i)
  })
})
