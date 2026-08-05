// Institutions she founded, led or served, with the role she held.
//
// Set typographically rather than as a logo wall. Two reasons, and the design
// one is the stronger:
//
// 1. DESIGN. The available marks are a green-and-gold peacock, a green
//    university roundel, a black wordmark, a bilingual temple mark and a
//    blue-grey state seal — five palettes and aspect ratios from 69x68 to
//    398x720, none in conversation with this site's 印泥 red. Side by side they
//    read as a conference sponsor strip, not as a record of a life.
//
// 2. RIGHTS. `logoPermitted` gates every mark and defaults to false. Nothing
//    renders until written permission from the holder is on file — the same
//    pattern already protecting her media accounts.
//
// The California Acupuncture Board and City of Arcadia marks are deliberately
// absent from this file entirely. The Board's "logo" is the Great Seal of the
// State of California with the board name around the rim; Gov Code 402 makes
// unauthorised use a misdemeanour, and modifying an official seal compounds
// the problem rather than solving it. Do not add them.

export type Affiliation = {
  id: string
  en: string
  zhHant: string
  roleEn: string
  roleZhHant: string
  /** Backing fact in facts.ts. */
  factId: string
  /** Path under public/. Only meaningful once logoPermitted is true. */
  logo?: string
  /** Written permission from the mark holder. Defaults false; nothing renders without it. */
  logoPermitted: boolean
  /** Who to ask, and what standing she has to ask them. */
  permissionNote?: string
}

export const affiliations: Affiliation[] = [
  {
    id: 'aca',
    en: 'Arcadia Chinese Association',
    zhHant: '亞凱迪亞華人協會',
    roleEn: 'Co-founder, 1982',
    roleZhHant: '1982年共同創辦',
    factId: 'aca-founded',
    logoPermitted: false,
    permissionNote:
      'She co-founded it. Asset located: 229x49 PNG on their site. Ask the current board.',
  },
  {
    id: 'acs',
    en: 'Arcadia Chinese School',
    zhHant: '亞凱迪亞中文學校',
    roleEn: 'Founder and Principal, thirty years',
    roleZhHant: '創辦人暨校長，任職三十年',
    factId: 'chinese-school-founded',
    logoPermitted: false,
    permissionNote:
      'No mark found; the school is no longer operating and ownership of any mark is unclear.',
  },
  {
    id: 'cta',
    en: 'Chinese Teacher Association',
    zhHant: '中文教師學會',
    roleEn: 'President, two years',
    roleZhHant: '會長，任期兩年',
    factId: 'teachers-association',
    logoPermitted: false,
    permissionNote:
      'Exact registered name still unconfirmed; several similarly-named bodies exist in Southern California.',
  },
  {
    id: 'shih-chien',
    en: 'Shih Chien University Alumni Association',
    zhHant: '實踐大學校友會',
    roleEn: 'Chapter President, then National President',
    roleZhHant: '分會會長，其後全國總會會長',
    factId: 'shih-chien',
    logoPermitted: false,
    permissionNote:
      'She is the current national president — she may be the person who grants this. The only asset found is a 69x68 favicon; ask for the vector emblem.',
  },
  {
    id: 'blia',
    en: "Buddha's Light International Association, Arcadia",
    zhHant: '國際佛光會亞凱迪亞分會',
    roleEn: 'Founding President; supervisor, Greater Los Angeles',
    roleZhHant: '創會會長；大洛杉磯地區督導',
    factId: 'blia',
    logoPermitted: false,
    permissionNote:
      'She founded the chapter. Fo Guang Shan Hsi Lai Temple mark located: 300x55 PNG.',
  },
  {
    id: 'acupuncture-board',
    en: 'California Acupuncture Board',
    zhHant: '加州針灸委員會',
    roleEn: 'Public member, appointed 2001',
    roleZhHant: '2001年獲任命為公眾委員',
    factId: 'acupuncture-board',
    logoPermitted: false,
    permissionNote:
      'NO LOGO, EVER. The board\'s mark is the Great Seal of California. Gov Code 402. Text only.',
  },
  {
    id: 'ausd',
    en: 'Arcadia Unified School District',
    zhHant: '亞凱迪亞聯合學區',
    roleEn: 'Golden Apple Award',
    roleZhHant: '獲頒金蘋果獎',
    factId: 'pta-golden-apple',
    logoPermitted: false,
    permissionNote: 'Public agency mark. Text only.',
  },
]

/** Marks cleared for display. Empty until permission is on file. */
export const permittedLogos = affiliations.filter((a) => a.logoPermitted && a.logo)

/** Facts already told by the Institutions list.
 *
 * Without this the Service page says everything twice — "Appointed... to the
 * California Acupuncture Board, May 2001" as prose, then "California
 * Acupuncture Board / Public member, appointed 2001" as a row. The Institutions
 * list owns the organisational roles; the achievements list owns everything
 * that is not a membership. */
export const factsCoveredByAffiliations = new Set(
  affiliations.map((a) => a.factId)
)
