import { describe, expect, it } from 'vitest'
import { simplifiedToTraditional } from './simplified-only'
import { renderableFacts } from '../../src/data/facts'
import { affiliations } from '../../src/data/affiliations'
import { archive } from '../../src/data/archive'
import { figures } from '../../src/data/figures'
import { mediaAccounts } from '../../src/data/media'
import { press } from '../../src/data/press'
import { timeline } from '../../src/data/timeline'
import { ui } from '../../src/i18n/ui'

// The existing per-module tests assert that Chinese copy EXISTS and DIFFERS
// from the English. None of them assert it is correct.
//
// This file closes that gap. The standard is 臺灣華語 at college level —
// 正體字, formal 書面語, Taiwan lexis, Taiwan punctuation. Every check below
// encodes a mistake actually made on this project, not a hypothetical one.
//
// It deliberately reads the RENDERED fields only. `note` and `source` are
// internal prose and legitimately contain counter-examples — the note on
// methodist-asian-outreach names 衛理醫院 precisely so nobody reintroduces it.
// Scanning raw files would flag that note and teach the wrong lesson.
// That they never reach the page is enforced, not assumed: the postbuild
// scripts/verify-no-notes.mjs fails the build if any note fragment does.

/** `standalone` is false when the component renders a title or heading directly
 *  above this string, which gives an opening anaphor something to refer to.
 *  Press.astro prints `title` and `outlet` above the description; nothing else
 *  in this codebase does. */
type Str = { source: string; where: string; text: string; standalone: boolean }

const SOURCES = [
  'fact',
  'affiliation',
  'archive',
  'figure',
  'media',
  'press',
  'timeline',
  'ui',
] as const

/** Every individual reader in the collector, by its `where` label minus the
 *  id. Floored one by one, not per source: three sub-field readers
 *  (affiliation role, archive needs, timeline year) shared a bucket with a
 *  sibling, so deleting one or pointing it at the other language passed
 *  (todo 013, item 2). A reader missing from this list fails too. */
const READERS = [
  'fact',
  'affiliation name',
  'affiliation role',
  'archive',
  'archive needs',
  'archive caption',
  'figure',
  'media',
  'press',
  'timeline',
  'timeline year',
  'ui',
] as const

/** "archive 'x' needs" → "archive needs"; "fact 'x'" → "fact". */
const readerOf = (where: string) => where.replace(/ '[^']*'/, '')

function renderedChinese(): Str[] {
  const out: Str[] = []
  const add = (source: string, where: string, text?: string, standalone = true) => {
    if (text) out.push({ source, where, text, standalone })
  }

  for (const f of renderableFacts) add('fact', `fact '${f.id}'`, f.zhHant)
  for (const a of affiliations) {
    add('affiliation', `affiliation '${a.id}' name`, a.zhHant)
    add('affiliation', `affiliation '${a.id}' role`, a.roleZhHant)
  }
  for (const i of archive) {
    add('archive', `archive '${i.id}'`, i.zhHant)
    add('archive', `archive '${i.id}' needs`, i.needs?.zhHant)
    add('archive', `archive '${i.id}' caption`, i.caption?.zhHant)
  }
  for (const f of figures) add('figure', `figure '${f.id}'`, f.zhHant)
  for (const a of mediaAccounts) add('media', `media '${a.id}'`, a.zhHant)
  for (const p of press) add('press', `press '${p.id}'`, p.zhHant, false)
  for (const e of timeline) {
    add('timeline', `timeline '${e.id}'`, e.zhHant)
    add('timeline', `timeline '${e.id}' year`, e.yearDisplay?.zhHant)
  }
  for (const [key, value] of Object.entries(ui['zh-hant'])) {
    if (typeof value === 'string') add('ui', `ui '${key}'`, value)
  }

  return out
}

const strings = renderedChinese()
const isCjk = (ch: string) => {
  const cp = ch.codePointAt(0)!
  return (cp >= 0x3400 && cp <= 0x4dbf) || (cp >= 0x4e00 && cp <= 0x9fff)
}

