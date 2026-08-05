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
    id: 'acupuncture-board',
    year: 2001,
    en: 'Appointed a public member of the California Acupuncture Board by the Speaker of the State Assembly.',
    zhHant: '經加州眾議會議長任命為加州針灸委員會公眾委員。',
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
