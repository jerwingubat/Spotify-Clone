const cache = new Map()

const defaultSources = ['youtube', 'soundcloud', 'bandcamp']

export class BackendUnavailableError extends Error {
  constructor(api) {
    super(
      `${api} is unavailable on this link. ` +
        'The page is being served without its backend, so /api/search returns the app’s HTML instead of JSON. ' +
        'Deploy this project so it runs `node server/index.mjs` (e.g. Bonto, Glitch, Render) or Firebase Hosting + Cloud Functions ' +
        '(firebase deploy), or locally run `npm run dev:full`.',
    )
    this.name = 'BackendUnavailableError'
  }
}

async function readJson(res, api) {
  const text = await res.text()
  if (text.startsWith('{') || text.startsWith('[')) {
    try {
      return JSON.parse(text)
    } catch (_) {}
  }
  if (/<!DOCTYPE|<html/i.test(text.slice(0, 500))) {
    throw new BackendUnavailableError(api)
  }
  throw new Error(`${api} returned an invalid response (status ${res.status})`)
}

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
    if (sourceErrors) {
      err.sourceErrors = sourceErrors
      const joined = Object.entries(sourceErrors)
        .map(([s, m]) => `${s}: ${String(m).replace(/\s+/g, ' ').slice(0, 120)}`)
        .join(' | ')
      if (joined) err.message = `${err.message} — ${joined}`
    }
    throw err
  }
  const data = await readJson(res, 'Search (/api/search)')
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
  if ((res.headers.get('content-type') || '').includes('text/html')) {
    throw new BackendUnavailableError('Streaming (/api/stream)')
  }
  if (!res.ok) {
    let bodyText = ''
    try {
      const text = await res.text()
      bodyText = text || ''
      const body = JSON.parse(text)
      if (body && body.detail) throw new Error(`Stream failed — ${String(body.detail).slice(0, 180)}`)
      if (body && body.error) throw new Error(`Stream failed — ${String(body.error).slice(0, 180)}`)
    } catch (err) {
      if (err instanceof Error && err.message.startsWith('Stream failed')) throw err
    }
    const snippet = bodyText.replace(/\s+/g, ' ').slice(0, 140)
    throw new Error(`Audio stream error (HTTP ${res.status})${snippet ? ` — ${snippet}` : ''}`)
  }
  return (res.headers.get('x-stream-type') || '').toLowerCase()
}

export async function resolveByName(q, skipUrl) {
  if (!skipUrl && cache.has(q)) return cache.get(q)
  const { results } = await searchAll(q, defaultSources, 1)
  const first = results[0]
  const resolved = {
    url: first && first.url ? streamUrlFor(first.url) : null,
    hls: (first && first.source) === 'soundcloud',
  }
  if (!skipUrl) cache.set(q, resolved)
  return resolved
}

export async function resolvePlayUrl(song) {
  if (song.url) {
    return { url: streamUrlFor(song.url), hls: song.source === 'soundcloud' }
  }
  return resolveByName(`${song.title} ${song.artist}`.trim())
}