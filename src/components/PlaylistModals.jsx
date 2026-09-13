import React, { useEffect, useState } from 'react'
import { PlusIcon, CrossIcon, PlaylistIcon } from './Icons.jsx'
import { usePlaylists } from '../store/PlaylistsContext.jsx'
import { searchAll } from '../audio/upstream.js'

const LIKE_COLORS = ['#503750', '#e8115b', '#148a08', '#246bc4', '#8e66ac', '#ba5d07']
const SOURCE_LABELS = { soundcloud: 'SoundCloud', bandcamp: 'Bandcamp', youtube: 'YouTube' }

function Modal({ title, onClose, wide, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className={`flex max-h-[85vh] w-full ${wide ? 'max-w-xl' : 'max-w-md'} flex-col overflow-hidden rounded-xl bg-panel-elevated shadow-[0_24px_80px_rgba(0,0,0,0.7)]`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4">
          <h3 className="text-lg font-bold">{title}</h3>
          <button className="flex h-8 w-8 items-center justify-center rounded-full text-[#b3b3b3] transition hover:bg-white/10 hover:text-white" onClick={onClose}>
            <CrossIcon size={16} />
          </button>
        </div>
        <div className="overflow-y-auto px-5 pb-5">{children}</div>
      </div>
    </div>
  )
}

const inputCls =
  'mt-1 w-full rounded bg-[#2a2a2a] px-3 py-2 text-sm text-white outline-none placeholder:text-[#777] focus:ring-2 focus:ring-spotify'

const primaryBtn = 'rounded-full bg-spotify px-5 py-2 text-sm font-bold text-black transition hover:scale-105 disabled:opacity-50'

const ghostBtn = 'rounded-full px-5 py-2 text-sm font-bold text-[#b3b3b3] transition hover:text-white'

export function EditPlaylistModal({ playlist, onClose }) {
  const { updatePlaylist } = usePlaylists()
  const [name, setName] = useState(playlist.name)
  const [desc, setDesc] = useState(playlist.desc || '')

  const save = async () => {
    if (!name.trim()) return
    await updatePlaylist(playlist.id, { name: name.trim(), desc: desc.trim() })
    onClose()
  }

  return (
    <Modal title="Edit playlist" onClose={onClose}>
      <label className="block text-[13px] font-semibold">
        Name
        <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && save()} />
      </label>
      <label className="mt-4 block text-[13px] font-semibold">
        Description
        <textarea className={`${inputCls} resize-none`} rows="3" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Add an optional description" />
      </label>
      <div className="mt-6 flex justify-end gap-2">
        <button className={ghostBtn} onClick={onClose}>Cancel</button>
        <button className={primaryBtn} disabled={!name.trim()} onClick={save}>Save</button>
      </div>
    </Modal>
  )
}

export function AddToPlaylistModal({ song, onClose }) {
  const { playlists, addSong, create } = usePlaylists()
  const [newName, setNewName] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [done, setDone] = useState({})

  const addTo = async (p) => {
    setBusyId(p.id)
    try {
      await addSong(p.id, song)
      setDone((d) => ({ ...d, [p.id]: true }))
    } finally {
      setBusyId(null)
    }
  }

  const createAndAdd = async () => {
    if (!newName.trim()) return
    await create({
      name: newName.trim(),
      color: LIKE_COLORS[playlists.length % LIKE_COLORS.length],
      desc: 'My playlist',
      songs: [song],
    })
    onClose()
  }

  return (
    <Modal title="Add to playlist" onClose={onClose}>
      <div className="mb-4 flex flex-col gap-2">
        <p className="truncate text-[14px] text-[#b3b3b3]">
          <strong className="text-white">{song.title}</strong>
          {song.artist ? ` — ${song.artist}` : ''}
        </p>
      </div>

      <div className="flex flex-col gap-1">
        {playlists.map((p) => {
          const added = done[p.id] || p.songs?.some((s) => s.title === song.title)
          return (
            <div key={p.id} className="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 transition hover:bg-white/10" onClick={() => !added && !busyId && addTo(p)}>
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded" style={{ background: p.color || '#222' }}>
                  <PlaylistIcon size={16} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-semibold">{p.name}</p>
                  <p className="text-[12px] text-[#b3b3b3]">{p.songs?.length || 0} songs</p>
                </div>
              </div>
              {added ? (
                <span className="shrink-0 text-[13px] font-bold text-spotify">Added</span>
              ) : (
                <span className={`shrink-0 text-[#b3b3b3] ${busyId === p.id ? 'opacity-40' : ''}`}>{busyId === p.id ? <span className="spinner" /> : <PlusIcon />}</span>
              )}
            </div>
          )
        })}
        {playlists.length === 0 && <p className="px-3 py-2 text-center text-[13px] text-[#b3b3b3]">No playlists yet — create one below.</p>}
      </div>

      <div className="mt-5 border-t border-white/10 pt-4">
        <p className="mb-2 text-[13px] font-semibold">Create new playlist</p>
        <div className="flex gap-2">
          <input className={inputCls} placeholder="Playlist name" value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && createAndAdd()} />
          <button className={primaryBtn} disabled={!newName.trim()} onClick={createAndAdd}>Create</button>
        </div>
      </div>
    </Modal>
  )
}

