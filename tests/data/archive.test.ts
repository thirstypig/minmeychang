import { describe, expect, it } from 'vitest'
import {
  archive,
  archiveDecades,
  archiveCategoryOrder,
  archiveCategoryLabels,
  suppliedItems,
  placeholderItems,
} from '../../src/data/archive'

describe('archive', () => {
  it('has unique ids', () => {
    const ids = archive.map((i) => i.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every item has a caption in both locales', () => {
    for (const item of archive) {
      expect(item.en.length, `'${item.id}'`).toBeGreaterThan(0)
      expect(item.zhHant.length, `'${item.id}'`).toBeGreaterThan(0)
      expect(item.zhHant, `'${item.id}' caption is untranslated`).not.toBe(item.en)
    }
  })

  // The concrete regression: an item with no asset AND no `needs` renders as a
  // blank dashed rectangle. A visitor sees an apparently broken image; the
  // family sees nothing telling them what to go and find. The placeholder is
  // only useful because it states what is missing.
  it('every item without an asset says what is needed', () => {
    for (const item of placeholderItems) {
      expect(
        item.needs,
        `'${item.id}' has no asset and no 'needs' — it renders as an empty box that asks for nothing`
      ).toBeTruthy()
      expect(item.needs!.en.length, `'${item.id}'`).toBeGreaterThan(0)
      expect(item.needs!.zhHant.length, `'${item.id}'`).toBeGreaterThan(0)
    }
  })

  it('supplied and placeholder items partition the archive', () => {
    expect(suppliedItems.length + placeholderItems.length).toBe(archive.length)
    for (const item of suppliedItems) expect(item.asset).toBeTruthy()
    for (const item of placeholderItems) expect(item.asset).toBeFalsy()
  })

  it('any supplied asset points inside public/ and is not an original', () => {
    // Originals live in gitignored src-photos/ and src-documents/ because the
    // repo is public and they carry EXIF, addresses and signatures. Only
    // derived, reviewed files belong under public/.
    for (const item of suppliedItems) {
      expect(item.asset, `'${item.id}'`).toMatch(/^\/[a-z0-9/-]+\.(jpg|jpeg|png|webp|avif)$/i)
      expect(item.asset, `'${item.id}' points at an original, not a derived asset`).not.toMatch(
        /src-photos|src-documents/
      )
    }
  })

  it('decades are sorted oldest first and cover every item', () => {
    expect(archiveDecades).toEqual([...archiveDecades].sort((a, b) => a - b))
    for (const item of archive) {
      expect(archiveDecades, `'${item.id}' decade ${item.decade} is missing`).toContain(
        item.decade
      )
    }
  })

  it('every decade is a plausible decade of her life', () => {
    // She arrived in the late 1960s. A stray 19 or 2020 breaks the grouping
    // silently by creating a section of one.
    for (const decade of archiveDecades) {
      expect(decade % 10, `${decade} is not a decade`).toBe(0)
      expect(decade).toBeGreaterThanOrEqual(1960)
      expect(decade).toBeLessThanOrEqual(2030)
    }
  })

  it('kinds are limited to photo and document', () => {
    for (const item of archive) {
      expect(['photo', 'document'], `'${item.id}'`).toContain(item.kind)
    }
  })

  it('every item has a category from the defined set', () => {
    for (const item of archive) {
      expect(archiveCategoryOrder, `'${item.id}' has an unknown category '${item.category}'`).toContain(
        item.category
      )
    }
  })

  it('every category in the order list has a bilingual label and at least one item', () => {
    for (const category of archiveCategoryOrder) {
      expect(archiveCategoryLabels[category], category).toBeTruthy()
      expect(archiveCategoryLabels[category].en.length, category).toBeGreaterThan(0)
      expect(archiveCategoryLabels[category].zhHant.length, category).toBeGreaterThan(0)
      expect(
        archive.some((i) => i.category === category),
        `category '${category}' has no items — dead section`
      ).toBe(true)
    }
  })
})
