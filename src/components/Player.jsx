import React, { useState } from 'react'
import {
  ShuffleIcon,
  SkipBackIcon,
  PlayFilledIcon,
  SkipForwardIcon,
  RepeatIcon,
  VolumeIcon,
  PlusIcon,
} from './Icons.jsx'
import { usePlayer } from '../store/PlayerContext.jsx'
import { useAuth } from '../store/AuthContext.jsx'
import { usePlaylists } from '../store/PlaylistsContext.jsx'
import { AddToPlaylistModal } from './PlaylistModals.jsx'

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
  const [addOpen, setAddOpen] = useState(false)

  const liked = user ? isLiked(track) : false
  const pct = duration ? (progress / duration) * 100 : 0

  const toggleLike = () => {
    if (!user) return signIn()
    if (liked) unlikeSong(track)
    else likeSong(track)
  }

  const btnCls = (active) =>
    `flex items-center justify-center text-[#b3b3b3] transition hover:text-white ${
      active ? 'text-spotify hover:text-spotify' : ''
    }`

  return (
    <footer className="player relative grid min-h-[58px] grid-cols-[minmax(0,1fr)_minmax(0,auto)] items-center gap-3 rounded-lg bg-panel px-3 py-2 md:min-h-0 md:grid-cols-[minmax(0,30%)_minmax(0,1fr)_minmax(0,30%)] md:gap-4 md:px-4">
      {/* Mobile: thin progress strip pinned to the top of the bar */}
      <div className="absolute -top-[5px] left-2 right-2 md:hidden">
        <label className="bar">
          <input
            type="range"
            min="0"
            max={duration || 1}
            step="1"
            value={Math.min(progress, duration || 0)}
            onChange={(e) => seek(+e.target.value)}
            onMouseDown={() => error && clearError()}
          />
          <span className="bar__fill" style={{ width: `${pct}%` }} />
        </label>
      </div>

      {/* Left: track info */}
      <div className="flex min-w-0 items-center gap-3">
        <div
          className="h-12 w-12 shrink-0 rounded shadow-[0_4px_16px_rgba(0,0,0,0.4)] md:h-14 md:w-14"
          style={{ background: 'linear-gradient(135deg,#dc148c,#503750)', backgroundSize: 'cover' }}
        />
        <div className="min-w-0">
          <p className="truncate text-[14px] font-semibold leading-tight">{track.title}</p>
          <p className="truncate text-[12px] text-[#b3b3b3]">
            {error ? <span className="text-red-400">{error}</span> : track.artist}
          </p>
        </div>
        <button
          className={`hidden shrink-0 transition hover:text-white md:flex ${liked ? 'text-spotify hover:text-spotify' : 'text-[#b3b3b3]'}`}
          onClick={toggleLike}
          title={liked ? 'Remove from Liked Songs' : 'Save to Liked Songs'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={liked ? '#1ed760' : 'none'} stroke={liked ? 'none' : '#b3b3b3'} strokeWidth="1.5">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
        <button
          className="flex shrink-0 items-center justify-center text-[#b3b3b3] transition hover:text-white"
          onClick={() => setAddOpen(true)}
          title="Add to playlist"
        >
          <PlusIcon />
        </button>
      </div>

      {/* Center: controls + progress (desktop) */}
      <div className="hidden flex-col items-center gap-2 md:flex">
        <div className="flex items-center gap-6">
          <button className={btnCls(shuffle)} onClick={() => setShuffle((s) => !s)} title="Shuffle">
            <ShuffleIcon />
          </button>
          <button className={btnCls(false)} onClick={() => !loading && prev()} title="Previous">
            <SkipBackIcon />
          </button>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black transition hover:scale-105 disabled:opacity-60"
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
          <button className={btnCls(false)} onClick={() => !loading && next()} title="Next">
            <SkipForwardIcon />
          </button>
          <button className={btnCls(repeat)} onClick={() => setRepeat((r) => !r)} title="Repeat">
            <RepeatIcon />
          </button>
        </div>

        <div className="flex w-full max-w-[560px] items-center gap-2">
          <span className="w-[34px] text-center text-[11px] text-[#b3b3b3]">{format(progress)}</span>
          <label className="bar">
            <input
              type="range"
              min="0"
              max={duration || 1}
              step="1"
              value={Math.min(progress, duration || 0)}
              onChange={(e) => seek(+e.target.value)}
            />
            <span className="bar__fill" style={{ width: `${pct}%` }} />
          </label>
          <span className="w-[34px] text-center text-[11px] text-[#b3b3b3]">{format(duration)}</span>
        </div>
      </div>

      {/* Right: volume (desktop) */}
      <div className="hidden items-center justify-end gap-4 lg:flex">
        <VolumeIcon />
        <label className="bar w-[110px] flex-none">
          <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => setVol(+e.target.value)} />
          <span className="bar__fill" style={{ width: `${volume * 100}%` }} />
        </label>
      </div>

      {/* Mobile: play controls */}
      <div className="flex items-center justify-end gap-3 md:hidden">
        <button className={btnCls(false)} onClick={() => !loading && prev()} title="Previous">
          <SkipBackIcon />
        </button>
        <button
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black transition hover:scale-105 disabled:opacity-60"
          onClick={togglePlay}
          title={playing ? 'Pause' : 'Play'}
          disabled={loading}
        >
          {loading ? <span className="spinner" /> : playing ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#111">
              <rect x="5" y="4" width="4.5" height="16" rx="1" />
              <rect x="14.5" y="4" width="4.5" height="16" rx="1" />
            </svg>
          ) : (
            <PlayFilledIcon size={20} />
          )}
        </button>
        <button className={btnCls(false)} onClick={() => !loading && next()} title="Next">
          <SkipForwardIcon />
        </button>
      </div>

      {addOpen && <AddToPlaylistModal song={track} onClose={() => setAddOpen(false)} />}
    </footer>
  )
}