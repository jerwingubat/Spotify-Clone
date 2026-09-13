import React from 'react'
import { playlists, charts, songs } from '../data.js'
import { PlayFilledIcon, ClockIcon } from './Icons.jsx'
import { usePlayer } from '../store/PlayerContext.jsx'
import { useAuth } from '../store/AuthContext.jsx'
import PlayingNow from './PlayingNow.jsx'

function SectionHeader({ title, link }) {
  return (
    <div className="mb-4 flex items-end justify-between">
      <h2 className="text-[22px] font-extrabold tracking-tight">{title}</h2>
      {link && (
        <a href="#" className="text-[13px] font-bold text-[#b3b3b3] transition hover:text-white hover:underline">
          Show all
        </a>
      )}
    </div>
  )
}

function PlaylistCard({ playlist, onOpen, onPlay }) {
  const track = (playlist.songs && playlist.songs[0]) || songs[0]
  return (
    <div
      className="group cursor-pointer rounded-md bg-panel-elevated p-3 transition hover:bg-panel-hover"
      onClick={() => onOpen(playlist)}
    >
      <div className="relative mb-3 aspect-square overflow-hidden rounded shadow-lg">
        <div className="absolute inset-0" style={{ background: playlist.color }} />
        {playlist.img && (
          <img src={playlist.img} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        <span
          className="absolute bottom-3 right-3 flex h-12 w-12 translate-y-5 items-center justify-center rounded-full bg-spotify opacity-100 shadow-[0_8px_16px_rgba(0,0,0,0.3)] transition-all duration-300 group-hover:translate-y-0 md:opacity-0 md:group-hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation()
            onPlay(track)
          }}
        >
          <PlayFilledIcon size={24} />
        </span>
      </div>
      <div className="min-w-0">
        <p className="truncate text-[15px] font-bold">{playlist.name}</p>
        <p className="mt-1 line-clamp-2 text-[13px] leading-[1.4] text-[#b3b3b3]">{playlist.desc}</p>
      </div>
    </div>
  )
}

export default function HomePage({ onOpenPlaylist }) {
  const { play } = usePlayer()
  const { user } = useAuth()
  const first = user?.displayName?.split(' ')[0]

  return (
    <div className="px-4 pb-6 pt-3 md:px-6">
      <PlayingNow />

      <div className="mb-8">
        <SectionHeader title={first ? `Good evening, ${first}` : 'Good evening'} />
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 2xl:grid-cols-3">
          {playlists.slice(0, 6).map((p) => (
            <button key={p.id} className="group flex min-h-[56px] w-full items-center overflow-hidden rounded bg-white/10 text-left transition hover:bg-white/20" onClick={() => onOpenPlaylist(p)}>
              <span className="relative h-[56px] w-[56px] shrink-0 overflow-hidden" style={{ background: p.color }}>
                {p.img && (
                  <img src={p.img} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                )}
                <span
                  className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-100 transition md:opacity-0 md:group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation()
                    play(songs[0])
                  }}
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-spotify">
                    <PlayFilledIcon size={20} />
                  </span>
                </span>
              </span>
              <span className="truncate px-3 text-[15px] font-bold">{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <SectionHeader title="Made for you" link />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {playlists.slice(0, 5).map((p) => (
            <PlaylistCard key={p.id} playlist={p} onOpen={onOpenPlaylist} onPlay={(t) => play(t)} />
          ))}
        </div>
      </div>

      <div className="mb-8">
        <SectionHeader title="Spotibai Playlists" link />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {playlists.slice(5, 11).map((p) => (
            <PlaylistCard key={p.id} playlist={p} onOpen={onOpenPlaylist} onPlay={(t) => play(t)} />
          ))}
        </div>
      </div>

      <div className="mb-8">
        <SectionHeader title="Featured Charts" />
        <div className="rounded-lg bg-panel-elevated p-5">
          <div className="mb-6 flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-[180px] w-full shrink-0 items-end rounded bg-[linear-gradient(135deg,#dc148c,#5f9ea0)] p-3 font-extrabold leading-none tracking-tight sm:w-[180px]">
              <span className="flex items-center gap-2 text-[22px] text-black">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="#111">
                  <path d="M2 12l20-10-12 18v-8z" />
                </svg>
                Spotibai
              </span>
            </div>
            <div className="min-w-0">
              <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-[#b3b3b3]">Spotibai Charts</p>
              <h3 className="mb-1 text-2xl font-extrabold tracking-tight sm:text-[32px] sm:leading-none">The Global Top 50</h3>
              <p className="text-[15px] text-[#b3b3b3]">The top tracks from around the world this week</p>
            </div>
          </div>

          <div className="grid grid-cols-[32px_1fr_84px] items-center gap-2 px-3 pb-2.5 text-[13px] font-semibold text-[#b3b3b3] md:grid-cols-[36px_1fr_160px_130px_60px] md:gap-3">
            <span className="text-left md:text-right">#</span>
            <span>Title</span>
            <span className="hidden md:block">Artist</span>
            <span className="hidden md:block">Streams</span>
            <span className="hidden justify-self-end md:block">
              <ClockIcon />
            </span>
          </div>

          {charts.map((c, i) => (
            <div
              key={c.rank}
              className="group grid cursor-pointer grid-cols-[32px_1fr_84px] items-center gap-2 rounded px-3 py-2 transition hover:bg-white/10 md:grid-cols-[36px_1fr_160px_130px_60px] md:gap-3"
              onClick={() => play(songs[i])}
            >
              <span className="text-sm text-[#b3b3b3]">{c.rank}</span>
              <span className="flex min-w-0 items-center gap-3">
                <span
                  className="relative block h-10 w-10 shrink-0 overflow-hidden rounded"
                >
                  <span className="absolute inset-0" style={{ background: c.rank === 1 ? 'linear-gradient(135deg,#e8115b,#148a08)' : '#222' }} />
                  <img src={songs[i]?.img} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                </span>
                <strong className="truncate">{c.title}</strong>
              </span>
              <span className="hidden truncate text-[#b3b3b3] md:block">{c.artist}</span>
              <span className="hidden truncate text-[#b3b3b3] md:block">{c.plays}</span>
              <span className="hidden text-sm text-[#b3b3b3] md:block">3:05</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}