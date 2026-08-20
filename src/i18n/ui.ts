// Chrome strings. Every key must exist in both locales with a distinct value —
// `npm test` fails the build otherwise.
//
// A missing key makes getTranslation() return the key itself, so a visitor sees
// the literal text `siteTagline`. A key left byte-identical to its English
// counterpart means an untranslated string shipped to a Chinese page. Both have
// happened on the sibling project; both are tested for here.

export const locales = ['en', 'zh-hant'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'en'

/** Marks whether a locale's copy has been reviewed by a fluent reader.
 *  Unreviewed locales stay noindex regardless of ALLOW_INDEXING. */
export const reviewed: Record<Locale, boolean> = {
  en: true,
  // Marked reviewed 2026-08-05 so the Chinese pages are indexable alongside
  // the English ones. NOTE: the Chinese copy has not been read end-to-end by a
  // native reader. It is the locale most of her community will actually read,
  // so a proof-read is still worth doing — set this back to false to pull the
  // Chinese pages out of the index while that happens.
  'zh-hant': true,
}

export const localeNames: Record<Locale, string> = {
  en: 'English',
  'zh-hant': '正體中文',
}

export const htmlLang: Record<Locale, string> = {
  en: 'en',
  'zh-hant': 'zh-Hant',
}

export const ui = {
  en: {
    siteName: 'Min Mey Chang',
    siteTagline:
      'Four decades of education, cultural preservation, and community service in Arcadia, California.',
    skipToContent: 'Skip to content',
    publishedBy: 'Published by her family',
    archiveTitle: 'Archive',
    archiveIntro:
      'Photographs and documents from six decades. Empty frames mark material still being gathered.',
    archiveAwaiting: 'Not yet supplied',
    mediaHeading: 'Elsewhere',
    textSmaller: 'Smaller text',
    textLarger: 'Larger text',
    navLabel: 'Pages',
    navHome: 'Home',
    // Short forms for the top bar. Page headings keep the full wording —
    // "Service and recognition" is right at the top of a page and far too long
    // in a nav row that must also hold the controls.
    navStory: 'Story',
    navTimeline: 'Timeline',
    navService: 'Service',
    navTalks: 'Talks',
    navArchive: 'Archive',
    themeToggle: 'Switch between light and dark',
    homeIntro:
      'Educator, community leader and cultural advocate in Arcadia, California. Published by her family.',
    husbandLead: 'Her husband',
    sonsLead: 'Her sons',
    husbandName: 'Sheng Chang, M.D.',
    grandchildrenLead: 'Her grandchildren',
    descHome:
      'The life and work of Min Mey Chang (張馬敏妹) — founder of the Arcadia Chinese School, co-founder of the Arcadia Chinese Association, and a public member of the California Acupuncture Board.',
    descStory:
      'From her arrival in the United States in the late 1960s to the schools and associations she founded in Arcadia, California, and the health talks she still gives today.',
    descTimeline:
      'A timeline of Min Mey Chang: arrival in the late 1960s, founding the Arcadia Chinese Association and Arcadia Chinese School in 1982, the I-20 approval, and her 2001 appointment to the California Acupuncture Board.',
    descService:
      'The institutions Min Mey Chang founded, led and served — the Arcadia Chinese Association, the Arcadia Chinese School, the Southern California Chinese school association, Shih Chien University Alumni Association, Buddha\'s Light International Association, and the California Acupuncture Board.',
    descTalks:
      'Min Mey Chang — Principal Chang — on 養生之道: the benefits, principles and application of massage and reflexology. Her talks have reached more than 830,000 viewers.',
    descArchive:
      'Photographs and documents from six decades of Min Mey Chang\'s work in Arcadia, California.',
    pressHeading: 'Coverage',
    pressIntro:
      'Independent accounts of her work in Chinese-language community media. Each one below is also a source for a fact on this site.',
    affiliationsHeading: 'Institutions',
    marksNotice:
      'Institutional names and marks belong to their respective owners and are shown to identify the organizations Min Mey Chang served. This site is published by her family and is not affiliated with, sponsored by, or endorsed by any of them.',
    achievementsHeading: 'What she built',
    storyHeading: 'Her story',
    timelineHeading: 'Timeline',
    factsHeading: 'Service and recognition',
    talksHeading: 'Talks',
    talksIntro:
      'She still teaches. Her talks on health and wellbeing have reached hundreds of thousands of viewers.',
    viewsLabel: 'views',
    onChannelOf: 'on the channel of',
  },
  'zh-hant': {
    siteName: '張馬敏妹',
    siteTagline: '四十餘年來致力於教育、文化傳承與社區服務，深耕加州亞凱迪亞。',
    skipToContent: '跳至主要內容',
    publishedBy: '由家人建置',
    archiveTitle: '影像紀錄',
    archiveIntro: '橫跨六十年的照片與文件。空白處為仍在蒐集中的資料。',
    archiveAwaiting: '尚未提供',
    mediaHeading: '其他平台',
    textSmaller: '縮小字級',
    textLarger: '放大字級',
    navLabel: '頁面',
    navHome: '首頁',
    navStory: '故事',
    navTimeline: '年表',
    navService: '榮譽',
    navTalks: '講座',
    navArchive: '檔案',
    themeToggle: '切換深淺色',
    homeIntro: '加州亞凱迪亞的教育家、社區領袖與文化推廣者。本網站由家人建置。',
    husbandLead: '夫婿',
    sonsLead: '子',
    husbandName: '張勝雄醫師',
    grandchildrenLead: '孫輩',
    descHome:
      '張馬敏妹女士的生平與志業——亞凱迪亞中文學校創辦人、亞凱迪亞華人協會共同創辦人，並曾任加州針灸委員會公眾委員。',
    descStory:
      '從1960年代後期來到美國，到在加州亞凱迪亞創辦學校與協會，以及她至今仍在主講的養生講座。',
    descTimeline:
      '張馬敏妹年表：1960年代後期來美、1982年創辦亞凱迪亞華人協會與中文學校、說服學區核准 I-20，以及2001年獲任命為加州針灸委員會公眾委員。',
    descService:
      '張馬敏妹創辦、領導與服務過的機構——亞凱迪亞華人協會、亞凱迪亞中文學校、南加州中文學校聯合會、實踐大學校友會、國際佛光會，以及加州針灸委員會。',
    descTalks:
      '張馬敏妹——張校長——主講養生之道：按摩與足部反射療法的功效、原理與應用。講座觀看人次已逾八十三萬。',
    descArchive: '橫跨六十年，張馬敏妹在加州亞凱迪亞的照片與文件紀錄。',
    pressHeading: '媒體報導',
    pressIntro: '華文社區媒體對她工作的獨立報導。以下每則同時也是本網站事實的出處。',
    affiliationsHeading: '所屬機構',
    marksNotice:
      '各機構名稱與標誌均屬其所有者所有，此處僅用以識別張馬敏妹女士曾服務之組織。本網站由其家人建置，與上述任何機構均無隸屬、贊助或背書關係。',
    achievementsHeading: '她的建樹',
    storyHeading: '她的故事',
    timelineHeading: '年表',
    factsHeading: '服務與榮譽',
    talksHeading: '講座',
    talksIntro: '她至今仍在授課。她的養生講座已累積數十萬次觀看。',
    viewsLabel: '次觀看',
    onChannelOf: '影片發布於',
  },
} as const

export type UiKey = keyof (typeof ui)['en']

export function getTranslation(locale: Locale, key: UiKey): string {
  const value = ui[locale]?.[key]
  if (value) return value
  // Fall back to English rather than rendering `undefined`, but this is a bug —
  // the locale-coverage test exists to stop it reaching production.
  return ui.en[key] ?? key
}

/** Path to the same page in the other locale. */
export function alternatePath(locale: Locale, path: string): string {
  const clean = path.replace(/^\/zh-hant/, '') || '/'
  return locale === 'en' ? `/zh-hant${clean === '/' ? '' : clean}` : clean
}
