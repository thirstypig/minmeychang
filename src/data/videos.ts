// Selected talks, ordered by reach.
//
// LINKS, NOT EMBEDS. A YouTube iframe adds roughly a megabyte of third-party
// JavaScript and reports every visitor to Google. This site ships zero JS. If
// embeds are ever wanted, use a click-to-load facade against
// youtube-nocookie.com rather than a bare iframe.
//
// View counts are a snapshot, not live data — labelled with `viewsAsOf` so the
// site never implies a freshness it does not have. Re-check before quoting them
// anywhere that matters.
//
// Verified 2026-08-05 by resolving each video's channelId against her own
// channel, UCpjtQwpLXpG-9n7tPcngs5g.

export type Video = {
  id: string
  /** YouTube video id. */
  youtubeId: string
  title: string
  /** Approximate views at the time of verification. */
  views: number
  viewsAsOf: string
  /** True when the video lives on her own channel. */
  ownChannel: boolean
  /** Channel title, when it is not hers. */
  hostChannel?: string
  note?: string
}

export const HER_CHANNEL_ID = 'UCpjtQwpLXpG-9n7tPcngs5g'

export const videos: Video[] = [
  {
    id: 'health-talk-2023-original',
    youtubeId: 'qcPWF8X8KZ4',
    title: '20230922張校長(馬敏妹)，傳授養生之道',
    views: 833538,
    viewsAsOf: '2026-08-05',
    ownChannel: false,
    hostChannel: '王勝鋒',
    note: 'Her widest reach by a wide margin — over 800,000 views — and she is proud of it. Feature it first. Recorded 2023-09-22 and posted to 王勝鋒\'s channel (UChLb7u__Bsru4eJWvuBxFuA); the same talk is on her own channel as LsL4MZIKIaw with ~2.2K views. The host channel is named on the page as attribution, not as a disclaimer. One engineering consequence to keep in mind: because it is not her upload, the link dies if that channel removes it — worth re-checking periodically.',
  },
  {
    id: 'health-talk-2023-own',
    youtubeId: 'LsL4MZIKIaw',
    title: '張馬敏妹 - 張校長, 傳授養生之道 Principal Chang teaches Health Tips - 9/22/2023',
    views: 2200,
    viewsAsOf: '2026-08-05',
    ownChannel: true,
  },
  {
    id: 'sleep-and-three-highs',
    youtubeId: 'GgInYwAzOds',
    title: '張馬敏妹 - 失眠，三高全走開！邊看電視邊保養',
    views: 2100,
    viewsAsOf: '2026-08-05',
    ownChannel: true,
  },
  {
    id: 'retirement-life',
    youtubeId: 'QEyl_ccnQ3E',
    title:
      '張馬敏妹 美國華人退休生活怎麼過？ Principal Chang talks about living and health tips for seniors!',
    views: 1800,
    viewsAsOf: '2026-08-05',
    ownChannel: true,
  },
  {
    id: 'eyesight',
    youtubeId: 'i9BwmOG7bfM',
    title: '張馬敏妹 - 近視和老花，視力模糊？一招解決！',
    views: 672,
    viewsAsOf: '2026-08-05',
    ownChannel: true,
  },
  {
    id: 'reflexology-2024',
    youtubeId: 'sL2zaa1Jbgk',
    title: '張馬敏妹養生之道',
    views: 1719,
    viewsAsOf: '2026-08-05',
    ownChannel: false,
    hostChannel: 'RosaVideos',
  },
  {
    id: 'interview-2018',
    youtubeId: 'C-NEZCsXqxQ',
    title: '心靈訪客：張馬敏妹校長的正向思維 3-21-18',
    views: 652,
    viewsAsOf: '2026-08-05',
    ownChannel: false,
    hostChannel: 'Alicejjtang',
    note: 'An interview with her — not a lecture. The only sit-down conversation found anywhere, and the closest thing to her own recorded voice on the site. Worth asking whether she has a copy.',
  },
  {
    id: 'amtv-2022',
    youtubeId: 'cqdyWDGSTnw',
    title: '亞凱迪亞前市長張勝雄宣佈支持張奔競選亞凱迪亞學區教委【AMTV】',
    views: 118,
    viewsAsOf: '2026-08-05',
    ownChannel: false,
    hostChannel: 'Amtv全美電視臺',
    note: 'Primarily her husband — the broadcast is his endorsement of a school board candidate. Included because the family says both parents appear, and because its title is the second independent attestation that he was Mayor of Arcadia.',
  },
  {
    id: 'neck-pain',
    youtubeId: 'IQbWJyh5y_Q',
    title: '張馬敏妹 - 頸椎痛怎麼辦？3招輕鬆解決',
    views: 603,
    viewsAsOf: '2026-08-05',
    ownChannel: true,
  },
]

/** Ordered by reach, widest first. */
export const videosByReach = [...videos].sort((a, b) => b.views - a.views)

export const watchUrl = (v: Video) => `https://www.youtube.com/watch?v=${v.youtubeId}`

/** Thumbnail, served by YouTube.
 *
 * Hotlinked rather than copied into public/. Two reasons: copying the
 * thumbnail of a video on someone else's channel reproduces their content,
 * and a hotlinked thumbnail stays correct if the uploader changes it.
 *
 * The cost is a third-party request to Google — the only one on this site.
 * Mitigated with referrerpolicy="no-referrer" at the img tag, so Google
 * learns that a thumbnail was fetched but not which page fetched it.
 *
 * hqdefault always exists for every video; maxresdefault frequently 404s.
 */
export const thumbnailUrl = (v: Video) =>
  `https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg`