describe('Taiwan Mandarin copy', () => {
  // Guards the guard. If the collector silently returns nothing — a renamed
  // export, a changed field — every assertion below passes vacuously. This
  // repo has already shipped one test that could not fail; not a second.
  // A total-count floor is NOT enough, and this was found the hard way: with
  // the collector rewired to read `.en`, a floor of 40 still passed, because
  // the six untouched modules cleared it on their own. Every check below would
  // then have been asserting things about English prose. The guard has to be
  // per-source, plus anchors, or it does not guard.
  it('actually collected the rendered Chinese, from every source', () => {
    expect(strings.length).toBeGreaterThan(40)

    for (const source of SOURCES) {
      const withCjk = strings.filter(
        (s) => s.source === source && [...s.text].some(isCjk)
      )
      expect(
        withCjk.length,
        `no Chinese collected from '${source}' — that reader is pointed at the wrong field`
      ).toBeGreaterThan(0)
    }

    // Per reader — the finer floor; see READERS.
    const collected = new Set(strings.map((s) => readerOf(s.where)))
    for (const reader of collected) {
      expect(READERS as readonly string[], `reader '${reader}' is not in READERS — add it`).toContain(reader)
    }
    for (const reader of READERS) {
      const hits = strings.filter((s) => readerOf(s.where) === reader && [...s.text].some(isCjk))
      expect(
        hits.length,
        `no Chinese collected by the '${reader}' reader — it was dropped or points at the wrong field`
      ).toBeGreaterThan(0)
    }

    // Anchors. Both survive a per-source count that is technically non-zero:
    // ui['en'] contains 張馬敏妹 inside an English meta description, so 'ui'
    // alone would still show CJK if the locale key were swapped.
    expect(
      strings.some((s) => s.source === 'fact' && s.text === '張馬敏妹'),
      'her name is missing from the collected facts'
    ).toBe(true)
    expect(
      [...(strings.find((s) => s.where === "ui 'siteName'")?.text ?? '')].some(isCjk),
      'the zh-hant site name is not Chinese — the locale key is probably wrong'
    ).toBe(true)
  })

  // Simplified characters that have a distinct 正體 form and are NOT themselves
  // valid Traditional characters. 台 and 里 are legitimate in Taiwan and must
  // never be flagged; nor may any character identical in both scripts. The
  // first hand-written draft listed 敏 — unchanged in Traditional and sitting
  // in 張馬敏妹 — so the test failed on her own name and called it 简体.
  //
  // Until 2026-11 this was 60 hand-picked pairs, which caught a paste only if
  // that character happened to be listed: 32 characters in use on the site,
  // including the awards vocabulary 獲 榮 譽 獎, had no simplified twin in it
  // (todo 009). The table is now generated from OpenCC with Taiwan variants
  // applied — see scripts/build-simplified-table.mjs for the rule that keeps
  // 台, 里, 后, 几, 峰 and 敏 out of it.
  //
  // The regression: mainland sources get read during research. Three of the
  // sites consulted while sourcing the hospital facts were 简体.
  it('contains no simplified characters', () => {
    const simplified = simplifiedToTraditional
    expect(simplified.size, 'simplified table failed to load').toBeGreaterThan(3000)
    for (const valid of ['台', '里', '后', '几', '峰', '敏', '張', '馬', '妹']) {
      expect(simplified.has(valid), `'${valid}' is valid Traditional and must not be flagged`).toBe(false)
    }

    const found: string[] = []
    for (const { where, text } of strings) {
      for (const ch of text) {
        if (simplified.has(ch)) {
          found.push(`${where}: 简体 '${ch}' should be '${simplified.get(ch)}'`)
        }
      }
    }
    expect(found, found.join('\n  ')).toEqual([])
  })

  // Half-width punctuation is correct inside Latin runs — "Robert M. Hertzberg"
  // and "U.S." are right as written. It is wrong when it touches CJK.
  //
  // The regression: ASCII punctuation is what a keyboard produces by default.
  it('uses full-width punctuation wherever it touches Chinese', () => {
    const halfWidth = new Set([',', ';', ':', '?', '!', '(', ')'])
    const found: string[] = []

    for (const { where, text } of strings) {
      const chars = [...text]
      chars.forEach((ch, i) => {
        if (!halfWidth.has(ch)) return
        const prev = chars[i - 1]
        const next = chars[i + 1]
        if ((prev && isCjk(prev)) || (next && isCjk(next))) {
          found.push(`${where}: half-width '${ch}' adjacent to Chinese in "${text}"`)
        }
      })
    }
    expect(found, found.join('\n  ')).toEqual([])
  })

  // Every string renders as its own element — a list item, a caption, a label.
  // Nothing precedes it, so an opening anaphor points at nothing.
  //
  // The regression: methodist-asian-outreach shipped opening with 該院 ("said
  // hospital") in a standalone <li>. Caught in review, not by a test.
  it('opens no standalone string with a bare anaphor', () => {
    const anaphors = ['該', '此', '其', '這', '那']
    // Lexicalized openers. 其他 is the word "other", not a reference to
    // anything — 其他平台 ("Elsewhere") is correct as written.
    const lexicalized = ['其他', '其中', '其餘', '其後', '這些', '這樣', '那些']

    const found = strings
      .filter((s) => s.standalone)
      .filter((s) => anaphors.includes([...s.text][0]))
      .filter((s) => !lexicalized.includes([...s.text].slice(0, 2).join('')))
      .map((s) => `${s.where}: opens with '${[...s.text][0]}' — "${s.text}"`)

    expect(found, found.join('\n  ')).toEqual([])
  })

  // Proper nouns come from the body itself, never from the obvious rendering.
  // 衛理 is the textbook translation of "Methodist" and is what an unchecked
  // translation produces. The hospital calls itself 南加州美以美醫院 throughout
  // its own Chinese-language site.
  //
  // Same shape as the existing guard on her name and the grandchildren's.
  it('names the hospital as it names itself, never 衛理', () => {
    const hospital = strings.filter((s) => s.text.includes('美以美醫院'))
    expect(
      hospital.length,
      'no string names the hospital — did the facts get renamed or removed?'
    ).toBeGreaterThan(0)

    const wrong = strings
      .filter((s) => s.text.includes('衛理'))
      .map((s) => `${s.where}: uses 衛理 — the hospital's own name is 南加州美以美醫院`)
    expect(wrong, wrong.join('\n  ')).toEqual([])
  })
})
