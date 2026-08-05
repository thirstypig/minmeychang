// Her public accounts.
//
// LINKS ONLY — deliberately not embeds. A YouTube iframe adds roughly a
// megabyte of third-party JavaScript and reports every visitor to Google;
// Instagram's is heavier still and increasingly demands a login. This site
// currently ships zero JavaScript, and that is worth keeping. If embeds are
// wanted later, use a click-to-load facade against youtube-nocookie.com rather
// than a bare iframe.
//
// Nothing here is scraped or re-hosted. She owns this material; the proper
// route to the originals is her own export (YouTube Studio, and Instagram →
// Settings → Your activity → Download your information), which preserves full
// resolution and timestamps.

export type MediaAccount = {
  id: string
  url: string
  en: string
  zhHant: string
  /** false until she confirms she wants this account linked publicly. */
  confirmed: boolean
  note?: string
}

export const mediaAccounts: MediaAccount[] = [
  {
    id: 'youtube-health',
    url: 'https://www.youtube.com/@minmeychang',
    en: 'YouTube — health and wellbeing talks',
    zhHant: 'YouTube — 養生講座',
    confirmed: false,
    note: 'Channel title "Min Mey Chang 張馬敏妹". Active, with videos reaching 2.1K views, where she presents as 張校長 / Principal Chang. Independently corroborates her Chinese name. Verified to exist 2026-08-05; awaiting her confirmation that she wants it linked from this site.',
  },
  {
    id: 'youtube-family',
    url: 'https://www.youtube.com/@minmeychang9273',
    en: 'YouTube — family videos',
    zhHant: 'YouTube — 家庭影片',
    confirmed: false,
    note: 'Channel title "Min Mey Chang". Contains family material — "Chang family", "Oregon trip", "Peter chang speeches" — at 46–100 views. Reads as personal rather than public-facing. Confirm she intends this to be findable BEFORE linking it; a tribute site pointing at it would make it considerably more discoverable than it is today.',
  },
  {
    id: 'instagram',
    url: 'https://www.instagram.com/minmeychang/',
    en: 'Instagram',
    zhHant: 'Instagram',
    confirmed: false,
    note: 'Public account, 690 followers, posts from March 2023 to December 2025. Verified public without login 2026-08-05.',
  },
]

/** Only accounts she has confirmed may be linked from the site. */
export const linkableAccounts = mediaAccounts.filter((a) => a.confirmed)
