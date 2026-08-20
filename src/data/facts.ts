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
    status: 'confirmed',
    source:
      'Family, 2026-08-05, for the founding year and tenure. The principalship is independently attested by Merit Times 人間通訊社: "並曾任亞凱迪亞市中華學校校長" — https://www.lnanews.com/news/150416',
  },
  {
    id: 'afternoon-classes',
    en: 'A trailblazer among Chinese schools, she established the school\'s afternoon classes and its extracurricular programs.',
    zhHant: '她在中文學校教育上勇於開創，率先設立該校的課後中文班與課外活動課程。',
    status: 'family',
    source: 'confirmed by James Chang (son), 2026-08-05',
    note: 'Reworded 2026-08-05 at the family\'s request. Previously read "the first of their kind in the country" — an unverifiable nationwide superlative, and the only claim on the site a stranger could arrive to correct. What she established is concrete and family-attested; "trailblazer" characterizes rather than asserts a record. Do not reintroduce the superlative without a source.',
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
    note: 'The organization was the bracketed [CONFIRM ORGANIZATION NAME] in the draft. Supplied as "the Chinese Teacher Association" — worth confirming the exact registered name and the years, as several similarly-named bodies exist in Southern California.',
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
    en: 'President of the Shih Chien University Alumni Association of Southern California in 2016–17, and President of the North America association.',
    zhHant:
      '2016至2017年任實踐大學南加州校友會會長，並任北美總會長。',
    status: 'confirmed',
    source:
      'Southern California chapter presidency 2016-17: Taiwanese American Archives, "Shih Chien University Alumni Association of Southern California 實踐大學南加州校友會", listing "2016-17 會長 張馬敏妹 Minmey Chang" — https://taiwaneseamericanhistory.org/shih-chien-university-alumni-association-of-southern-california/ | North America presidency: 大紀元/Epoch Times, 2024-07-03, naming her 北美總會長張馬敏妹 at the Northern California chapter handover — https://sf.epochtimes.com/2024/07/03/30561.html',
    note: 'CORRECTED. The draft said "national association"; the sources say 北美總會 — North America, not one country. Also note the archive renders her English name as one word, "Minmey Chang".',
  },
  {
    id: 'blia',
    en: "Founding President of the Arcadia chapter of Buddha's Light International Association, established in 1994 at a ceremony led by Venerable Master Hsing Yun, and later supervisor for the Los Angeles association.",
    zhHant:
      '國際佛光會亞凱迪亞分會創會會長。該分會於1994年由開山祖師星雲大師親臨主持成立，她其後出任洛杉磯協會督導。',
    status: 'confirmed',
    source:
      'BLIA Los Angeles, 2024-09-22: "亞市分會是在1994年由開山祖師星雲大師親臨佈達主持成立儀式… 創會會長張馬敏妹督導" — https://la.blia.org/2024/09/22/092224/ | Also Merit Times 人間通訊社: "張馬敏妹為國際佛光會洛杉磯協會亞市分會創會會長" — https://www.lnanews.com/news/150416',
    note: 'RESOLVED the founding year: 1994, and the ceremony was led by 星雲大師 himself. 督導 was the right guess for the supervisor title. The 2024 chapter election was held at their home.',
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
    id: 'sheng-chang-mayor',
    en: 'Her husband, Dr. Sheng Chang, served as Mayor of Arcadia for two terms — eight years.',
    zhHant: '夫婿張勝雄醫師曾任亞凱迪亞市市長，兩任共八年。',
    status: 'confirmed',
    source:
      'Merit Times 人間通訊社: "張勝雄曾任亞凱迪亞市市長兩任8年" — https://www.lnanews.com/news/150416. Also referred to as 亞凱迪亞前市長 in an AMTV broadcast, 2022 — https://youtu.be/cqdyWDGSTnw',
    note: 'ABSENT FROM THE DRAFT BIO ENTIRELY, and absent from shengchangmd.com, which describes him only as a family physician. Worth telling that project. Included here because it is the context in which much of her civic work happened — she was co-founding associations and running a school while her husband led the city. Years of the two terms still unknown.',
  },
  {
    id: 'arcadia-beautiful',
    en: 'The City of Arcadia twice honored the garden she made at their home: the Anita Baldwin Award in 1982, and the Mayor\'s Award in 1984, both under the Arcadia Beautiful Award.',
    zhHant:
      '她親手打理的家園庭院兩度獲亞凱迪亞市表彰：1982年獲安妮塔・鮑德溫獎，1984年獲市長獎，皆屬「亞凱迪亞美化獎」。',
    status: 'confirmed',
    source:
      'The two framed certificates themselves, photographed by the family 2026-08-05. 1982: category "The Anita Baldwin Award", Mayor Donald D. Pellegrino. 1984: category "Mayor\'s Award", Mayor David S. Hannah. Both signed by the chairs of the Arcadia Beautiful Commission and Arcadia Beautiful Awards. Scans in public/archive/.',
    note: 'Two details worth knowing. (1) The 1982 certificate spells the surname "Cheng"; the 1984 one spells it "Chang". The family confirms Chang is correct, so the site uses Chang throughout — the 1982 spelling is a property of the artifact, not a fact about them. (2) Both certificates print a former home address, and the family confirms both were their homes; they moved between 1982 and 1984. Both addresses are redacted in the published scans by scripts/build-award-scans.mjs. Never publish an unredacted version.',
  },
  {
    id: 'family',
    en: 'She and Dr. Sheng Chang are the parents of three sons — James, Peter and Richard — and grandparents of three grandchildren: Tobin, Jarren and Rhys.',
    zhHant:
      '與夫婿張勝雄醫師育有三子 James、Peter、Richard，並有三名孫輩 Tobin、Jarren、Rhys。',
    status: 'family',
    source: 'confirmed by James Chang (son), 2026-08-05',
    note: 'Names published at the family\'s direction; James is the eldest. The grandchildren were named on 2026-08-05 when their own sites were linked from the footer — naming them there while withholding the names here would have been incoherent, and each of tobinchang.com / jarrenchang.com / rhyschang.com already publishes the name as its domain and title. Ages were supplied but are deliberately NOT published — they go stale the moment they are written, and a living private person\'s age adds nothing a tribute page needs. The grandchildren are given as a count, not by name: they were not named, and several are likely minors.',
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
  {
    id: 'methodist-hospital-board',
    en: 'Served on the Foundation Board of Methodist Hospital of Southern California in Arcadia, now USC Arcadia Hospital.',
    zhHant:
      '曾任位於亞凱迪亞的南加州美以美醫院基金會董事，該院現已更名為 USC Arcadia Hospital。',
    status: 'family',
    source:
      'Stated by Min Mey Chang to James Chang (son), relayed 2026-08-10 as "the board". Narrowed to the Foundation Board by the family\'s written biography, supplied 2026-08-20: "Served on the Foundation Board of the USC Arcadia Hospital (formerly the Arcadia Methodist Hospital)."',
    note:
      'NO YEARS, deliberately — she did not give them and no roster confirms them. PUBLISHED AGAINST A CONTRARY SEARCH, at the family\'s direction, on the understanding that it can be revised. Originally recorded as the hospital board; narrowed to the FOUNDATION board on 2026-08-20, when the family supplied a written biography naming that body specifically. That is a more precise claim from the same source, not a new one, and it does not escape the contrary search — the Foundation roster was among those read. What was checked on 2026-08-09, each roster verified to contain names before the absence was treated as meaningful: the hospital Board of Directors for 1999, 2002, 2003, 2004, 2005 and 2010 (archived rosters) and 2019-2024 (Form 990 Part VII via ProPublica); the Foundation Board of Directors for 2002, 2003, 2004, 2005 and 2019, plus the 39 individual board-member bio pages published around 2010-11. She appears on none of them. Unchecked: pre-1999, 2006-2009, and 2012-2018 — and note the Foundation years read are the thinner set, so the years most likely to carry her are among those never sampled. The definitive source is Form 990 Part VII for 2001-2024, which names every director — ProPublica blocks scripted downloads and the IRS now ships those XMLs only in bulk yearly zips, so it was not run. If this fact is ever challenged, run that before defending it. See also the sibling fact methodist-asian-outreach.',
  },
  {
    id: 'methodist-asian-outreach',
    en: "Served on the hospital's Asian Outreach committee, which advised on cultural matters and helped plan its annual Asian Health Fair.",
    zhHant:
      '曾任南加州美以美醫院亞裔外展委員會（Asian Outreach committee）委員；該委員會就文化事務提供諮詢，並協助籌辦該院一年一度的亞裔健康博覽會。',
    status: 'family',
    source:
      'Her service stated by Min Mey Chang to James Chang (son), relayed 2026-08-10. The committee itself and its remit are confirmed by the hospital: "this committee focuses its efforts on understanding the service needs of the Asian population… advise on cultural matters… plan and volunteer for the hospital\'s annual Asian Health fair" — https://web.archive.org/web/20190718123851/https://www.methodisthospital.org/Foundation/Partners-in-Health/Asian-Outreach.aspx',
    note:
      'The stronger of the two hospital claims, and the reason both are recorded. The committee demonstrably existed under the Methodist Hospital Foundation and its remit matches her record exactly, but its MEMBERSHIP WAS NEVER PUBLISHED in any year sampled — so unlike the board claim there is no roster to contradict her. A family memory of serving "the board" is well explained by a seat here. Note that both claims now name FOUNDATION bodies: the sibling fact was narrowed to the Foundation Board on 2026-08-20. That makes them coherent rather than competing — the same institution, one governing and one advisory — and it is entirely possible she held both, or that one memory is the other. 亞裔外展委員會 is this project\'s rendering of "Asian Outreach committee"; the hospital\'s Chinese pages do not name the committee, so it is not an attested term. The hospital\'s own Chinese name IS attested: 南加州美以美醫院, used throughout its Chinese-language site — NOT 衛理醫院, which is the obvious wrong guess.',
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
 * A fact mislabeled 'confirmed' in either file is then caught by
 * `every renderable fact cites a source`.
 */
export const renderableFacts: Fact[] = [...confirmedFacts, ...pendingFacts].filter(
  (f) => f.status !== 'unverified'
)

export const hasPendingFacts = pendingFacts.length > 0
