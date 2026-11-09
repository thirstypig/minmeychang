import { describe, expect, it } from 'vitest'
import { renderableFacts } from '../../src/data/facts'
import { affiliations } from '../../src/data/affiliations'
import { archive } from '../../src/data/archive'
import { figures } from '../../src/data/figures'
import { mediaAccounts } from '../../src/data/media'
import { press } from '../../src/data/press'
import { timeline } from '../../src/data/timeline'
import { ui } from '../../src/i18n/ui'

// She lived her whole American life in Arcadia, California, and this site is
// published by her family for her community there. The English is American.
//
// It was not. A sweep on 2026-08-10 found 78 British spellings across 29
// files, six of them in copy a visitor actually reads — "extracurricular
// programmes", "the City of Arcadia twice honoured the garden", "School
// programmes and yearbooks", and the marks notice naming "the organisations
// Min Mey Chang served". The garden was honored by an American city on an
// American certificate.
//
// Sibling of chinese-copy.test.ts, same shape: rendered fields only. Comments
// and notes are prose for maintainers and are swept separately by hand;
// scripts/verify-no-notes.mjs (postbuild) keeps them out of the built site.
//
// NOT collected, on purpose, though rendered by Press.astro: `press[].title`
// and `press[].outlet`. A title is a headline as published — a quotation —
// and an outlet is a proper noun in its own language. Neither may be
// Americanized, so "closing the gap" by collecting them would turn this guard
// into one that demands altering a published headline. (Todo 010.)
//
// BRITISH below is a list of known British-only forms, not a rule: it catches
// what a sweep found plus their inflections, and a word not on it passes. A
// pattern arm (any -our / -ise word minus an allowlist) was considered and not
// added; it would raise false positives on names for a prospective gain.

type Str = { source: string; where: string; text: string }

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
 *  (todo 013, item 2). A reader missing from this list fails too.
 *
 *  'archive needs' is deliberately absent: it reads the text of an empty
 *  placeholder frame, and since the last one (the 2001 appointment letter)
 *  was removed on 2026-11-08 there is none to read. If a placeholder with
 *  `needs` returns, the "not in READERS" check below fails — add it back. */
