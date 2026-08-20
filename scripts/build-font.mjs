#!/usr/bin/env node
// Subsets Noto Serif TC to only the glyphs this site actually uses.
//
// A full Noto Serif TC is ~7.9MB — unshippable as a webfont, which is why most
// bilingual sites fall back to whatever Chinese font the visitor's OS supplies
// and therefore look materially different on Windows than on macOS. This site's
// copy is finite and known at build time, so it can ship a real webfont instead.
//
// The source font is NOT committed (7.9MB, gitignored in src-fonts/). The
// generated subset IS committed, so the normal build and CI need neither the
// source nor a network call. Regenerate with `npm run fonts` after adding
// Chinese copy — tests/fonts/coverage.test.ts fails if you forget.
//
// Noto Serif TC is SIL Open Font License 1.1: redistributable, and subsetting
// is explicitly permitted. License is committed alongside the font.

import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync } from 'node:fs'
import { join, extname } from 'node:path'
import subsetFont from 'subset-font'

const SOURCE = 'src-fonts/NotoSerifTC-Regular.otf'
const OUT_DIR = 'public/fonts'
const OUT_FONT = join(OUT_DIR, 'noto-serif-tc-subset.woff2')
const OUT_MANIFEST = join(OUT_DIR, 'subset-manifest.json')

// Directories whose text can reach a page carrying lang="zh-*".
const SCAN = ['src/content', 'src/i18n', 'src/data', 'src/pages', 'src/components']
const EXT = new Set(['.md', '.ts', '.astro'])

function walk(dir) {
  const out = []
  let entries
  try {
    entries = readdirSync(dir)
  } catch {
    return out
  }
  for (const entry of entries) {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) out.push(...walk(path))
    else if (EXT.has(extname(path))) out.push(path)
  }
  return out
}

// CJK ideographs, plus the compatibility and extension blocks a Traditional
// Chinese page can legitimately hit, plus CJK punctuation and full-width forms.
const isCjk = (cp) =>
  (cp >= 0x3000 && cp <= 0x303f) || // CJK punctuation 。、「」
  (cp >= 0x3400 && cp <= 0x4dbf) || // Extension A
  (cp >= 0x4e00 && cp <= 0x9fff) || // Unified ideographs
  (cp >= 0xf900 && cp <= 0xfaff) || // Compatibility ideographs
  (cp >= 0xfe30 && cp <= 0xfe4f) || // Compatibility forms
  (cp >= 0xff00 && cp <= 0xffef) // Full-width forms

const chars = new Set()
for (const dir of SCAN) {
  for (const file of walk(dir)) {
    for (const ch of readFileSync(file, 'utf8')) {
      if (isCjk(ch.codePointAt(0))) chars.add(ch)
    }
  }
}

// Digits and basic Latin punctuation appear inside Chinese sentences (years,
// "I-20", "YouTube"). Include them so a mixed run does not fall back mid-line.
for (const ch of '0123456789．，、。：；！？（）「」『』—－·%／') chars.add(ch)
for (let c = 0x20; c <= 0x7e; c++) chars.add(String.fromCharCode(c))

const text = [...chars].sort().join('')

if (chars.size === 0) {
  console.error('build-font: found no glyphs to subset — is SCAN pointing at the right dirs?')
  process.exit(1)
}

let source
try {
  source = readFileSync(SOURCE)
} catch {
  console.error(
    `build-font: ${SOURCE} not found.\n` +
      `It is gitignored (7.9MB). Download it once with:\n\n` +
      `  mkdir -p src-fonts && curl -sSL -o ${SOURCE} \\\n` +
      `    https://github.com/notofonts/noto-cjk/raw/main/Serif/SubsetOTF/TC/NotoSerifTC-Regular.otf\n`
  )
  process.exit(1)
}

const subset = await subsetFont(source, text, { targetFormat: 'woff2' })

mkdirSync(OUT_DIR, { recursive: true })
writeFileSync(OUT_FONT, subset)
writeFileSync(
  OUT_MANIFEST,
  JSON.stringify(
    {
      generated: 'run `npm run fonts` to regenerate',
      source: 'Noto Serif TC Regular, SIL OFL 1.1',
      glyphCount: chars.size,
      // Sorted codepoints, so tests/fonts/coverage.test.ts can assert that
      // every CJK character in source content is actually present.
      codepoints: [...chars]
        .map((c) => c.codePointAt(0))
        .filter(isCjk)
        .sort((a, b) => a - b),
    },
    null,
    2
  ) + '\n'
)

const pct = ((subset.length / source.length) * 100).toFixed(2)
console.log(
  `build-font: ${chars.size} glyphs → ${(subset.length / 1024).toFixed(1)}KB woff2 ` +
    `(${pct}% of the ${(source.length / 1024 / 1024).toFixed(1)}MB source)`
)
