import React from 'react'
import { songs as defaultSongs } from '../data.js'
import { PlayFilledIcon, HeartIcon, MoreIcon, ClockIcon } from './Icons.jsx'
import { usePlayer } from '../store/PlayerContext.jsx'
import { useAuth } from '../store/AuthContext.jsx'
import { usePlaylists } from '../store/PlaylistsContext.jsx'

const LIKE_COLORS = ['#503750', '#e8115b', '#148a08', '#246bc4', '#8e66ac', '#ba5d07']

export default function PlaylistPage({ playlist, onBack }) {
  const { playQueue } = usePlayer()
  const { user } = useAuth()
  const { remove, create } = usePlaylists()

  const isOwned = !!user && !!playlist.id && !!playlist.createdAt
  const tracklist =
    playlist.songs && playlist.songs.length
      ? playlist.songs
      : defaultSongs

  const saveToLibrary = async () => {
    if (!user) return
    const color = LIKE_COLORS[playlist.id % LIKE_COLORS.length]
    const songs =
      playlist.songs && playlist.songs.length
        ? playlist.songs
        : defaultSongs.map((s) => ({ title: s.title, artist: s.artist, album: s.album }))
    await create({
      name: playlist.name,
      color,
      desc: playlist.desc || 'My playlist',
      songs,
    })
    alert(`Saved "${playlist.name}" to your library`)
  }

  return (
    <div className="min-w-0 px-4 md:px-6">
      <div
        className="-mx-4 px-4 pb-5 pt-2 md:-mx-6 md:px-6"
        style={{ background: `linear-gradient(180deg, ${playlist.color}AA, #121212 85%)` }}
      >
        <button className="mb-4 flex items-center gap-1 text-white transition hover:-translate-x-0.5" onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ transform: 'rotate(180deg)' }}>
            <path d="M12 3v12.2l4.6-4.6 1.4 1.4-7 7-7-7 1.4-1.4 4.6 4.6V3z" />
          </svg>
        </button>

        <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
          <div
            className="flex h-40 w-40 shrink-0 items-center justify-center rounded shadow-[0_16px_32px_rgba(0,0,0,0.5)] sm:h-48 sm:w-48"
            style={{ background: playlist.color }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="#000">
              <path d="M7.05 3.606l13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="mb-2 text-[13px] font-semibold">{isOwned ? 'Your Playlist' : 'Public Playlist'}</p>
            <h1 className="mb-3 text-5xl font-black leading-none tracking-tighter md:text-[72px]">{playlist.name}</h1>
            {playlist.desc && <p className="mb-2 text-[15px] text-white/85">{playlist.desc}</p>}
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

        {user && isOwned && playlist.name !== 'Liked Songs' && (
          <button
            className="text-[13px] font-bold text-[#b3b3b3] transition hover:scale-[1.04] hover:text-[#ff4d4d]"
            onClick={() => {
              if (confirm(`Delete "${playlist.name}"?`)) {
                remove(playlist.id)
                onBack()
              }
            }}
          >
            Delete playlist
          </button>
        )}
      </div>

      <div className="mt-4">
        <div className="grid grid-cols-[32px_1fr_84px] items-center gap-2 px-3 pb-2.5 text-[13px] font-semibold text-[#b3b3b3] md:grid-cols-[32px_1fr_3fr_60px] md:gap-3">
          <span className="text-left md:text-right">#</span>
          <span>Title</span>
          <span className="hidden md:block">Album</span>
          <span className="hidden justify-self-end md:block">
            <ClockIcon />
          </span>
        </div>

        {tracklist.length === 0 && (
          <p className="px-3 py-6 text-center text-[14px] text-[#b3b3b3]">
            No songs yet — hit the play button or heart a track.
          </p>
        )}

        {tracklist.map((t, i) => (
          <div
            key={`${t.title}-${i}`}
            className="group grid cursor-pointer grid-cols-[32px_1fr_84px] items-center gap-2 rounded px-3 py-2 transition hover:bg-white/10 md:grid-cols-[32px_1fr_3fr_60px] md:gap-3"
            onClick={() => playQueue(tracklist, i)}
          >
            <span className="text-right text-sm text-[#b3b3b3]">{i + 1}</span>
            <span className="flex min-w-0 items-center gap-3">
              <span className="h-10 w-10 shrink-0 rounded" style={{ background: `hsl(${(i * 47 + 200) % 360}, 45%, 35%)` }} />
              <strong className="truncate">{t.title}</strong>
            </span>
            <span className="truncate text-[#b3b3b3]">{t.album || t.artist || 'Album'}</span>
            <span className="hidden justify-self-end text-sm text-[#b3b3b3] md:block">–</span>
          </div>
        ))}
      </div>
    </div>
  )
}