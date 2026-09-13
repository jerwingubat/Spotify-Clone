import { proxiedText, unescapeHtmlEntities } from './utils.js'

async function fetchTrack(rel) {
  const url = 'https://bandcamp.com' + rel
  const html = await proxiedText(url)
  const m = html.match(/data-tralbum="([^"]+)"/)
  if (!m) return null

  let data
  try {
    data = JSON.parse(unescapeHtmlEntities(m[1]))
  } catch (_) {
    return null
  }

  const trackInfo = data.trackinfo && data.trackinfo[0]
  if (!trackInfo) return null

  const file = (trackInfo.file && (trackInfo.file['mp3-128'] || trackInfo.file['mp3-320'])) || null
  return {
    title: trackInfo.title || 'Untitled track',
    artist: data.artist || '',
    streamUrl: file,
    duration: trackInfo.duration || null,
  }
}

export async function searchBandcamp(query, limit = 3) {
  const url =
    'https://bandcamp.com/search?q=' + encodeURIComponent(query) + '&item_type=t'
  const html = await proxiedText(url)

  const seen = new Set()
  const tracks = []
  for (const m of html.matchAll(/href="(\/track\/[^"?]+)"/g)) {
    const rel = m[1]
    if (seen.has(rel)) continue
    seen.add(rel)
    try {
      const info = await fetchTrack(rel)
      if (info && info.streamUrl) {
        tracks.push({ source: 'bandcamp', id: rel, url: 'https://bandcamp.com' + rel, ...info })
        if (tracks.length >= limit) break
      }
    } catch (_) {
      /* skip unusable result */
    }
  }
  return tracks
}