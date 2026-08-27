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

/** Split the array body into { id, raw } blocks, in file order. */
function splitBlocks(source) {
  const { startIdx, endIdx } = splitBounds(source)
  const body = source.slice(startIdx, endIdx)
  const lines = body.split('\n')
  const blocks = []
  let cur = null
  for (const line of lines) {
    if (line === '  {') {
      cur = [line]
    } else if (cur) {
      cur.push(line)
      if (line === '  },') {
        const text = cur.join('\n')
        const id = text.match(/id: ['"]([^'"]+)['"]/)?.[1]
        if (!id) throw new Error(`block with no id near:\n${text.slice(0, 80)}`)
        blocks.push({ id, raw: text })
        cur = null
      }
    }
  }
  if (cur) throw new Error('unterminated block in archive.ts')
  return blocks
}

/** Load the file's real exported values via the TypeScript compiler, so
 *  every string/number the editor shows is exactly what the site sees. */
export async function loadArchive() {
  const source = readFileSync(ARCHIVE_PATH, 'utf8')
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

const EDITABLE_KEYS = ['id', 'kind', 'category', 'decade', 'en', 'zhHant', 'asset', 'needs', 'caption']

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
export async function saveArchive(items) {
  const source = readFileSync(ARCHIVE_PATH, 'utf8')
  const { startIdx, endIdx } = splitBounds(source)
  const blocks = splitBlocks(source)
  const blockById = new Map(blocks.map((b) => [b.id, b.raw]))

  const { items: current } = await loadArchive()
  const currentById = new Map(current.map((i) => [i.id, pick(i)]))

  const outBlocks = []
  for (const incoming of items) {
    const existingRaw = blockById.get(incoming.id)
    if (!existingRaw) {
      throw new Error(`unknown id "${incoming.id}" — this editor only edits existing entries`)
    }
    const before = currentById.get(incoming.id)
    const after = pick(incoming)
    outBlocks.push(fieldsEqual(before, after) ? existingRaw : renderBlock(after))
  }

  const newBody = '\n' + outBlocks.join('\n') + '\n'
  const beforeArray = source.slice(0, startIdx - START_MARKER.length)
  const newSource = beforeArray + START_MARKER + newBody + source.slice(endIdx)
  writeFileSync(ARCHIVE_PATH, newSource)
}
