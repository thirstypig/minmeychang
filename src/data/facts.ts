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
    id: 'chinese-name',
    en: 'Chang Ma Min-Mey',
    zhHant: '張馬敏妹',
    status: 'family',
    source: 'confirmed by James Chang (son), 2026-08-05',
    note: 'Four-character 冠夫姓 form: husband\'s surname 張 + her maiden surname 馬 + given name 敏妹. The 馬 is not recoverable from the anglicized "Min Mey Chang", which is why this could never have been searched out or guessed.',
  },
  {
    id: 'aca-founded',
    en: 'Co-founded the Arcadia Chinese Association with Dr. Sheng Chang in 1982.',
    zhHant: '1982年與夫婿張勝雄醫師共同創辦亞凱迪亞華人協會。',
    status: 'family',
    source: 'confirmed by James Chang (son), 2026-08-05',
    note: 'The ACA site advertised a "38th Annual Gala" in Feb 2021, which would imply 1983. The family says 1982; gala counts commonly lag founding by a year. Going with 1982.',
  },
  {
    id: 'chinese-school-founded',
    en: 'Founded the Arcadia Chinese School in 1982 and served as its principal for more than thirty years.',
    zhHant: '1982年創辦亞凱迪亞中文學校，擔任校長逾三十年。',
    status: 'family',
    source: 'confirmed by James Chang (son), 2026-08-05',
  },
  {
    id: 'afternoon-classes',
    en: 'A trailblazer among Chinese schools, she established the school\'s afternoon classes and its extracurricular programmes.',
    zhHant: '她在中文學校教育上勇於開創，率先設立該校的課後中文班與課外活動課程。',
    status: 'family',
    source: 'confirmed by James Chang (son), 2026-08-05',
    note: 'Reworded 2026-08-05 at the family\'s request. Previously read "the first of their kind in the country" — an unverifiable nationwide superlative, and the only claim on the site a stranger could arrive to correct. What she established is concrete and family-attested; "trailblazer" characterises rather than asserts a record. Do not reintroduce the superlative without a source.',
  },
  {
    id: 'students-taught',
    en: 'Over thirty years the school educated thousands of students, who have gone on to professions of every kind and have children of their own.',
    zhHant: '三十年間，學校培育數千名學生，如今遍布各行各業，並各自成家。',
    status: 'family',
    source: 'confirmed by James Chang (son), 2026-08-05',
  },
  {
    id: 'ausd-relationship',
    en: 'Built a working relationship with the Arcadia Unified School District, resolving many issues affecting students.',
    zhHant: '與亞凱迪亞聯合學區建立良好關係，為學生解決許多問題。',
    status: 'family',
    source: 'confirmed by James Chang (son), 2026-08-05',
  },
  {
    id: 'i20',
    en: 'Persuaded the Arcadia Unified School District to approve I-20 forms, so students could remain in the United States to continue their studies.',
    zhHant: '說服亞凱迪亞聯合學區核准 I-20 入學許可，使學生得以留在美國繼續就學。',
    status: 'family',
    source: 'confirmed by James Chang (son), 2026-08-05',
    note: 'An I-20 is the form a school issues so a student can obtain or maintain F-1 status. This was the bracketed blank in the original draft and is arguably the most concrete institutional achievement in her record. Dated to the 1980s by the family, 2026-08-05; exact year still open.',
  },
  {
    id: 'teachers-association',
    en: 'Elected President of the Chinese Teacher Association for two years, leading three delegations of teachers, school board members and district staff to Taiwan and China to deepen their understanding of Chinese culture.',
    zhHant:
      '獲選為中文教師學會會長，任期兩年，並三度率領教師、教育委員及學區職員前往台灣與中國參訪，增進其對中華文化的了解。',
    status: 'family',
    source: 'confirmed by James Chang (son), 2026-08-05',
    note: 'The organisation was the bracketed [CONFIRM ORGANIZATION NAME] in the draft. Supplied as "the Chinese Teacher Association" — worth confirming the exact registered name and the years, as several similarly-named bodies exist in Southern California.',
  },
  {
    id: 'pta-golden-apple',
    en: 'Active in Arcadia Unified School District parent and school activities, and received the Golden Apple Award for her contributions.',
    zhHant: '積極參與亞凱迪亞聯合學區的家長與學校活動，並獲頒金蘋果獎。',
    status: 'family',
    source: 'confirmed by James Chang (son), 2026-08-05',
    note: 'Year still unknown; no public record names her. A scan of the certificate would settle it.',
  },
  {
    id: 'shih-chien',
    en: 'President of the local chapter of the Shih Chien University Alumni Association, and currently President of the national association.',
    zhHant: '曾任實踐大學校友會分會會長，現任全國總會會長。',
    status: 'family',
    source: 'confirmed by James Chang (son), 2026-08-05',
    note: 'Spelling confirmed as Shih Chien (實踐), not "She Chien". The national presidency is a CURRENT role — present tense. Years still unknown.',
  },
  {
    id: 'blia',
    en: "Founded the Arcadia chapter of Buddha's Light International Association and served as its founding President, later becoming supervisor for the Greater Los Angeles area.",
    zhHant: '創辦國際佛光會亞凱迪亞分會並任創會會長，其後擔任大洛杉磯地區督導。',
    status: 'family',
    source: 'confirmed by James Chang (son), 2026-08-05',
    note: 'The Greater LA role is "supervisor" — 督導 in BLIA usage. Founding year still unknown.',
  },
  {
    id: 'reflexology',
    en: 'A believer in reflexology, she publishes talks on the benefits, principles and application of massage, which have reached more than 830,000 viewers.',
    zhHant:
      '深信足部反射療法，並發表關於按摩功效、原理與應用的講座，觀看人次已逾八十三萬。',
    status: 'family',
    source: 'confirmed by James Chang (son), 2026-08-05',
    note: 'This is the subject of the 833,538-view lecture. Described by the family as a podcast; in practice the material is published as video. Wording on the site says "talks" to cover both.',
  },
  {
    id: 'calligraphy',
    en: 'For several years she has performed Chinese calligraphy at Lunar New Year celebrations at the Huntington Library and Gardens, the Los Angeles County Arboretum in Arcadia, and Hsi Lai Temple.',
    zhHant:
      '連續多年於農曆新年期間，在杭廷頓圖書館與花園、位於亞凱迪亞的洛杉磯郡植物園及西來寺揮毫展演。',
    status: 'family',
    source: 'confirmed by James Chang (son), 2026-08-05',
    note: 'Still no photograph of her calligraphy. It remains the most visually distinctive thing in her record and the archive has an empty frame waiting for it.',
  },
  {
    id: 'family',
    en: 'She and Dr. Sheng Chang are the parents of three sons — James, Peter and Richard — and grandparents of three grandchildren.',
    zhHant:
      '與夫婿張勝雄醫師育有三子 James、Peter、Richard，並有三名孫輩。',
    status: 'family',
    source: 'confirmed by James Chang (son), 2026-08-05',
    note: 'Names published at the family\'s direction; James is the eldest. Ages were supplied but are deliberately NOT published — they go stale the moment they are written, and a living private person\'s age adds nothing a tribute page needs. The grandchildren are given as a count, not by name: they were not named, and several are likely minors.',
  },
  {
    id: 'chinese-school-outcome',
    en: 'The school she founded was later transferred to new leadership, and is no longer running.',
    zhHant: '她所創辦的學校後來移交他人經營，現已停辦。',
    status: 'family',
    source: 'confirmed by James Chang (son), 2026-08-05',
    note: 'Resolves the contradiction in public sources. The PrivateSchoolReview listing at 823 S. First Ave showing an open "Arcadia Chinese School" with 184 students is either stale or a different entity — it is not the school under her tenure. Do not cite that listing.',
  },
  {
    id: 'immigration-arrival',
    en: 'Came to the United States in the late 1960s with her husband, Dr. Sheng Chang.',
    zhHant: '1960年代後期與夫婿張勝雄醫師一同來到美國。',
    status: 'family',
    source: 'confirmed by James Chang (son), 2026-08-05',
    note: 'Exact year, port of arrival and route still open — flagged for the in-depth interview. "Late 1960s" is safe to publish as written.',
  },
  {
    id: 'acupuncture-board',
    en: 'Appointed by California State Assembly Speaker Robert M. Hertzberg as a public member of the California Acupuncture Board, May 2001, for a term expiring July 2004.',
    zhHant:
      '2001年5月經加州眾議院議長 Robert M. Hertzberg 任命為加州針灸委員會公眾委員，任期至2004年7月。',
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

/** The only facts any page may render.
 *
 * Derived from ALL facts, not just `confirmedFacts`. Filtering `confirmedFacts`
 * alone would make the guard vacuous — that array contains no unverified facts
 * by construction, so the filter could never remove anything and the test
 * asserting "nothing unverified renders" could never fail. Deriving from the
 * union means the status field is what actually decides, which is the point.
 * A fact mislabelled 'confirmed' in either file is then caught by
 * `every renderable fact cites a source`.
 */
export const renderableFacts: Fact[] = [...confirmedFacts, ...pendingFacts].filter(
  (f) => f.status !== 'unverified'
)

export const hasPendingFacts = pendingFacts.length > 0
