// Single source of truth for every factual claim the site makes.
//
// RULE: nothing with status 'unverified' may render. This exists because the
// sibling project shengchangmd shipped an invented Chinese name, an invented
// insurance list and a fabricated Google Maps URL — all of which typechecked
// and built cleanly.
//
//   'confirmed'  — primary source on file; `source` names it
//   'family'     — stated directly by Min Mey Chang or Sheng Chang; `source` dates it
//   'unverified' — drafted but unchecked. DOES NOT RENDER.
//
// ---------------------------------------------------------------------------
// WHY UNVERIFIED CLAIMS ARE NOT IN THIS FILE
//
// This repository is PUBLIC. Unverified claims are drafted assertions about a
// living private person who has not yet reviewed them — and the `noindex` gate
// only covers the rendered site, not the repo, which GitHub indexes and serves
// publicly. Keeping them here would publish exactly the material the review
// gate exists to withhold.
//
// They live in `facts.pending.ts`, which is gitignored. The loader below treats
// a missing pending file as "nothing pending", so the build works for anyone
// who clones this repo without it.
// ---------------------------------------------------------------------------

export type FactStatus = 'confirmed' | 'family' | 'unverified'

export type Fact = {
  id: string
  en: string
  zhHant: string
  status: FactStatus
  /** URL of the primary source, or "confirmed by MMC, YYYY-MM-DD". */
  source?: string
  note?: string
}

/** Verified claims. Safe to render, safe to publish. */
export const confirmedFacts: Fact[] = [
  {
    id: 'acupuncture-board',
    en: 'Appointed by California State Assembly Speaker Robert M. Hertzberg as a public member of the California Acupuncture Board, May 2001, for a term expiring July 2004.',
    zhHant:
      '2001年5月經加州眾議會議長 Robert M. Hertzberg 任命為加州針灸委員會公眾委員，任期至2004年7月。',
    status: 'confirmed',
    source:
      'California Acupuncture Board Sunset Report, roster: "MIN M. CHANG (Public Member) July 2004 / Appointed by the Speaker of the Assembly, May 2001" — https://www.acupuncture.ca.gov/pubs_forms/sunset_report.pdf',
    note: 'Listed in the roster as "Min M. Chang". Decide which form of the name the site uses.',
  },
]

// Loaded via import.meta.glob rather than a static import: the file is
// gitignored and legitimately absent in a fresh clone, and a static import
// would fail the build. glob returns {} when nothing matches.
const pendingModules = import.meta.glob<{ pendingFacts?: Fact[] }>(
  './facts.pending.ts',
  { eager: true }
)

const loadedPending: Fact[] = Object.values(pendingModules).flatMap(
  (m) => m.pendingFacts ?? []
)

/** Drafted but unchecked. Never rendered. Empty unless facts.pending.ts exists locally. */
export const pendingFacts: Fact[] = loadedPending

/** The only facts any page may render. */
export const renderableFacts: Fact[] = confirmedFacts.filter(
  (f) => f.status !== 'unverified'
)

export const hasPendingFacts = pendingFacts.length > 0
