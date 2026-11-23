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
    // Was '2016'; the article itself is dated 2023-04-02 (checked 2026-11-23).
    date: '2023-04-02',
    en: 'On meeting the abbot of Fo Guang Shan. Records her as founding president of the BLIA Arcadia chapter and former principal of the Arcadia Chinese School — and refers to her husband as a former mayor of Arcadia.',
    zhHant:
      '記述與佛光山住持會面。文中載明她為國際佛光會亞市分會創會會長、曾任亞凱迪亞中文學校校長，並稱夫婿為亞市前市長。',
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
    id: 'singtao-historymakers-2026',
    url: 'https://www.singtaousa.com/2026/09/12/news/usa/chinese-american-museum-honors/',
    outlet: '星島日報 Sing Tao Daily',
    title: '華美博物館「歷史締造者」 五傑出人士獲殊榮',
    date: '2026-09-12',
    en: 'Announces the Chinese American Museum\'s 2026 Historymakers honorees, naming her and Dr. Chang as joint recipients of the Dr. Dan S. Louie Jr. Lifetime Achievement Award, and her as founder of the Arcadia Chinese School.',
    zhHant:
      '報導華美博物館2026年歷史締造者得獎名單，載明她與張勝雄醫師共同獲頒呂國芳博士終身成就獎，並記述她創辦亞凱迪亞中文學校。',
    corroborates: 'historymakers-lifetime-achievement',
  },
  {
    id: 'worldjournal-historymakers-2026',
    url: 'https://www.worldjournal.com/wj/story/121359/9757656',
    outlet: '世界日報 World Journal',
    title: '行醫從政、服務社區、推廣辣油... 6組華人締造歷史 華博表揚',
    date: '2026-09-16',
    en: 'Coverage of the honorees\' press conference. She was traveling and missed it; Dr. Chang told reporters she had done more than he had and deserved the award more.',
    zhHant:
      '報導得獎者記者會。她因旅行未能出席，張勝雄醫師笑言「她做得比我更多，更配得這個獎」。',
    corroborates: 'historymakers-lifetime-achievement',
  },
  // Found by a web search on 2026-11-23 (her names in English and Chinese),
  // each page fetched and checked to name her. Descriptions say only what the
  // page says. None of these added a fact to facts.ts; where a page goes
  // beyond or against the family's account, it has no `corroborates`.
  {
    id: 'annnews-historymakers-2026',
    url: 'https://www.annnewsnet.com/華美博物館舉辦第-30-屆頒獎典禮-致敬2026年度歷史締造/',
    outlet: 'ANN NEWS 華聞在線',
    title: '華美博物館舉辦第 30 屆頒獎典禮 致敬2026年度歷史締造者',
    date: '2026-09-29',
    en: 'Report on the gala itself, naming her and Dr. Chang as joint recipients of the Dr. Dan S. Louie Jr. Lifetime Achievement Award, and her as the founding principal of the Arcadia Chinese School.',
    zhHant:
      '報導頒獎典禮當晚實況，載明她與張勝雄醫師共同獲頒呂國芳博士終身成就獎，並稱她為亞凱迪亞中文學校創校校長。',
    corroborates: 'historymakers-lifetime-achievement',
  },
  {
    id: 'chinesedaily-historymakers-2026',
    url: 'https://www.chinesedaily.com/article/detail-704582.html',
    outlet: '華人今日網 Chinese Daily News',
    title: '華美博物館公布「歷史締造者」名單',
    date: '2026-09-10',
    en: 'Announces the 2026 Historymakers honorees, naming her and Dr. Chang as joint recipients of the lifetime achievement award, and her as founder of the Arcadia Chinese School.',
    zhHant:
      '報導華美博物館公布2026年歷史締造者得獎名單，載明她與張勝雄醫師共同獲頒呂國芳博士終身成就獎，並記述她創辦亞凱迪亞中文學校。',
    corroborates: 'historymakers-lifetime-achievement',
  },
  {
    id: 'shih-chien-alumni-office',
    url: 'https://career.usc.edu.tw/p/412-1064-345.php?Lang=zh-tw',
    outlet: '實踐大學 Shih Chien University',
    title: '校友會簡介',
    // The page carries no date; this is the year it was found listing her.
    date: '2026',
    en: 'The university\'s own alumni office directory, listing her as president of the North America alumni association.',
    zhHant: '實踐大學校友服務單位的校友會名錄，列她為北美校友總會會長。',
    corroborates: 'shih-chien',
  },
  {
    // Roster in the PDF's own columns: 84-85 副會長 and 財務; 85-86 會長.
    // Years are Western (the roll runs to 13-14). facts.ts says president in
    // 1986 for two years: not changed on the strength of this, see STATUS.md.
    id: 'scccs-board-roster',
    url: 'https://s3.amazonaws.com/scccs.net/Intro/38th/Board_List_38th.pdf',
    outlet: '南加州中文學校聯合會 Southern California Council of Chinese Schools',
    title: '南加州中文學校聯合會歷屆理事會目錄',
    // PDF created 2014-08-27.
    date: '2014',
    en: 'The council\'s own roll of past boards, listing her as vice president and treasurer for 1984–85 and as president for 1985–86.',
    zhHant: '該聯合會歷屆理事會名錄，載明她於1984至1985年度任副會長兼財務，1985至1986年度任會長。',
  },
  {
    // The yearbook's own 1982 founding date, crediting Dr. Chang alone, is on
    // another page; this essay is the one that names her.
    id: 'aca-yearbook-2022',
    url: 'https://arcadiachineseassociation.org/wp-content/uploads/2022/10/ACA_2022_final_LR.pdf#page=28',
    outlet: '亞凱迪亞華人協會 Arcadia Chinese Association',
    title: '華協 - 從故到今 ACA Now and Then',
    date: '2022',
    en: 'A former president\'s history of the association, reprinted in its 40th-anniversary yearbook. It says the association grew out of Chinese film evenings that Dr. Chang and she began at Baldwin Stocker School around 1984.',
    zhHant:
      '歷屆會長撰文，收錄於該會四十週年紀念特刊。文中記述華協約於1984年起源於張勝雄醫師與她在 Baldwin Stocker 小學舉辦的中國影片放映聚會。',
  },
  {
    id: 'cal-heritage-profile',
    url: 'https://webapp.cal.org/Heritage/ProfileDetails.aspx?id=312',
    outlet: 'Center for Applied Linguistics',
    title: 'Heritage Languages in America: Arcadia Chinese School',
    // Undated; the page footer reads © 2013. It gives the founding as 1981,
    // against the family's 1982, so it is not cited as a source for that fact.
    date: '2013',
    en: 'A national directory of heritage-language schools, listing her as principal of the Arcadia Chinese School.',
    zhHant: '美國應用語言學中心（Center for Applied Linguistics）的傳承語言學校名錄，列她為亞凱迪亞中文學校校長。',
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
