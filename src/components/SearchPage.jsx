import React, { useEffect, useState } from 'react'
import { songs } from '../data.js'
import { usePlayer } from '../store/PlayerContext.jsx'
import { searchAll } from '../audio/upstream.js'
import { PlayFilledIcon } from './Icons.jsx'

const GENRES = [
  'Pop', 'Hip-Hop', 'Rock', 'Electronic', 'Chill', 'Latin', 'K-Pop',
  'R&B', 'Jazz', 'Classical', 'House', 'Indie', 'Metal', 'Reggae',
]

const GENRE_COLORS = [
  '#e13300', '#bc5900', '#608108', '#148a08', '#0d73ec', '#503750',
  '#b02897', '#8d67ab', '#e8115b', '#7d4b32', '#1e3264', '#246bc4',
  '#5f9ea0', '#dc148c', '#cd1a2b', '#06402b', '#9656a1', '#8400e7',
]

const SOURCE_LABELS = {
  soundcloud: 'SoundCloud',
  bandcamp: 'Bandcamp',
  youtube: 'YouTube',
}

const SOURCE_CHIPS = [
  { id: 'all', label: 'All' },
  { id: 'soundcloud', label: 'SoundCloud' },
  { id: 'bandcamp', label: 'Bandcamp' },
  { id: 'youtube', label: 'YouTube' },
]

function buildSources(chip) {
  if (chip === 'all') return ['soundcloud', 'youtube']
  return [chip]
}

