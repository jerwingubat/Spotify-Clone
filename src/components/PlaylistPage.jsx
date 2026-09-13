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
    <div className="page">
      <div className="playlist">
        <div
          className="playlist__header"
          style={{ background: `linear-gradient(180deg, ${playlist.color}AA, #121212 85%)` }}
        >
          <button className="back-btn" onClick={onBack} style={{ color: '#fff' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ transform: 'rotate(180deg)' }}>
              <path d="M12 3v12.2l4.6-4.6 1.4 1.4-7 7-7-7 1.4-1.4 4.6 4.6V3z" />
            </svg>
          </button>

          <div className="playlist__hero">
            <div className="playlist__cover" style={{ background: playlist.color }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="#000">
                <path d="M7.05 3.606l13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z" />
              </svg>
            </div>
            <div>
              <p className="playlist__type">{isOwned ? 'Your Playlist' : 'Public Playlist'}</p>
              <h1 className="playlist__name">{playlist.name}</h1>
              <p className="playlist__desc">{playlist.desc}</p>
              <p className="playlist__meta">
                <strong>{user?.displayName || 'Spotify'}</strong> • {tracklist.length} songs
              </p>
            </div>
          </div>
        </div>

        <div className="playlist__controls">
          <button
            className="big-play"
            onClick={() => playQueue(tracklist, 0)}
            title="Play"
          >
            <PlayFilledIcon size={28} />
          </button>
          <HeartIcon />
          <MoreIcon />

          {user && !isOwned && (
            <button className="text-btn" onClick={saveToLibrary}>
              Save to your library
            </button>
          )}

          {user && isOwned && playlist.name !== 'Liked Songs' && (
            <button
              className="text-btn text-btn--danger"
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

        <div className="playlist__tracks">
          <div className="table table--tracks">
            <div className="table__head">
              <span className="col-rank">#</span>
              <span className="col-main">Title</span>
              <span className="col-artist">Album</span>
              <span className="col-dur"><ClockIcon /></span>
            </div>
            {tracklist.length === 0 && (
              <p className="empty-state">No songs yet — hit the play button or heart a track.</p>
            )}
            {tracklist.map((t, i) => (
              <div className="table__row" key={`${t.title}-${i}`} onClick={() => playQueue(tracklist, i)}>
                <span className="col-rank">{i + 1}</span>
                <span className="col-main">
                  <span className="minicover" style={{ background: `hsl(${(i * 47 + 200) % 360}, 45%, 35%)` }} />
                  <strong>{t.title}</strong>
                </span>
                <span className="col-artist">{t.album || t.artist || 'Album'}</span>
                <span className="col-dur">–</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}