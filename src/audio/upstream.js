const cache = new Map()

const defaultSources = ['soundcloud', 'bandcamp', 'youtube']

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

export async function resolvePlayUrl(song) {
  if (song.url) return streamUrlFor(song.url)

  const key = `${song.title}|${song.artist}`
  if (cache.has(key)) return cache.get(key)

  const results = await searchAll(`${song.title} ${song.artist}`.trim(), defaultSources, 1)
  const first = results.results[0]
  const url = first && first.url ? streamUrlFor(first.url) : null
  cache.set(key, url)
  return url
}