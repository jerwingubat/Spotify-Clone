import React, { useState } from 'react'
import {
  ShuffleIcon,
  SkipBackIcon,
  PlayFilledIcon,
  SkipForwardIcon,
  RepeatIcon,
  VolumeIcon,
} from './Icons.jsx'
import { usePlayer } from '../store/PlayerContext.jsx'
import { useAuth } from '../store/AuthContext.jsx'
import { usePlaylists } from '../store/PlaylistsContext.jsx'

function format(sec) {
  if (!Number.isFinite(sec)) return '0:00'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function Player() {
  const {
    track, playing, progress, duration, volume,
    loading, error, togglePlay, seek, next, prev, setVol, clearError,
  } = usePlayer()
  const { user, signIn } = useAuth()
  const { likeSong, unlikeSong, isLiked } = usePlaylists()

  const [shuffle, setShuffle] = useState(false)
  const [repeat, setRepeat] = useState(false)

  const liked = user ? isLiked(track) : false

  const toggleLike = () => {
    if (!user) return signIn()
    if (liked) unlikeSong(track)
    else likeSong(track)
  }

  const pct = duration ? (progress / duration) * 100 : 0

  return (
    <footer className="player">
      <div className="player__track">
        <div className="player__cover" style={{ background: 'linear-gradient(135deg,#dc148c,#503750)' }} />
        <div className="player__meta">
          <p className="player__song">{track.title}</p>
          <p className="player__artist">{error ? <span className="player__error">{error}</span> : track.artist}</p>
        </div>
        <button className={`player__heart ${liked ? 'is-liked' : ''}`} onClick={toggleLike} title={liked ? 'Remove from Liked Songs' : 'Save to Liked Songs'}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill={liked ? '#1ed760' : 'none'} stroke={liked ? 'none' : '#b3b3b3'} strokeWidth="1.5">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      <div className="player__center">
        <div className="player__controls">
          <button className={`player__btn ${shuffle ? 'is-active' : ''}`} onClick={() => setShuffle((s) => !s)} title="Shuffle">
            <ShuffleIcon />
          </button>
          <button className="player__btn" onClick={() => !loading && prev()} title="Previous">
            <SkipBackIcon />
          </button>
          <button
            className="player__play"
            onClick={togglePlay}
            title={playing ? 'Pause' : 'Play'}
            disabled={loading}
            onMouseDown={() => error && clearError()}
          >
            {loading ? (
              <span className="spinner" />
            ) : playing ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#111">
                <rect x="5" y="4" width="4.5" height="16" rx="1" />
                <rect x="14.5" y="4" width="4.5" height="16" rx="1" />
              </svg>
            ) : (
              <PlayFilledIcon size={22} />
            )}
          </button>
          <button className="player__btn" onClick={() => !loading && next()} title="Next">
            <SkipForwardIcon />
          </button>
          <button className={`player__btn ${repeat ? 'is-active' : ''}`} onClick={() => setRepeat((r) => !r)} title="Repeat">
            <RepeatIcon />
          </button>
        </div>
        <div className="player__progress">
          <span className="player__time">{format(progress)}</span>
          <label className="bar">
            <input type="range" min="0" max={duration || 1} step="1" value={Math.min(progress, duration || 0)} onChange={(e) => seek(+e.target.value)} />
            <span className="bar__fill" style={{ width: `${pct}%` }} />
          </label>
          <span className="player__time">{format(duration)}</span>
        </div>
      </div>

      <div className="player__right">
        <button className="player__btn">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M11.196 8 6 5v6l5.196-3z" />
          </svg>
        </button>
        <button className="player__btn">
          <VolumeIcon />
        </button>
        <label className="bar bar--volume">
          <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => setVol(+e.target.value)} />
          <span className="bar__fill" style={{ width: `${volume * 100}%` }} />
        </label>
      </div>
    </footer>
  )
}