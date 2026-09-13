import React from 'react'
import { playlists, charts, songs } from '../data.js'
import { PlayFilledIcon, ClockIcon } from './Icons.jsx'
import { usePlayer } from '../store/PlayerContext.jsx'
import { useAuth } from '../store/AuthContext.jsx'

function SectionHeader({ title, link }) {
  return (
    <div className="section-header">
      <h2>{title}</h2>
      {link && <a href="#">Show all</a>}
    </div>
  )
}

function PlaylistCard({ playlist, onOpen, onPlay }) {
  const track = (playlist.songs && playlist.songs[0]) || songs[0]
  return (
    <div className="card" onClick={() => onOpen(playlist)}>
      <div className="card__cover" style={{ background: playlist.color }}>
        <span
          className="card__play"
          onClick={(e) => {
            e.stopPropagation()
            onPlay(track)
          }}
        >
          <PlayFilledIcon size={24} />
        </span>
      </div>
      <div className="card__body">
        <p className="card__title">{playlist.name}</p>
        <p className="card__subtitle">{playlist.desc}</p>
      </div>
    </div>
  )
}

export default function HomePage({ onOpenPlaylist }) {
  const { play } = usePlayer()
  const { user } = useAuth()
  const first = user?.displayName?.split(' ')[0]

  return (
    <div className="page">
      <div className="section">
        <SectionHeader title={first ? `Good evening, ${first}` : 'Good evening'} />
        <div className="grid grid--greeting">
          {playlists.slice(0, 6).map((p) => (
            <button key={p.id} className="greeting-card" onClick={() => onOpenPlaylist(p)}>
              <span className="greeting-card__cover" style={{ background: p.color }}>
                <span
                  className="greeting-card__play"
                  onClick={(e) => {
                    e.stopPropagation()
                    play(songs[0])
                  }}
                >
                  <PlayFilledIcon size={20} />
                </span>
              </span>
              <span>{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="section">
        <SectionHeader title="Made for you" link />
        <div className="grid">
          {playlists.slice(0, 5).map((p) => (
            <PlaylistCard key={p.id} playlist={p} onOpen={onOpenPlaylist} onPlay={(t) => play(t)} />
          ))}
        </div>
      </div>

      <div className="section">
        <SectionHeader title="Spotify Playlists" link />
        <div className="grid">
          {playlists.slice(5, 11).map((p) => (
            <PlaylistCard key={p.id} playlist={p} onOpen={onOpenPlaylist} onPlay={(t) => play(t)} />
          ))}
        </div>
      </div>

      <div className="section">
        <SectionHeader title="Featured Charts" link />
        <div className="chart-card">
          <div className="chart-card__header">
            <div className="chart-card__cover" style={{ background: 'linear-gradient(135deg,#dc148c,#5f9ea0)' }}>
              <span>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="#111">
                  <path d="M2 12l20-10-12 18v-8z" />
                </svg>
                Spotify
              </span>
            </div>
            <div>
              <p className="chart-card__label">Spotify Charts</p>
              <h3>The Global Top 50</h3>
              <p className="chart-card__sub">The top tracks from around the world this week</p>
            </div>
          </div>
          <div className="table">
            <div className="table__head">
              <span className="col-rank">#</span>
              <span className="col-main">Title</span>
              <span className="col-artist">Artist</span>
              <span className="col-plays">Streams</span>
              <span className="col-dur">Duration</span>
            </div>
            {charts.map((c, i) => (
              <div className="table__row" key={c.rank} onClick={() => play(songs[i])}>
                <span className="col-rank">{c.rank}</span>
                <span className="col-main">
                  <span className="minicover" style={{ background: c.rank === 1 ? 'linear-gradient(135deg,#e8115b,#148a08)' : '#222' }} />
                  <strong>{c.title}</strong>
                </span>
                <span className="col-artist">{c.artist}</span>
                <span className="col-plays">{c.plays}</span>
                <span className="col-dur">3:05</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}