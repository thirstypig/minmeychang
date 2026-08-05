// Dated events, ordered oldest first.
//
// `year` is always a number so sorting works. When the real date is imprecise,
// `yearDisplay` overrides what the visitor sees — her arrival is known only as
// "the late 1960s", and rendering a false precision like "1968" would be
// exactly the kind of invented fact this project forbids. A test asserts the
// sort key never reaches the page.
//
// Every entry must correspond to a renderable fact. Adding an event here for
// an unverified claim would bypass the provenance gate; the test in
// tests/data/timeline.test.ts fails if you do.

export type TimelineEvent = {
  id: string
  year: number
  yearDisplay?: { en: string; zhHant: string }
  en: string
  zhHant: string
  /** id of the backing fact in facts.ts */
  factId?: string
}

export const timeline: TimelineEvent[] = [
  {
    id: 'arrival',
    year: 1968,
    yearDisplay: { en: 'Late 1960s', zhHant: '1960年代後期' },
    en: 'Came to the United States with her husband, Dr. Sheng Chang.',
    zhHant: '與夫婿張勝雄醫師一同來到美國。',
    factId: 'immigration-arrival',
  },
  {
    id: 'aca-founded',
    year: 1982,
    en: 'Co-founds the Arcadia Chinese Association with Dr. Sheng Chang.',
    zhHant: '與張勝雄醫師共同創辦亞凱迪亞華人協會。',
    factId: 'aca-founded',
  },
  {
    id: 'school-founded',
    year: 1982,
    en: 'Founds the Arcadia Chinese School, and becomes its principal for the next thirty years.',
    zhHant: '創辦亞凱迪亞中文學校，並於其後三十年擔任校長。',
    factId: 'chinese-school-founded',
  },
  {
    id: 'i20',
    // 1985 is a mid-decade sort key, deliberately not 1980 — "1980s" must not
    // contain the raw year, or the placeholder becomes indistinguishable from
    // a real date if the display value is ever dropped.
    year: 1985,
    yearDisplay: { en: '1980s', zhHant: '1980年代' },
    en: 'Persuades the school district to approve I-20 forms, letting students remain in the United States to continue their studies.',
    zhHant: '說服學區核准 I-20 入學許可，使學生得以留在美國繼續就學。',
    factId: 'i20',
  },
  {
    id: 'acupuncture-board',
    year: 2001,
    en: 'Appointed a public member of the California Acupuncture Board by the Speaker of the State Assembly.',
    zhHant: '經加州眾議院議長任命為加州針灸委員會公眾委員。',
    factId: 'acupuncture-board',
  },
  {
    id: 'health-talk',
    year: 2023,
    en: 'Her lecture on 養生之道 — the way of nurturing life — reaches an audience of over 800,000.',
    zhHant: '「傳授養生之道」講座觀看次數突破八十萬。',
  },
]

export const timelineByYear = [...timeline].sort((a, b) => a.year - b.year)
