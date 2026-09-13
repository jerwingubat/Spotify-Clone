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

  return (
    <aside className="sidebar">
      <nav className="sidebar__nav">
        <button className="sidebar__nav-item" onClick={() => setView('home')}>
          <span className="sidebar__logo">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="#1ed760">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
            <strong>Spotify</strong>
          </span>
        </button>

        <button className={`sidebar__nav-item ${view === 'home' ? 'is-active' : ''}`} onClick={() => setView('home')}>
          <HomeIcon />
          <span>Home</span>
        </button>
        <button className={`sidebar__nav-item ${view === 'search' ? 'is-active' : ''}`} onClick={() => setView('search')}>
          <SearchIcon />
          <span>Search</span>
        </button>
      </nav>

      <section className="lib">
        <header className="lib__header">
          <button
            className={`sidebar__nav-item ${view === 'library' ? 'is-active' : ''}`}
            onClick={() => {
              if (user) setView('library')
              else signIn()
            }}
          >
            <LibraryIcon />
            <span>Your Library</span>
          </button>
          <button
            className="icon-btn"
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
          <form className="lib__create" onSubmit={submitCreate}>
            <input
              autoFocus
              placeholder="New playlist name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button type="submit">Create</button>
          </form>
        )}

        <div className="lib__chips">
          <button className="chip">Playlists</button>
          <button className="chip">Artists</button>
          <button className="chip">Albums</button>
        </div>

        <div className="lib__search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <input
            className="lib__search-input"
            placeholder="Search in your library"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>

        <div className="lib__list">
          {filtered.map((p) => (
            <button
              key={p.id}
              className="lib__item"
              onClick={() => {
                setSelectedPlaylist(p)
                setView('playlist')
              }}
            >
              <span className="lib__item-cover" style={{ background: p.color }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#000">
                  <path d="M7.05 3.606l13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z" />
                </svg>
              </span>
              <span className="lib__item-body">
                <strong className="lib__item-name">{p.name}</strong>
                <span className="lib__item-sub">
                  {isUserLibrary ? 'Playlist • In your library' : 'Playlist'} <span className="dot">•</span>{' '}
                  {(p.desc || '').slice(0, 26)}
                </span>
              </span>
            </button>
          ))}
          {!user && (
            <button className="lib__signin-hint" onClick={signIn}>
              Sign in to save playlists
            </button>
          )}
        </div>
      </section>
    </aside>
  )
}