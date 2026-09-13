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
    <div className="page">
      <div className="search-hero">
        <h1 className="search-title">Search</h1>
        <div className="search-bar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <input
            placeholder="Search SoundCloud, Bandcamp, YouTube…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {query && (
            <button className="search-clear" onClick={() => setQuery('')} title="Clear">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#000">
                <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm4.24 13.59-1.41 1.41L12 13.41l-2.83 2.83-1.41-1.41L10.59 12 7.76 9.17l1.41-1.41L12 10.59l2.83-2.83 1.41 1.41L13.41 12l2.83 2.83z" />
              </svg>
            </button>
          )}
        </div>

        <div className="source-chips">
          {SOURCE_CHIPS.map((s) => (
            <button key={s.id} className={`chip ${chip === s.id ? 'chip--active' : ''}`} onClick={() => setChip(s.id)}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {!q && (
        <div className="section">
          <div className="section-header">
            <h2>Browse all</h2>
          </div>
          <div className="grid grid--genres">
            {GENRES.map((g, i) => (
              <button key={g} className="genre-card" style={{ background: GENRE_COLORS[i % GENRE_COLORS.length] }} onClick={() => play(songs[i % songs.length])}>
                <span>{g}</span>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="#000">
                  <path d="M7.05 3.606l13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z" />
                </svg>
                <span className="genre-card__blob" />
              </button>
            ))}
          </div>
        </div>
      )}

      {chip === 'bandcamp' && q.length >= 3 && (
        <div className="section">
          <p className="empty-state">
            Bandcamp search is temporarily unavailable
            <br />
            <span className="dim">Bandcamp currently blocks non-browser requests from servers.</span>
          </p>
        </div>
      )}

      {q && chip !== 'bandcamp' && searching && (
        <p className="empty-state">Searching {sources.map((s) => SOURCE_LABELS[s]).join(', ')}…</p>
      )}

      {q && chip !== 'bandcamp' && !searching && searchError && (
        <div className="section">
          <p className="empty-state">
            Search failed: {searchError}
            <br />
            <span className="dim">
              Run <code>npm run dev:full</code> (or deploy the Cloud Function) so <code>/api/search</code> is available.
            </span>
          </p>
        </div>
      )}

      {q && chip !== 'bandcamp' && !searching && sourceErrors && (
        <p className="empty-state dim">
          {Object.keys(sourceErrors).map((s) => `${SOURCE_LABELS[s]} is temporarily unavailable`).join(' · ')}
        </p>
      )}

      {q && chip !== 'bandcamp' && !searching && !searchError && results.length === 0 && (
        <p className="empty-state">No results for “{query}”</p>
      )}

      {q && results.length > 0 && (
        <div className="section">
          <div className="section-header">
            <h3>{results.length} results</h3>
          </div>
          <div className="table table--tracks table--search">
            <div className="table__head">
              <span className="col-rank">#</span>
              <span className="col-main">Title</span>
              <span className="col-artist">Artist</span>
              <span className="col-dur">Source</span>
            </div>
            {results.map((r, i) => (
              <div className="table__row table__row--search" key={`${r.source}-${r.id}-${i}`} onClick={() => playResult(r, i)}>
                <span className="col-rank">
                  <button className="mini-play">
                    <PlayFilledIcon size={14} />
                  </button>
                </span>
                <span className="col-main">
                  <span className="minicover" style={{ background: r.thumbnail ? `url(${r.thumbnail}) center/cover` : `hsl(${(i * 47 + 200) % 360}, 45%, 35%)` }} />
                  <div className="col-main-body">
                    <strong>{r.title}</strong>
                    <span className="col-main-sub">{r.artist || '–'}</span>
                  </div>
                </span>
                <span className="col-artist">{r.artist || '–'}</span>
                <span className="col-dur">
                  <span className={`source-badge source-badge--${r.source}`}>{SOURCE_LABELS[r.source]}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}