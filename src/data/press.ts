// Independent coverage of her, in Chinese-language community media.
//
// These matter more than their view counts suggest. Every one was supplied by
// the family, because SHE IS EFFECTIVELY INVISIBLE TO GENERAL WEB SEARCH: a
// search for 張馬敏妹 returns Hong Kong actresses named 張敏, and a search for
// "Minmey Chang" returns nothing relevant. The pages below exist, are public,
// and are substantial — the search engines simply do not surface them.
//
// That is the argument for this site in one line. It will likely become her
// primary findable record, and these are the sources that let it be sourced
// rather than merely asserted.
//
// Links only, never embeds. An article is a link; a Facebook video embed would
// cost several hundred KB of Meta JavaScript on a site that ships none.

export type PressItem = {
  id: string
  url: string
  /** Publication, in its own language. */
  outlet: string
  /** Headline as published. Not translated — that is what you would search for. */
  title: string
  /** ISO date of publication, or the year where only that is known. */
  date: string
  en: string
  zhHant: string
  /** Which fact in facts.ts this corroborates, if any. */
  corroborates?: string
}

export const press: PressItem[] = [
  {
    id: 'lnanews-hsing-yun',
    url: 'https://www.lnanews.com/news/150416',
    outlet: '人間通訊社 Merit Times',
    title: '洛杉磯亞市前市長張勝雄　感念大師特來致意',
    date: '2016',
    en: 'On meeting the abbot of Fo Guang Shan. Records her as founding president of the BLIA Arcadia chapter and former principal of the Arcadia Chinese School — and her husband as Mayor of Arcadia for two terms.',
    zhHant:
      '記述與佛光山住持會面。文中載明她為國際佛光會亞市分會創會會長、曾任亞凱迪亞中文學校校長，並記錄夫婿曾任亞市市長兩任八年。',
    corroborates: 'blia',
  },
  {
    id: 'taiwanese-american-archives',
    url: 'https://taiwaneseamericanhistory.org/shih-chien-university-alumni-association-of-southern-california/',
    outlet: '台美史料中心 Taiwanese American Archives',
    title: 'Shih Chien University Alumni Association of Southern California 實踐大學南加州校友會',
    date: '2017',
    en: 'The association\'s own roll of presidents, listing her for 2016–17.',
    zhHant: '該校友會歷任會長名錄，載明她於2016至2017年任會長。',
    corroborates: 'shih-chien',
  },
  {
    id: 'epochtimes-2024',
    url: 'https://sf.epochtimes.com/2024/07/03/30561.html',
    outlet: '大紀元 Epoch Times',
    title: '北加州實踐校友會 舉辦2024年會暨會長交接儀式',
    date: '2024-07-03',
    en: 'Coverage of the Northern California chapter handover, naming her as President of the North America association.',
    zhHant: '報導北加州校友會年會暨會長交接，文中稱她為北美總會長。',
    corroborates: 'shih-chien',
  },
  {
    id: 'blia-2024',
    url: 'https://la.blia.org/2024/09/22/092224/',
    outlet: '國際佛光會洛杉磯協會 BLIA Los Angeles',
    title: '亞市分會2025-2026會長改選及慶生會',
    date: '2024-09-22',
    en: 'Records the Arcadia chapter as founded in 1994 at a ceremony led by Venerable Master Hsing Yun, names her as its founding president and supervisor, and notes the 2024 election was held at their home.',
    zhHant:
      '記載亞市分會於1994年由星雲大師親臨主持成立，稱她為創會會長暨督導，並記錄2024年改選假其府上舉行。',
    corroborates: 'blia',
  },
  {
    id: 'fb-2016',
    url: 'https://www.facebook.com/1188554056/videos/10209164529568856/',
    outlet: 'Facebook — Arcadia Chinese School Alumni',
    title: 'Arcadia Chinese School Alumni',
    date: '2016-09-12',
    en: 'A video posted to the school\'s alumni group.',
    zhHant: '發布於中文學校校友社團的影片。',
  },
]
