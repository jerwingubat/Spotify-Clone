import React from 'react'
import { ShuffleIcon, SkipBackIcon, PlayFilledIcon, SkipForwardIcon, RepeatIcon, PlusIcon, ExpandIcon, ContractIcon } from './Icons.jsx'
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

export default function NowPlayingCard({ variant = 'card', onFsToggle }) {
  const {
    track, playing, progress, duration, volume,
    loading, error, togglePlay, seek, next, prev, setVol, clearError, fsOpen,
  } = usePlayer()
  const { user, signIn } = useAuth()
  const { likeSong, unlikeSong, isLiked } = usePlaylists()

  const [shuffle, setShuffle] = React.useState(false)
  const [repeat, setRepeat] = React.useState(false)
  const [addOpen, setAddOpen] = React.useState(false)

  const full = variant === 'fullscreen'

  const liked = user ? isLiked(track) : false
  const pct = duration ? (progress / duration) * 100 : 0

  const toggleLike = () => {
    if (!user) return signIn()
    if (liked) unlikeSong(track)
    else likeSong(track)
  }

  const btn = (active) =>
    `flex items-center justify-center text-[#b3b3b3] transition hover:text-white ${
      active ? 'text-spotify hover:text-spotify' : ''
    } ${full ? 'h-10 w-10' : 'h-8 w-8'}`

  return (
    <div
      className={`relative flex flex-col items-center gap-6 rounded-lg bg-panel-elevated p-6 shadow-[0_12px_40px_rgba(0,0,0,0.55)] sm:flex-row sm:gap-8 ${
        full ? 'w-full max-w-3xl' : ''
      }`}
    >
      {onFsToggle && (
        <button
          className={`absolute top-3 right-3 flex items-center justify-center rounded-full bg-black/40 text-[#b3b3b3] transition hover:text-white ${
            full ? 'h-9 w-9' : 'h-8 w-8'
          }`}
          onClick={onFsToggle}
          title={fsOpen ? 'Exit fullscreen' : 'Fullscreen'}
          aria-label={fsOpen ? 'Exit fullscreen' : 'Fullscreen'}
        >
          {fsOpen ? <ContractIcon /> : <ExpandIcon />}
        </button>
      )}

      <div
        className={`relative shrink-0 overflow-hidden rounded-lg shadow-[0_16px_48px_rgba(0,0,0,0.6)] ${
          full ? 'h-64 w-64 sm:h-80 sm:w-80' : 'h-40 w-40 md:h-52 md:w-52'
        }`}
        style={{ background: 'linear-gradient(135deg,#503750,#1f1f1f)' }}
      >
        {track.thumbnail || track.img ? (
          <img src={track.thumbnail || track.img} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-7xl font-black text-black/40">
            {String(track.title || 'S')[0]}
          </div>
        )}
      </div>

      <div className="w-full min-w-0 flex-1 text-center sm:text-left">
        <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.22em] text-spotify">Playing now</p>
        <h3 className={`truncate font-extrabold tracking-tight ${full ? 'text-3xl sm:text-5xl' : 'text-2xl md:text-4xl'}`}>
          {track.title}
        </h3>
        <p className={`mt-1.5 truncate text-[#b3b3b3] ${full ? 'text-base sm:text-lg' : 'text-sm md:text-base'}`}>
          {track.artist}
          {track.source ? <span className="capitalize"> · {track.source}</span> : null}
          {error ? <span className="block text-[12px] font-semibold text-red-400">{error}</span> : null}
        </p>

        <div className={`flex items-center gap-4 ${full ? 'mt-8' : 'mt-6'}`}>
          <span className={`min-w-[34px] text-[#b3b3b3] ${full ? 'text-sm' : 'text-[12px]'}`}>{format(progress)}</span>
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
          <span className={`min-w-[34px] text-[#b3b3b3] ${full ? 'text-sm' : 'text-[12px]'}`}>{format(duration)}</span>
        </div>

        <div className={`flex items-center justify-center gap-6 sm:justify-start ${full ? 'mt-6' : 'mt-6'}`}>
          <button className={btn(shuffle)} onClick={() => setShuffle((s) => !s)} title="Shuffle">
            <ShuffleIcon size={full ? 18 : 14} />
          </button>
          <button className={btn(false)} onClick={() => !loading && prev()} title="Previous">
            <SkipBackIcon size={full ? 22 : 16} />
          </button>
          <button
            className={`flex items-center justify-center rounded-full bg-white text-black transition hover:scale-105 disabled:opacity-60 ${full ? 'h-14 w-14' : 'h-12 w-12'}`}
            onClick={togglePlay}
            title={playing ? 'Pause' : 'Play'}
            disabled={loading}
          >
            {loading ? (
              <span className="spinner" />
            ) : playing ? (
              <svg width={full ? 24 : 20} height={full ? 24 : 20} viewBox="0 0 24 24" fill="#111">
                <rect x="5" y="4" width="4.5" height="16" rx="1" />
                <rect x="14.5" y="4" width="4.5" height="16" rx="1" />
              </svg>
            ) : (
              <PlayFilledIcon size={full ? 28 : 24} />
            )}
          </button>
          <button className={btn(false)} onClick={() => !loading && next()} title="Next">
            <SkipForwardIcon size={full ? 22 : 16} />
          </button>
          <button className={btn(repeat)} onClick={() => setRepeat((r) => !r)} title="Repeat">
            <RepeatIcon size={full ? 18 : 14} />
          </button>
        </div>

        <div className={`flex items-center justify-center gap-4 sm:justify-start ${full ? 'mt-7' : 'mt-6'}`}>
          <label className="flex items-center gap-2 text-[#b3b3b3]">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M9.741.85a.75.75 0 0 0 0 1.5v-1.5zm0 13.8a.75.75 0 0 0 0-1.5v1.5zM6.076 11.402a.75.75 0 0 0-1.049 1.072l1.05-1.072zm7.02-7.164a.75.75 0 1 0-1.03 1.09l1.03-1.09zM6.7 9.7a.75.75 0 0 0 0-1.5v1.5zm0-2.4a.75.75 0 0 0 0 1.5v-1.5zM1 3.5h2.5a.75.75 0 0 0 0-1.5H1v1.5zm0 9h2.5v-1.5H1v1.5z" />
            </svg>
            <span className="text-[12px] text-[#b3b3b3]">{Math.round(volume * 100)}%</span>
          </label>
          <label className="bar w-28">
            <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => setVol(+e.target.value)} />
            <span className="bar__fill" style={{ width: `${volume * 100}%` }} />
          </label>
          <button
            className={`flex items-center justify-center rounded-full transition ${full ? 'h-10 w-10' : 'h-8 w-8'} ${
              liked ? 'text-spotify' : 'text-[#b3b3b3] hover:text-white'
            }`}
            onClick={toggleLike}
            title={liked ? 'Remove from Liked Songs' : 'Save to Liked Songs'}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill={liked ? '#1ed760' : 'none'} stroke={liked ? 'none' : '#b3b3b3'} strokeWidth="1.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
          <button
            className={`flex items-center justify-center rounded-full text-[#b3b3b3] transition hover:text-white ${full ? 'h-10 w-10' : 'h-8 w-8'}`}
            onClick={() => setAddOpen(true)}
            title="Add to playlist"
          >
            <PlusIcon size={full ? 20 : 18} />
          </button>
        </div>
      </div>

      {addOpen && <AddToPlaylistModal song={track} onClose={() => setAddOpen(false)} />}
    </div>
  )
}