export default function SearchPage() {
  const { playQueue, play } = usePlayer()
  const [query, setQuery] = useState('')
  const [chip, setChip] = useState('all')
  const [results, setResults] = useState([])
  const [sourceErrors, setSourceErrors] = useState(null)
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState(null)

  const sources = buildSources(chip)
  const q = query.trim()

  useEffect(() => {
    if (q.length < 3 || chip === 'bandcamp') {
      setResults([])
      setSearching(false)
      setSearchError(null)
      setSourceErrors(null)
      return
    }
    setSearching(true)
    setSearchError(null)
    setSourceErrors(null)
    const t = setTimeout(async () => {
      try {
        const res = await searchAll(q, sources, 6)
        setResults(res.results)
        setSourceErrors(res.errors)
      } catch (err) {
        setResults([])
        setSearchError(err.message)
        if (err.sourceErrors) setSourceErrors(err.sourceErrors)
      } finally {
        setSearching(false)
      }
    }, 350)
    return () => clearTimeout(t)
  }, [q, sources.join(','), chip])

  const playResult = (item, i) => {
    playQueue(
      results.map((r) => ({
        title: r.title,
        artist: r.artist,
        album: r.source,
        source: r.source,
        url: r.url,
      })),
      i,
    )
  }

  return (
    <div className="px-4 pb-6 md:px-6">
      <div className="pt-1">
        <h1 className="mb-5 mt-1 text-[34px] font-extrabold tracking-tighter md:text-[40px]">Search</h1>
        <div className="flex max-w-[400px] items-center gap-3 rounded-full bg-white px-4 py-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <input
            placeholder="Search SoundCloud, Bandcamp, YouTube…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-[15px] text-black outline-none placeholder:text-[#777]"
          />
          {query && (
            <button
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#ccc] text-black transition hover:bg-[#aaa]"
              onClick={() => setQuery('')}
              title="Clear"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#000">
                <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm4.24 13.59-1.41 1.41L12 13.41l-2.83 2.83-1.41-1.41L10.59 12 7.76 9.17l1.41-1.41L12 10.59l2.83-2.83 1.41 1.41L13.41 12l2.83 2.83z" />
              </svg>
            </button>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {SOURCE_CHIPS.map((s) => (
            <button
              key={s.id}
              className={`rounded-full px-4 py-1.5 text-[13px] font-semibold transition ${
                chip === s.id ? 'bg-white text-black' : 'bg-[#232323] text-white hover:bg-[#333]'
              }`}
              onClick={() => setChip(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {!q && (
        <div className="mt-6">
          <div className="mb-4">
            <h2 className="text-[22px] font-extrabold tracking-tight">Browse all</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
            {GENRES.map((g, i) => (
              <button
                key={g}
                className="group relative aspect-square overflow-hidden rounded-md p-3 text-left transition hover:scale-[1.01]"
                style={{ background: GENRE_COLORS[i % GENRE_COLORS.length] }}
                onClick={() => play(songs[i % songs.length])}
              >
                <span className="text-[18px] font-bold">{g}</span>
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="#000"
                  className="absolute bottom-2.5 right-2.5 rotate-[20deg] opacity-0 transition group-hover:opacity-100"
                >
                  <path d="M7.05 3.606l13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z" />
                </svg>
                <span className="absolute -bottom-[60px] -right-[40px] h-[160px] w-[160px] rounded-full bg-black/30" />
              </button>
            ))}
          </div>
        </div>
      )}

      {chip === 'bandcamp' && q.length >= 3 && (
        <div className="mt-6">
          <p className="text-center text-[14px] text-[#b3b3b3]">
            Bandcamp search is temporarily unavailable
            <br />
            <span className="text-[13px] text-[#7a7a7a]">Bandcamp currently blocks non-browser requests from servers.</span>
          </p>
        </div>
      )}

      {q && chip !== 'bandcamp' && searching && (
        <p className="mt-6 text-center text-[14px] text-[#b3b3b3]">
          Searching {sources.map((s) => SOURCE_LABELS[s]).join(', ')}…
        </p>
      )}

      {q && chip !== 'bandcamp' && !searching && searchError && (
        <div className="mt-6">
          <p className="text-center text-[14px] text-[#b3b3b3]">
            Search failed: {searchError}
            <br />
            <span className="text-[13px] text-[#7a7a7a]">
              Run <code className="rounded bg-[#222] px-1.5 py-0.5 text-[13px]">npm run dev:full</code> (or deploy the Cloud
              Function) so <code className="rounded bg-[#222] px-1.5 py-0.5 text-[13px]">/api/search</code> is available.
            </span>
          </p>
        </div>
      )}

      {q && chip !== 'bandcamp' && !searching && sourceErrors && (
        <p className="mt-3 text-center text-[13px] text-[#7a7a7a]">
          {Object.keys(sourceErrors).map((s) => `${SOURCE_LABELS[s]} is temporarily unavailable`).join(' · ')}
        </p>
      )}

      {q && chip !== 'bandcamp' && !searching && !searchError && results.length === 0 && (
        <p className="mt-6 text-center text-[14px] text-[#b3b3b3]">No results for “{query}”</p>
      )}

      {q && results.length > 0 && (
        <div className="mt-6">
          <div className="mb-2">
            <h3 className="text-[16px] font-bold">{results.length} results</h3>
          </div>

          <div className="grid grid-cols-[36px_1fr_60px] items-center gap-3 px-3 pb-2.5 text-[13px] font-semibold text-[#b3b3b3] md:grid-cols-[36px_1fr_3fr_84px]">
            <span className="text-left md:text-right">#</span>
            <span>Title</span>
            <span className="hidden md:block">Artist</span>
            <span className="hidden md:block">Source</span>
          </div>

          {results.map((r, i) => (
            <div
              key={`${r.source}-${r.id}-${i}`}
              className="group grid cursor-pointer grid-cols-[36px_1fr_60px] items-center gap-3 rounded px-3 py-2 transition hover:bg-white/10 md:grid-cols-[36px_1fr_3fr_84px]"
              onClick={() => playResult(r, i)}
            >
              <span className="col-rank flex justify-center md:justify-end">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-spotify md:opacity-0 md:group-hover:opacity-100">
                  <PlayFilledIcon size={14} />
                </span>
              </span>
              <span className="col-main flex min-w-0 items-center gap-3">
                <span
                  className="h-10 w-10 shrink-0 rounded"
                  style={{ background: r.thumbnail ? `url(${r.thumbnail}) center/cover` : `hsl(${(i * 47 + 200) % 360}, 45%, 35%)` }}
                />
                <div className="min-w-0">
                  <strong className="truncate">{r.title}</strong>
                  <span className="block truncate text-[13px] text-[#b3b3b3] md:hidden">{r.artist || '–'}</span>
                </div>
              </span>
              <span className="hidden truncate text-[#b3b3b3] md:block">{r.artist || '–'}</span>
              <span className="hidden md:block">
                <span
                  className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-bold text-white ${
                    r.source === 'soundcloud' ? 'bg-sc' : r.source === 'bandcamp' ? 'bg-bc' : 'bg-yt'
                  }`}
                >
                  {SOURCE_LABELS[r.source]}
                </span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}