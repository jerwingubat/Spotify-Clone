import React, { useState } from 'react'
import { HomeIcon, SearchIcon, LibraryIcon, PlusIcon } from './Icons.jsx'
import { useAuth } from '../store/AuthContext.jsx'
import { usePlaylists } from '../store/PlaylistsContext.jsx'

export default function MobileMenu({ open, onClose, view, setView, library, isUserLibrary, setSelectedPlaylist }) {
  const { user, signIn } = useAuth()
  const { create } = usePlaylists()
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')

  const go = (next) => {
    setView(next)
    onClose()
  }

  const goPlaylist = (p) => {
    setSelectedPlaylist(p)
    onClose()
  }

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
    <div className={`fixed inset-0 z-40 md:hidden ${open ? '' : 'pointer-events-none'}`}>
      <div
        className={`absolute inset-0 bg-black/60 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      <aside
        className={`absolute bottom-0 left-0 top-0 flex w-[300px] max-w-[85vw] flex-col gap-2 bg-[#000] p-2 shadow-[16px_0_48px_rgba(0,0,0,0.7)] transition-transform duration-200 ${open ? 'translate-x-0' : '-translate-x-full'}`}
        aria-hidden={!open}
      >
        <nav className="shrink-0 rounded-lg bg-panel p-2">
          <button className="logo flex w-full items-center gap-2 px-1.5 pb-5 pt-1.5" onClick={() => go('home')}>
            <img src="/spotibai.png" alt="Spotibai" width="26" height="26" className="rounded-md" />
            <strong className="text-[24px] font-bold leading-none">Spotibai</strong>
          </button>

          <button className={navCls(view === 'home')} onClick={() => go('home')}>
            <HomeIcon />
            <span>Home</span>
          </button>
          <button className={navCls(view === 'search')} onClick={() => go('search')}>
            <SearchIcon />
            <span>Search</span>
          </button>
        </nav>

        <section className="flex min-h-0 flex-1 flex-col rounded-lg bg-panel p-2">
          <header className="flex shrink-0 items-center justify-between pr-1">
            <button
              className={navCls(view === 'library')}
              onClick={() => {
                if (user) go('library')
                else {
                  signIn()
                  onClose()
                }
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
              <button type="submit" className="rounded bg-spotify px-3 py-2 text-[13px] font-bold text-black">
                Create
              </button>
            </form>
          )}

          <div className="flex-1 overflow-y-auto pb-1">
            {library.map((p) => (
              <button
                key={p.id}
                className="flex w-full items-center gap-3 rounded p-2 text-left transition hover:bg-[#1a1a1a]"
                onClick={() => goPlaylist(p)}
              >
                <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded" style={{ background: p.color }}>
                  {p.img && <img src={p.img} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff" className="relative drop-shadow">
                    <path d="M7.05 3.606l13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z" />
                  </svg>
                </span>
                <span className="min-w-0">
                  <strong className="block truncate text-[15px] font-bold">{p.name}</strong>
                  <span className="block truncate text-[13px] text-[#b3b3b3]">
                    Playlist <span className="inline-block px-1">•</span> {(p.desc || '').slice(0, 26)}
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

          {!user && (
            <button
              className="shrink-0 rounded-full bg-white px-5 py-2.5 text-[15px] font-bold text-black transition hover:scale-[1.04]"
              onClick={signIn}
            >
              Sign in with Google
            </button>
          )}
        </section>
      </aside>
    </div>
  )
}