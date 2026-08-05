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
  'zh-hant': false,
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
    holdingNotice: 'A site in her honour, published by her family. In progress.',
    skipToContent: 'Skip to content',
    switchLanguage: 'Switch language',
    publishedBy: 'Published by her family',
    archiveTitle: 'Archive',
    archiveIntro:
      'Photographs and documents from six decades. Empty frames mark material still being gathered.',
    archiveAwaiting: 'Not yet supplied',
    mediaHeading: 'Elsewhere',
    backToStory: 'Back to her story',
    storyHeading: 'Her story',
    timelineHeading: 'Timeline',
    factsHeading: 'Service and recognition',
    talksHeading: 'Talks',
    talksIntro:
      'She still teaches. Her talks on health and wellbeing have reached hundreds of thousands of viewers.',
    viewsLabel: 'views',
    onChannelOf: 'on the channel of',
    allTalks: 'All talks',
  },
  'zh-hant': {
    siteName: '張馬敏妹',
    siteTagline: '四十餘年來致力於教育、文化傳承與社區服務，深耕加州亞凱迪亞。',
    holdingNotice: '本網站由家人建置，記錄她的貢獻。建置中。',
    skipToContent: '跳至主要內容',
    switchLanguage: '切換語言',
    publishedBy: '由家人建置',
    archiveTitle: '影像檔案',
    archiveIntro: '橫跨六十年的照片與文件。空白處為仍在蒐集中的資料。',
    archiveAwaiting: '尚未提供',
    mediaHeading: '其他平台',
    backToStory: '返回她的故事',
    storyHeading: '她的故事',
    timelineHeading: '年表',
    factsHeading: '服務與榮譽',
    talksHeading: '講座',
    talksIntro: '她至今仍在傳授。她的養生講座已累積數十萬次觀看。',
    viewsLabel: '次觀看',
    onChannelOf: '影片發布於',
    allTalks: '全部講座',
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
