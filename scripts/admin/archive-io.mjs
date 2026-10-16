// Reads and writes src/data/archive.ts for the local admin editor
// (scripts/admin-server.mjs). Two different techniques for two different
// jobs, on purpose:
//
//   READING needs accurate values (real strings, real numbers) to populate
//   an edit form. Regexing them out of hand-written TS risks exactly the
//   misattribution this project has hit before with batched image reads —
//   so instead this transpiles the file with the real TypeScript compiler
//   and imports the result, getting the exact values the site itself uses.
//
//   WRITING must NOT reformat every entry just because one caption got
//   fixed — that turns a one-line correction into a 1900-line diff nobody
//   can review. So this operates on the file as literal per-item TEXT
//   BLOCKS: unedited blocks are copied through byte-for-byte; only blocks
//   whose values actually changed are regenerated. Reordering necessarily
//   shows up as moved lines in the diff — that's unavoidable and fine.

import ts from 'typescript'
import { readFileSync, writeFileSync, rmSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

export const ARCHIVE_PATH = 'src/data/archive.ts'

const START_MARKER = 'export const archive: ArchiveItem[] = [\n'
const END_MARKER = '\n]\n\nexport const archiveDecades'

function splitBounds(source) {
  const startIdx = source.indexOf(START_MARKER) + START_MARKER.length
  const endIdx = source.indexOf(END_MARKER)
  if (startIdx < START_MARKER.length || endIdx < 0) {
    throw new Error('archive.ts markers not found — has the file structure changed?')
  }
  return { startIdx, endIdx }
}

/**
 * Split the array body into blocks, in file order, accounting for EVERY line
 * so that joining the pieces back reproduces the body exactly.
 *
 * The lines between two entries are split in two:
 *   - `sep`: the leading blank lines. Spacing belongs to the POSITION, so it
 *     stays put when entries are reordered.
 *   - `notes`: everything from the first non-blank line on, i.e. comments.
 *     A comment describes the entry below it, so it travels WITH that entry.
 * Lines after the last entry are `trailing`.
 */
function splitBlocks(source) {
  const { startIdx, endIdx } = splitBounds(source)
  const lines = source.slice(startIdx, endIdx).split('\n')
  const blocks = []
  const seps = []
  let pending = []
  let cur = null
  for (const line of lines) {
    if (cur) {
      cur.push(line)
      if (line === '  },') {
        const raw = cur.join('\n')
        const id = raw.match(/id: ['"]([^'"]+)['"]/)?.[1]
        if (!id) throw new Error(`block with no id near:\n${raw.slice(0, 80)}`)
        const firstNote = pending.findIndex((l) => l.trim() !== '')
        const cut = firstNote < 0 ? pending.length : firstNote
        seps.push(pending.slice(0, cut))
        blocks.push({ id, raw, notes: pending.slice(cut) })
        pending = []
        cur = null
      }
    } else if (line === '  {') {
      cur = [line]
    } else {
      pending.push(line)
    }
  }
  if (cur) throw new Error('unterminated block in archive.ts')
  return { blocks, seps, trailing: pending }
}

/** A line inside an entry that is a comment, not part of a value. Anchored to
 *  the start of the line, so a URL inside a string ('https://…') is not one. */
const COMMENT_LINE = /^\s*(\/\/|\/\*|\*)/

/** Load the file's real exported values via the TypeScript compiler, so
 *  every string/number the editor shows is exactly what the site sees. */
export async function loadArchive(path = ARCHIVE_PATH) {
  const source = readFileSync(path, 'utf8')
  const js = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText

  const tmpFile = join(tmpdir(), `archive-admin-${Date.now()}-${Math.random().toString(36).slice(2)}.mjs`)
  writeFileSync(tmpFile, js)
  try {
    const mod = await import(pathToFileURL(tmpFile).href)
    return {
      items: mod.archive,
      categoryOrder: mod.archiveCategoryOrder,
      categoryLabels: mod.archiveCategoryLabels,
    }
  } finally {
    rmSync(tmpFile, { force: true })
  }
}

function fieldsEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b)
}