export function AddSongsModal({ playlistId, onClose }) {
  const { addSong } = usePlaylists()
  const [query, setQuery] = useState('')
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState(null)
  const [added, setAdded] = useState({})

  useEffect(() => {
    if (q.trim().length < 3) {
      setResults([])
      setSearching(false)
      return
    }
    setSearching(true)
    setError(null)
    const t = setTimeout(async () => {
      try {
        const res = await searchAll(q.trim(), ['soundcloud', 'youtube'], 6)
        setResults(res.results)
        if (res.errors) setError(Object.keys(res.errors).map((s) => SOURCE_LABELS[s]).join(' and ') + ' temporarily unavailable')
      } catch (err) {
        setResults([])
        setError(err.message)
      } finally {
        setSearching(false)
      }
    }, 350)
    return () => clearTimeout(t)
  }, [q])

  const add = async (r) => {
    await addSong(playlistId, {
      title: r.title,
      artist: r.artist,
      album: SOURCE_LABELS[r.source],
      source: r.source,
      url: r.url,
    })
    setAdded((a) => ({ ...a, [r.id]: true }))
  }

  return (
    <Modal title="Add songs" onClose={onClose} wide>
      <div className="relative">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#777" strokeWidth="2.5" className="absolute left-3 top-1/2 -translate-y-1/2">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
        <input
          className="w-full rounded-full bg-[#2a2a2a] py-2 pl-9 pr-3 text-sm text-white outline-none placeholder:text-[#777] focus:ring-2 focus:ring-spotify"
          placeholder="Search to add songs"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && setQ(query)}
          autoFocus
        />
      </div>

      {q && searching && <p className="mt-4 text-center text-[13px] text-[#b3b3b3]">Searching…</p>}
      {q && !searching && error && <p className="mt-4 text-center text-[13px] text-[#b3b3b3]">{error}</p>}
      {q && !searching && !error && results.length === 0 && <p className="mt-4 text-center text-[13px] text-[#b3b3b3]">No results for “{q}”</p>}

      <div className="mt-3 flex flex-col gap-1">
        {results.map((r) => (
          <div key={r.id} className="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 transition hover:bg-white/10" onClick={() => !added[r.id] && add(r)}>
            <div className="flex min-w-0 items-center gap-3">
              <span className="h-10 w-10 shrink-0 rounded" style={{ background: `hsl(${(r.title.length * 47) % 360}, 45%, 35%)` }} />
              <div className="min-w-0">
                <p className="truncate text-[14px] font-semibold">{r.title}</p>
                <p className="truncate text-[12px] text-[#b3b3b3]">{r.artist || '–'}</p>
              </div>
            </div>
            {added[r.id] ? (
              <span className="shrink-0 text-[13px] font-bold text-spotify">Added</span>
            ) : (
              <span className="shrink-0 text-[#b3b3b3] transition hover:text-white"><PlusIcon /></span>
            )}
          </div>
        ))}
      </div>
    </Modal>
  )
}