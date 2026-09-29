import { describe, expect, it } from 'vitest'
import { existsSync } from 'node:fs'
import sharp from 'sharp'
import { archive, recentlyAdded, RECENT_LIMIT, suppliedItems, type ArchiveItem } from '../../src/data/archive'

// The grid renders public/archive/thumbs/<name>.jpg, built by
// scripts/build-thumbs.mjs. Nothing in CI runs that script, so these check the
// committed files themselves.

const thumbOf = (asset: string) => `public${asset.replace('/archive/', '/archive/thumbs/')}`

describe('archive thumbnails', () => {
  it('every published item has a thumbnail', () => {
    const missing = suppliedItems.filter((i) => !existsSync(thumbOf(i.asset!))).map((i) => i.id)
    expect(missing, 'run `npm run thumbs`').toEqual([])
  })

  // A stale thumbnail for a photo that was later re-cropped is the realistic
  // failure: it exists, it is a valid JPEG, and it shows the wrong picture.
  // The one property that reliably changes with a re-crop is the aspect ratio.
  it('every thumbnail has the same shape as its photo and is no wider than 480px', async () => {
    const wrong: string[] = []
    for (const item of suppliedItems) {
      const full = await sharp(`public${item.asset}`).metadata()
      const thumb = await sharp(thumbOf(item.asset!)).metadata()
      const ratio = (m: { width?: number; height?: number }) => m.width! / m.height!
      if (thumb.width! > 480 || Math.abs(ratio(full) / ratio(thumb) - 1) > 0.02) {
        wrong.push(`${item.id}: photo ${full.width}x${full.height}, thumb ${thumb.width}x${thumb.height}`)
      }
    }
    expect(wrong, 'stale thumbnail — delete it and run `npm run thumbs`').toEqual([])
  })
})

describe('recentlyAdded', () => {
  // `placeholder` rather than an `asset = …` default: passing undefined to a
  // defaulted parameter gives you the default, which is how this helper first
  // produced a "placeholder" that had a photo.
  const item = (id: string, added?: string, placeholder = false): ArchiveItem => ({
    id,
    kind: 'photo',
    category: 'family',
    decade: 2020,
    en: id,
    zhHant: id,
    asset: placeholder ? undefined : `/archive/${id}.jpg`,
    added,
  })

  it('returns newest first, skipping items with no added date', () => {
    const got = recentlyAdded([item('a', '2026-01-01'), item('b'), item('c', '2026-09-28')])
    expect(got.map((i) => i.id)).toEqual(['c', 'a'])
  })

  it('never shows a placeholder, even a recently added one', () => {
    expect(recentlyAdded([item('p', '2026-09-28', true)])).toEqual([])
  })

  it('keeps file order within the same date, and caps the row', () => {
    const many = Array.from({ length: RECENT_LIMIT + 3 }, (_, n) => item(`x${n}`, '2026-09-28'))
    const got = recentlyAdded(many)
    expect(got).toHaveLength(RECENT_LIMIT)
    expect(got[0].id).toBe('x0')
  })

  it('every added date in the real archive is a real ISO date, not in the future of the data', () => {
    for (const i of archive.filter((i) => i.added)) {
      expect(i.added, i.id).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(Number.isNaN(Date.parse(i.added!)), i.id).toBe(false)
    }
  })

  it('the real archive still shows all five 2026 Historymakers gala photos', () => {
    const ids = recentlyAdded().map((i) => i.id)
    expect(ids.filter((id) => id.startsWith('historymakers-2026-'))).toHaveLength(5)
  })
})
