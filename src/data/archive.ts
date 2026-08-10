// The photo and document archive.
//
// Entries may exist WITHOUT an asset. An entry whose `asset` is undefined
// renders as a labeled placeholder tile, so the archive's shape is visible and
// reviewable before any scanning or exporting has happened. This is deliberate:
// it lets her and the family see what is being asked for, and point at gaps.
//
// BEFORE adding an `asset`, both gates in the spec must be cleared:
//   1. EXIF — phone photographs carry GPS coordinates. Verify the built output,
//      do not trust the image pipeline's defaults.
//   2. Documents — award certificates and the 2001 appointment letter carry a
//      home address, a phone number and a handwritten signature. Crop or redact
//      signatures and addresses BEFORE the file enters public/.
//
// Originals live in src-photos/ and src-documents/, both gitignored. This repo
// is public. Only derived, reviewed, web-sized assets are committed.

export type ArchiveKind = 'photo' | 'document'

export type ArchiveItem = {
  id: string
  kind: ArchiveKind
  /** Decade bucket for grouping, e.g. 1980. */
  decade: number
  en: string
  zhHant: string
  /** Path under public/. Undefined means "not yet supplied" — renders as a placeholder. */
  asset?: string
  /** What is needed to fill this in. Shown only in the placeholder state. */
  needs?: { en: string; zhHant: string }
}

export const archive: ArchiveItem[] = [
  {
    id: 'arrival-1960s',
    kind: 'photo',
    decade: 1960,
    en: 'Arrival in the United States',
    zhHant: '初抵美國',
    needs: {
      en: 'Any photograph from their first years in the US.',
      zhHant: '來美最初幾年的任何照片。',
    },
  },
  {
    id: 'school-founding',
    kind: 'photo',
    decade: 1980,
    en: 'The Chinese school she founded',
    zhHant: '她創辦的中文學校',
    needs: {
      en: 'Classroom, ceremony or staff photographs from the school years.',
      zhHant: '學校時期的教室、典禮或教職員合影。',
    },
  },
  {
    id: 'arcadia-beautiful-1982',
    kind: 'document',
    decade: 1980,
    en: 'Arcadia Beautiful Award — the Anita Baldwin Award, 1982',
    zhHant: '亞凱迪亞美化獎——安妮塔・鮑德溫獎，1982年',
    asset: '/archive/arcadia-beautiful-1982.jpg',
  },
  {
    id: 'arcadia-beautiful-1984',
    kind: 'document',
    decade: 1980,
    en: "Arcadia Beautiful Award — the Mayor's Award, 1984",
    zhHant: '亞凱迪亞美化獎——市長獎，1984年',
    asset: '/archive/arcadia-beautiful-1984.jpg',
  },
  {
    id: 'school-programs',
    kind: 'document',
    decade: 1980,
    en: 'School programs and yearbooks',
    zhHant: '學校刊物與年刊',
    needs: {
      en: 'Scans of programs, yearbooks or graduation booklets.',
      zhHant: '節目單、年刊或畢業紀念冊掃描件。',
    },
  },
  {
    id: 'delegations',
    kind: 'photo',
    decade: 1990,
    en: 'Educational delegations to Taiwan and China',
    zhHant: '台灣及中國教育參訪',
    needs: {
      en: 'Group photographs from the three visits, if any survive.',
      zhHant: '三次參訪的合影（如仍留存）。',
    },
  },
  {
    id: 'appointment-letter',
    kind: 'document',
    decade: 2000,
    en: 'California Acupuncture Board appointment, May 2001',
    zhHant: '2001年5月加州針灸委員會任命',
    needs: {
      en: 'Scan of the appointment letter. REDACT the home address and signature before this file enters public/.',
      zhHant: '任命函掃描件。存入 public/ 前務必遮蔽住址與簽名。',
    },
  },
  {
    id: 'golden-apple-certificate',
    kind: 'document',
    decade: 2000,
    en: 'Golden Apple Award certificate',
    zhHant: '金蘋果獎獎狀',
    needs: {
      en: 'Scan of the certificate. Also confirms the year, which no public record gives.',
      zhHant: '獎狀掃描件，並可確認公開紀錄未載明的年份。',
    },
  },
  {
    id: 'calligraphy',
    kind: 'photo',
    decade: 2010,
    en: 'Chinese calligraphy',
    zhHant: '書法',
    needs: {
      en: 'Photographs of her calligraphy, and of her writing at Lunar New Year events. The most visually distinctive thing in her story.',
      zhHant: '她的書法作品照片，以及農曆新年活動揮毫的照片。這是她故事中最具視覺特色的部分。',
    },
  },
]

export const archiveDecades = [...new Set(archive.map((i) => i.decade))].sort(
  (a, b) => a - b
)

export const suppliedItems = archive.filter((i) => i.asset)
export const placeholderItems = archive.filter((i) => !i.asset)