/** Render a fresh, canonical text block for an item. Only used for items
 *  whose values actually changed — see saveArchive(). */
function renderBlock(item) {
  const lines = [
    '  {',
    `    id: ${JSON.stringify(item.id)},`,
    `    kind: ${JSON.stringify(item.kind)},`,
    `    decade: ${item.decade},`,
    `    category: ${JSON.stringify(item.category)},`,
    `    en: ${JSON.stringify(item.en)},`,
    `    zhHant: ${JSON.stringify(item.zhHant)},`,
  ]
  if (item.asset) lines.push(`    asset: ${JSON.stringify(item.asset)},`)
  if (item.added) lines.push(`    added: ${JSON.stringify(item.added)},`)
  if (item.needs) {
    lines.push(
      '    needs: {',
      `      en: ${JSON.stringify(item.needs.en)},`,
      `      zhHant: ${JSON.stringify(item.needs.zhHant)},`,
      '    },'
    )
  }
  if (item.caption) {
    lines.push(
      '    caption: {',
      `      en: ${JSON.stringify(item.caption.en)},`,
      `      zhHant: ${JSON.stringify(item.caption.zhHant)},`,
      '    },'
    )
  }
  lines.push('  },')
  return lines.join('\n')
}

const EDITABLE_KEYS = ['id', 'kind', 'category', 'decade', 'en', 'zhHant', 'asset', 'added', 'needs', 'caption']

function pick(item) {
  const out = {}
  for (const key of EDITABLE_KEYS) out[key] = item[key] ?? null
  return out
}

/**
 * items: the FULL desired final list, in the FULL desired final order.
 * Anything present in the current file but missing from `items` is treated
 * as deleted. Anything whose fields are unchanged from the current file is
 * copied through verbatim; anything changed is regenerated.
 */
export async function saveArchive(items, path = ARCHIVE_PATH) {
  const source = readFileSync(path, 'utf8')
  const { startIdx, endIdx } = splitBounds(source)
  const { blocks, seps, trailing } = splitBlocks(source)
  const blockById = new Map(blocks.map((b) => [b.id, b]))

  const { items: current } = await loadArchive(path)
  const currentById = new Map(current.map((i) => [i.id, pick(i)]))

  // A comment above a deleted entry is never dropped: it moves down to the
  // next surviving entry (or to the end of the list), where it shows up in
  // the diff for a human to keep or delete.
  const keptIds = new Set(items.map((i) => i.id))
  const notesById = new Map()
  let carried = []
  for (const b of blocks) {
    if (keptIds.has(b.id)) {
      notesById.set(b.id, [...carried, ...b.notes])
      carried = []
    } else {
      carried.push(...b.notes)
    }
  }

  const outLines = []
  items.forEach((incoming, position) => {
    const existing = blockById.get(incoming.id)
    if (!existing) {
      throw new Error(`unknown id "${incoming.id}" — this editor only edits existing entries`)
    }
    const before = currentById.get(incoming.id)
    const after = pick(incoming)
    let raw = existing.raw
    if (!fieldsEqual(before, after)) {
      // renderBlock rebuilds an entry from its fields alone, so a comment
      // inside it would be lost. Refuse before anything is written.
      if (raw.split('\n').some((l) => COMMENT_LINE.test(l))) {
        throw new Error(
          `"${incoming.id}" has a comment inside its entry, which saving would delete. ` +
            'Move the comment above the entry in archive.ts, then save again.'
        )
      }
      raw = renderBlock(after)
    }
    outLines.push(...(seps[position] ?? []), ...notesById.get(incoming.id), raw)
  })
  outLines.push(...carried, ...trailing)

  const newBody = outLines.join('\n')
  const beforeArray = source.slice(0, startIdx - START_MARKER.length)
  const newSource = beforeArray + START_MARKER + newBody + source.slice(endIdx)
  writeFileSync(path, newSource)
}
