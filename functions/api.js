export const SOURCES = {
  soundcloud: { prefix: 'scsearch', home: 'soundcloud.com' },
  bandcamp: { prefix: 'bcsearch', home: 'bandcamp.com' },
  youtube: { prefix: 'ytsearch', home: 'youtube.com' },
}

export const DEFAULT_SOURCES = ['soundcloud', 'bandcamp', 'youtube']

const DIRECT_MEDIA = /\.(m3u8|m4s|mp4|m4a|aac|ts|opus|webm|mp3|flac|oga)(\?|$)/i

function isValidSource(s) {
  return Object.prototype.hasOwnProperty.call(SOURCES, s)
}

function isHlsUrl(url) {
  return /\.m3u8(\?|$)/i.test(url)
}

export function isDirectMediaUrl(url) {
  return DIRECT_MEDIA.test(url)
}

function pick(item, source) {
  const url = item.webpage_url || item.url || item._url || ''
  const title = item.title || item.track || ''
  const artist = item.uploader || item.channel || item.creator || item.artist || ''
  const thumbRaw = item.thumbnail || (Array.isArray(item.thumbnails) && item.thumbnails[0] ? item.thumbnails[0].url : '')

  if (source === 'bandcamp' && !/\/track\//i.test(url)) return null
  if (source === 'soundcloud') {
    const m = url.match(/soundcloud\.com\/([^/]+)(?:[?/]([^?/]+))?/i)
    if (!m || !m[2]) return null
    if (m[2].toLowerCase() === 'sets') return null
  }
  if (source === 'youtube' && !/(youtube\.com\/watch|youtu\.be\/)/i.test(url)) return null

  return {
    id: item.id || title,
    title,
    artist,
    duration: item.duration || null,
    source,
    url,
    thumbnail: thumbRaw || '',
  }
}

function rewritePlaylist(text, baseUrl) {
  const toLocal = (raw) => {
    try {
      const abs = new URL(raw, baseUrl).href
      return `/api/stream?url=${encodeURIComponent(abs)}`
    } catch (_) {
      return raw
    }
  }
  return text
    .split('\n')
    .map((line) => {
      const trimmed = line.trim()
      if (!trimmed) return line
      const uri = trimmed.match(/^(.*URI=")([^"]+)(".*)$/)
      if (uri) return `${uri[1]}${toLocal(uri[2])}${uri[3]}`
      if (trimmed.startsWith('#')) return line
      return toLocal(trimmed)
    })
    .join('\n')
}

async function streamedBody(up) {
  if (typeof ReadableStream !== 'undefined' && up.body && typeof up.body.getReader === 'function') {
    const { Readable } = await import('node:stream')
    return Readable.fromWeb(up.body)
  }
  return up.body
}

export function createApi({ searchPlaylist, extractAudioUrl }) {
  const streamCache = new Map()

  async function searchSource(source, q, limit) {
    const input = `${SOURCES[source].prefix}${limit}:${q}`
    const data = await searchPlaylist(input)
    const entries = (data.entries || []).filter(Boolean)
    const out = []
    for (const e of entries) {
      const picked = pick(e, source)
      if (picked) out.push(picked)
      if (out.length >= limit) break
    }
    return out
  }

  async function resolveTarget(urlParam) {
    if (isDirectMediaUrl(urlParam)) return urlParam
    if (streamCache.has(urlParam)) return streamCache.get(urlParam)
    const target = await extractAudioUrl(urlParam)
    if (!target) throw new Error('extraction returned an empty url')
    streamCache.set(urlParam, target)
    return target
  }

  function setCors(res, headers = {}) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type')
    for (const [k, v] of Object.entries(headers)) res.setHeader(k, v)
  }

  function json(res, code, body) {
    setCors(res)
    res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' })
    res.end(JSON.stringify(body))
  }

  async function handleSearch(u, res) {
    const q = (u.searchParams.get('q') || '').trim()
    if (!q) return json(res, 400, { error: 'missing q' })

    const rawSources = (u.searchParams.get('sources') || DEFAULT_SOURCES.join(','))
      .split(',')
      .filter(isValidSource)
    const sources = rawSources.length ? rawSources : DEFAULT_SOURCES
    const limit = Math.max(1, Math.min(10, Number(u.searchParams.get('limit')) || 5))

    const results = []
    const errors = {}
    for (const source of sources) {
      try {
        const items = await searchSource(source, q, limit)
        results.push(...items)
      } catch (err) {
        errors[source] = String(err.stderr || err.message || err)
      }
    }

    if (!results.length && Object.keys(errors).length === sources.length) {
      return json(res, 500, { error: 'search failed for all sources', errors })
    }
    return json(res, 200, { results, errors: Object.keys(errors).length ? errors : null })
  }

  async function proxyBinary(target, req, res) {
    const INITIAL_RANGE = 'bytes=0-1048575'
    const browserRange = req.headers['range']
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      Accept: '*/*',
      Range: browserRange || INITIAL_RANGE,
    }

    let up
    try {
      up = await fetch(target, { headers, redirect: 'follow' })
      if (!up.ok && !browserRange) {
        up = await fetch(target, { headers: { ...headers, Range: INITIAL_RANGE }, redirect: 'follow' })
      }
    } catch (err) {
      return json(res, 502, { error: 'upstream fetch failed', detail: String(err.message) })
    }
    if (!up.ok) {
      return json(res, 502, { error: 'upstream error', detail: `${up.status} ${target}` })
    }

    const type = up.headers.get('content-type') || 'application/octet-stream'
    const length = up.headers.get('content-length')
    const contentRange = up.headers.get('content-range')
    const acceptRanges = up.headers.get('accept-ranges') || 'bytes'

    res.setHeader('Content-Type', type)
    if (length) res.setHeader('Content-Length', length)
    if (contentRange) res.setHeader('Content-Range', contentRange)
    res.setHeader('Accept-Ranges', acceptRanges)
    setCors(res)
    res.writeHead(up.status)

    const body = await streamedBody(up)
    if (!body || typeof body.pipe !== 'function') {
      res.end(Buffer.from(await up.arrayBuffer()))
      return
    }
    body.on('error', () => res.end())
    body.pipe(res)
  }

  async function handleStream(req, res) {
    const u = new URL(req.url, 'http://localhost')
    const urlParam = u.searchParams.get('url')
    if (!urlParam) return json(res, 400, { error: 'missing url' })
    if (!/^https?:\/\//i.test(urlParam)) return json(res, 400, { error: 'invalid url' })

    try {
      const target = await resolveTarget(urlParam)
      const hls = isHlsUrl(target)

      if (req.method === 'HEAD') {
        setCors(res, { 'X-Stream-Type': hls ? 'hls' : 'file', 'Content-Type': hls ? 'application/vnd.apple.mpegurl' : 'application/octet-stream' })
        res.writeHead(200)
        return res.end()
      }

      if (hls) {
        const up = await fetch(target, {
          redirect: 'follow',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            Accept: '*/*',
          },
        })
        if (!up.ok) {
          return json(res, 502, { error: 'playlist fetch failed', detail: `${up.status} ${target}` })
        }
        const text = await up.text()
        setCors(res, { 'X-Stream-Type': 'hls' })
        res.writeHead(200, {
          'Content-Type': up.headers.get('content-type') || 'application/vnd.apple.mpegurl',
          'Cache-Control': 'no-store',
        })
        res.end(rewritePlaylist(text, target))
        return
      }

      return proxyBinary(target, req, res)
    } catch (err) {
      return json(res, 502, { error: 'audio extraction failed', detail: String(err.stderr || err.message || err) })
    }
  }

  async function handle(req, res) {
    if (req.method === 'OPTIONS') {
      setCors(res)
      res.writeHead(204)
      return res.end()
    }
    const u = new URL(req.url, 'http://localhost')
    const path = u.pathname
    try {
      if (path.endsWith('/health')) {
        return json(res, 200, { ok: true })
      }
      if (path.endsWith('/search')) {
        return await handleSearch(u, res)
      }
      if (path.endsWith('/stream')) {
        return await handleStream(req, res)
      }
      return json(res, 404, { error: 'not found' })
    } catch (err) {
      return json(res, 500, { error: String(err.message || err), detail: String(err.stderr || '') })
    }
  }

  return { handle, searchSource }
}