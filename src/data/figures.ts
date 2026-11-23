// Numbers from her record, set large enough to carry visual weight on a page
// that is otherwise entirely prose.
//
// Every figure must trace to a renderable fact — a number is a factual claim
// with the citation stripped off, which makes it exactly the kind of thing that
// drifts from its source. tests/data/figures.test.ts enforces the link.
//
// Chinese gets its own value string, not a translated label around a Western
// numeral: 830,000 is 八十三萬 in Chinese counting, grouped by 萬 (10,000) rather
// than by thousands. Rendering "830,000" on a Chinese page is the numeric
// equivalent of leaving an English string in place.

export type Figure = {
  id: string
  /** Display value, English pages. */
  value: string
  /** Display value, Chinese pages. */
  valueZhHant: string
  /** Label beneath the value. */
  en: string
  zhHant: string
  /** id of the backing fact in facts.ts. */
  factId: string
}

export const figures: Figure[] = [
  {
    id: 'founded',
    // Was "1982 — two institutions founded, in one year" until the school's
    // founding moved to 1981 (James, 2026-11-23).
    value: '1981',
    valueZhHant: '1981',
    en: 'Founded the Arcadia Chinese School',
    zhHant: '創辦亞凱迪亞中文學校',
    factId: 'chinese-school-founded',
  },
  {
    id: 'principal',
    value: '30+',
    valueZhHant: '三十餘',
    en: 'Years as principal',
    zhHant: '年擔任校長',
    factId: 'chinese-school-founded',
  },
  {
    id: 'students',
    value: 'Thousands',
    valueZhHant: '數千',
    en: 'Students taught',
    zhHant: '名學生受教',
    factId: 'students-taught',
  },
  {
    id: 'delegations',
    value: 'Three',
    valueZhHant: '三',
    en: 'Delegations led to Taiwan, Hong Kong and China',
    zhHant: '度率團赴台灣、香港與中國參訪',
    factId: 'ausd-delegations',
  },
  {
    id: 'views',
    value: '830,000',
    valueZhHant: '八十三萬',
    en: 'Views of her talks on 養生之道',
    zhHant: '養生講座觀看人次',
    factId: 'reflexology',
  },
]
