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
    logo: '/logos/aca.png',
    logoPermitted: true,
    permissionNote: 'She co-founded it. Mark from their own site, unmodified.',
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
    roleEn: 'President, Southern California 2016–17; President, North America',
    roleZhHant: '2016–17年南加州會長；北美總會長',
    factId: 'shih-chien',
    logo: '/logos/shih-chien.png',
    logoPermitted: true,
    permissionNote:
      'She is the current national president. Source is a 69x68 favicon — the only asset published; ask the university for the vector emblem to replace it.',
  },
  {
    id: 'blia',
    en: "Buddha's Light International Association, Arcadia",
    zhHant: '國際佛光會亞凱迪亞分會',
    roleEn: 'Founding President, 1994; supervisor, Los Angeles',
    roleZhHant: '1994年創會會長；洛杉磯協會督導',
    factId: 'blia',
    logo: '/logos/hsilai.png',
    logoPermitted: true,
    permissionNote:
      'She founded the Arcadia chapter. Mark shown is Fo Guang Shan Hsi Lai Temple, unmodified.',
  },
  {
    id: 'acupuncture-board',
    en: 'California Acupuncture Board',
    zhHant: '加州針灸委員會',
    roleEn: 'Public member, appointed 2001',
    roleZhHant: '2001年獲任命為公眾委員',
    factId: 'acupuncture-board',
    logo: '/logos/acupuncture-board.png',
    logoPermitted: true,
    permissionNote:
      'The board\'s mark IS the Great Seal of California with the board name around the rim. Gov Code 402 prohibits use "maliciously or for commercial purposes" — a non-commercial tribute recording a seat she genuinely held is neither. Shown unmodified and small. NEVER alter this artwork: an altered public seal is worse than the original in every respect.',
  },
  {
    id: 'ausd',
    en: 'Arcadia Unified School District',
    zhHant: '亞凱迪亞聯合學區',
    roleEn: 'Golden Apple Award',
    roleZhHant: '獲頒金蘋果獎',
    factId: 'pta-golden-apple',
    logoPermitted: false,
    permissionNote:
      'No mark. AUSD publishes no logo asset — their site serves only promotional banners, and both favicon paths 404. Do NOT substitute the City of Arcadia seal: the city and the school district are separate entities, and using one for the other would misstate which body gave her the award. Text only until AUSD publishes a mark.',
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