const READERS = [
  'fact',
  'affiliation name',
  'affiliation role',
  'archive',
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

function renderedEnglish(): Str[] {
  const out: Str[] = []
  const add = (source: string, where: string, text?: string) => {
    if (text) out.push({ source, where, text })
  }

  for (const f of renderableFacts) add('fact', `fact '${f.id}'`, f.en)
  for (const a of affiliations) {
    add('affiliation', `affiliation '${a.id}' name`, a.en)
    add('affiliation', `affiliation '${a.id}' role`, a.roleEn)
  }
  for (const i of archive) {
    add('archive', `archive '${i.id}'`, i.en)
    add('archive', `archive '${i.id}' needs`, i.needs?.en)
    add('archive', `archive '${i.id}' caption`, i.caption?.en)
  }
  for (const f of figures) add('figure', `figure '${f.id}'`, f.en)
  for (const a of mediaAccounts) add('media', `media '${a.id}'`, a.en)
  for (const p of press) add('press', `press '${p.id}'`, p.en)
  for (const e of timeline) {
    add('timeline', `timeline '${e.id}'`, e.en)
    add('timeline', `timeline '${e.id}' year`, e.yearDisplay?.en)
  }
  for (const [key, value] of Object.entries(ui.en)) {
    if (typeof value === 'string') add('ui', `ui '${key}'`, value)
  }

  return out
}

const strings = renderedEnglish()

/** Han ideographs only — deliberately NOT shared with chinese-copy.test.ts or
 *  tests/fonts/coverage.test.ts, which define their own. The three exist for
 *  different reasons and must be able to fail independently; a shared helper
 *  would let one wrong edit void all three at once, which is the exact failure
 *  this file guards against. The font one is intentionally wider (it includes
 *  full-width punctuation, because it is about glyph coverage). */
const isCjk = (ch: string) => {
  const cp = ch.codePointAt(0)!
  return (cp >= 0x3400 && cp <= 0x4dbf) || (cp >= 0x4e00 && cp <= 0x9fff)
}

/** British form → American form. British-only spellings: nothing here is
 *  ambiguous, and nothing here is also a correct American word. `practise`
 *  is included because American English uses `practice` for both noun and
 *  verb; `advertise`, `exercise` and `supervise` are identical in both and
 *  are deliberately absent. */
const BRITISH: Record<string, string> = {
  honour: 'honor', honours: 'honors', honoured: 'honored', honouring: 'honoring',
  colour: 'color', colours: 'colors', coloured: 'colored',
  favour: 'favor', favours: 'favors', favourite: 'favorite',
  behaviour: 'behavior', neighbour: 'neighbor', neighbours: 'neighbors',
  labour: 'labor', humour: 'humor', misdemeanour: 'misdemeanor',
  organise: 'organize', organised: 'organized', organisation: 'organization',
  organisations: 'organizations', organisational: 'organizational',
  organiser: 'organizer', organisers: 'organizers', organising: 'organizing',
  recognise: 'recognize', recognised: 'recognized', recognising: 'recognizing',
  realise: 'realize', realised: 'realized',
  normalise: 'normalize', normalised: 'normalized', normalises: 'normalizes',
  authorise: 'authorize', authorised: 'authorized', authorisation: 'authorization',
  unauthorised: 'unauthorized', anglicised: 'anglicized',
  characterise: 'characterize', characterises: 'characterizes',
  summarise: 'summarize', summarised: 'summarized', optimisation: 'optimization',
  specialise: 'specialize', specialised: 'specialized', serialised: 'serialized',
  practise: 'practice', practises: 'practices', practising: 'practicing',
  programme: 'program', programmes: 'programs',
  artefact: 'artifact', artefacts: 'artifacts',
  labelled: 'labeled', labelling: 'labeling', mislabelled: 'mislabeled',
  travelled: 'traveled', travelling: 'traveling', cancelled: 'canceled',
  marvellous: 'marvelous', jewellery: 'jewelry', counsellor: 'counselor',
  centre: 'center', centres: 'centers', theatre: 'theater', metre: 'meter',
  fibre: 'fiber', litre: 'liter',
  defence: 'defense', offence: 'offense', licence: 'license',
  grey: 'gray', enrol: 'enroll', enrolment: 'enrollment', fulfil: 'fulfill',
  instalment: 'installment', skilful: 'skillful', judgement: 'judgment',
  whilst: 'while', amongst: 'among', learnt: 'learned', spelt: 'spelled',
  storey: 'story', kerb: 'curb', tyre: 'tire', aluminium: 'aluminum',
  sceptical: 'skeptical', moustache: 'mustache', catalogue: 'catalog',
  speciality: 'specialty', orientated: 'oriented', ageing: 'aging',
  // Added 2026-11-08 (todo 010): inflections of stems already listed, and
  // whole classes the 2026-08 sweep never met. `towards` is deliberately
  // absent — it is correct, common American usage, not a British form.
  favoured: 'favored', honourable: 'honorable', colourful: 'colorful',
  neighbouring: 'neighboring', neighbourhood: 'neighborhood',
  organises: 'organizes', recognises: 'recognizes', realisation: 'realization',
  theatres: 'theaters', metres: 'meters', licences: 'licenses',
  storeys: 'stories', travellers: 'travelers', traveller: 'traveler',
  counsellors: 'counselors', counselling: 'counseling',
  analyse: 'analyze', analysed: 'analyzed', apologise: 'apologize',
  emphasise: 'emphasize', emphasised: 'emphasized', criticise: 'criticize',
  utilise: 'utilize', cheque: 'check', manoeuvre: 'maneuver',
  draught: 'draft', paediatric: 'pediatric', paediatrician: 'pediatrician',
}

const PATTERN = new RegExp(`\\b(${Object.keys(BRITISH).join('|')})\\b`, 'gi')

describe('American English copy', () => {
  // Guards the guard, per source. A total-count floor is not enough — proved
  // in chinese-copy.test.ts, where a floor of 40 survived the collector being
  // rewired to the wrong locale.
  //
  // The floor must be on ENGLISH strings, not on strings. The first version of
  // this file counted `length > 0` per source, which any string satisfies —
  // including a Chinese one. Sabotage, 2026-08-20: pointing the facts reader
  // at `.zhHant` passed 2/2, silently removing every rendered fact from the
  // spelling sweep. Only `ui` was anchored. Seven of eight sources were
  // unguarded while README claimed otherwise.
  //
  // Some English strings legitimately contain CJK — the meta description
  // carries 張馬敏妹 — so the test is "has Latin and no CJK", per string.
  it('actually collected the rendered English, from every source', () => {
    expect(strings.length).toBeGreaterThan(40)
    for (const source of SOURCES) {
      const english = strings.filter(
        (s) => s.source === source && /[A-Za-z]/.test(s.text) && ![...s.text].some(isCjk)
      )
      expect(
        english.length,
        `no English collected from '${source}' — that reader is pointed at the wrong field`
      ).toBeGreaterThan(0)
    }

    // Per reader — the finer floor; see READERS.
    const collected = new Set(strings.map((s) => readerOf(s.where)))
    for (const reader of collected) {
      expect(READERS as readonly string[], `reader '${reader}' is not in READERS — add it`).toContain(reader)
    }
    for (const reader of READERS) {
      const hits = strings.filter((s) => readerOf(s.where) === reader && /[A-Za-z]/.test(s.text) && ![...s.text].some(isCjk))
      expect(
        hits.length,
        `no English collected by the '${reader}' reader — it was dropped or points at the wrong field`
      ).toBeGreaterThan(0)
    }
    // Anchor: swapping ui.en for ui['zh-hant'] would leave the counts intact.
    expect(
      strings.find((s) => s.where === "ui 'siteName'")?.text,
      'the English site name is wrong — the locale key is probably swapped'
    ).toBe('Min Mey Chang')
  })

  it('uses American spelling in every rendered string', () => {
    const found: string[] = []
    for (const { where, text } of strings) {
      for (const m of text.matchAll(PATTERN)) {
        const british = m[0]
        found.push(
          `${where}: British '${british}' should be '${BRITISH[british.toLowerCase()]}' — "${text}"`
        )
      }
    }
    // The escape hatch, named in the failure itself so the guard never pushes
    // an author into breaking the copy standard (todo 010, option A).
    const hint =
      '\n\nIf the flagged word is part of an OFFICIAL NAME ("… Theatre", "… Centre", ' +
      'the surname Grey, an award "Honour") or inside a QUOTATION, it must NOT be ' +
      'Americanized — see the writing-american-english-copy skill. There is no ' +
      'exemption list yet (todo 010, option C): add one here, keyed by the ' +
      '`where` label above, rather than changing the spelling.'
    expect(found, found.join('\n  ') + (found.length ? hint : '')).toEqual([])
  })
})
