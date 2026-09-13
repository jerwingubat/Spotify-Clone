import { proxiedText } from './utils.js'

let clientIdPromise = null

async function getClientId() {
  if (clientIdPromise) return clientIdPromise
  clientIdPromise = (async () => {
    const html = await proxiedText('https://soundcloud.com/')
    const m = html.match(/"client_id":"([a-zA-Z0-9_]{20,80})"/)
    if (!m) throw new Error('SoundCloud client_id could not be extracted')
    return m[1]
  })()
  return clientIdPromise
}

export async function searchSoundCloud(query, limit = 5) {
  const clientId = await getClientId()
  const url =
    'https://api-v2.soundcloud.com/search' +
    `?q=${encodeURIComponent(query)}` +
    `&client_id=${clientId}` +
    `&limit=${limit}` +
    '&filter.content_track=single_track'
  const json = JSON.parse(await proxiedText(url))
  return (json.collection || [])
    .filter((t) => t.media && t.media.transcodings && t.media.transcodings.length)
    .map((t) => ({
      source: 'soundcloud',
      id: t.id,
      title: t.title,
      artist: (t.user && t.user.username) || '',
      duration: t.duration ? t.duration / 1000 : null,
      artwork: t.artwork_url || '',
    }))
}

export async function extractSoundCloudStream(id) {
  const clientId = await getClientId()
  const url = `https://api-v2.soundcloud.com/tracks/${id}/streams?client_id=${clientId}`
  const json = JSON.parse(await proxiedText(url))
  return json.http_mp3_128_url || json.http_mp3_64_url || null
}