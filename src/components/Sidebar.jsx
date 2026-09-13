import React, { useState } from 'react'
import { HomeIcon, SearchIcon, LibraryIcon, PlusIcon } from './Icons.jsx'
import { useAuth } from '../store/AuthContext.jsx'
import { usePlaylists } from '../store/PlaylistsContext.jsx'

export default function Sidebar({ view, setView, library, isUserLibrary, setSelectedPlaylist }) {
  const { user, signIn } = useAuth()
  const { create } = usePlaylists()
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [filter, setFilter] = useState('')

  const filtered = library.filter(
    (p) =>
      p.name.toLowerCase().includes(filter.toLowerCase()) ||
      (p.desc || '').toLowerCase().includes(filter.toLowerCase()),
  )

  const submitCreate = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    await create({ name: name.trim(), color: '#148a08', desc: 'My playlist' })
    setName('')
    setCreating(false)
  }

  const navCls = (active) =>
    `flex w-full items-center gap-4 rounded px-3 py-2.5 text-[15px] font-bold transition-colors ${
      active ? 'text-white' : 'text-[#b3b3b3] hover:text-white'
    }`

  return (
    <aside className="sidebar flex min-h-0 flex-col gap-2">
      <nav className="shrink-0 rounded-lg bg-panel p-2 pb-1.5">
        <button className="logo flex w-full items-center gap-2 px-1.5 pb-5 pt-1.5" onClick={() => setView('home')}>
          <img src="/spotibai.png" alt="Spotibai" width="26" height="26" className="rounded-md" />
          <strong className="text-[24px] font-bold leading-none">Spotibai</strong>
        </button>

        <button className={navCls(view === 'home')} onClick={() => setView('home')}>
          <HomeIcon />
          <span>Home</span>
        </button>
        <button className={navCls(view === 'search')} onClick={() => setView('search')}>
          <SearchIcon />
          <span>Search</span>
        </button>
      </nav>

      <section className="flex min-h-0 flex-1 flex-col rounded-lg bg-panel p-2">
        <header className="flex shrink-0 items-center justify-between pr-1">
          <button
            className={navCls(view === 'library')}
            onClick={() => {
              if (user) setView('library')
              else signIn()
            }}
          >
            <LibraryIcon />
            <span>Your Library</span>
          </button>
          <button
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#b3b3b3] transition hover:bg-white/10 hover:text-white"
            title="Create playlist"
            onClick={() => {
              if (!user) return signIn()
              setCreating((c) => !c)
            }}
          >
            <PlusIcon />
          </button>
        </header>

        {creating && (
          <form className="flex shrink-0 gap-2 px-2 pb-2" onSubmit={submitCreate}>
            <input
              autoFocus
              placeholder="New playlist name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="min-w-0 flex-1 rounded border border-white/20 bg-[#232323] px-2.5 py-2 text-[13px] text-white outline-none focus:border-spotify"
            />
            <button
              type="submit"
              className="rounded bg-spotify px-3 py-2 text-[13px] font-bold text-black"
            >
              Create
            </button>
          </form>
        )}

        <div className="flex shrink-0 flex-wrap gap-2 py-2">
          <button className="rounded-full bg-[#232323] px-3 py-1.5 text-[13px] font-semibold transition hover:bg-[#333]">
            Playlists
          </button>
          <button className="rounded-full bg-[#232323] px-3 py-1.5 text-[13px] font-semibold transition hover:bg-[#333]">
            Artists
          </button>
          <button className="rounded-full bg-[#232323] px-3 py-1.5 text-[13px] font-semibold transition hover:bg-[#333]">
            Albums
          </button>
        </div>

        <div className="mb-2 flex shrink-0 items-center gap-2 px-2 text-[#b3b3b3]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <input
            className="w-full bg-transparent text-[14px] text-white outline-none"
            placeholder="Search in your library"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto pb-1">
          {filtered.map((p) => (
            <button
              key={p.id}
              className="flex w-full items-center gap-3 rounded p-2 text-left transition hover:bg-[#1a1a1a]"
              onClick={() => {
                setSelectedPlaylist(p)
                setView('playlist')
              }}
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded" style={{ background: p.color }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#000">
                  <path d="M7.05 3.606l13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z" />
                </svg>
              </span>
              <span className="min-w-0">
                <strong className="block truncate text-[15px] font-bold">{p.name}</strong>
                <span className="block truncate text-[13px] text-[#b3b3b3]">
                  {isUserLibrary ? 'Playlist • In your library' : 'Playlist'} <span className="inline-block px-1">•</span>{' '}
                  {(p.desc || '').slice(0, 26)}
                </span>
              </span>
            </button>
          ))}
          {!user && (
            <button
              className="mx-1 my-2 block w-[calc(100%-8px)] rounded border border-dashed border-white/20 p-3 text-center text-[13px] text-[#b3b3b3] transition hover:border-[#b3b3b3] hover:text-white"
              onClick={signIn}
            >
              Sign in to save playlists
            </button>
          )}
        </div>
      </section>
    </aside>
  )
}