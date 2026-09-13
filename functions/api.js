export const SOURCES = {
  soundcloud: { prefix: 'scsearch', home: 'soundcloud.com' },
  bandcamp: { prefix: 'bcsearch', home: 'bandcamp.com' },
  youtube: { prefix: 'ytsearch', home: 'youtube.com' },
}

export const DEFAULT_SOURCES = ['soundcloud', 'bandcamp', 'youtube']

function isValidSource(s) {
  return Object.prototype.hasOwnProperty.call(SOURCES, s)
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

  function setCors(res) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', '*')
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

  function handleStream(u, res) {
    const urlParam = u.searchParams.get('url')
    if (!urlParam) return json(res, 400, { error: 'missing url' })
    if (!/^https?:\/\//i.test(urlParam)) return json(res, 400, { error: 'invalid url' })

    const send = async () => {
      try {
        let target = streamCache.get(urlParam)
        if (!target) {
          target = await extractAudioUrl(urlParam)
          if (!target) throw new Error('extraction returned an empty url')
          streamCache.set(urlParam, target)
        }
        setCors(res)
        res.writeHead(302, { Location: target })
        res.end()
      } catch (err) {
        json(res, 502, { error: 'audio extraction failed', detail: String(err.stderr || err.message || err) })
      }
    }
    return send()
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
        return await handleStream(u, res)
      }
      return json(res, 404, { error: 'not found' })
    } catch (err) {
      return json(res, 500, { error: String(err.message || err), detail: String(err.stderr || '') })
    }
  }

  return { handle, searchSource }
}