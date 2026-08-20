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
  /** A sentence of context under the image. `en`/`zhHant` stay the short label
   *  and the alt text; this is what a reader who does not recognise anyone in
   *  the photograph needs in order to understand what they are looking at.
   *
   *  NO DATES unless the artifact itself carries one. The family supplied
   *  these photographs on 2026-08-20 without dates, and a decade attribution
   *  inferred from clothing is a guess. Where a clipping prints its own date
   *  or an internal fact that fixes it, the caption says so and how. */
  caption?: { en: string; zhHant: string }
}

export const archive: ArchiveItem[] = [
  {
    id: 'arrival-1960s',
    kind: 'photo',
    decade: 1960,
    en: 'Arrival in the United States',
    zhHant: '初抵美國',
    asset: '/archive/parents-san-francisco.jpg',
    caption: {
      en: 'Min Mey Chang and Dr. Sheng Chang in San Francisco, in their first years in the United States. The family gave no date.',
      zhHant:
        '張馬敏妹與張勝雄醫師攝於舊金山，時值兩人來美最初幾年。家屬未提供確切日期。',
    },
  },
  {
    id: 'family-footbridge',
    kind: 'photo',
    decade: 1970,
    en: 'With their first son',
    zhHant: '與長子',
    asset: '/archive/family-footbridge.jpg',
    caption: {
      en: 'On a footbridge with their eldest son, James, as an infant. Undated.',
      zhHant: '兩人抱著襁褓中的長子詹姆斯，攝於一座木橋上。無註明日期。',
    },
  },
  {
    id: 'crab-fishing',
    kind: 'photo',
    decade: 1970,
    en: 'Crab fishing',
    zhHant: '捕蟹',
    asset: '/archive/crab-fishing.jpg',
    caption: {
      en: 'Crab fishing, with a landing net between them. Undated; the family titled the photograph.',
      zhHant: '兩人一同捕蟹，手中提著撈網。無註明日期，標題為家屬所擬。',
    },
  },
  {
    id: 'couple-pavilion',
    kind: 'photo',
    decade: 1970,
    en: 'At a pavilion',
    zhHant: '涼亭前合影',
    asset: '/archive/couple-pavilion.jpg',
    caption: {
      en: 'On a boardwalk beside a pavilion. Undated.',
      zhHant: '兩人於涼亭旁的木棧道上合影。無註明日期。',
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
    id: 'community-service-center',
    kind: 'document',
    decade: 1990,
    en: 'Arcadia Community Service Center opening',
    zhHant: '亞凱迪亞社區服務中心開幕',
    asset: '/archive/community-service-center-clipping.jpg',
    caption: {
      en: 'A newspaper report on the opening of the Arcadia Community Service Center, formed by the Chinese school with a San Gabriel Valley family counseling service. Representatives of Congressman David Dreier and Assemblymember Bob Margett, with two Arcadia council members, presented commendations. The clipping is undated; Margett sat in the Assembly from 1995 to 2000, which places it in that span. It headlines her 張馬盈宇 — see the note on her name.',
      zhHant:
        '報導亞凱迪亞社區服務中心開幕：該中心由中文學校與聖蓋博谷一家庭輔導服務社合辦。聯邦眾議員大衛・德萊爾與加州眾議員巴伯・馬格的代表，偕兩位亞市市議員頒贈表揚狀。剪報未載日期；馬格於1995至2000年間任加州眾議員，可據以推定年代。標題稱她為「張馬盈宇」，另見姓名說明。',
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
    id: 'world-journal-commendation',
    kind: 'document',
    decade: 2000,
    en: 'Chinese Daily News commendation, 2003',
    zhHant: '世界日報表揚，2003年',
    asset: '/archive/world-journal-commendation-2003.jpg',
    caption: {
      en: 'A commendation from the Los Angeles office of Chinese Daily News (世界日報) to the groups that performed on the Chinese stage at the 2003 Children\'s Expo. The Arcadia Chinese School is named first. The certificate carries its own year.',
      zhHant:
        '世界日報洛杉磯社致贈之敬謝狀，表揚參與2003年兒童博覽會中國舞台演出的各單位，亞凱迪亞中文學校列於首位。年份載於獎狀本身。',
    },
  },
  {
    id: 'school-profile',
    kind: 'document',
    decade: 2000,
    en: 'A profile of the school',
    zhHant: '中文學校簡介',
    asset: '/archive/school-profile-clipping.jpg',
    caption: {
      en: 'A newspaper profile of the Arcadia Chinese School describing its daily and after-school classes across three campuses, its Saturday classes, and a summer program teaching Chinese, English, Spanish and mathematics alongside kung fu, dance, handicrafts and diabolo, with teachers invited from Taiwan. The clipping is undated but says the school was in its twenty-sixth year, which places it around 2008. It names her 張馬盈宇 — see the note on her name.',
      zhHant:
        '報紙刊載的亞凱迪亞中文學校簡介，記述該校於三處校區開設的每日班與課後班、週六班，以及暑期班——除中文、英文、西班牙文與數學外，另設功夫、舞蹈、手工藝等才藝課，並自臺灣聘請教師教授扯鈴。剪報未載日期，惟文中稱該校已創辦二十六年，可推定約為2008年。文中稱她為「張馬盈宇」，另見姓名說明。',
    },
  },
  {
    id: 'family-five',
    kind: 'photo',
    decade: 2010,
    en: 'With their three sons',
    zhHant: '與三個兒子',
    asset: '/archive/family-five.jpg',
    caption: {
      en: 'Min Mey Chang and Dr. Sheng Chang with their three sons — James, Peter and Richard — on a glacier cruise. Undated.',
      zhHant:
        '張馬敏妹與張勝雄醫師偕三子詹姆斯、彼得、理查，攝於冰河遊輪上。無註明日期。',
    },
  },
  {
    id: 'calligraphy',
    kind: 'photo',
    decade: 2020,
    en: 'Writing at a Lunar New Year event',
    zhHant: '農曆新年揮毫',
    asset: '/archive/calligraphy-lunar-new-year.jpg',
    caption: {
      en: 'Holding up 福 — good fortune — written in gold on red, at an outdoor Lunar New Year event, with 愛 and 馬到成功 beside it. Undated.',
      zhHant:
        '手持親書「福」字，金墨紅箋，攝於戶外農曆新年活動；旁另有「愛」與「馬到成功」。無註明日期。',
    },
  },
  {
    id: 'calligraphy-exhibition',
    kind: 'photo',
    decade: 2020,
    en: 'A calligraphy and painting exhibition',
    zhHant: '書畫花藝聯展',
    asset: '/archive/calligraphy-exhibition.jpg',
    caption: {
      en: 'At a joint exhibition of calligraphy, painting and floral art held for an alumni association Parents\' Day, with framed work behind. Undated.',
      zhHant:
        '攝於大專校友雙親節書畫花藝聯展會場，身後為展出之裱框作品。無註明日期。',
    },
  },
  {
    id: 'chang-couple-recent',
    kind: 'photo',
    decade: 2020,
    en: 'Min Mey Chang and Dr. Sheng Chang',
    zhHant: '張馬敏妹與張勝雄醫師',
    asset: '/archive/min-mey-and-sheng-chang.jpg',
    caption: {
      en: 'Together at an evening event. Undated.',
      zhHant: '兩人攝於一場晚間活動。無註明日期。',
    },
  },
]

export const archiveDecades = [...new Set(archive.map((i) => i.decade))].sort(
  (a, b) => a - b
)

export const suppliedItems = archive.filter((i) => i.asset)
export const placeholderItems = archive.filter((i) => !i.asset)
