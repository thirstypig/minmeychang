#!/usr/bin/env node
// Fails the build if any `note` — or any non-URL `source` — from the data files
// appears in the built site.
//
// Those fields are research records for the repository: roster-by-roster search
// logs, consent caveats ("confirm she intends this to be findable BEFORE linking
// it"), and the names of the people who relayed a fact. Nothing renders them
// today, and the English and Chinese copy suites deliberately skip them because
// they legitimately quote counter-examples (衛理醫院). That is only safe while
// they stay out of the page, so this checks the page — what the public actually
// receives — rather than grepping components for `.note` (todo 003, option A).
//
// URL sources are exempt: a press article cited as a source may legitimately be
// linked from the Press page, and a public URL publishes nothing new.
//
// Matching is by sentence, not by the whole note, so a note that escapes only in
// part (a truncated tooltip, one line in JSON-LD) is still caught. The built HTML
// is entity-decoded and whitespace-collapsed first; without that, an apostrophe
// escaped to &#39; would make every note "absent" and the check vacuous.
// A positive control fails the run if a sentence that MUST be on the page is not
// found — proof the reader works, not just that it ran.

import ts from 'typescript'
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { pathToFileURL } from 'node:url'

const DIST = 'dist'
const DATA_FILES = [
  'src/data/facts.ts',
  'src/data/media.ts',
  'src/data/videos.ts',
  // gitignored, so absent in CI; checked when present locally.
  'src/data/facts.pending.ts',
]
const MIN_CHUNK = 20

async function loadModule(path) {
  // facts.ts pulls facts.pending.ts in with Vite's import.meta.glob, which
  // plain Node lacks. Stub it to "no matches": this script loads the pending
  // file directly from DATA_FILES instead.
  // Replaced after transpiling, once its type argument is gone.
  const js = ts
    .transpileModule(readFileSync(path, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    })
    .outputText.replace(/import\.meta\.glob\(/g, '((..._) => ({}))(')
  const tmp = join(tmpdir(), `verify-no-notes-${process.pid}-${Math.random().toString(36).slice(2)}.mjs`)
  writeFileSync(tmp, js)
  try {
    return await import(pathToFileURL(tmp).href)
  } finally {
    rmSync(tmp, { force: true })
  }
}

/** Every string held under a `note` or `source` key, anywhere in the value. */
function collect(value, file, out, id = '?') {
  if (Array.isArray(value)) value.forEach((v) => collect(v, file, out, id))
  else if (value && typeof value === 'object') {
    const ownId = typeof value.id === 'string' ? value.id : id
    for (const [key, v] of Object.entries(value)) {
      if ((key === 'note' || key === 'source') && typeof v === 'string') {
        out.push({ file, id: ownId, field: key, text: v })
      } else collect(v, file, out, ownId)
    }
  }
}

const normalize = (s) => s.replace(/\s+/g, ' ').trim()

function decode(html) {
  return html
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    // JSON-LD escapes quotes inside <script> blocks.
    .replace(/\\"/g, '"')
}

function chunks(text) {
  const parts = normalize(text).split(/(?<=[.。;；!?！？])\s*/)
  return parts.map((p) => p.trim()).filter((p) => p.length >= MIN_CHUNK)
}

function findHtml(dir) {
  const out = []
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) out.push(...findHtml(path))
    else if (entry.endsWith('.html')) out.push(path)
  }
  return out
}

if (!existsSync(DIST)) {
  console.error(`verify-no-notes: ${DIST}/ not found — did the build run?`)
  process.exit(1)
}

const records = []
let facts = []
for (const file of DATA_FILES) {
  if (!existsSync(file)) continue
  const mod = await loadModule(file)
  collect(Object.values(mod), file, records)
  if (file === 'src/data/facts.ts') facts = mod.confirmedFacts ?? []
}

const pages = findHtml(DIST).map((path) => ({ path, text: normalize(decode(readFileSync(path, 'utf8'))) }))

// Positive control: a fact's rendered English must be found by this same reader.
const control = facts.find((f) => f.id === 'sheng-chang-mayor')
if (!control || !pages.some((p) => p.text.includes(normalize(control.en)))) {
  console.error(
    'verify-no-notes: positive control failed — the rendered text of fact ' +
      '`sheng-chang-mayor` was not found in dist/. The reader is broken, so a ' +
      'clean result would mean nothing.',
  )
  process.exit(1)
}

const leaks = []
let checked = 0
for (const r of records) {
  if (r.field === 'source' && /^https?:\/\//.test(r.text.trim())) continue
  const needles = r.field === 'note' ? chunks(r.text) : [normalize(r.text)].filter((s) => s.length >= MIN_CHUNK)
  for (const needle of needles) {
    checked++
    const hit = pages.find((p) => p.text.includes(needle))
    if (hit) leaks.push({ ...r, needle, page: hit.path })
  }
}

if (checked === 0) {
  console.error('verify-no-notes: no note or source text was collected — the loader is broken.')
  process.exit(1)
}

if (leaks.length > 0) {
  console.error(`verify-no-notes: ${leaks.length} internal note/source fragment(s) reached the built site:`)
  for (const l of leaks) {
    console.error(`  ${l.file} · ${l.id} · ${l.field} → ${l.page}\n    "${l.needle.slice(0, 120)}"`)
  }
  process.exit(1)
}

console.log(
  `verify-no-notes: OK — ${checked} fragment(s) from ${records.length} note/source field(s) ` +
    `absent from ${pages.length} page(s); positive control found.`,
)
