import React, { useState } from 'react'
import { songs as defaultSongs } from '../data.js'
import { PlayFilledIcon, HeartIcon, MoreIcon, ClockIcon, CrossIcon } from './Icons.jsx'
import { usePlayer } from '../store/PlayerContext.jsx'
import { useAuth } from '../store/AuthContext.jsx'
import { usePlaylists } from '../store/PlaylistsContext.jsx'
import { EditPlaylistModal, AddSongsModal } from './PlaylistModals.jsx'

const LIKE_COLORS = ['#503750', '#e8115b', '#148a08', '#246bc4', '#8e66ac', '#ba5d07']

export default function PlaylistPage({ playlist, onBack }) {
  const { playQueue } = usePlayer()
  const { user } = useAuth()
  const { playlists, remove, create, removeSong } = usePlaylists()
  const [editing, setEditing] = useState(false)
  const [adding, setAdding] = useState(false)

  const livePlaylist =
    (playlist.id && playlists.find((p) => p.id === playlist.id)) || playlist
  const isOwned = !!user && !!livePlaylist.id && !!livePlaylist.createdAt
  const tracklist = Array.isArray(livePlaylist.songs) ? livePlaylist.songs : defaultSongs

  const saveToLibrary = async () => {
    if (!user) return
    const color = LIKE_COLORS[livePlaylist.id % LIKE_COLORS.length]
    const songs = Array.isArray(livePlaylist.songs)
      ? livePlaylist.songs.map((s) => ({ title: s.title, artist: s.artist, album: s.album }))
      : defaultSongs.map((s) => ({ title: s.title, artist: s.artist, album: s.album }))
    await create({
      name: livePlaylist.name,
      color,
      desc: livePlaylist.desc || 'My playlist',
      songs,
    })
    alert(`Saved "${livePlaylist.name}" to your library`)
  }

  return (
    <div className="min-w-0 px-4 md:px-6">
      <div
        className="-mx-4 px-4 pb-5 pt-2 md:-mx-6 md:px-6"
        style={{ background: `linear-gradient(180deg, ${livePlaylist.color}AA, #121212 85%)` }}
      >
        <button className="mb-4 flex items-center gap-1 text-white transition hover:-translate-x-0.5" onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ transform: 'rotate(180deg)' }}>
            <path d="M12 3v12.2l4.6-4.6 1.4 1.4-7 7-7-7 1.4-1.4 4.6 4.6V3z" />
          </svg>
        </button>

        <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
          <div
            className="relative flex h-40 w-40 shrink-0 items-center justify-center overflow-hidden rounded shadow-[0_16px_32px_rgba(0,0,0,0.5)] sm:h-48 sm:w-48"
            style={{ background: livePlaylist.color }}
          >
            {livePlaylist.img && (
              <img src={livePlaylist.img} alt="" className="absolute inset-0 h-full w-full object-cover" />
            )}
            <svg width="40" height="40" viewBox="0 0 24 24" fill="#000" className="drop-shadow-lg">
              <path d="M7.05 3.606l13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="mb-2 text-[13px] font-semibold">{isOwned ? 'Your Playlist' : 'Public Playlist'}</p>
            <h1 className="mb-3 text-5xl font-black leading-none tracking-tighter md:text-[72px]">{livePlaylist.name}</h1>
            {livePlaylist.desc && <p className="mb-2 text-[15px] text-white/85">{livePlaylist.desc}</p>}
            <p className="text-[13px] text-[#b3b3b3]">
              <strong className="text-white">{user?.displayName || 'Spotibai'}</strong> • {tracklist.length} songs
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-5 px-1">
        <button
          className="flex h-14 w-14 items-center justify-center rounded-full bg-spotify transition hover:scale-105 active:scale-100"
          onClick={() => playQueue(tracklist, 0)}
          title="Play"
        >
          <PlayFilledIcon size={28} />
        </button>
        <HeartIcon />
        <MoreIcon />

        {user && !isOwned && (
          <button
            className="text-[13px] font-bold text-[#b3b3b3] transition hover:scale-[1.04] hover:text-white"
            onClick={saveToLibrary}
          >
            Save to your library
          </button>
        )}

        {user && isOwned && livePlaylist.name !== 'Liked Songs' && (
          <>
            <button
              className="text-[13px] font-bold text-[#b3b3b3] transition hover:scale-[1.04] hover:text-white"
              onClick={() => setEditing(true)}
            >
              Edit details
            </button>
            <button
              className="text-[13px] font-bold text-[#b3b3b3] transition hover:scale-[1.04] hover:text-white"
              onClick={() => setAdding(true)}
            >
              Add songs
            </button>
            <button
              className="text-[13px] font-bold text-[#b3b3b3] transition hover:scale-[1.04] hover:text-[#ff4d4d]"
              onClick={() => {
                if (confirm(`Delete "${livePlaylist.name}"?`)) {
                  remove(livePlaylist.id)
                  onBack()
                }
              }}
            >
              Delete playlist
            </button>
          </>
        )}
      </div>

      <div className="mt-4">
        <div className="grid grid-cols-[24px_1fr_28px] items-center gap-2 px-3 pb-2.5 text-[13px] font-semibold text-[#b3b3b3] sm:grid-cols-[24px_1fr_3fr_60px] sm:gap-3">
          <span className="text-left sm:text-right">#</span>
          <span>Title</span>
          <span className="hidden sm:block">Album</span>
          <span className="hidden justify-self-end sm:block">
            <ClockIcon />
          </span>
        </div>

        {tracklist.length === 0 && (
          <p className="px-3 py-6 text-center text-[14px] text-[#b3b3b3]">
            No songs yet — add some with “Add songs”.
          </p>
        )}

        {tracklist.map((t, i) => (
          <div
            key={`${t.title}-${i}`}
            className="group grid cursor-pointer grid-cols-[24px_1fr_28px] items-center gap-2 rounded px-3 py-2 transition hover:bg-white/10 sm:grid-cols-[24px_1fr_3fr_60px] sm:gap-3"
            onClick={() => playQueue(tracklist, i)}
          >
            <span className="text-right text-sm text-[#b3b3b3]">{i + 1}</span>
            <span className="flex min-w-0 items-center gap-3">
              <span className="relative block h-10 w-10 shrink-0 overflow-hidden rounded" style={{ background: `hsl(${(i * 47 + 200) % 360}, 45%, 35%)` }}>
                {t.img && <img src={t.img} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />}
              </span>
              <div className="min-w-0">
                <strong className="truncate">{t.title}</strong>
                <span className="block truncate text-[12px] text-[#b3b3b3] sm:hidden">{t.album || t.artist || 'Album'}</span>
              </div>
            </span>
            <span className="hidden truncate text-[#b3b3b3] sm:block">{t.album || t.artist || 'Album'}</span>
            <span className="flex justify-end sm:block">
              {isOwned ? (
                <button
                  className="flex h-6 w-6 items-center justify-center rounded-full text-[#b3b3b3] transition hover:bg-white/15 hover:text-white sm:opacity-0 sm:group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (confirm(`Remove "${t.title}"?`)) removeSong(livePlaylist.id, t.title)
                  }}
                  title="Remove from playlist"
                >
                  <CrossIcon size={12} />
                </button>
              ) : (
                <span className="hidden text-sm text-[#b3b3b3] sm:block">–</span>
              )}
            </span>
          </div>
        ))}
      </div>

      {editing && <EditPlaylistModal playlist={livePlaylist} onClose={() => setEditing(false)} />}
      {adding && <AddSongsModal playlistId={livePlaylist.id} onClose={() => setAdding(false)} />}
    </div>
  )
}