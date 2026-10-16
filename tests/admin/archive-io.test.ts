import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { copyFileSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { ARCHIVE_PATH, loadArchive, saveArchive } from '../../scripts/admin/archive-io.mjs'

// The admin editor writes src/data/archive.ts by copying unedited entries
// through as text. These tests run it against a fixture in a temp directory,
// never the real file.

// Guard: if a path argument is ever ignored again, saves land on the real
// archive.ts. That happened while writing these tests. Fail loudly if so.
let realBefore: string
beforeAll(() => {
  realBefore = readFileSync(ARCHIVE_PATH, 'utf8')
})
afterAll(() => {
  expect(readFileSync(ARCHIVE_PATH, 'utf8'), 'a test wrote to the real archive.ts').toBe(realBefore)
})

const entry = (id: string, extra = '') => `  {
    id: '${id}',
    kind: 'photo',
    decade: 1980,
    category: 'family',
    en: '${id} en',
    zhHant: '${id} zh',${extra}
  },`

const fixture = (body: string) => `export const archiveCategoryOrder = ['family']
export const archiveCategoryLabels = { family: { en: 'Family', zhHant: '家庭' } }

export const archive: ArchiveItem[] = [
${body}
]

export const archiveDecades = [1980]
`

let dir: string
let path: string

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'archive-io-test-'))
  path = join(dir, 'archive.ts')
})

afterEach(() => {
  rmSync(dir, { recursive: true, force: true })
})

const write = (body: string) => writeFileSync(path, fixture(body))
const read = () => readFileSync(path, 'utf8')

type Item = { id: string; en: string }

async function edit(fn: (items: Item[]) => Item[]) {
  const { items } = await loadArchive(path)
  await saveArchive(fn(items), path)
}

describe('saveArchive', () => {
  it('a no-op save of the real archive.ts is byte-identical', async () => {
    // Fails if any part of the file is regenerated or re-spaced on a save
    // that changed nothing.
    copyFileSync(ARCHIVE_PATH, path)
    await edit((items) => items)
    expect(read()).toBe(readFileSync(ARCHIVE_PATH, 'utf8'))
  })

  it('keeps a comment between entries when an unrelated entry is edited', async () => {
    // The 2026-09-29 bug: splitBlocks kept only `{ … },` text, so this
    // comment vanished on any save.
    write(['', entry('a'), '  // about b', entry('b'), entry('c')].join('\n'))
    await edit((items) => items.map((i) => (i.id === 'c' ? { ...i, en: 'changed' } : i)))
    expect(read()).toContain(`  // about b\n${entry('b')}`)
  })

  it('moves a comment with the entry below it when entries are reordered', async () => {
    write(['', entry('a'), '  // about b', entry('b')].join('\n'))
    await edit((items) => [items[1]!, items[0]!])
    expect(read()).toContain(`[\n\n  // about b\n${entry('b')}\n${entry('a')}\n]`)
  })

  it('carries the comment above a deleted entry to the next entry, rather than dropping it', async () => {
    write(['', entry('a'), '  // about b', entry('b'), entry('c')].join('\n'))
    await edit((items) => items.filter((i) => i.id !== 'b'))
    expect(read()).toContain(`  // about b\n${entry('c')}`)
    expect(read()).not.toContain("id: 'b'")
  })

  it('keeps a comment after the last entry', async () => {
    write(['', entry('a'), entry('b'), '  // end of list'].join('\n'))
    await edit((items) => items.map((i) => (i.id === 'a' ? { ...i, en: 'changed' } : i)))
    expect(read()).toContain(`${entry('b')}\n  // end of list\n]`)
  })

  it('refuses to regenerate an edited entry that has a comment inside it, and leaves the file alone', async () => {
    // renderBlock rebuilds an edited entry from its fields, which would
    // silently drop a comment inside it.
    write(['', entry('a', '\n    // keep me')].join('\n'))
    const before = read()
    await expect(
      edit((items) => items.map((i) => ({ ...i, en: 'changed' })))
    ).rejects.toThrow(/comment/)
    expect(read()).toBe(before)
  })

  it('a URL inside a string is not mistaken for a comment', async () => {
    write(['', entry('a', "\n    asset: 'https://example.com/a.jpg',")].join('\n'))
    await edit((items) => items.map((i) => ({ ...i, en: 'changed' })))
    expect(read()).toContain("en: \"changed\"")
  })
})
