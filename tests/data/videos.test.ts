import { describe, expect, it } from 'vitest'
import {
  videos,
  videosByReach,
  watchUrl,
  thumbnailUrl,
  HER_CHANNEL_ID,
} from '../../src/data/videos'

describe('videos', () => {
  it('has unique ids and unique YouTube ids', () => {
    expect(new Set(videos.map((v) => v.id)).size).toBe(videos.length)
    expect(new Set(videos.map((v) => v.youtubeId)).size).toBe(videos.length)
  })

  it('every YouTube id is a real 11-character id', () => {
    // A truncated or mistyped id yields a dead link and a broken thumbnail,
    // and neither fails the build.
    for (const v of videos) {
      expect(v.youtubeId, `'${v.id}'`).toMatch(/^[A-Za-z0-9_-]{11}$/)
    }
  })

  it('videosByReach puts pinned videos first, in pin order', () => {
    const pinned = videos.filter((v) => v.pin !== undefined)
    const head = videosByReach.slice(0, pinned.length)
    expect(head.every((v) => v.pin !== undefined)).toBe(true)
    const pins = head.map((v) => v.pin!)
    expect(pins).toEqual([...pins].sort((a, b) => a - b))
  })

  it('pins are unique, so the pinned order is never a tie', () => {
    const pins = videos.flatMap((v) => (v.pin === undefined ? [] : [v.pin]))
    expect(new Set(pins).size).toBe(pins.length)
  })

  it('her most-watched talk stays first', () => {
    // The family asked for it to lead; pinning the 2026 gala videos must not
    // displace it.
    expect(videosByReach[0]!.id).toBe('health-talk-2023-original')
  })

  it('after the pinned videos, the rest are sorted widest first and nothing is lost', () => {
    const rest = videosByReach.filter((v) => v.pin === undefined)
    const views = rest.map((v) => v.views)
    expect(views).toEqual([...views].sort((a, b) => b - a))
    expect(rest.length).toBeGreaterThan(0)
    expect(videosByReach).toHaveLength(videos.length)
  })

  it('does not mutate the source array while sorting', () => {
    // videosByReach uses a spread; dropping it would reorder `videos` in place
    // and silently change any other consumer's order.
    const before = videos.map((v) => v.id)
    void [...videosByReach]
    expect(videos.map((v) => v.id)).toEqual(before)
  })
})

describe('attribution', () => {
  // The concrete regression: her most-seen talk — over 800,000 views — is NOT
  // on her channel. Every one of these videos has 張馬敏妹 in the title, so by
  // title alone all six look like hers. Only the channel distinguishes them.
  // Dropping the attribution would claim someone else's upload as her own.
  it('any video not on her channel names the channel it is on', () => {
    for (const v of videos) {
      if (v.ownChannel) continue
      expect(
        v.hostChannel,
        `'${v.id}' is not on her channel but names no host — the page would imply it is hers`
      ).toBeTruthy()
    }
  })

  it('videos on her own channel do not name a host', () => {
    for (const v of videos) {
      if (!v.ownChannel) continue
      expect(
        v.hostChannel,
        `'${v.id}' is on her channel but also names a host channel`
      ).toBeUndefined()
    }
  })

  it('her channel id is recorded so future videos can be checked against it', () => {
    expect(HER_CHANNEL_ID).toMatch(/^UC[A-Za-z0-9_-]{22}$/)
  })
})

describe('url construction', () => {
  it('builds a watch url from the id', () => {
    const v = videos[0]!
    expect(watchUrl(v)).toBe(`https://www.youtube.com/watch?v=${v.youtubeId}`)
  })

  it('builds an hqdefault thumbnail url', () => {
    // hqdefault exists for every video; maxresdefault frequently 404s.
    const v = videos[0]!
    expect(thumbnailUrl(v)).toBe(`https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg`)
  })

  it('every generated url is https', () => {
    for (const v of videos) {
      expect(watchUrl(v)).toMatch(/^https:\/\//)
      expect(thumbnailUrl(v)).toMatch(/^https:\/\//)
    }
  })
})

describe('view counts', () => {
  it('every video carries the date its view count was taken', () => {
    // Counts are a snapshot. Without viewsAsOf the page implies live data.
    for (const v of videos) {
      expect(v.viewsAsOf, `'${v.id}'`).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(v.views, `'${v.id}'`).toBeGreaterThan(0)
    }
  })
})
