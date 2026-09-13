const cache = new Map()

const defaultSources = ['soundcloud', 'youtube']

export async function searchAll(q, sources = defaultSources, limit = 5) {
  const params = new URLSearchParams({
    q,
    sources: sources.join(','),
    limit: String(limit),
  })
  const res = await fetch(`/api/search?${params}`)
  if (!res.ok) {
    let sourceErrors = null
    let detail = ''
    try {
      const body = await res.json()
      detail = body.error || ''
      sourceErrors = body.errors || null
    } catch (_) {}
    const err = new Error(detail || `Search server error (${res.status})`)
    if (sourceErrors) err.sourceErrors = sourceErrors
    throw err
  }
  const data = await res.json()
  return { results: data.results || [], errors: data.errors || null }
}

export function streamUrlFor(url) {
  return `/api/stream?url=${encodeURIComponent(url)}`
}

export async function probeStream(url) {
  let res
  try {
    res = await fetch(url, { method: 'HEAD' })
  } catch (_) {
    throw new Error('Audio server unreachable — run `npm run dev:full`')
  }
  return (res.headers.get('x-stream-type') || '').toLowerCase()
}

export async function resolvePlayUrl(song) {
  if (song.url) {
    return { url: streamUrlFor(song.url), hls: song.source === 'soundcloud' }
  }

  const key = `${song.title}|${song.artist}`
  if (cache.has(key)) return cache.get(key)

  const { results } = await searchAll(`${song.title} ${song.artist}`.trim(), defaultSources, 1)
  const first = results[0]
  const resolved = {
    url: first && first.url ? streamUrlFor(first.url) : null,
    hls: (first && first.source) === 'soundcloud',
  }
  cache.set(key, resolved)
  return resolved
}